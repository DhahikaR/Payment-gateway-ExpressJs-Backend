import express from "express";
import cors from "cors";
import { logger } from "./config/logger.js";
import productRoute from "./routes/product.routes.js";
import transactionRoute from "./routes/transaction.routes.js";
import { FRONT_END_URL } from "./utils/constant.js";

const app = express();

app.use(cors({ credentials: true, origin: FRONT_END_URL }));

app.use(express.json());
app.use(productRoute);
app.use(transactionRoute);

app.listen(process.env.SERVER_PORT, () => {
  logger.info("server run");
});
