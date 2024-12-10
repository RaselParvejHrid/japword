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
      { error: "Password must be al least 6 characters long." },
      { status: 400 }
    );
  }

  if (!photo) {
    return NextResponse.json({ error: "Upload a Photo." }, { status: 400 });
  }

  // Upload the Photo in ImageBB; get the link
  let photoData;
  try {
    photoData = await uploadImageToImgBB(photo);
    console.log(photoData);
    if (!photoData.success) {
      throw Error("Cannot save the photo");
    }
  } catch (e) {
    return NextResponse.json(
      { error: "Cannot save the Photo" },
      { status: 400 }
    );
  }

  let hashedPassword;

  try {
    hashedPassword = await hashPassword(password);
  } catch (e) {
    return NextResponse.json(
      { error: "Cannot hash the password." },
      { status: 400 }
    );
  }

  // Save name, email, password and Photo URL in firebase.
  try {
    await cloudFirestore.collection("users").add({
      name,
      email,
      password: hashedPassword,
      role: "standard",
      photo: photoData.data,
    });
  } catch (e) {
    console.log("Error: ", e);
    return NextResponse.json(
      { error: "Cannot create new user." },
      { status: 400 }
    );
  }

  // User Created
  return NextResponse.json(
    { message: "Registration successful!" },
    { status: 200 }
  );
}
