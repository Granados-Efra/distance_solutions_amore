import express from "express";
import dotenv from 'dotenv';
import bodyParser from "body-parser";
import cors from 'cors'

import productRoutes from './routes/product.routes';
import userRoutes from './routes/user.routes'

dotenv.config(); // enviroment variables will be loaded here

const app = express();
app.use(bodyParser.json()); //Gives the hability to read JSON inputs
app.use(cors({
    origin: '*',
  }));
  

app.use('/products', productRoutes);
app.use('/users/',userRoutes);

export default app;
