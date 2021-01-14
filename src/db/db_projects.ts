import { assert } from "../util/util";
import { query } from "./db";
import { createExercise, getFullExerciseById } from "./db_exercises";

export async function getProjectById(projectId: number) {
  return await query("projects").where({id: projectId}).select().first();
}

export async function isProjectPublic(project_id: number) {
  return !!await query("projects").where({
    id: project_id
  }).select("is_public").first();
}

export async function isProjectOwner(user_id: number, project_id: number) {
  return !!await query("users_projects").where({
    user_id: user_id,
    project_id: project_id
  }).select().first();
}

export async function isAdminForProjectCourse(user_id: number, project_id: number) {
  return !!await query("users_courses")
    .join('courses_projects', 'users_courses.course_id', 'courses_projects.course_id')
    .where({
      user_id: user_id,
      project_id: project_id,
      is_admin: true,
    }).select().first();
}

export async function hasProjectReadAccess(user_id: number, project_id: number) {
  return await isProjectPublic(project_id) ||
         await isProjectOwner(user_id, project_id) ||
         await isAdminForProjectCourse(user_id, project_id);
}

export async function hasProjectWriteAccess(user_id: number, project_id: number) {
  return await isProjectOwner(user_id, project_id) ||
         await isAdminForProjectCourse(user_id, project_id);
}


async function createProject(name: string, contents: string, exercise_id: number | undefined, is_public: boolean | undefined) {

  let exercise = exercise_id ? await getFullExerciseById(exercise_id) : await createExercise();
  assert(exercise); // fails if someone called us with a bad exercise_id

  // Create and get a copy of the new project
  let [newProject] = await query("projects").insert({
    name: name!,
    contents: contents!,
    exercise_id: exercise.id,
    is_public: is_public
  }).returning("*");

  // If the exercise was newly created, it won't have a starter project id
  // and we need to set that here.
  if (!exercise.starter_project_id) {
    await query("exercises")
      .where({id: exercise.id})
      .update({starter_project_id: newProject.id});
  }

  Object.assign(newProject, {
    write_access: true, // must have write access if you're creating it
    exercise: exercise
  });

  return newProject;
}


export async function createUserProject(user_id: number, name: string, contents: string, exercise_id: number | undefined, is_public: boolean | undefined) {

  let newProject = await createProject(name, contents, exercise_id, is_public);

  // Add current user as owner for project
  await query("users_projects").insert({
    project_id: newProject.id,
    user_id: user_id
  });

  return newProject;
}


export async function createCourseProject(course_id: number, name: string, contents: string, exercise_id: number | undefined, is_public: boolean | undefined) {

  let newProject = await createProject(name, contents, exercise_id, is_public);

  // Add project to course
  await query("courses_projects").insert({
    project_id: newProject!.id,
    course_id: course_id
  });

  return newProject;
}


