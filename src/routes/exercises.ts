import { NextFunction, Request, Response, Router } from "express";
import { getJwtUserInfo } from "../auth/jwt_auth";
import { query } from "../db/db"
import { getFullExerciseById, getStarterProjectForExercise } from "../db/db_exercises";
import { hasProjectReadAccess, hasProjectWriteAccess } from "../db/db_projects";
import { createRoute, jsonBodyParser, NONE, validateBody, validateParamId } from "./common";

// export async function getExercisesForCourse(course_id: number) {
//   return await db("exercises").where({course_id: course_id}).select();
// }

const validateBodyExerciseKey = validateBody("exercise_key").trim().isLength({min: 1, max: 50});

const validateBodyExercise = [
  validateBodyExerciseKey
];



async function requireExerciseReadPrivileges(req: Request, res: Response, next: NextFunction) {
  let ex_id = parseInt(req.params["id"]);
  let starter_project_id = await getStarterProjectForExercise(ex_id);

  // Access to an exercise is determined by access to its starter project
  if (starter_project_id && await hasProjectReadAccess(getJwtUserInfo(req).id, starter_project_id)) {
    return next();
  }
  else {
    // Not authorized
    res.sendStatus(403);
  }
}

async function requireExerciseWritePrivileges(req: Request, res: Response, next: NextFunction) {
  let ex_id = parseInt(req.params["id"]);
  let starter_project_id = await getStarterProjectForExercise(ex_id);

  // Access to an exercise is determined by access to its starter project
  if (starter_project_id && await hasProjectWriteAccess(getJwtUserInfo(req).id, starter_project_id)) {
    return next();
  }
  else {
    // Not authorized
    res.sendStatus(403);
  }
}


export const exercises_router = Router();
exercises_router
  .route("/:id")
    .get(createRoute({
      preprocessing:
        NONE,
      validation:
        validateParamId,
      authorization:
        requireExerciseReadPrivileges,
      handler:
        async (req,res) => {
          let exercise = await getFullExerciseById(parseInt(req.params["id"]));
          if (exercise) {
            res.status(200).json(exercise);
          }
          else {
            res.sendStatus(404);
          }
        }
    }))
    .patch(createRoute({
      preprocessing:
        jsonBodyParser,
      validation: [
        validateParamId,
        ...validateBodyExercise.map(v => v.optional())
      ],
      authorization:
        requireExerciseWritePrivileges,
      handler: async (req: Request, res: Response) => {
        let id = parseInt(req.params["id"]);
        let body = req.body;

        await query("exercises")
          .where({id: id})
          .update({
            exercise_key: body.exercise_key
          });

        res.sendStatus(204);
      }
    }));