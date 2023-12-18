import { prismaClient } from "../config/db.config.js";
import { v4 as uuidv4 } from "uuid";

class ProductService {
  async createProduct({ name, price, image }) {
    const id = uuidv4();
    return prismaClient.product.create({
      data: {
        id,
        name,
        price,
        image: `https://picsum.photos/143/108?random=${id}`,
      },
    });
  }

  async getProducts() {
    return prismaClient.product.findMany();
  }

  async getProductsById({ products }) {
    return prismaClient.product.findMany({
      where: {
        id: {
          in: products.map((product) => product.id),
        },
      },
    });
  }
}

export const productService = new ProductService();
