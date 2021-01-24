import { Router } from "express";
import passport from "passport";
import { OAuth2Strategy as GoogleStrategy } from "passport-google-oauth";
import { auth_config } from "../auth/config";
import { generateJwt } from "../auth/jwt_auth";
import { query } from "../db/db";
import { getOrCreateUser } from "../db/db_user";


passport.use(new GoogleStrategy(
  auth_config.google,
  async (accessToken, refreshToken, profile, done) => {
    let email = profile.emails![0].value;
    let user = await getOrCreateUser(email);

    if (!user) {
      // Error adding new user
      return done(new Error("Failed to add new user to database. :("))
    }
    

    return done(null, {id: user.id});
  }
));

export const auth_router = Router();
auth_router
  .use(passport.initialize())
  .get("/google",
    passport.authenticate("google", { session: false, scope: ["openid", "email"] })
  )
  .get("/google/callback",
    passport.authenticate("google", { session: false }),
    (req, res) => {
      res.cookie("bearer", generateJwt((req.user as any).id), {
        secure: true
      });
      res.redirect(302, "/");
      // res.sendStatus(302);
    }
  )
