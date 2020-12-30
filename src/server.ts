import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';

import { projects_router } from './routes/projects';
import { courses_router } from './routes/courses';
import swaggerDocs from './docs/api-docs.json';
import passport from 'passport';
import { auth_router } from './routes/auth';
import { public_router } from './routes/public';
import { users_router } from './routes/users';
import { assert } from 'console';

const app = express();

app.get('/',
  (req,res) => res.send('Hi this is the Lobster REST API')
);

// ALL requests to the regular api require authentication
app.use('/api',
  passport.initialize(),
  passport.authenticate('jwt', { session: false })
)

// Regular API Routes
app.use("/api/users", users_router);
app.use("/api/projects", projects_router);
app.use("/api/courses", courses_router);

// Public API routes do not require authentication
app.use("/public", public_router);

// Route to obtain authentication
// (does not require prior authentication)
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