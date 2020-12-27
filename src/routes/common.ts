import bodyParser from 'body-parser';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ValidationChain, validationResult } from 'express-validator';

// Body parsers
export const jsonBodyParser = bodyParser.json();
export const urlencodedBodyParser = bodyParser.urlencoded({ extended: false });

export {body as validateBody, param as validateParam} from 'express-validator';

export function requireAllValid(req: Request, res: Response, next: NextFunction) {
  let vr = validationResult(req);
  if (vr.isEmpty()) {
    next();
  }
  else {
    res.status(400).json({ errors: vr.array() });
  }
}

export interface CommonRouteHandlers {
  preprocessing: RequestHandler | readonly RequestHandler[];
  authorization: RequestHandler | readonly RequestHandler[];
  validation: ValidationChain | readonly ValidationChain[];
  middleware: RequestHandler | readonly RequestHandler[];
};

export function createRoute(handlers: CommonRouteHandlers) {
  
  return [
    ...(Array.isArray(handlers.preprocessing) ? handlers.preprocessing : [handlers.preprocessing]),
    ...(Array.isArray(handlers.authorization) ? handlers.authorization : [handlers.authorization]),
    ...(Array.isArray(handlers.validation) ? handlers.validation : [handlers.validation]),
    requireAllValid,
    ...(Array.isArray(handlers.middleware) ? handlers.middleware : [handlers.middleware]),
  ];
}

export const NO_PREPROCESSING = [] as readonly never[];
export const NO_AUTHORIZATION = [] as readonly never[];
export const NO_VALIDATION = [] as readonly never[];

// .post("/",
// jsonBodyParser,
// requiredValidation(
//   validateBody("id").not().exists(),
//   ...validateBodyProject,
// ),
// async (req: Request, res: Response) => {
//   let body : {[index:string]: string | undefined} = req.body;
//   await db("projects").insert({
//     contents: body.contents!
//   });
//   res.sendStatus(201);
// }
// );