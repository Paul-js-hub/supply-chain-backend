import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

const port = process.env.PORT || 8080;

app.use(cors())
app.use(express.json())
app.get("/", (req, res) =>{
  res.json({message: "Alive"})
});

app.get("/categories", async(req, res) => {
  const allCategories = await prisma.category.findMany({
    include: {
      products: true
    }
  })
  res.status(200).json(allCategories)
});

app.get("/products", async(req, res) => {
  const allProducts = await prisma.product.findMany()
  res.status(200).json(allProducts)
});

app.post("/categories", async(req, res) =>{
  const {name, description} = req.body
  const result = await prisma.category.create({
    data: {
      name,
      description
    }
  })

  res.status(201).json(result)
})

app.post("/products", async(req, res) =>{
  const {name, price, description, categoryID} = req.body
  const result = await prisma.product.create({
    data: {
      name,
      price,
      description,
      categoryID: parseInt(categoryID)
    }
  })

  res.status(201).json(result)
})



app.listen(port, () => {
  console.log(`Listening to requests on port ${port}`);
})