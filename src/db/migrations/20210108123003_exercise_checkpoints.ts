import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable("exercises_checkpoints", table => {
      table.integer("exercise_id").unsigned().notNullable()
        .references("id").inTable("exercises").onDelete("cascade");
      table.string("checkpoint_key", 50).notNullable();
      table.primary(["exercise_id", "checkpoint_key"]);
    });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTable("exercises_checkpoints");
}

