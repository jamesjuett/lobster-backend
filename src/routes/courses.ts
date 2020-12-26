import {Router, Request, Response, NextFunction } from "express";
import { DB_Courses } from "knex/types/tables";
import {db} from "../db/db"
import { withoutProps } from "../db/db_types";
import { requireAllValid, jsonBodyParser, validateBody, validateParam } from "../middleware/common";

const validateParamId = validateParam("id").isInt();

const validateParamShortName = validateParam("short_name").trim().isLength({min: 1, max: 20});
const validateParamTerm = validateParam("term").isIn(["fall", "winter", "spring", "summer"]);
const validateParamYear = validateParam("year").isInt();


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

export const getCourses = async (req: Request, res: Response) => {
  res.status(200);
  res.json(await db("courses").select());
};

export const getCourseByIdParam = [
  validateParamId,
  requireAllValid,
  async (req: Request, res: Response) => {
    let course = await getCourseById(parseInt(req.params["id"]));
    if (course) {
      res.status(200);
      res.json(course);
    }
    else {
      res.status(404);
      res.send("This course does not exist.");
    }
  }
];

export const getCourseByShortNameTermYear = [
  validateParamShortName,
  validateParamTerm,
  validateParamYear,
  requireAllValid,
  async (req: Request, res: Response) => {
    let course = await db("courses")
      .where({
        short_name: req.params["short_name"],
        term: req.params["term"],
        year: parseInt(req.params["year"])
      }).select().first();
      
    if (course) {
      res.status(200);
      res.json(course);
    }
    else {
      res.status(404);
      res.send("This course does not exist.");
    }
  }
]

async function getCourseById(id: number) {
  return await db("courses").where({id: id}).select().first();
}

export const courses_router = Router();
courses_router
  .get("/",
    getCourses
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
      getCourseByIdParam
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
          res.status(201);
          res.json(copy);
        }
        else {
          res.sendStatus(500);
        }

      }
    );

courses_router
  .route("/:short_name/:term/:year")
    .get(
      getCourseByShortNameTermYear
    );

