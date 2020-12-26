import { Router } from "express";
import passport from "passport";
import { OAuth2Strategy as GoogleStrategy } from "passport-google-oauth";
import { auth_config } from "../auth/config";
import { generateJwt } from "../auth/jwt_auth";
import { db } from "../db/db";


passport.use(new GoogleStrategy(
  auth_config.google,
  async (accessToken, refreshToken, profile, done) => {
    let email = profile.emails![0].value;
    let user = await db("users")
      .where({email: email})
      .select().first();

    if (!user) {
      user = await db("users")
        .insert({
          email: email,
          name: "unnamed user"
        })
        .returning("*").first();

      if (!user) {
        // Error adding new user
        return done(new Error("Failed to add new user to database. :("))
      }
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
      res.cookie("bearer", generateJwt((req.user as any).id));
      res.redirect("/");
    }
  )
