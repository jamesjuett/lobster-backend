import { query } from "./db";
import { withoutProps } from "./db_types";

export async function getExtrasForExercise(exercise_id: number) {
  return await query("exercises_extras").where({exercise_id: exercise_id}).select("extra_key");
}

export async function getExerciseById(exercise_id: number) {
  return await query("exercises").where({id: exercise_id}).select().first();
}

export async function getStarterProjectForExercise(exercise_id: number) {
  let result = await query("exercises").where({id: exercise_id}).select("starter_project_id").first();
  return result?.starter_project_id;
}

export async function getFullExerciseById(exercise_id: number) {
  let ex = await query("exercises").where({id: exercise_id}).select().first();
  if (!ex) { return ex; }

  return Object.assign(
    ex,
    {extra_keys: (await getExtrasForExercise(exercise_id)).map(e => e.extra_key)}
  )
}

export async function createExercise() {
  let [new_ex] = (await query("exercises").insert({
    exercise_key: "",
  }).returning("*"));

  return new_ex;
}

export async function duplicateExercise(exercise_id: number) {
  let orig_ex = await getExerciseById(exercise_id);
  if (!orig_ex) { return undefined; }

  let [new_ex] = (await query("exercises").insert(
    withoutProps(orig_ex, "id")
  ).returning("*"));

  let extras = await getExtrasForExercise(exercise_id);
  await Promise.all(
    extras.map(async e => {
      await query("exercises_extras").insert({
        exercise_id: new_ex.id,
        extra_key: e.extra_key,
      });
    })
  );

  return new_ex;
}