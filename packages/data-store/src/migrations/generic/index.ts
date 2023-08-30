import { CreateContacts1659463079429 } from './1-CreateContacts'
import { CreateContacts1690925872318 } from './2-CreateContacts'
import { CreateIssuanceBranding1659463079429 } from './1-CreateIssuanceBranding'

/**
 * The migrations array that SHOULD be used when initializing a TypeORM database connection.
 *
 * These ensure the correct creation of tables and the proper migrations of data when tables change between versions.
 *
 * @public
 */
export const DataStoreMigrations = [CreateContacts1659463079429, CreateContacts1690925872318, CreateIssuanceBranding1659463079429]
