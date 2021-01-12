import { assert } from "console";
import { Router, Request, Response } from "express";
import { getJwtUserInfo } from "../auth/jwt_auth";
import { query } from "../db/db";
import { createRoute, jsonBodyParser, NONE, validateBody, validateParamId } from "./common";
import { createExerciseForProject, getExerciseById } from "./exercises";
import { hasWriteAccess, validateBodyProject } from "./projects";

async function getUserById(id: number) {
  return await query("users").where({ id: id }).select().first();
}

export const users_router = Router();
users_router.route("/me")
  .get(createRoute({
    authorization: NONE,
    preprocessing: NONE,
    validation: NONE,
    handler: async (req: Request, res: Response) => {
      let userInfo = getJwtUserInfo(req);
      let user = await getUserById(userInfo.id);
      if (user) {
        res.status(200);
        res.json(user);
      }
      else {
        res.status(404);
        res.send("This user does not exist.");
      }
    }
  }));

users_router.route("/me/projects")
  .get(createRoute({
    authorization: NONE,
    preprocessing: NONE,
    validation: NONE,
    handler: async (req: Request, res: Response) => {
      let userInfo = getJwtUserInfo(req);
      let projects = await getUserProjectsById(userInfo.id);
      assert(projects);
      res.status(200).json(projects);
    }
  }))
  .post(createRoute({
    authorization:
      NONE,
    preprocessing:
      jsonBodyParser,
    validation:
      [
        validateBody("id").not().exists(),
        ...validateBodyProject
      ],
    handler:
      async (req: Request, res: Response) => {
        let body = req.body;
        
        // Create and get a copy of the new project
        let [newProject] = await query("projects").insert({
          name: body.name!,
          contents: body.contents!,
          exercise_id: body.exercise_id,
          is_public: body.is_public
        }).returning("*");

        // If the exercise_id was undefined, go ahead and
        // create a new exercise and attach it.
        if (!newProject.exercise_id) {
          newProject.exercise_id = await createExerciseForProject(newProject.id);
        }

        Object.assign(newProject, {
          write_access: true, // must have write access if you're creating it
          exercise: await getExerciseById(newProject.exercise_id!)
        });

        // Add current user as owner for project
        let userInfo = getJwtUserInfo(req);
        await query("users_projects").insert({
          project_id: newProject!.id,
          user_id: userInfo.id
        });

        res.status(201).json(newProject);
      }
  }));

users_router.route("/:id/projects")
  .get(createRoute({
    authorization: NONE,
    preprocessing: NONE,
    validation: validateParamId,
    handler: async (req: Request, res: Response) => {
      let projects = await getUserProjectsById(parseInt(req.params["id"]));
      assert(projects);
      res.status(200).json(projects);
    }
  }));




async function getUserProjectsById(id: number) {
  return await query("projects")
    .join("users_projects", "projects.id", "users_projects.project_id")
    .select("projects.*").where({user_id: id});
}