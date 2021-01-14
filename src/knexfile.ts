import { assertExists, dotenv_config, getDockerSecret } from "./util/util";

dotenv_config()

type knex_config = {[index:string]: any};

const development : knex_config = {
  client: 'pg',
  connection: {
    host: assertExists(process.env.DB_HOST),
    port: assertExists(process.env.DB_PORT),
    user: assertExists(process.env.DB_USER),
    password: getDockerSecret("db_password"),
    database: assertExists(process.env.DB_NAME)
  },
  migrations: {
    directory: './db/migrations',
  },
  seeds: { directory: './db/seeds' },
};

const testing : knex_config = {
  client: 'pg',
  connection: {
    host: assertExists(process.env.DB_HOST),
    port: assertExists(process.env.DB_PORT),
    user: assertExists(process.env.DB_USER),
    password: getDockerSecret("db_password"),
    database: assertExists(process.env.DB_NAME)
  },
  migrations: {
    directory: './db/migrations',
  },
  seeds: { directory: './db/seeds' },
};

const production : knex_config = {
  client: 'pg',
  connection: {
    host: assertExists(process.env.DB_HOST),
    port: assertExists(process.env.DB_PORT),
    user: assertExists(process.env.DB_USER),
    password: getDockerSecret("db_password"),
    database: assertExists(process.env.DB_NAME)
  },
  migrations: {
    directory: './db/migrations',
  },
  seeds: { directory: './db/seeds' },
};

export default {
  development: development,
  testing: testing,
  production: production,
};