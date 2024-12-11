import { type NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/jwt/jwt";
import { cloudFirestore } from "@/app/lib/firebase/firebase-admin";

export async function POST(request: NextRequest) {
  const requestBody = await request.json();
  const token = requestBody.token;

  if (!token) {
    return NextResponse.json({ message: "Token not found." }, { status: 400 });
  }

  let payload = null;

  if (token) {
    payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { message: "No Payload in JWT Token." },
        { status: 400 }
      );
    }
  }

  if (payload) {
    const userEmail = payload.email;

    // is there any user with this email?
    const anyUserWithThisEmailQuerySnapshot = await cloudFirestore
      .collection("users")
      .where("email", "==", userEmail)
      .get();

    if (anyUserWithThisEmailQuerySnapshot.empty) {
      return NextResponse.json(
        { message: "No User corresponding to this JWT Token exists." },
        { status: 400 }
      );
    }

    if (!anyUserWithThisEmailQuerySnapshot.empty) {
      const userInDB = anyUserWithThisEmailQuerySnapshot.docs[0];
      return NextResponse.json(
        { message: "Token OK!", user: userInDB.data() },
        { status: 200 }
      );
    }
  }
}
