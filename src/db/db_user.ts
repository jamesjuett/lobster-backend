import { first as firstResult, query } from "./db";

export async function getOrCreateUser(email: string) {
  let user = await query("users")
    .where({email: email})
    .select().first();

  if (!user) {
    user = firstResult(await query("users")
      .insert({
        email: email,
        name: email // set initial name to their email, can change later
      })
      .returning("*"));
  }

  return user;
}

export async function isSuperUser(user_id: number) {
  let result = await query("users").where({id: user_id}).select("is_super").first();
  return !!result?.is_super;
}