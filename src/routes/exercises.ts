import {Request, Response, Router } from "express";
import { query } from "../db/db"
import { createRoute, jsonBodyParser, NONE, validateBody, validateParamId } from "./common";

// export async function getExercisesForCourse(course_id: number) {
//   return await db("exercises").where({course_id: course_id}).select();
// }

export async function getExtrasForExercise(exercise_id: number) {
  return await query("exercises_extras").where({exercise_id: exercise_id}).select("extra_key");
}

export async function getExerciseById(exercise_id: number) {
  let ex = await query("exercises").where({id: exercise_id}).select().first();
  if (!ex) { return ex; }

  return Object.assign(
    ex,
    {extra_keys: (await getExtrasForExercise(exercise_id)).map(e => e.extra_key)}
  )
}


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
        let body : {[index:string]: string | undefined} = req.body;

        await query("exercises")
          .where({id: id})
          .update({
            exercise_key: body.exercise_key
          });
          
        res.sendStatus(204);
      }
    }));