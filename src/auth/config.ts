import { assertExists, dotenv_config, getDockerSecret } from "../util/util";
import passportJwt from "passport-jwt";
import { IOAuth2StrategyOption } from "passport-google-oauth";

dotenv_config()

export const auth_config = {
  google: {
    clientID: assertExists(process.env.GOOGLE_CLIENT_ID),
    clientSecret: getDockerSecret("google_client_secret"),
    callbackURL: assertExists(process.env.GOOGLE_CALLBACK_URL)
  },
  
  jwt: {
    jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: getDockerSecret("jwt_secret")
  }
}