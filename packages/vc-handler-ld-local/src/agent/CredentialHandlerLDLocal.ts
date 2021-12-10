import { CredentialPayload, IAgentContext, IAgentPlugin, IIdentifier, IKey, IResolver, PresentationPayload } from '@veramo/core'

import { IBindingOverrides, schema } from '../index'
import { ICredentialHandlerLDLocal, IRequiredContext } from '../types/ICredentialHandlerLDLocal'
import { VerifiableCredentialSP, VerifiablePresentationSP } from '@sphereon/ssi-sdk-core'
import {
  _ExtendedIKey,
  extractIssuer,
  isDefined,
  MANDATORY_CREDENTIAL_CONTEXT,
  mapIdentifierKeysToDoc,
  OrPromise,
  processEntryToArray,
  RecordLike,
} from '@veramo/utils'
import { LdCredentialModule } from '../ld-credential-module'
import { LdContextLoader } from '../ld-context-loader'
import { LdSuiteLoader } from '../ld-suite-loader'
import Debug from 'debug'
import { SphereonLdSignature } from '../ld-suites'
import {
  ContextDoc,
  ICreateVerifiableCredentialLDArgs,
  ICreateVerifiablePresentationLDArgs,
  IVerifyCredentialLDArgs,
  IVerifyPresentationLDArgs,
} from '../types/types'

const debug = Debug('veramo:w3c:ld-credential-action-handler-local')

/**
 * {@inheritDoc IVcLocalIssuerJsonLd}
 */
export class CredentialHandlerLDLocal implements IAgentPlugin {
  private ldCredentialModule: LdCredentialModule
  readonly schema = schema.IVcLocalIssuerJsonLd
  readonly methods: ICredentialHandlerLDLocal = {
    // test: this.createVerifiableCredentialLDLocal.bind(this),
    // We bind to existing methods as we can act as a drop in replacement. todo: Add config support for this mode
    // createVerifiableCredentialLD: this.createVerifiableCredentialLDLocal.bind(this),
    // createVerifiablePresentationLD: this.createVerifiablePresentationLDLocal.bind(this),
    verifyPresentationLD: this.verifyPresentationLDLocal.bind(this),
    verifyCredentialLD: this.verifyCredentialLDLocal.bind(this),
    createVerifiableCredentialLDLocal: this.createVerifiableCredentialLDLocal.bind(this),
    createVerifiablePresentationLDLocal: this.createVerifiablePresentationLDLocal.bind(this),
    verifyPresentationLDLocal: this.verifyPresentationLDLocal.bind(this),
    verifyCredentialLDLocal: this.verifyCredentialLDLocal.bind(this),
  }

  constructor(options: { contextMaps: RecordLike<OrPromise<ContextDoc>>[]; suites: SphereonLdSignature[]; bindingOverrides?: IBindingOverrides }) {
    this.ldCredentialModule = new LdCredentialModule({
      ldContextLoader: new LdContextLoader({ contextsPaths: options.contextMaps }),
      ldSuiteLoader: new LdSuiteLoader({ ldSignatureSuites: options.suites }),
    })

    this.overrideBindings(options.bindingOverrides)
  }

  private overrideBindings(overrides?: IBindingOverrides) {
    overrides?.forEach((methodName, bindingName) => {
      if (typeof this[methodName] === 'function') {
        this.methods[bindingName] = this[methodName].bind(this)
      } else {
        throw new Error(`Method ${methodName} supplied as target for ${bindingName} is not a valid method in CredentialHandlerLDLocal`)
      }
      console.log(`binding: this.${bindingName}() -> CredentialHandlerLDLocal.${methodName}()`)
    })
  }

  /** {@inheritDoc ICredentialIssuerLDLocal.createVerifiableCredentialLDLocal} */
  private async createVerifiableCredentialLDLocal(
    args: ICreateVerifiableCredentialLDArgs,
    context: IRequiredContext
  ): Promise<VerifiableCredentialSP> {
    // Create a deep copy to prevent signature ending up in passed in object
    // const credentialArg = JSON.parse(JSON.stringify(args.credential))
    const credentialContext = processEntryToArray(args?.credential?.['@context'], MANDATORY_CREDENTIAL_CONTEXT)
    const credentialType = processEntryToArray(args?.credential?.type, 'VerifiableCredential')
    let issuanceDate = args?.credential?.issuanceDate || new Date().toISOString()
    if (issuanceDate instanceof Date) {
      issuanceDate = issuanceDate.toISOString()
    }
    const credential: CredentialPayload = {
      ...args?.credential,
      '@context': credentialContext,
      type: credentialType,
      issuanceDate,
    }

    const issuer = extractIssuer(credential)
    if (!issuer || typeof issuer === 'undefined') {
      throw new Error('invalid_argument: args.credential.issuer must not be empty')
    }

    let identifier: IIdentifier
    try {
      identifier = await context.agent.didManagerGet({ did: issuer })
    } catch (e) {
      throw new Error(`invalid_argument: args.credential.issuer must be a DID managed by this agent. ${e}`)
    }
    try {
      const { signingKey, verificationMethodId } = await this.findSigningKeyWithId(context, identifier, args.keyRef)

      return await this.ldCredentialModule.issueLDVerifiableCredential(
        credential,
        identifier.did,
        signingKey,
        verificationMethodId,
        args.purpose,
        context
      )
    } catch (error) {
      debug(error)
      return Promise.reject(error)
    }
  }

  /** {@inheritdoc ICredentialIssuerLD.createVerifiablePresentationLD} */
  private async createVerifiablePresentationLDLocal(
    args: ICreateVerifiablePresentationLDArgs,
    context: IRequiredContext
  ): Promise<VerifiablePresentationSP> {
    const presentationContext = processEntryToArray(args?.presentation?.['@context'], MANDATORY_CREDENTIAL_CONTEXT)
    const presentationType = processEntryToArray(args?.presentation?.type, 'VerifiablePresentation')

    const presentation: PresentationPayload = {
      ...args?.presentation,
      '@context': presentationContext,
      type: presentationType,
    }
    // Workaround for bug in TypeError: Cannot read property 'length' of undefined
    //     at VeramoEd25519Signature2018.preSigningPresModification
    if (!presentation.verifier) {
      presentation.verifier = []
    }

    if (!isDefined(presentation.holder) || !presentation.holder) {
      throw new Error('invalid_argument: args.presentation.holder must not be empty')
    }

    if (args.presentation.verifiableCredential) {
      const credentials = args.presentation.verifiableCredential.map((cred) => {
        if (typeof cred !== 'string' && cred.proof.jwt) {
          return cred.proof.jwt
        } else {
          return cred
        }
      })
      presentation.verifiableCredential = credentials
    }

    //issuanceDate must not be present for presentations because it is not defined in a @context
    delete presentation.issuanceDate

    let identifier: IIdentifier
    try {
      identifier = await context.agent.didManagerGet({ did: presentation.holder })
    } catch (e) {
      throw new Error('invalid_argument: args.presentation.holder must be a DID managed by this agent')
    }
    try {
      const { signingKey, verificationMethodId } = await this.findSigningKeyWithId(context, identifier, args.keyRef)

      return await this.ldCredentialModule.signLDVerifiablePresentation(
        presentation,
        identifier.did,
        signingKey,
        verificationMethodId,
        args.challenge,
        args.domain,
        args.purpose,
        context
      )
    } catch (error) {
      debug(error)
      return Promise.reject(error)
    }
  }

  /** {@inheritdoc ICredentialHandlerLDLocal.verifyCredentialLDLocal} */
  public async verifyCredentialLDLocal(args: IVerifyCredentialLDArgs, context: IRequiredContext): Promise<boolean> {
    const credential = args.credential
    return this.ldCredentialModule.verifyCredential(credential, context, args.fetchRemoteContexts, args.purpose)
  }

  /** {@inheritdoc ICredentialHandlerLDLocal.verifyPresentationLDLocal} */
  public async verifyPresentationLDLocal(args: IVerifyPresentationLDArgs, context: IRequiredContext): Promise<boolean> {
    const presentation = args.presentation
    return this.ldCredentialModule.verifyPresentation(
      presentation,
      args.challenge,
      args.domain,
      context,
      args.fetchRemoteContexts,
      args.presentationPurpose
    )
  }

  private async findSigningKeyWithId(
    context: IAgentContext<IResolver>,
    identifier: IIdentifier,
    keyRef?: string
  ): Promise<{ signingKey: IKey; verificationMethodId: string }> {
    const extendedKeys: _ExtendedIKey[] = await mapIdentifierKeysToDoc(identifier, 'verificationMethod', context)
    let supportedTypes = this.ldCredentialModule.ldSuiteLoader.getAllSignatureSuiteTypes()
    let signingKey: _ExtendedIKey | undefined
    let verificationMethodId: string
    if (keyRef) {
      signingKey = extendedKeys.find((k) => k.kid === keyRef)
    }
    if (signingKey && !supportedTypes.includes(signingKey.meta.verificationMethod.type)) {
      debug('WARNING: requested signing key DOES NOT correspond to a supported Signature suite type. Looking for the next best key.')
      signingKey = undefined
    }
    if (!signingKey) {
      if (keyRef) {
        debug('WARNING: no signing key was found that matches the reference provided. Searching for the first available signing key.')
      }
      signingKey = extendedKeys.find((k) => supportedTypes.filter((value) => value.startsWith(k.meta.verificationMethod.type)))
    }

    if (!signingKey) throw Error(`key_not_found: No suitable signing key found for ${identifier.did}`)
    verificationMethodId = signingKey.meta.verificationMethod.id
    return { signingKey, verificationMethodId }
  }
}
