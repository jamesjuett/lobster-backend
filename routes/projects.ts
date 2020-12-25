import Router from "express";
import {db} from "../db/db"

async function getProjectById(projectId: number) {
  console.log(projectId);
  let result = await db("projects").where({id: projectId}).select();
  return result[0];
}

export const projects_router = Router();
projects_router
  .get("/", async function (req, res) {
    let x = await db("projects").select();
    res.json(x)
  })
  .route("/:projectId")
    .get(
      // TODO auth check
      async (req,res,next) => res.json(await getProjectById(parseInt(req.params.projectId)))
    )

