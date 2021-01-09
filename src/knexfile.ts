import { dotenv_config } from "./util/util";

dotenv_config()

type knex_config = {[index:string]: any};

const development : knex_config = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  },
  migrations: {
    directory: './db/migrations',
  },
  seeds: { directory: './db/seeds' },
};

const testing : knex_config = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  },
  migrations: {
    directory: './db/migrations',
  },
  seeds: { directory: './db/seeds' },
};

const production : knex_config = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
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