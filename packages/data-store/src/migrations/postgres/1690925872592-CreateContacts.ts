import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateContacts1690925872592 implements MigrationInterface {
  name = 'CreateContacts1690925872592'



  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "CorrelationIdentifier" DROP CONSTRAINT "FK_CorrelationIdentifier_identityId"`)
    await queryRunner.query(`ALTER TABLE "IdentityMetadata" DROP CONSTRAINT "FK_IdentityMetadata_identityId"`)
    await queryRunner.query(`ALTER TABLE "Identity" DROP CONSTRAINT "FK_Identity_contactId"`)
    await queryRunner.query(`ALTER TABLE "Connection" DROP CONSTRAINT "FK_Connection_identityId"`)
    await queryRunner.query(`ALTER TABLE "CorrelationIdentifier" RENAME COLUMN "identityId" TO "identity_id"`)
    await queryRunner.query(`ALTER TABLE "Connection" RENAME COLUMN "identityId" TO "identity_id"`)
    await queryRunner.query(`CREATE TYPE "public"."PartyType_type_enum" AS ENUM('naturalPerson', 'organization')`)
    await queryRunner.query(`CREATE TABLE "PartyType" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."PartyType_type_enum" NOT NULL, "name" character varying(255) NOT NULL, "description" character varying(255), "tenant_id" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "last_updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_06658931a9c40b5c1f7371210a7" UNIQUE ("name"), CONSTRAINT "PK_cb5d69529212caff17a4a56b65d" PRIMARY KEY ("id"))`)
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_PartyTypeEntity_type_tenantId" ON "PartyType" ("type", "tenant_id")`)
    await queryRunner.query(`CREATE TABLE "BaseContact" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "last_updated_at" TIMESTAMP NOT NULL DEFAULT now(), "legal_name" character varying(255), "display_name" character varying(255), "first_name" character varying(255), "middle_name" character varying(255), "last_name" character varying(255), "type" character varying NOT NULL, "party_id" uuid, CONSTRAINT "UQ_b8c8005251433839dfc2babf9f8" UNIQUE ("legal_name"), CONSTRAINT "REL_be0b2a601d6a71b07e2a8a5b61" UNIQUE ("party_id"), CONSTRAINT "PK_49b53d0fabcefd59b204b9b65f6" PRIMARY KEY ("id"))`)
    await queryRunner.query(`CREATE INDEX "IDX_d265e69d45aa55a9e197f5e626" ON "BaseContact" ("type")`)
    await queryRunner.query(`CREATE TABLE "PartyRelationship" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "left_id" uuid NOT NULL, "right_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "last_updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_57bc64287935e4546d3c3161df7" PRIMARY KEY ("id"))`)
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_PartyRelationshipEntity_left_right" ON "PartyRelationship" ("left_id", "right_id")`)
    await queryRunner.query(`CREATE TABLE "ElectronicAddress" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying(255) NOT NULL, "electronic_address" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "last_updated_at" TIMESTAMP NOT NULL DEFAULT now(), "partyId" uuid, CONSTRAINT "PK_4b1c9ab5ad01c105abed06a0a9c" PRIMARY KEY ("id"))`)
    await queryRunner.query(`CREATE TABLE "Party" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "uri" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "last_updated_at" TIMESTAMP NOT NULL DEFAULT now(), "party_type_id" uuid NOT NULL, CONSTRAINT "PK_1d61626792eccfcb50ff6f7cda2" PRIMARY KEY ("id"))`)
    await queryRunner.query(`CREATE TABLE "BaseConfig" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "identifier" character varying(255), "redirect_url" character varying(255), "session_id" character varying(255), "client_id" character varying(255), "client_secret" character varying(255), "scopes" text, "issuer" character varying(255), "dangerously_allow_insecure_http_requests" boolean, "client_auth_method" text, "type" character varying NOT NULL, "connection_id" uuid, CONSTRAINT "REL_4b10e0398e0bc003b479a21f53" UNIQUE ("connection_id"), CONSTRAINT "PK_71b897e705b414db840e1751679" PRIMARY KEY ("id"))`)
    await queryRunner.query(`CREATE INDEX "IDX_5624e2253276217cf609b044b1" ON "BaseConfig" ("type")`)
    await queryRunner.query(`ALTER TABLE "Identity" DROP COLUMN "contactId"`)
    await queryRunner.query(`ALTER TABLE "Identity" ADD "partyId" uuid`)
    await queryRunner.query(`ALTER TABLE "Identity" ALTER COLUMN "roles" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "CorrelationIdentifier" ADD CONSTRAINT "FK_d98b8f355649e9d090ee2a915ca" FOREIGN KEY ("identity_id") REFERENCES "Identity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`)
    await queryRunner.query(`ALTER TABLE "IdentityMetadata" ADD CONSTRAINT "FK_e22568cc3d201c0131b87186117" FOREIGN KEY ("identityId") REFERENCES "Identity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`)
    await queryRunner.query(`ALTER TABLE "BaseContact" ADD CONSTRAINT "FK_be0b2a601d6a71b07e2a8a5b61e" FOREIGN KEY ("party_id") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE NO ACTION`)
    await queryRunner.query(`ALTER TABLE "PartyRelationship" ADD CONSTRAINT "FK_c3db1bd42ed96c5164b2e6276bf" FOREIGN KEY ("left_id") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE NO ACTION`)
    await queryRunner.query(`ALTER TABLE "PartyRelationship" ADD CONSTRAINT "FK_f366006d2ad5adbe3632277f1c0" FOREIGN KEY ("right_id") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE NO ACTION`)
    await queryRunner.query(`ALTER TABLE "ElectronicAddress" ADD CONSTRAINT "FK_672ac311680d9c366405bb5737c" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE NO ACTION`)
    await queryRunner.query(`ALTER TABLE "Party" ADD CONSTRAINT "FK_d6b87c0830068c6d396a501e3d1" FOREIGN KEY ("party_type_id") REFERENCES "PartyType"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await queryRunner.query(`ALTER TABLE "Identity" ADD CONSTRAINT "FK_916e4ef6ee2f24c5c88bdc9dfbb" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE NO ACTION`)
    await queryRunner.query(`ALTER TABLE "Connection" ADD CONSTRAINT "FK_360ccf2d714878339680a197d26" FOREIGN KEY ("identity_id") REFERENCES "Identity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`)
    await queryRunner.query(`ALTER TABLE "BaseConfig" ADD CONSTRAINT "FK_4b10e0398e0bc003b479a21f53e" FOREIGN KEY ("connection_id") REFERENCES "Connection"("id") ON DELETE CASCADE ON UPDATE NO ACTION`)





























    // await queryRunner.query(
    //   `CREATE TABLE "BaseConfigEntity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "client_id" character varying(255), "client_secret" character varying(255), "scopes" text, "issuer" character varying(255), "redirect_url" text, "dangerously_allow_insecure_http_requests" boolean, "client_auth_method" text, "identifier" character varying(255), "session_id" character varying(255), "type" character varying NOT NULL, "connectionId" uuid, CONSTRAINT "REL_BaseConfig_connectionId" UNIQUE ("connectionId"), CONSTRAINT "PK_BaseConfigEntity_id" PRIMARY KEY ("id"))`
    // )
    // await queryRunner.query(`CREATE INDEX "IDX_BaseConfigEntity_type" ON "BaseConfigEntity" ("type")`)
    // await queryRunner.query(`CREATE TYPE "public"."CorrelationIdentifier_type_enum" AS ENUM('did', 'url')`)
    // await queryRunner.query(
    //   `CREATE TABLE "CorrelationIdentifier" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."CorrelationIdentifier_type_enum" NOT NULL, "correlation_id" text NOT NULL, "identityId" uuid, CONSTRAINT "UQ_Correlation_id" UNIQUE ("correlation_id"), CONSTRAINT "REL_CorrelationIdentifier_identityId" UNIQUE ("identityId"), CONSTRAINT "PK_CorrelationIdentifier_id" PRIMARY KEY ("id"))`
    // )
    // await queryRunner.query(
    //   `CREATE TABLE "Contact" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "alias" character varying(255) NOT NULL, "uri" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "last_updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_Name" UNIQUE ("name"), CONSTRAINT "UQ_Alias" UNIQUE ("alias"), CONSTRAINT "PK_Contact_id" PRIMARY KEY ("id"))`
    // )
    // await queryRunner.query(
    //   `CREATE TABLE "IdentityMetadata" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "label" character varying(255) NOT NULL, "value" character varying(255) NOT NULL, "identityId" uuid, CONSTRAINT "PK_IdentityMetadata_id" PRIMARY KEY ("id"))`
    // )
    // await queryRunner.query(
    //   `CREATE TABLE "Identity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "alias" character varying(255) NOT NULL, "roles" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "last_updated_at" TIMESTAMP NOT NULL DEFAULT now(), "contactId" uuid, CONSTRAINT "UQ_Alias" UNIQUE ("alias"), CONSTRAINT "PK_Identity_id" PRIMARY KEY ("id"))`
    // )
    // await queryRunner.query(`CREATE TYPE "public"."Connection_type_enum" AS ENUM('OIDC', 'SIOPv2', 'SIOPv2+OpenID4VP')`)
    // await queryRunner.query(
    //   `CREATE TABLE "Connection" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."Connection_type_enum" NOT NULL, "identityId" uuid, CONSTRAINT "REL_Connection_identityId" UNIQUE ("identityId"), CONSTRAINT "PK_Connection_id" PRIMARY KEY ("id"))`
    // )
    // await queryRunner.query(
    //   `ALTER TABLE "BaseConfigEntity" ADD CONSTRAINT "FK_BaseConfig_connectionId" FOREIGN KEY ("connectionId") REFERENCES "Connection"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    // )
    // await queryRunner.query(
    //   `ALTER TABLE "CorrelationIdentifier" ADD CONSTRAINT "FK_CorrelationIdentifier_identityId" FOREIGN KEY ("identityId") REFERENCES "Identity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    // )
    // await queryRunner.query(
    //   `ALTER TABLE "IdentityMetadata" ADD CONSTRAINT "FK_IdentityMetadata_identityId" FOREIGN KEY ("identityId") REFERENCES "Identity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    // )
    // await queryRunner.query(
    //   `ALTER TABLE "Identity" ADD CONSTRAINT "FK_Identity_contactId" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    // )
    // await queryRunner.query(
    //   `ALTER TABLE "Connection" ADD CONSTRAINT "FK_Connection_identityId" FOREIGN KEY ("identityId") REFERENCES "Identity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    // )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Connection" DROP CONSTRAINT "FK_Connection_identityId"`)
    await queryRunner.query(`ALTER TABLE "Identity" DROP CONSTRAINT "FK_Identity_contactId"`)
    await queryRunner.query(`ALTER TABLE "IdentityMetadata" DROP CONSTRAINT "FK_IdentityMetadata_identityId"`)
    await queryRunner.query(`ALTER TABLE "CorrelationIdentifier" DROP CONSTRAINT "FK_CorrelationIdentifier_identityId"`)
    await queryRunner.query(`ALTER TABLE "BaseConfigEntity" DROP CONSTRAINT "FK_BaseConfig_connectionId"`)
    await queryRunner.query(`DROP TABLE "Connection"`)
    await queryRunner.query(`DROP TYPE "public"."Connection_type_enum"`)
    await queryRunner.query(`DROP TABLE "Identity"`)
    await queryRunner.query(`DROP TABLE "IdentityMetadata"`)
    await queryRunner.query(`DROP TABLE "Contact"`)
    await queryRunner.query(`DROP TABLE "CorrelationIdentifier"`)
    await queryRunner.query(`DROP TYPE "public"."CorrelationIdentifier_type_enum"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_BaseConfigEntity_type"`)
    await queryRunner.query(`DROP TABLE "BaseConfigEntity"`)
  }
}
