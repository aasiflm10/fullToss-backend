import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "./config";

export function userMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
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
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded === "string") {
      res.status(403).json({
        message: "Invalid token format",
      });
      return;
    }

    req.userId = (decoded as JwtPayload).id;
    next();
  } catch (error) {
    res
      .status(401)
      .json({ message: "Invalid or expired token ", error: error });
    return;
  }
}
