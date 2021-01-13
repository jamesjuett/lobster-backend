import {Request, Response, Router, NextFunction, RequestHandler } from "express";
import {query} from "../db/db"
import {body as validateBody, param as validateParam, validationResult } from 'express-validator';
import { createRoute, jsonBodyParser, NONE, validateParamId, } from "./common";
import { withoutProps } from "../db/db_types";
import { getJwtUserInfo, JwtUserInfo } from "../auth/jwt_auth";
import { getFullExerciseById } from "../db/db_exercises";
import { getProjectById, hasProjectReadAccess, hasProjectWriteAccess } from "../db/db_projects";

const validateBodyName = validateBody("name").trim().isLength({min: 1, max: 100});
const validateBodyContents = validateBody("contents").trim().isLength({max: 100000});

export const validateBodyProject = [
  validateBody("exercise_id").isInt().optional(),
  validateBodyName,
  validateBodyContents
];

async function requireProjectReadPrivileges(req: Request, res: Response, next: NextFunction) {
  let user_id = getJwtUserInfo(req).id;
  let project_id = parseInt(req.params["id"]);

  if (await hasProjectReadAccess(user_id, project_id)) {
    return next();
  }
  else {
    // Not authorized
    res.sendStatus(403);
  }

}

async function requireProjectWritePrivileges(req: Request, res: Response, next: NextFunction) {
  let user_id = getJwtUserInfo(req).id;
  let project_id = parseInt(req.params["id"]);

  if (await hasProjectWriteAccess(user_id, project_id)) {
    return next();
  }
  else {
    // Not authorized
    res.sendStatus(403);
  }

}

export const projects_router = Router();

projects_router
  .route("/:id")
    .get(createRoute({
      preprocessing:
        NONE,
      validation:
        validateParamId,
      authorization:
        requireProjectReadPrivileges,
      handler:
        async (req,res) => {
          let project = await getProjectById(parseInt(req.params["id"]));
          if (project) {
            res.status(200).json(project);
          }
          else {
            res.sendStatus(404);
          }
        }
    }))
    .patch(createRoute({
      preprocessing: jsonBodyParser,
      validation: [
        validateParamId,
        ...validateBodyProject.map(v => v.optional())
      ],
      authorization:
        requireProjectWritePrivileges,
      handler: async (req: Request, res: Response) => {
        let id = parseInt(req.params["id"]);
        let body = req.body;

        await query("projects")
          .where({id: id})
          .update({
            name: body.name,
            contents: body.contents,
            is_public: body.is_public,
          });
        res.sendStatus(204);
      }
    }))
    .delete(createRoute({
      preprocessing: NONE,
      validation: validateParamId,
      authorization:
        requireProjectWritePrivileges,
      handler: async (req, res) => {
        let id = parseInt(req.params["id"]);
        await query("projects")
          .where({id: id})
          .delete();
        res.sendStatus(204);
      }
    }));


projects_router
  .route("/:id/copy")
    .post(createRoute({
      authorization:
        requireProjectReadPrivileges,
      preprocessing: NONE,
      validation: validateParamId,
      handler: async (req, res) => {
        let id = parseInt(req.params["id"]);
        let orig = await query("projects").where({id: id}).select().first();
        if (!orig) {
          res.sendStatus(404);
          return;
        }
        
        let [copy] = await query("projects")
          .insert(withoutProps(orig, "id", "last_modified"))
          .returning("*");

        if (copy) {
          res.status(201);
          res.json(copy);
        }
        else {
          res.sendStatus(500);
        }
      }
    }));

projects_router
  .route("/:id/full")
    .get(createRoute({
      preprocessing:
        NONE,
      validation:
        validateParamId,
      authorization:
        requireProjectReadPrivileges,
      handler:
        async (req,res) => {
          let project = await getProjectById(parseInt(req.params["id"]));
          if (project) {
            Object.assign(project, {
              write_access: await hasProjectWriteAccess(getJwtUserInfo(req).id, project.id),
              exercise: await getFullExerciseById(project.exercise_id!)
            })
            
            res.status(200).json(project);
          }
          else {
            res.sendStatus(404);
          }
        }
    }))