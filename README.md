# lobster-backend

## Knex

### Migrations

Database migrations are `.ts` files in `db/migrations/`. The files contain Knex code that implements the migration:

- An `up` function to perform the migration
- A `down` function to rollback the migration

#### Creating new Migrations

To begin creating a new migration, first auto-generate a migration `.ts` file using `knex migrate:make <name>` where `<name>` is replaced by a name for your migration. The name should generally be something related to the feature you are implementing. This creates a new `.ts` file in `db/migrations/`, named with a timestamp and the name you provided.

Then, edit the `.ts` file to implement the migration. You might want to use a previous migration as a template.

### Seeds

Be careful about using seeds. Running them will delete existing data in the database.

Make sure to include the line `import "../db_types"` at the top of any new seed file (after it is auto-generated) so that you get typescript support.