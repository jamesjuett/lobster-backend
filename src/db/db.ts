import assert from 'assert';
import knex from 'knex';
import knexfile from '../knexfile';

const env = process.env.NODE_ENV;
assert(env === "development" || env === "testing" || env === "production");


export const query = knex(knexfile[env]);

export function first<T>(results: readonly T[]) : T | undefined {
    return results[0];
}