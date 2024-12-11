import jwt from "jsonwebtoken";

// Create a JWT token
export const createToken = (payload: object) => {
  const secret = process.env.JWT_SECRET ?? "your-secret-key";
  return jwt.sign(payload, secret, { expiresIn: "1h" });
};

// Verify a JWT token
export const verifyToken = (token: string) => {
  const secret = process.env.JWT_SECRET ?? "your-secret-key";
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null; // Invalid token
  }
};
