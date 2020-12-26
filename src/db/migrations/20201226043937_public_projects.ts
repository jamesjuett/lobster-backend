import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("projects", table => {
      table.boolean("is_public").notNullable().defaultTo(false);
    });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("projects", table => {
      table.dropColumn("is_public");
    });
}

