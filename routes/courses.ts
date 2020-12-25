import {Router, NextFunction } from "express";
import { ValidationChain } from "express-validator";
import {db} from "../db/db"
import { jsonBodyParser, validateBody } from "../middleware/common";

function validateShortName(chain: ValidationChain) {
  return chain.trim().isLength({min: 1, max: 20});
}

function validateFullName(chain: ValidationChain) {
  return chain.trim().isLength({min: 1, max: 100});
}

function validateTerm(chain: ValidationChain) {
  return chain.isIn(["fall", "winter", "spring", "summer"]);
}

export const courses_router = Router();
courses_router
  .get("/",
    async (req, res) => res.json(await db("courses").select())
  )
  .post("/",
    jsonBodyParser,
    validateShortName(validateBody("short_name")),
    validateFullName(validateBody("full_name")),
    validateTerm(validateBody("term")),
    validateBody("year").isInt(),
    async (req, res) => {
      await db("courses").insert(req.body);
      res.sendStatus(200);
    }
  )

