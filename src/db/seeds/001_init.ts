import * as Knex from "knex";
import "../db_types"

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("users_courses").del();
  await knex("users").del();
  await knex("courses").del();
  await knex("projects").update({ exercise_id: null });
  await knex("exercises").del();
  await knex("projects").del();
  
  // Inserts seed entries
  let user_ids = await knex("users").insert([
    { email: "jjuett@umich.edu", name: "James Juett", is_super: true },
    { email: "akamil@umich.edu", name: "Amir Kamil", is_super: true },
    { email: "jklooste@umich.edu", name: "John Kloosterman", is_super: true },
    { email: "lslavice@umich.edu", name: "Laura Alford", is_super: false },
  ]).returning("id");

  let course_ids = await knex("courses").insert([
    { short_name: "eecs280", full_name: "Programming and Introductory Data Structures", term: "winter", year: 2021 },
    { short_name: "engr101", full_name: "Introduction to Computers and Programming", term: "winter", year: 2021 },
    { short_name: "eecs183", full_name: "Elementary Programming Concepts", term: "winter", year: 2021 },
  ]).returning("id");
  
  await knex("users_courses").insert([
    { user_id: user_ids[0], course_id: course_ids[0], is_admin: true },
    { user_id: user_ids[0], course_id: course_ids[1], is_admin: true },
    { user_id: user_ids[0], course_id: course_ids[2], is_admin: false },
    { user_id: user_ids[1], course_id: course_ids[1], is_admin: true },
    { user_id: user_ids[2], course_id: course_ids[1], is_admin: true },
    { user_id: user_ids[3], course_id: course_ids[1], is_admin: true },
  ]);

  let project_ids = await knex("projects").insert([
    {
      name: "Project 1 (Public)",
      contents: '{"name": "Project 1 (Public)", "files": [{"name": "program1.cpp", "code": "int main() {\\n  int x = 1;\\n  int y = x + x;\\n}", "isTranslationUnit": true}]}',
      is_public: true
    },
    {
      name: "Project 2",
      contents: '{"name": "Project 2", "files": [{"name": "program2.cpp", "code": "int main() {\\n  int x = 2;\\n  int y = x + x;\\n}", "isTranslationUnit": true}]}',
    },
    {
      name: "Project 3",
      contents: '{"name": "Project 3", "files": [{"name": "program3.cpp", "code": "int main() {\\n  int x = 3;\\n  int y = x + x;\\n}", "isTranslationUnit": true}]}',
    },
    {
      name: "Project 4 (Public)",
      contents: '{"name": "Project 4", "files": [{"name": "program4.cpp", "code": "int main() {\\n  int x = 4;\\n  int y = x + x;\\n}", "isTranslationUnit": true}]}',
      is_public: true,
    },
  ]).returning("id");
  
  let exercise_ids = await knex("exercises").insert([
    { starter_project_id: project_ids[0], exercise_key: "test_exercise_1" },
    { starter_project_id: project_ids[1], exercise_key: "test_exercise_2" },
  ]).returning("id");
  
  await knex("projects").where({ id: project_ids[0] }).update({ exercise_id: exercise_ids[0] });
  await knex("projects").where({ id: project_ids[1] }).update({ exercise_id: exercise_ids[1] });

  await knex("users_projects").insert([
    { user_id: user_ids[0], project_id: project_ids[0] },
    { user_id: user_ids[0], project_id: project_ids[1] },
  ]);

  await knex("courses_projects").insert([
    { course_id: course_ids[0], project_id: project_ids[0] },
    { course_id: course_ids[0], project_id: project_ids[1] },
    { course_id: course_ids[0], project_id: project_ids[2] },
    { course_id: course_ids[0], project_id: project_ids[3] },
  ]);

  await knex("exercises_extras").insert([
    { exercise_id: exercise_ids[0], extra_key: "test_extra_1" },
    { exercise_id: exercise_ids[0], extra_key: "test_extra_2" },
  ]);
};
