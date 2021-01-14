import bodyParser from 'body-parser';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { param as validateParam, body as validateBody, ValidationChain, validationResult } from 'express-validator';
import { getJwtUserInfo } from '../auth/jwt_auth';
import { isSuperUser } from '../db/db_user';

// Body parsers
export const jsonBodyParser = bodyParser.json();
export const urlencodedBodyParser = bodyParser.urlencoded({ extended: false });

export {body as validateBody, param as validateParam} from 'express-validator';

function requireAllValid(req: Request, res: Response, next: NextFunction) {
  let vr = validationResult(req);
  if (vr.isEmpty()) {
    next();
  }
  else {
    res.status(400).json({ errors: vr.array() });
  }
}

export async function requireSuperUser(req: Request, res: Response, next: NextFunction) {
  let user_id = getJwtUserInfo(req).id;

  if (await isSuperUser(user_id)) {
    return next();
  }
  else {
    // Not authorized
    res.sendStatus(403);
  }

}

export interface CommonRouteHandlers {
  preprocessing: RequestHandler | readonly RequestHandler[];
  authorization: RequestHandler | readonly RequestHandler[];
  validation: ValidationChain | readonly ValidationChain[];
  handler: RequestHandler | readonly RequestHandler[];
};

export function createRoute(handlers: CommonRouteHandlers) {
  
  return [
    ...(Array.isArray(handlers.preprocessing) ? handlers.preprocessing : [handlers.preprocessing]),
    ...(Array.isArray(handlers.validation) ? handlers.validation : [handlers.validation]),
    ...(Array.isArray(handlers.authorization) ? handlers.authorization : [handlers.authorization]),
    requireAllValid,
    ...(Array.isArray(handlers.handler) ? handlers.handler : [handlers.handler]),
  ];
}

export const NO_PREPROCESSING = [] as readonly never[];
export const NO_VALIDATION = [] as readonly never[];
export const NO_AUTHORIZATION = [] as readonly never[];

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

export const validateParamId = validateParam("id").isInt();