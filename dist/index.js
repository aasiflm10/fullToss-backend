"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const middleware_1 = require("./middleware");
const config_1 = require("./config");
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// function to randomly assign IPL teams
const assignIplTeam = () => {
    const teams = ["RCB", "MI", "CSK", "KKR", "SRH", "DC", "RR", "PBKS"];
    return teams[Math.floor(Math.random() * teams.length)];
};
// Root Endpoint
app.get("/", (req, res) => {
    res.status(200).json({ message: "It is up and running" });
});
// User Registration
app.post("/api/v1/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        res.status(400).json({ error: "All fields are required." });
        return;
    }
    try {
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const assignedTeam = assignIplTeam();
        const user = yield prisma.user.create({
            data: { name, email, password: hashedPassword, assignedTeam },
        });
        res.status(201).json({
            message: "User registered successfully!",
            assignedTeam: user.assignedTeam,
        });
    }
    catch (error) {
        if (error.code === "P2002") {
            // Prisma unique constraint violation
            res.status(400).json({ error: "Email is already registered." });
            return;
        }
        console.error(error);
        res.status(500).json({ error: "Internal server error." });
    }
}));
// User Login
app.post("/api/v1/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: "Email and password are required." });
        return;
    }
    try {
        const user = yield prisma.user.findUnique({ where: { email } });
        //if user does not exist, return
        if (!user) {
            res.status(404).json({ message: "User not found " });
        }
        //checking if the provided password  matches
        const checkPassword = yield bcrypt_1.default.compare(password, user.password);
        //if password does not match, return
        if (!user || !checkPassword) {
            res.status(401).json({ error: "Invalid email or password." });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, config_1.JWT_SECRET);
        res.status(200).json({
            message: "Login successful!",
            user: { id: user.id, name: user.name, assignedTeam: user.assignedTeam },
            token: token,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error.", error: error });
    }
}));
// Add Product
app.post("/api/v1/products", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, price, imageUrl } = req.body;
    if (!name || !description || !price || !imageUrl) {
        res.status(400).json({ error: "All fields are required." });
        return;
    }
    try {
        const product = yield prisma.product.create({
            data: { name, description, price, imageUrl },
        });
        res.status(201).json({
            message: "Product added successfully!",
            product,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to add product.", error: error });
    }
}));
app.get("/api/v1/products", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield prisma.product.findMany();
        if (products.length === 0) {
            res.status(404).json({ message: "No products found." });
            return;
        }
        res
            .status(200)
            .json({ message: "Products retrieved successfully", products: products });
        return;
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ message: "Some error occured ", error: e });
    }
}));
// Start Server
app.listen(3000, () => {
    console.log(`Server running on port 3000 http://localhost:3000`);
});
