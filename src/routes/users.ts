import { Router, Request, Response } from "express";
import { getJwtUserInfo } from "../auth/jwt_auth";
import { db } from "../db/db";
import { createRoute, NONE } from "./common";

async function getUserById(id: number) {
  return await db("users").where({id: id}).select().first();
}

export const users_router = Router();
users_router
  .get("/me", createRoute({
    authorization: NONE,
    preprocessing: NONE,
    validation: NONE,
    handler: async (req: Request, res: Response) => {
      let userInfo = getJwtUserInfo(req);
      let user = await getUserById(userInfo.id);
      if (user) {
        res.status(200);
        res.json(user);
      }
      else {
        res.status(404);
        res.send("This user does not exist.");
      }
    }
  }));