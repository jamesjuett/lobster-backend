import {Request, Response, Router } from "express";
import { query } from "../db/db"
import { getExerciseById } from "../db/db_exercises";
import { createRoute, jsonBodyParser, NONE, validateBody, validateParamId } from "./common";

// export async function getExercisesForCourse(course_id: number) {
//   return await db("exercises").where({course_id: course_id}).select();
// }

const validateBodyExerciseKey = validateBody("exercise_key").trim().isLength({min: 1, max: 50});

const validateBodyExercise = [
  validateBodyExerciseKey
];


export const exercises_router = Router();
exercises_router
  .route("/:id")
    .get(createRoute({
      authorization:
        NONE,
      preprocessing:
        NONE,
      validation:
        validateParamId,
      handler:
        async (req,res) => {
          let exercise = await getExerciseById(parseInt(req.params["id"]));
          if (exercise) {
            res.status(200).json(exercise);
          }
          else {
            res.sendStatus(404);
          }
        }
    }))
    .patch(createRoute({
      authorization:
        NONE,
      preprocessing:
        jsonBodyParser,
      validation: [
        validateParamId,
        ...validateBodyExercise.map(v => v.optional())
      ],
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