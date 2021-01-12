import passport from "passport";
import passportJwt from "passport-jwt";
import { auth_config } from "../auth/config";
import jsonwebtoken from "jsonwebtoken";
import { Request } from "express";


export interface JwtUserInfo {
  id: number;
};

/**
 * DO NOT use unless on a route that has already passed through
 * the JWT authentication middleware.
 */
export function getJwtUserInfo(req: Request) {
  return req.user as JwtUserInfo;
}

passport.use(new passportJwt.Strategy(
  auth_config.jwt, (payload, done) => {
    const user = {id: parseInt(payload.sub)};
    return done(null, user, payload);
  }
));

export function generateJwt(user_id: number) {
  return jsonwebtoken.sign(
    {}, // empty payload, all we need for now is user id as subject
    auth_config.jwt.secretOrKey,
    {
      // No expiration
      subject: user_id.toString()
    }
  );
}