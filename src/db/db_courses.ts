import { DB_Projects } from "knex/types/tables";
import { query } from "./db";


export async function getCourse(id: number) {
  return await query("courses").where({id: id}).select().first();
}

export async function getAllCourseProjects(course_id: number) {
  let result = await query("projects")
    .join("courses_projects", "projects.id", "courses_projects.project_id")
    .select("projects.*").where({course_id: course_id});
  return result as DB_Projects[];
}

export async function getPublicCourseProjects(course_id: number) {
  let result = await query("projects")
    .join("courses_projects", "projects.id", "courses_projects.project_id")
    .select("projects.*").where({course_id: course_id, is_public: true});
  return result as DB_Projects[];
}

export async function getCourseByShortNameTermYear(short_name: string, term: string, year: number) {
  return await query("courses")
    .where({
      short_name: short_name,
      term: term,
      year: year
    }).select().first();
}

export async function isCourseAdmin(user_id: number, course_id: number) {
  return !!await query("users_courses").where({
    user_id: user_id,
    course_id: course_id,
    is_admin: true
  }).select().first();
}