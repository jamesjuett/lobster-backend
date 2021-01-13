import {NextFunction, Request, Response, Router } from "express";
import { param as validateParam } from 'express-validator';
import { createRoute, NONE } from "./common";
import { getCourseByIdRoute, getCourseByShortNameTermYearRoute, getCoursesRoute } from "./courses";
import { getPublicCourseProjects } from "../db/db_courses";
import { getProjectById, hasProjectWriteAccess, isProjectPublic } from "../db/db_projects";
import { getJwtUserInfo } from "../auth/jwt_auth";
import { getFullExerciseById } from "../db/db_exercises";

const validateParamId = validateParam("id").isInt();

async function requireProjectIsPublic(req: Request, res: Response, next: NextFunction) {
  let project_id = parseInt(req.params["id"]);

  if (await isProjectPublic(project_id)) {
    return next();
  }
  else {
    // Not authorized
    res.sendStatus(403);
  }

}

export const public_router = Router();

public_router
  .get("/courses", getCoursesRoute)
  .get("/courses/:id", getCourseByIdRoute)
  .get("/courses/:short_name/:term/:year", getCourseByShortNameTermYearRoute);

  
public_router.route("/courses/:id/projects")
  .get(createRoute({
    authorization: NONE,
    preprocessing: NONE,
    validation: validateParamId,
    handler: async (req: Request, res: Response) => {
      let projects = await getPublicCourseProjects(parseInt(req.params["id"]));
      res.status(200).json(projects);
    }
  }));

  

public_router
.route("/projects/:id/full")
  .get(createRoute({
    preprocessing:
      NONE,
    validation:
      validateParamId,
    authorization:
      requireProjectIsPublic,
    handler:
      async (req,res) => {
        let project = await getProjectById(parseInt(req.params["id"]));
        if (project) {
          Object.assign(project, {
            write_access: false,
            exercise: await getFullExerciseById(project.exercise_id!)
          })
          
          res.status(200).json(project);
        }
        else {
          res.sendStatus(404);
        }
      }
  }))