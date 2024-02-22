import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("root");
});

//Categories
app.get("/categories", async (req, res) => {
  try {
    const allCategories = await prisma.category.findMany({
      orderBy: {
        id: "asc",
      },
      include: {
        products: true,
      },
    });
    res.status(200).json(allCategories);
  } catch (error) {
    console.error("Error deleting parent and children:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/categories", async (req, res) => {
  const { name, description } = req.body;
  const result = await prisma.category.create({
    data: {
      name,
      description,
    },
  });
  if (!result) {
    res.status(500).json({ error: "Internal Server Error" });
  } else {
    res.status(201).json({ result, message: `Category added successfully` });
  }
});

app.get("/categories/:id", async (req, res) => {
  const { id } = req.params;
  const getOneCategory = await prisma.category.findUnique({
    where: {
      id: Number(id),
    },
  });
  if (!getOneCategory) {
    res
      .status(200)
      .json({ message: `The Category with that particular ID doesn't exist` });
  } else {
    res.status(200).json(getOneCategory);
  }
});
app.put("/categories/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, description } = req.body;
  try {
    await prisma.category.update({
      where: { id: id },
      data: {
        name,
        description,
      },
    });
    const remainingCategories = await prisma.category.findMany({
      orderBy: {
        id: "asc",
      },
    });
    res.status(200).json({
      remainingCategories,
      message: `The Category updated successfully`,
    });
  } catch (error) {
    console.error("Error deleting parent and children:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }

  // if (!updatedCategory) {
  //   res
  //     .status(404)
  //     .json({ message: `The Category with that particular ID doesn't exist` });
  // }
  // res
  //   .status(200)
  //   .json({ updatedCategory, message: `The Category updated successfully` });
});

app.delete("/categories/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    // Begin transaction
    await prisma.$transaction([
      // Delete parent record
      prisma.category.delete({
        where: { id: id },
      }),
      // Delete related child records
      prisma.product.deleteMany({
        where: { id },
      }),
    ]);
    const remainingCategories = await prisma.category.findMany({
      orderBy: {
        id: "asc",
      },
    });
    res
      .status(200)
      .json({
        remainingCategories,
        message: `Category with ID ${id} deleted successfully`,
      });
  } catch (error) {
    console.error("Error deleting parent and children:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Products
app.get("/products", async (req, res) => {
  const allProducts = await prisma.product.findMany();
  res.status(200).json(allProducts);
});

app.post("/products", async (req, res) => {
  const { name, price, description, categoryID } = req.body;
  const result = await prisma.product.create({
    data: {
      name,
      price,
      description,
      categoryID: parseInt(categoryID),
    },
  });

  res.status(201).json({ result, message: `Category added Successfully` });
});

app.delete("/products/:id", async (req, res) => {
  const { id } = req.params;
  const deletedProduct = await prisma.product.delete({
    where: {
      id: Number(id),
    },
  });
  if (!deletedProduct) {
    res.status(404).json({ message: `Product with ID ${id} doesn't exist` });
  } else {
    res.status(200).json({
      deletedProduct,
      message: `Product with ID ${id} deleted successfully`,
    });
  }
});

app.listen(port, () => {
  console.log(`Listening to requests on port ${port}`);
});
