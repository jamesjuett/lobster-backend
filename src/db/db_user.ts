import { query } from "./db";

export async function isSuperUser(user_id: number) {
  let result = await query("users").where({id: user_id}).select("is_super").first();
  return !!result?.is_super;
}