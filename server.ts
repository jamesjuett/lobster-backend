import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';

import { projects_router } from './routes/projects';
import { courses_router } from './routes/courses';
import swaggerDocs from './docs/docs.json';
import passport from 'passport';
import { passport_jwt_middleware } from './auth/jwt_auth';
import { auth_router } from './routes/auth';

const app = express();

app.get('/',
  (req,res) => res.send('Hi this is the Lobster REST API')
);

app.use(passport_jwt_middleware);

app.get('/users/whoami',
  // This request must be authenticated using a JWT, or else we will fail
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.send('Secure response from ' + JSON.stringify(req.user));
  }
);


app.use("/projects", projects_router);
app.use("/courses", courses_router);
app.use("/auth", auth_router);

// Swagger API docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Generic error handler
// Basically indicates we missed something oops
app.use( (err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  res.sendStatus(500);
});



const PORT = 3000;
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});