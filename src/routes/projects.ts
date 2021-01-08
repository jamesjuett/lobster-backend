import {Request, Response, Router, NextFunction, RequestHandler } from "express";
import {db} from "../db/db"
import {body as validateBody, param as validateParam, validationResult } from 'express-validator';
import { createRoute, jsonBodyParser, NONE, } from "./common";
import { withoutProps } from "../db/db_types";
import { getJwtUserInfo } from "../auth/jwt_auth";

const validateParamId = validateParam("id").isInt();

const validateBodyName = validateBody("name").trim().isLength({min: 1, max: 100});
const validateBodyContents = validateBody("contents").trim().isLength({max: 100000});

const validateBodyProject = [
  validateBody("exercise_id").isInt().optional(),
  validateBodyName,
  validateBodyContents
];

async function getProjectById(projectId: number) {
  return await db("projects").where({id: projectId}).select().first();
}

async function requireProjectOwner(projectId: number, next: NextFunction) {
  if (false) { // TODO: fix this
    next();
  }
  else {
    throw new Error("test");
  }
}

export const projects_router = Router();
projects_router
  
  .post("/", createRoute({
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
        let body : {[index:string]: string | undefined} = req.body;
        
        // Create and get a copy of the new project
        let [newProject] = await db("projects").insert({
          name: body.name!,
          contents: body.contents!
        }).returning("*");

        // Add current user as owner for project
        let userInfo = getJwtUserInfo(req);
        await db("users_projects").insert({
          project_id: newProject!.id,
          user_id: userInfo.id
        });

        res.status(201).json(newProject);
      }
  }));

projects_router
  .route("/:id")
    .get(createRoute({
      authorization:
        NONE, // TODO add authorization,
      preprocessing:
        NONE,
      validation:
        validateParamId,
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
      authorization: NONE,
      preprocessing: jsonBodyParser,
      validation: [
        validateParamId,
        ...validateBodyProject.map(v => v.optional())
      ],
      handler: async (req: Request, res: Response) => {
        let id = parseInt(req.params["id"]);
        let body : {[index:string]: string | undefined} = req.body;

        await db("projects")
          .where({id: id})
          .update({
            name: body.name,
            contents: body.contents
          });
        res.sendStatus(204);
      }
    }))
    .delete(createRoute({
      authorization: NONE,
      preprocessing: NONE,
      validation: validateParamId,
      handler: async (req, res) => {
        let id = parseInt(req.params["id"]);
        await db("projects")
          .where({id: id})
          .delete();
        res.sendStatus(204);
      }
    }));


projects_router
  .route("/:id/copy")
    .post(createRoute({
      authorization: NONE,
      preprocessing: NONE,
      validation: validateParamId,
      handler: async (req, res) => {
        let id = parseInt(req.params["id"]);
        let orig = await db("projects").where({id: id}).select().first();
        if (!orig) {
          res.sendStatus(404);
          return;
        }
        
        let copy = await db("projects")
          .insert(withoutProps(orig, "id", "last_modified"))
          .returning("*").first();

        if (copy) {
          res.status(201);
          res.json(copy);
        }
        else {
          res.sendStatus(500);
        }
      }
    }));