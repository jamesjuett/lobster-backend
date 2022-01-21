# lobster-backend

## Database

### Knex

DO NOT use `.raw()` with a query manually constructed as a string (e.g. you might accidentally do something that opens up the possibility of SQL injection). Use the Knex query builder functions like `.select()`, `.where()`, etc.

### Migrations

Database migrations are `.ts` files in `db/migrations/`. The files contain Knex code that implements the migration:

- An `up` function to perform the migration
- A `down` function to rollback the migration

#### Creating new Migrations

To begin creating a new migration, first auto-generate a migration `.ts` file using `knex migrate:make <name>` where `<name>` is replaced by a name for your migration. The name should generally be something related to the feature you are implementing. This creates a new `.ts` file in `db/migrations/`, named with a timestamp and the name you provided.

Then, edit the `.ts` file to implement the migration. You might want to use a previous migration as a template.

You'll also want to check out `db/db_types.ts` and make changes there to reflect your migration.

### Seeds

Be careful about using seeds. Running them will delete existing data in the database.

Make sure to include the line `import "../db_types"` at the top of any new seed file (after it is auto-generated) so that you get typescript support.

### Certificate Stuff

```console
sudo apt install libnss3-tools
sudo apt install golang-go
git clone https://github.com/FiloSottile/mkcert && cd mkcert
go build -ldflags "-X main.Version=$(git describe --tags)"
sudo cp mkcert /usr/local/bin/

# Remove source, no longer needed
cd..
rm -r mkcert/

# Create local CA
mkcert -CAROOT
sudo mkcert --install
sudo mkcert localhost 127.0.0.1

```

**On windows**
Use instructions in `mkcert` readme on github to install using chocolatey.
Make sure to use administrator PowerShell.

```console
mkcert -install
mkcert localhost
```

Then copy those files to `./secrets/certs`.


### Secrets

Create a secret key for JWT:
```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'));" > secrets/jwt_secret
```