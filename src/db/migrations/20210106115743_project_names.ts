import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("projects", table => {
      table.string("name", 100).notNullable().defaultTo("[unnamed project]");
      table.string("name", 100).notNullable().alter();
    });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("projects", table => {
      table.dropColumn("name");
    });
}

