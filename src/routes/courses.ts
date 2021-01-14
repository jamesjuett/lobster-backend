import {Router, Request, Response, NextFunction } from "express";
import { DB_Courses, DB_Projects } from "knex/types/tables";
import { getJwtUserInfo } from "../auth/jwt_auth";
import { query } from "../db/db"
import { getCourse, getAllCourseProjects, getCourseByShortNameTermYear, isCourseAdmin, getPublicCourseProjects } from "../db/db_courses";
import { createCourseProject } from "../db/db_projects";
import { withoutProps } from "../db/db_types";
import { jsonBodyParser, validateBody, validateParam, createRoute, validateParamId, requireSuperUser, NO_AUTHORIZATION, NO_PREPROCESSING, NO_VALIDATION } from "./common";
import { validateBodyProject } from "./projects";

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



async function requireCourseAdmin(req: Request, res: Response, next: NextFunction) {
  let user_id = getJwtUserInfo(req).id;
  let course_id = parseInt(req.params["id"]);

  if (await isCourseAdmin(user_id, course_id)) {
    return next();
  }
  else {
    // Not authorized
    res.sendStatus(403);
  }

}

export const getCoursesRoute = createRoute({
  preprocessing: NO_PREPROCESSING,
  validation: NO_VALIDATION,
  authorization: NO_AUTHORIZATION,
  handler: async (req: Request, res: Response) => {
    res.status(200);
    res.json(await query("courses").select());
  }
});


export const getCourseByIdRoute = createRoute({
  preprocessing: NO_PREPROCESSING,
  validation: validateParamId,
  authorization: NO_AUTHORIZATION,
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
  preprocessing: NO_PREPROCESSING,
  validation: [
    validateParamShortName,
    validateParamTerm,
    validateParamYear,
  ],
  authorization: NO_AUTHORIZATION,
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
    authorization: requireSuperUser,
    preprocessing: jsonBodyParser,
    validation: [
      validateBody("id").not().exists(),
      ...validateBodyCourse,
    ],
    handler: async (req: Request, res: Response) => {
      let body = req.body;
      await query("courses").insert({
        short_name: body.short_name!,
        full_name: body.full_name!,
        term: body.term!,
        year: body.year!,
      });
      res.sendStatus(201);
    }
  }));

courses_router
  .route("/:id")
    .get(getCourseByIdRoute)
    .patch(createRoute({
      preprocessing: jsonBodyParser,
      validation: [
        validateParamId,
        ...validateBodyCourse.map(v => v.optional())
      ],
      authorization: requireCourseAdmin,
      handler: async (req: Request, res: Response) => {
        let id = parseInt(req.params["id"]);
        let body = req.body;

        await query("courses")
          .where({id: id})
          .update({
            short_name: body.short_name,
            full_name: body.full_name,
            term: body.term,
            year: body.year,
          });
        res.sendStatus(204); // TODO send different status if not found
      }
    }))
    .delete(createRoute({
      preprocessing: NO_PREPROCESSING,
      validation: validateParamId,
      authorization: requireSuperUser,
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
      preprocessing: NO_PREPROCESSING,
      validation: validateParamId,
      authorization: requireSuperUser,
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
    preprocessing: NO_PREPROCESSING,
    validation: validateParamId,
    authorization: NO_AUTHORIZATION,
    handler: async (req: Request, res: Response) => {
      let user_id = getJwtUserInfo(req).id;
      let course_id = parseInt(req.params["id"]);

      let projects = await isCourseAdmin(user_id, course_id)
        ? await getAllCourseProjects(course_id)
        : await getPublicCourseProjects(course_id);

      res.status(200).json(projects);
    }
  }))
  .post(createRoute({
    preprocessing: jsonBodyParser,
    validation:
      [
        validateParamId,
        ...validateBodyProject
      ],
    authorization: requireCourseAdmin,
    handler:
      async (req: Request, res: Response) => {
        let body = req.body;
        
        let newProject = await createCourseProject(
          parseInt(req.params["id"]),
          body.name!,
          body.contents!,
          body.exercise_id,
          body.is_public
        );

        res.status(201).json(newProject);
      }
  }));
