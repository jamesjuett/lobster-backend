import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';

import { projects_router } from './routes/projects';
import { courses_router } from './routes/courses';
import swaggerDocs from './docs/docs.json';

const app = express();

app.get('/',
  (req,res) => res.send('Hi this is the Lobster REST API')
);

app.use("/projects", projects_router);
app.use("/courses", courses_router);

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