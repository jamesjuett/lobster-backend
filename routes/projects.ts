import {Router, NextFunction } from "express";
import {db} from "../db/db"
import {body as validateBody, param as validateParam, validationResult } from 'express-validator';
import { assertValidation } from "../middleware/common";

async function getProjectById(projectId: number) {
  let result = await db("projects").where({id: projectId}).select();
  return result[0];
}

async function requireProjectOwner(projectId: number, next: NextFunction) {
  if (false) { // TODO: fix this
    next();
  }
  else {
    throw new Error("test");
    next("blsdfah");
  }
}

export const projects_router = Router();
projects_router
  // .get("/", async function (req, res) {
  //   res.json(await db("projects").select());
  // })
  .route("/:projectId")
    .get(
      validateParam("projectId").isInt(),
      assertValidation,
      // TODO auth check
      // (req,res,next) => requireProjectOwner(parseInt(req.params.projectId), next),
      async (req,res) => {
        res.json(await getProjectById(parseInt(req.params.projectId)))
      }
    )

