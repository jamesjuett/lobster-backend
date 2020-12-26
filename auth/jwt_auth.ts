import passport from "passport";
import passportJwt from "passport-jwt";
import { auth_config } from "../auth/config";
import jsonwebtoken from "jsonwebtoken";


passport.use(new passportJwt.Strategy(
  auth_config.jwt, (payload, done) => {
    const user = {id: parseInt(payload.sub)};
    return done(null, user, payload);
  }
));

export const passport_jwt_middleware = passport.initialize();

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