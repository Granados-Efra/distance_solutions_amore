import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  deleteProduct,
  modifyProduct
} from "../controllers/Product.controllers";

const router = Router();

// main url will be 127.0.0.1:3000/products/[anyotherRoute]
const productsRouter = Router({ mergeParams: true });
router.use("/products", productsRouter);

productsRouter.get("/", getAllProducts);

productsRouter.post("/create", createProduct);

productsRouter.post("/delete", deleteProduct);

productsRouter.put("/update", modifyProduct)

export default router;
