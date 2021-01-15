import * as Knex from "knex";
import fs from 'fs';
import { createUserProject } from "../db_projects";
import { getOrCreateUser } from "../db_user";
import { assert } from "../../util/util";
import pLimit from "p-limit";

type OldUserProjectData = {
  uniqname: string,
  name: string,
  code: string,
  isPublic: boolean
}

export async function seed(knex: Knex): Promise<void> {

  console.log("Populating user code projects for courses...");

  let oldProjects: OldUserProjectData[] = JSON.parse(fs.readFileSync('../data/user_code.json', 'utf8'));
  // let i = 0;

  // Run with limited concurrency so we don't have a ton of serial delay
  // due to back and forth for each individual DB request, but also so we
  // don't completely destroy everything with a bazillion requests at once.
  const limit = pLimit(100);

  let input = oldProjects.map((p,i) => limit(async () => {

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
  }));

  await(Promise.all(input))
  // printStatus(i);
  console.log("done");
}

function printStatus(n: number) {
  process.stdout.cursorTo(0);
  process.stdout.write(`Populated ${n} user projects...`);
}