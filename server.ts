import express from 'express';
const app = express();

app.get('/', 
  (req,res,next) => {res.send('Express + TypeScript Server'); next()},
  (req,res,next) => {console.log("before test"); next()},
);


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});