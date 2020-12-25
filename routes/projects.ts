import Router from "express";

export const projects_router = Router()
  .get('/', function (req, res) {
    res.send('projects get');
  });

