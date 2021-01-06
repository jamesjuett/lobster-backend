import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable("users_projects", table => {
      table.integer("user_id").unsigned().notNullable()
        .references("id").inTable("users").onDelete("cascade");
      table.integer("project_id").unsigned().notNullable()
        .references("id").inTable("projects").onDelete("cascade");
      table.primary(["user_id", "project_id"]);
    });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTable("users_projects");
}

