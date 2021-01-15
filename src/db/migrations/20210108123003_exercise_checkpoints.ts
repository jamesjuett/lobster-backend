import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable("exercises_extras", table => {
      table.integer("exercise_id").unsigned().notNullable()
        .references("id").inTable("exercises").onDelete("cascade");
      table.string("extra_key", 50).notNullable();
      table.primary(["exercise_id", "extra_key"]);

      table.index("exercise_id");
    });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTable("exercises_extras");
}

