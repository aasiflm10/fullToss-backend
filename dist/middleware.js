"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMiddleware = userMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
function userMiddleware(req, res, next) {
    const header = req.headers["authorization"];
    if (!header) {
        res.status(401).json({ message: "Authorization header missing" });
        return;
    }
    const token = header.split(" ")[1]; //Bearer <token> format
    if (!token) {
        res.status(401).json({ message: "Token not provided" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        if (typeof decoded === "string") {
            res.status(403).json({
                message: "Invalid token format",
            });
            return;
        }
        req.userId = decoded.id;
        next();
    }
    catch (error) {
        res
            .status(401)
            .json({ message: "Invalid or expired token ", error: error });
        return;
    }
}
