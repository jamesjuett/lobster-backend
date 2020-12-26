import {Router, Request, Response, NextFunction } from "express";
import { DB_Courses } from "knex/types/tables";
import {db} from "../db/db"
import { withoutProps } from "../db/db_types";
import { requireAllValid, jsonBodyParser, validateBody, validateParam } from "../middleware/common";

const validateParamId = validateParam("id").isInt();

const validateBodyShortName = validateBody("short_name").trim().isLength({min: 1, max: 20});
const validateBodyFullName = validateBody("full_name").trim().isLength({min: 1, max: 100});
const validateBodyTerm = validateBody("term").isIn(["fall", "winter", "spring", "summer"]);
const validateBodyYear = validateBody("year").isInt();

const validateBodyCourse = [
  validateBodyShortName,
  validateBodyFullName,
  validateBodyTerm,
  validateBodyYear
];

async function getCourseById(id: number) {
  return await db("projects").where({id: id}).select().first();
}

export const courses_router = Router();
courses_router
  .get("/",
    async (req, res) => {
      res.json(await db("courses").select());
      res.status(200);
    }
  )
  .post("/",
    jsonBodyParser,
    validateBody("id").not().exists(),
    validateBodyCourse,
    requireAllValid,
    async (req: Request, res: Response) => {
      let body : {[index:string]: string | undefined} = req.body;
      await db("courses").insert({
        short_name: body.short_name!,
        full_name: body.full_name!,
        term: body.term!,
        year: parseInt(body.year!),
      });
      res.sendStatus(201);
    }
  );

courses_router
  .route("/:id")
    .get(
      validateParamId,
      requireAllValid,
      async (req, res) => {
        let course = await getCourseById(parseInt(req.params["id"]));
        if (course) {
          res.json(course);
          res.status(200);
        }
        else {
          res.sendStatus(404);
        }
      }
    )
    .patch(
      jsonBodyParser,
      validateParamId,
      validateBodyCourse.map(v => v.optional()),
      requireAllValid,
      async (req: Request, res: Response) => {
        let id = parseInt(req.params["id"]);
        let body : {[index:string]: string | undefined} = req.body;

        await db("courses")
          .where({id: id})
          .update({
            short_name: body.short_name,
            full_name: body.full_name,
            term: body.term,
            year: body.year !== undefined ? parseInt(body.year) : undefined,
          });
        res.sendStatus(204); // TODO send different status if not found
      }
    )
    .delete(
      validateParamId,
      requireAllValid,
      async (req, res) => {
        let id = parseInt(req.params["id"]);
        await db("courses")
          .where({id: id})
          .delete();
        res.sendStatus(204);
      }
    );

courses_router
  .route("/:id/copy")
    .post(
      validateParamId,
      requireAllValid,
      async (req, res) => {
        let id = parseInt(req.params["id"]);
        let orig = await db("courses").where({id: id}).select().first();
        if (!orig) {
          res.sendStatus(404);
          return;
        }
        
        let copy = await db("courses")
          .insert(withoutProps(orig, "id"))
          .returning("*").first();

        if (copy) {
          res.json(copy);
          res.sendStatus(201);
        }
        else {
          res.sendStatus(500);
        }

      }
    );

courses_router
  .route("/:short_name/:term/:year")
    .get(
      validateBodyShortName,
      validateBodyTerm,
      validateBodyYear,
      requireAllValid,
      async (req, res) => {
        let course = await getCourseById(parseInt(req.params["id"]));
        if (course) {
          res.json(course);
          res.status(200);
        }
        else {
          res.sendStatus(404);
        }
      }
    );

