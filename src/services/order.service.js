import { prismaClient } from "../config/db.config.js";
import { nanoid } from "nanoid";
import { PENDING_PAYMENT } from "../utils/constant.js";

class TransactionService {
  async createTransaction({
    transaction_id,
    gross_amount,
    customer_name,
    customer_email,
    snap_token = null,
    snap_redirect_url = null,
  }) {
    return prismaClient.transaction.create({
      data: {
        id: transaction_id,
        total: gross_amount,
        status: PENDING_PAYMENT,
        customer_name,
        customer_email,
        snap_token,
        snap_redirect_url,
      },
    });
  }

  async createTransactionItem({ products, transaction_id }) {
    return prismaClient.transactionsItem.createMany({
      data: products.map((product) => ({
        id: `TRX-ITEM-${nanoid(10)}`,
        transaction_id,
        product_id: products.product_id,
        product_name: product.customer_name,
        price: product.price,
        quantity: product.quantity,
      })),
    });
  }

  async getTransaction({ status }) {
    let where = {};
    if (status) {
      where = {
        status,
      };
    }

    return prismaClient.transaction.findMany({
      where,
      include: {
        transactions_items: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
              },
            },
          },
        },
      },
    });
  }
  async getTransactionById({ transaction_id }) {
    return prismaClient.transaction.findUnique({
      where: {
        id: transaction_id,
      },
      include: {
        transactions_items: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
              },
            },
          },
        },
      },
    });
  }

  async updateTransactionStatus({
    transaction_id,
    status,
    payment_method = null,
  }) {
    return prisma.transaction.update({
      where: {
        id: transaction_id,
      },
      data: {
        status,
        payment_method,
      },
    });
  }
}

export const transactionService = new TransactionService();
