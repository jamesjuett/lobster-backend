import { Router } from "express";
import { query } from "../db/db"
import { createRoute, NONE, validateParamId } from "./common";

export async function getExerciseById(exercise_id: number) {
  return await query("exercises").where({id: exercise_id}).select().first();
}

// export async function getExercisesForCourse(course_id: number) {
//   return await db("exercises").where({course_id: course_id}).select();
// }

export async function getCheckpointsForExercise(exercise_id: number) {
  return await query("exercises_checkpoints").where({exercise_id: exercise_id}).select("checkpoint_key");
}

export async function getFullExerciseById(exercise_id: number) {
  let ex = await getExerciseById(exercise_id);
  if (!ex) { return ex; }

  return Object.assign(
    ex,
    {checkpoint_keys: (await getCheckpointsForExercise(exercise_id)).map(c => c.checkpoint_key)}
  )
}


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
    }));

    
exercises_router
.route("/:id/full")
  .get(createRoute({
    authorization:
      NONE,
    preprocessing:
      NONE,
    validation:
      validateParamId,
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
  }));