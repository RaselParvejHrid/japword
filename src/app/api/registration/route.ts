// src/app/api/registration/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import validator from "validator";

export async function POST(request: NextRequest) {
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

  // Save name, email, password and Photo URL in firebase.

  // For now, simulate a successful registration
  return NextResponse.json(
    { message: "Registration successful!" },
    { status: 200 }
  );
}
