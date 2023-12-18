import express from "express";
import { catchAsync } from "../utils/catch-async.js";
import { createProduct, getProducts } from "../controllers/product.js";
import { validateProduct } from "../validations/product.validations.js";

const productRoute = express.Router();

productRoute.get("/", (req, res) => {
  res.send("Hello World!");
});

productRoute.post("/products", validateProduct, catchAsync(createProduct));
productRoute.get("/products", catchAsync(getProducts));

export default productRoute;
