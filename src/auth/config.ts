import { assertExists, dotenv_config } from "../util/util";
import passportJwt from "passport-jwt";
import { IOAuth2StrategyOption } from "passport-google-oauth";

dotenv_config()

export const auth_config = {
  google: {
    clientID: assertExists(process.env.GOOGLE_CLIENT_ID),
    clientSecret: assertExists(process.env.GOOGLE_CLIENT_SECRET),
    callbackURL: process.env.GOOGLE_CALLBACK_URL!
  },
  
  jwt: {
    jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: assertExists(process.env.JWT_SECRET)
  }
}