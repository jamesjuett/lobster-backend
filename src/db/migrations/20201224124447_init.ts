import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable("users", table => {
      table.increments("id").primary();
      table.string("email", 50).notNullable();
      table.string("name", 100).notNullable();
      table.boolean("is_super").notNullable().defaultTo(false);
    })
    .createTable("courses", table => {
      table.increments("id").primary();
      table.string("short_name", 20).notNullable();
      table.string("full_name", 100).notNullable();
      table.string("term", 6).notNullable();
      table.integer("year").notNullable();
    })
    .createTable("users_courses", table => {
      table.integer("user_id").unsigned().notNullable()
        .references("id").inTable("users").onDelete("cascade");
      table.integer("course_id").unsigned().notNullable()
        .references("id").inTable("courses").onDelete("cascade");
      table.boolean("is_admin").notNullable().defaultTo(false);
      table.primary(["user_id", "course_id"]);
    })
    .createTable("exercises", table => {
      table.increments("id").primary();
      table.string("name", 100).notNullable();
    })
    .createTable("projects", table => {
      table.increments("id").primary();
      table.integer("exercise_id").unsigned().nullable()
        .references("id").inTable("exercises").onDelete("restrict");
      table.timestamp("last_modified").notNullable().defaultTo(knex.fn.now());
      table.text("contents").notNullable();
    })
    .alterTable("exercises", table => {
      table.integer("starter_project_id").unsigned().notNullable()
        .references("id").inTable("projects").onDelete("restrict");
    });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("exercises", table => {
      table.dropColumn("starter_project_id");
    })
    .dropTable("projects")
    .dropTable("exercises")
    .dropTable("users_courses")
    .dropTable("courses")
    .dropTable("users");
}

