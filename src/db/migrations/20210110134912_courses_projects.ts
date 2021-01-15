import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable("courses_projects", table => {
      table.integer("course_id").unsigned().notNullable()
        .references("id").inTable("courses").onDelete("cascade");
      table.integer("project_id").unsigned().notNullable()
        .references("id").inTable("projects").onDelete("cascade");
      table.primary(["course_id", "project_id"]);

      table.index(["course_id", "project_id"]);
    });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTable("courses_projects");
}

