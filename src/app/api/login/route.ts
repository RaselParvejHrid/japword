import { NextRequest, NextResponse } from "next/server";
import { cloudFirestore } from "@/app/lib/firebase/firebase-admin";
import validator from "validator";
import { verifyPassword } from "@/app/lib/hash-password/hash-password";
import { createToken } from "@/app/lib/jwt/jwt";

export async function POST(request: NextRequest) {
  console.log("Login Request.");
  const formData = await request.formData();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!validator.isEmail(email.trim())) {
    return NextResponse.json(
      { message: "Email Format is Invalid." },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { message: "Password must be al least 6 characters long." },
      { status: 400 }
    );
  }

  // is there any user with this email
  const anyUserAlreadyQuerySnapshot = await cloudFirestore
    .collection("users")
    .where("email", "==", email.toLowerCase())
    .get();

  if (anyUserAlreadyQuerySnapshot.empty) {
    return NextResponse.json(
      { message: "No User with this email." },
      { status: 400 }
    );
  }

  // Verify password (using bcrypt)
  const userInDB = anyUserAlreadyQuerySnapshot.docs[0];
  const isPasswordOkay = await verifyPassword(
    password,
    userInDB.get("password")
  );
  if (!isPasswordOkay) {
    return NextResponse.json({ message: "Wrong Password." }, { status: 400 });
  }

  // Create JWT payload and sign token
  const payload = {
    name: userInDB.get("name"),
    email: userInDB.get("email"),
    role: userInDB.get("role"),
    password: userInDB.get("password"),
    timestamp: new Date().valueOf(),
  };
  const token = createToken(payload);

  // Set token as HttpOnly cookie
  const response = NextResponse.json({ message: "Login successful" });

  // Add HttpOnly cookie to the response
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60,
    path: "/",
  });

  return response;
}
