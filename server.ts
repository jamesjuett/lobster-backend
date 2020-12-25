import express from 'express';

import {projects_router} from './routes/projects';

const app = express();

app.get('/', 
  (req,res,next) => {res.send('Express + TypeScript Server'); next()},
  (req,res,next) => {console.log("before test"); next()},
);

app.use("/projects", projects_router);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});