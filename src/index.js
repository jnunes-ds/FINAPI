const express = require("express");
const { v4: uuidV4 } = require("uuid");

const app = express();

app.use(express.json());

const customers = [];

// Middleware
function verifyIfExistsAccountCPF(request, response, next) {
  const { cpf } = request.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return response.status(400).json({ error: "Customer not found" });
  }

  request.customer = customer;

  return next();
}

app.post("/account", (request, response) => {
  const { cpf, name } = request.body;

  const customerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  );

  if (customerAlreadyExists) {
    return response.status(400).json({ error: "Customer already exists!" });
  }

  customers.push({
    cpf,
    name,
    id: uuidV4(),
    statment: [],
  });

  return response.status(201).send();
});

// app.use(verifyIfExistsAccountCPF);

app.get("/statment", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  return response.json(customer.statment);
});

app.post("/deposit", verifyIfExistsAccountCPF, (request, response) => {
  const { description, amount } = request.body;

  const { customer } = request;

  const statmentOperation = {
    description,
    amount,
    created_ad: new Date(),
    type: "credit",
  };

  customer.statment.push(statmentOperation);

  return response.status(201).send();
});

app.listen(3333);
