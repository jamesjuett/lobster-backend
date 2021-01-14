import * as Knex from "knex";
import fs from 'fs';
import { createUserProject } from "../db_projects";
import { getOrCreateUser } from "../db_user";
import { assert } from "../../util/util";

type OldUserProjectData = {
  uniqname: string,
  name: string,
  code: string,
  isPublic: boolean
}

export async function seed(knex: Knex): Promise<void> {

  console.log("Populating user code projects for courses...");

  let oldProjects: OldUserProjectData[] = JSON.parse(fs.readFileSync('../data/user_code.json', 'utf8'));
  let i = 0;
  for(; i < oldProjects.length; ++i) {
    let p = oldProjects[i];

    // Note - the old uniqname column actually contains emails
    let user = await getOrCreateUser(p.uniqname);
    assert(user, "failed to create user " + p.uniqname + ". that shouldn't happen :(");

    await createUserProject(
      user.id,
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
      p.isPublic
    );

    if (i % 100 === 0) {
      printStatus(i);
    }
  }

  printStatus(i);
  console.log();
}

function printStatus(n: number) {
  process.stdout.cursorTo(0);
  process.stdout.write(`Populated ${n} user projects...`);
}