import { query } from "./db";

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
  
  export async function createExercise() {
    let [new_ex] = (await query("exercises").insert({
      exercise_key: "",
    }).returning("*"));
  
    return new_ex;
  }