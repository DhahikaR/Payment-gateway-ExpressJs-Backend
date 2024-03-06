# Node Js Payment Gateway Midtrans Backend

This is a sample REST API of using Snap Midtrans payment using Node Js and Express Js. This code use Prisma ORM to manage MySQL database. With all Routes Create Product, Get product, Create Transaction, Get Transaction, and Update Transaction.

Use two collection, for product and transaction. This code use [express-validator](https://www.npmjs.com/package/express-validator) for validate product and transaction.

Uses middleware for handle error and validation error, and can be found in [middlewares](https://github.com/DhahikaR/Payment-gateway-ExpressJs-Backend/tree/main/src/middlewares)

## Run Locally

Clone the project

```bash
  git https://github.com/DhahikaR/payment-gateway-ExpressJs.git
```

Go to the project directory

```bash
  cd my-project
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  node src/index
```

## API Reference

Here are some main api usage, more details can be found in [routes](https://github.com/DhahikaR/payment-gateway-ExpressJs/tree/main/src/routes)
