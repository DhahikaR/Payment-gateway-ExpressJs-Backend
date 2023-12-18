import { transactionService } from "../services/order.service.js";
import { productService } from "../services/product.service.js";
import { nanoid } from "nanoid";
import crypto from 'crypto'
import { reformTransaction } from "../utils/reform-Transaction.js";
import {
  MIDTRANS_SERVER_KEY,
  MIDTRANS_APP_URL,
  FRONT_END_URL,
  PENDING_PAYMENT,
  PAID,
  CANCELED,
} from "../utils/constant.js";
import { logger } from "../config/logger.js";

export const createTransaction = async (req, res) => {
  const { products, customer_name, customer_email } = req.body;

  const productIndDatabase = await productService.getProductsById({ products });

  if (productIndDatabase.length === 0) {
    return res.status(404).json({ message: "Product Not Found" });
  }

  productIndDatabase.forEach((product) => {
    const productRequest = products.find(
      (productRequest) => productRequest.id === product.id
    );
    product.quantity = productRequest.quantity;
  });

  const transaction_id = `TRX-${nanoid(4)}-${nanoid(8)}`;
  const gross_amount = productIndDatabase.reduce(
    (acc, product) => acc + product.quantity * product.price,
    0
  );

  const authString = btoa(`${MIDTRANS_SERVER_KEY}:`);

  const payload = {
    transaction_details: {
      order_id: transaction_id,
      gross_amount,
    },
    item_details: productIndDatabase.map((product) => ({
      id: product.id,
      price: product.price,
      quantity: product.quantity,
      name: product.name,
    })),
    customer_details: {
      name: customer_name,
      email: customer_email,
    },
    callbacks: {
      finish: `${FRONT_END_URL}/order-status?transaction_id=${transaction_id}`,
      error: `${FRONT_END_URL}/order-status?transaction_id=${transaction_id}`,
      pending: `${FRONT_END_URL}/order-status?transaction_id=${transaction_id}`,
    },
  };

  const response = await fetch(`${MIDTRANS_APP_URL}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Basic ${authString}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (response.status !== 201) {
    return res.status(500).json({ message: "Failed to create Transaction" });
  }

  await Promise.all([
    transactionService.createTransaction({
      transaction_id,
      gross_amount,
      customer_name,
      customer_email,
      snap_token: data.token,
      snap_redirect_url: data.redirect_url,
    }),
  ]);
  res.json({
    status: "success",
    data: {
      id: transaction_id,
      status: PENDING_PAYMENT,
      customer_name,
      customer_email,
      products: productIndDatabase,
      snap_token: data.token,
      snap_redirect_url: data.snap_redirect_url,
    },
  });
};

export const getTransactions = async (req, res) => {
  const { status } = req.query;
  const transaction = await transactionService.getTransaction({ status });

  res.json({
    status: "Success",
    data: transaction.map((transaction) => reformTransaction(transaction)),
  });
};

export const getTransactionById = async (req, res) => {
  const { transaction_id } = req.params;
  const transaction = await transactionService.getTransactionById({
    transaction_id,
  });

  if (!transaction) {
    return res
      .status(404)
      .json({ status: "error", message: "Transaction Not Found" });
  }

  res.json({
    status: "Success",
    data: reformTransaction(transaction),
  });
};

export const updateTransactionStatus = async (req, res) => {
  const { transaction_id } = req.params;
  const { status } = req.body;
  const transaction = await transactionService.updateTransactionStatus({
    transaction_id,
    status,
  });

  res.json({
    status: "success",
    data: transaction,
  });
};

const updateStatusMidtrans =async(transaction_id, data) => {
const hash = crypto.createHash('sha512').update(`${transaction_id}${data.status_code}${data.gross_amount}${MIDTRANS_SERVER_KEY}`).digest('hex')
if(data.signature_key !== hash){
  return{
    status: 'error',
    message: 'invalid signature key'
  }
}
let responseData = null
let transactionStatus = data.transaction_status
let fraudStatus = data.fraud_status

if(transactionStatus == 'capture'){
  if(fraudStatus == 'accept'){
const transaction = await transactionService.updateTransactionStatus({transaction_id, status: PAID, payment_method: data.payment_type})
responseData = transaction
  }
}else if(transactionStatus == 'settlement'){
  const transaction = await transactionService.updateTransactionStatus({transaction_id, status: PAID, payment_method: data.payment_type})
  responseData = transaction
} else if(transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire'){
  const transaction = await transactionService.updateTransactionStatus({transaction_id, status: CANCELED})
  responseData = transaction
} else if (transactionStatus == 'pending'){
  const transaction = await transactionService.updateTransactionStatus({transaction_id, status: PENDING_PAYMENT})
  responseData = transaction
}

return {
  status: 'success',
  data: responseData
}
}

export const transactionNotification = async(req, res) => {
  const data = req.body

transactionService.getTransactionById({transaction_id: data.order_id}).then((transaction) => {
  if(transaction){
updateStatusMidtrans(transaction.id, data).then(result => {
  logger.info('result', result)
}
)
  }
})

  res.status(200).json({status: 'success'})
}
