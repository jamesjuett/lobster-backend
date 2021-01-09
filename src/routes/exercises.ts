import { Router } from "express";
import { db } from "../db/db"
import { createRoute, NONE, validateParamId } from "./common";

export async function getExerciseById(exercise_id: number) {
  let ex = await db("exercises").where({id: exercise_id}).select().first();
  let ex_checkpoints = await db("exercises_checkpoints").where({exercise_id: exercise_id}).select("checkpoint_key");
  return Object.assign(ex, {
    checkpoint_keys: ex_checkpoints.map(c => c.checkpoint_key)
  });
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