import express from "express";
import cors from "cors";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { userMiddleware } from "./middleware";
import { JWT_SECRET } from "./config";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

// function to randomly assign IPL teams
const assignIplTeam = (): string => {
  const teams = ["RCB", "MI", "CSK", "KKR", "SRH", "DC", "RR", "PBKS"];
  return teams[Math.floor(Math.random() * teams.length)];
};

// Root Endpoint
app.get("/", (req, res) => {
  res.status(200).json({ message: "Backend is up and running" });
});

// User Registration
app.post("/api/v1/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: "All fields are required." });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedTeam = assignIplTeam();

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, assignedTeam },
    });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);

    res.status(201).json({
      message: "Login successful!",
      user: { id: user.id, name: user.name, assignedTeam: user.assignedTeam },
      token: token,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      // Prisma unique constraint violation
      res.status(400).json({ error: "Email is already registered." });
      return;
    }
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// User Login
app.post("/api/v1/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    //if user does not exist, return
    if (!user) {
      res.status(404).json({ message: "User not found " });
    }

    //checking if the provided password  matches
    const checkPassword = await bcrypt.compare(password, user!.password);

    //if password does not match, return
    if (!user || !checkPassword) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);

    res.status(200).json({
      message: "Login successful!",
      user: { id: user.id, name: user.name, assignedTeam: user.assignedTeam },
      token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error.", error: error });
  }
});

// Add Product
app.post("/api/v1/products", userMiddleware, async (req, res) => {
  const { name, description, price, imageUrl } = req.body;

  if (!name || !description || !price || !imageUrl) {
    res.status(400).json({ error: "All fields are required." });
    return;
  }

  try {
    const product = await prisma.product.create({
      data: { name, description, price, imageUrl },
    });

    res.status(201).json({
      message: "Product added successfully!",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add product.", error: error });
  }
});

app.get("/api/v1/products", userMiddleware, async (req, res) => {
  try {
    const products = await prisma.product.findMany();

    if (products.length === 0) {
      res.status(404).json({ message: "No products found." });
      return;
    }

    res
      .status(200)
      .json({ message: "Products retrieved successfully", products: products });
    return;
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Some error occured ", error: e });
  }
});

// Add to Cart
app.post("/api/v1/cart", userMiddleware, async (req, res) => {
  let { productId, quantity } = req.body;

  productId = Number(productId);
  quantity = Number(quantity);

  if (
    !productId ||
    !quantity ||
    isNaN(productId) ||
    isNaN(quantity) ||
    quantity < 1
  ) {
    res.status(400).json({ error: "Invalid product or quantity." });
    return;
  }

  try {
    const userId = req.userId; // Assuming `userMiddleware` sets `req.user`

    if (!userId) {
      res.status(401).json({ error: "Unauthorized." });
      return;
    }
    // Check if the product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      res.status(404).json({ error: "Product not found." });
      return;
    }

    // Check if the product is already in the user's cart
    const existingCartItem = await prisma.cart.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existingCartItem) {
      // Update the quantity if the product is already in the cart
      const updatedCartItem = await prisma.cart.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
      });
      res
        .status(200)
        .json({
          message: "Cart updated successfully.",
          cartItem: updatedCartItem,
        });
    } else {
      // Add a new product to the cart
      const cartItem = await prisma.cart.create({
        data: { userId, productId, quantity },
      });
      res
        .status(201)
        .json({ message: "Product added to cart successfully.", cartItem });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add to cart.", details: error });
  }
});

// Get Cart Items
app.get("/api/v1/cart", userMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized." });
      return;
    }

    const cartItems = await prisma.cart.findMany({
      where: { userId },
      include: { product: true }, // Include product details
    });

    res
      .status(200)
      .json({ message: "Cart retrieved successfully.", cartItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve cart.", details: error });
  }
});

// Start Server
app.listen(3000, () => {
  console.log(`Server running on port 3000 http://localhost:3000`);
});
