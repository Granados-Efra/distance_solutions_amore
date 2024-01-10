import express from "express";
import dotenv from 'dotenv';
import bodyParser from "body-parser";

import indexRoutes from './routes/index.routes';

dotenv.config(); // enviroment variables will be loaded here

const app = express();
app.use(bodyParser.json()); //Gives the hability to read JSON inputs

app.use(indexRoutes);

export default app;
