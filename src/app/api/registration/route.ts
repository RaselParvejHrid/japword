// src/app/api/registration/route.ts
import { uploadImageToImgBB } from "@/app/lib/imgbb";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import validator from "validator";

import { cloudFirestore } from "@/app/lib/firebase/firebase-admin";
import { hashPassword } from "@/app/lib/hash-password/hash-password";

export async function POST(request: NextRequest) {
  console.log("/api/registration");
  const formData = await request.formData();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const photo = formData.get("photo") as File | null;

  if (validator.isEmpty(name.trim())) {
    return NextResponse.json({ error: "Name is invalid." }, { status: 400 });
  }

  if (!validator.isEmail(email.trim())) {
    return NextResponse.json({ error: "Email is Invalid." }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json(
      { message: "Password must be al least 6 characters long." },
      { status: 400 }
    );
  }

  if (!photo) {
    return NextResponse.json({ message: "Upload a Photo." }, { status: 400 });
  }

  // Check if any existing user with this email
  // is there any user with this email
  const anyUserAlreadyQuerySnapshot = await cloudFirestore
    .collection("users")
    .where("email", "==", email)
    .get();

  if (!anyUserAlreadyQuerySnapshot.empty) {
    return NextResponse.json(
      { message: "The email is associate with Another Account." },
      { status: 400 }
    );
  }
  // Upload the Photo in ImageBB; get the link
  let imgBBResponse;
  try {
    imgBBResponse = await uploadImageToImgBB(photo);
    console.log(imgBBResponse);
    if (!imgBBResponse.success) {
      throw Error("Cannot save the photo");
    }
  } catch (e) {
    return NextResponse.json(
      { message: "Cannot save the Photo" },
      { status: 400 }
    );
  }

  let hashedPassword;

  try {
    hashedPassword = await hashPassword(password);
  } catch (e) {
    return NextResponse.json(
      { message: "Cannot hash the password." },
      { status: 400 }
    );
  }

  // Save name, email, password and Photo URL in firebase.
  try {
    await cloudFirestore.collection("users").add({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "standard",
      photo: imgBBResponse.data,
    });
  } catch (e) {
    console.log("Error: ", e);
    return NextResponse.json(
      { message: "Cannot create new user." },
      { status: 400 }
    );
  }

  // User Created
  return NextResponse.json(
    { message: "Registration successful!" },
    { status: 200 }
  );
}
