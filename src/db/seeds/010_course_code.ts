import * as Knex from "knex";
import fs from 'fs';
import { createCourseProject } from "../db_projects";

type OldProjectData = {
  name: string,
  code: string,
}

export async function seed(knex: Knex): Promise<void> {

  console.log("Populating starter projects for courses...");

  let oldProjects: OldProjectData[] = JSON.parse(fs.readFileSync('../data/course_code.json', 'utf8'));

  let courses = await knex("courses").select();
  let courseMap : {[index: string]: number} = {};
  courses.forEach(c => courseMap[c.short_name] = c.id)

  for(let i = 0; i < oldProjects.length; ++i) {
    let p = oldProjects[i];
    let course_id: number;
    if (p.name.indexOf("183") !== -1) {
      course_id = courseMap["eecs183"];
    }
    else if (p.name.indexOf("101") !== -1) {
      course_id = courseMap["engr101"];
    }
    else {
      course_id = courseMap["eecs280"];
    }

    await createCourseProject(
      course_id,
      p.name,
      JSON.stringify({
        name: p.name,
        files: [{
            name: "main.cpp",
            code: p.code,
            isTranslationUnit: true
        }]
      }),
      undefined,
      true
    );
  }

}
