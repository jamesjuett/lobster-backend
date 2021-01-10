import {Router, Request, Response, NextFunction } from "express";
import { DB_Courses, DB_Projects } from "knex/types/tables";
import { query } from "../db/db"
import { getCourse, getAllCourseProjects, getCourseByShortNameTermYear } from "../db/db_courses";
import { withoutProps } from "../db/db_types";
import { jsonBodyParser, validateBody, validateParam, createRoute, NONE, validateParamId } from "./common";

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


export const getCoursesRoute = createRoute({
  authorization: NONE,
  preprocessing: NONE,
  validation: NONE,
  handler: async (req: Request, res: Response) => {
    res.status(200);
    res.json(await query("courses").select());
  }
});


export const getCourseByIdRoute = createRoute({
  authorization: NONE,
  preprocessing: NONE,
  validation: validateParamId,
  handler: async (req: Request, res: Response) => {
    let course = await getCourse(parseInt(req.params["id"]));
    if (course) {
      res.status(200);
      res.json(course);
    }
    else {
      res.status(404);
      res.send("This course does not exist.");
    }
  }
});

export const getCourseByShortNameTermYearRoute = createRoute({
  authorization: NONE,
  preprocessing: NONE,
  validation: [
    validateParamShortName,
    validateParamTerm,
    validateParamYear,
  ],
  handler: async (req: Request, res: Response) => {
    let course = getCourseByShortNameTermYear(
      req.params["short_name"],
      req.params["term"],
      parseInt(req.params["year"])
    );
      
    if (course) {
      res.status(200);
      res.json(course);
    }
    else {
      res.status(404);
      res.send("This course does not exist.");
    }
  }
});

export const courses_router = Router();
courses_router
  .get("/", getCoursesRoute)
  .post("/", createRoute({
    authorization: NONE,
    preprocessing: jsonBodyParser,
    validation: [
      validateBody("id").not().exists(),
      ...validateBodyCourse,
    ],
    handler: async (req: Request, res: Response) => {
      let body : {[index:string]: string | undefined} = req.body;
      await query("courses").insert({
        short_name: body.short_name!,
        full_name: body.full_name!,
        term: body.term!,
        year: parseInt(body.year!),
      });
      res.sendStatus(201);
    }
  }));

courses_router
  .route("/:id")
    .get(getCourseByIdRoute)
    .patch(createRoute({
      authorization: NONE,
      preprocessing: jsonBodyParser,
      validation: [
        validateParamId,
        ...validateBodyCourse.map(v => v.optional())
      ],
      handler: async (req: Request, res: Response) => {
        let id = parseInt(req.params["id"]);
        let body : {[index:string]: string | undefined} = req.body;

        await query("courses")
          .where({id: id})
          .update({
            short_name: body.short_name,
            full_name: body.full_name,
            term: body.term,
            year: body.year !== undefined ? parseInt(body.year) : undefined,
          });
        res.sendStatus(204); // TODO send different status if not found
      }
    }))
    .delete(createRoute({
      authorization: NONE,
      preprocessing: NONE,
      validation: validateParamId,
      handler: async (req, res) => {
        let id = parseInt(req.params["id"]);
        await query("courses")
          .where({id: id})
          .delete();
        res.sendStatus(204);
      }
    }));

courses_router
  .route("/:id/copy")
    .post(createRoute({
      authorization: NONE,
      preprocessing: NONE,
      validation: validateParamId,
      handler: async (req, res) => {
        let id = parseInt(req.params["id"]);
        let orig = await query("courses").where({id: id}).select().first();
        if (!orig) {
          res.sendStatus(404);
          return;
        }
        
        let [copy] = await query("courses")
          .insert(withoutProps(orig, "id"))
          .returning("*");

        if (copy) {
          res.status(201);
          res.json(copy);
        }
        else {
          res.sendStatus(500);
        }

      }
    }));

courses_router
  .route("/:short_name/:term/:year")
    .get(
      getCourseByShortNameTermYearRoute
    );


courses_router.route("/:id/projects")
  .get(createRoute({
    authorization: NONE,
    preprocessing: NONE,
    validation: validateParamId,
    handler: async (req: Request, res: Response) => {
      let projects = await getAllCourseProjects(parseInt(req.params["id"]));
      res.status(200).json(projects);
    }
  }));

  