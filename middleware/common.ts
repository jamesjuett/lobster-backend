import bodyParser from 'body-parser';
import { NextFunction, Request, Response } from 'express';
import { ValidationChain, validationResult } from 'express-validator';

// Body parsers
export const jsonBodyParser = bodyParser.json();
export const urlencodedBodyParser = bodyParser.urlencoded({ extended: false });

export {body as validateBody, param as validateParam} from 'express-validator';

export function assertValidation(req: Request, res: Response, next: NextFunction) {
  let vr = validationResult(req);
  if (vr.isEmpty()) {
    next();
  }
  else {
    res.status(400).json({ errors: vr.array() });
  }
}