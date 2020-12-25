import {Router, Request, Response, NextFunction } from "express";
import { body, ValidationChain } from "express-validator";
import { DB_Courses } from "knex/types/tables";
import {db} from "../db/db"
import { requireAllValid, jsonBodyParser, validateBody, validateParam } from "../middleware/common";

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
      validateParam("id").isInt(),
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
      validateParam("id").isInt(),
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
        res.sendStatus(204);
      }
    )
    .delete(
      validateParam("id").isInt(),
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
      validateParam("id").isInt(),
      requireAllValid,
      async (req, res) => {
        let id = parseInt(req.params["id"]);
        let orig = await db("courses").where({id: id}).select().first();
        if (!orig) {
          res.sendStatus(404);
          return;
        }
        
        let {id: ignore, ...copy} = orig;
        await db("courses").insert(copy);
        res.sendStatus(201);
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

