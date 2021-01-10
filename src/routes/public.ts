import {Request, Response, Router, NextFunction } from "express";
import {query} from "../db/db"
import {body as validateBody, param as validateParam, validationResult } from 'express-validator';
import { createRoute, jsonBodyParser, NONE } from "./common";
import { withoutProps } from "../db/db_types";
import { getCourseByIdRoute, getCourseByShortNameTermYearRoute, getCoursesRoute } from "./courses";
import { getPublicCourseProjects } from "../db/db_courses";

const validateParamId = validateParam("id").isInt();

// const validateBodyContents = validateBody("contents").trim().isLength({max: 100000});

// const validateBodyProject = [
//   validateBodyContents
// ];

// async function getProjectById(projectId: number) {
//   return await db("projects").where({id: projectId}).select().first();
// }

// async function requireProjectOwner(projectId: number, next: NextFunction) {
//   if (false) { // TODO: fix this
//     next();
//   }
//   else {
//     throw new Error("test");
//   }
// }

export const public_router = Router();

public_router
  .get("/projects/:id", createRoute({
    
    authorization: NONE,
    preprocessing: NONE,
    validation: validateParamId,
    handler: async (req,res) => {
      let id = parseInt(req.params["id"]);
      let project = await query("projects")
        .where({
          id: id,
          is_public: true,
        })
        .select().first();

      if (project) {
        res.json(project);
        res.status(200);
      }
      else {
        // Send 404 and a vague message since we don't care to tell them
        // whether the project exists or not (and the DB result doesn't
        // even tell us here).
        res.status(404);
        res.send("This project either does not exist or is not public.");
      }
    }
  }))
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