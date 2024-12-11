import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";

interface MyJwtPayload extends JwtPayload {
  name: string;
  email: string;
  role: string;
  password: string;
}

// Create a JWT token
export function createToken(payload: MyJwtPayload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT Secret is not defined");
  }
  return jwt.sign(payload, secret, { expiresIn: "1h" });
}

// Verify a JWT token
export function verifyToken(token: string): MyJwtPayload | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT Secret is not defined");
  }
  try {
    return jwt.verify(token, secret) as MyJwtPayload;
  } catch (error) {
    return null;
  }
}
