import express from "express";
import {
  createTransaction,
  getTransactionById,
  getTransactions,
  transactionNotification,
  updateTransactionStatus,
} from "../controllers/order.js";
import { catchAsync } from "../utils/catch-async.js";
import {
  validateTransaction,
  validateTransactionStatus,
} from "../validations/transaction.validations.js";

const transactionRoute = express.Router();

transactionRoute.get("/", (req, res) => {
  res.send("Hello World!");
});

transactionRoute.post(
  "/transactions",
  validateTransaction,
  catchAsync(createTransaction)
);
transactionRoute.get("/transactions", catchAsync(getTransactions));
transactionRoute.get(
  "/transactions/:transaction_id",
  catchAsync(getTransactionById)
);
transactionRoute.put(
  "/transactions/:transaction_id",
  validateTransactionStatus,
  catchAsync(updateTransactionStatus)
);
transactionRoute.post('/transactions/notification', catchAsync(transactionNotification))
export default transactionRoute;
