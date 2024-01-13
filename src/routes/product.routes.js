import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  deleteProduct,
  modifyProduct,
  getUniqueFields
} from "../controllers/Product.controllers";

const productsRouter = Router();

// main url will be 127.0.0.1:3000/products [anyotherRoute]
productsRouter.get("/", getAllProducts);

productsRouter.post("/create", createProduct);

productsRouter.delete("/delete", deleteProduct);

productsRouter.put("/update", modifyProduct)

productsRouter.get("/unique-values", getUniqueFields);

export default productsRouter;
