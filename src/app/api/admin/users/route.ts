import { NextRequest, NextResponse } from "next/server";
import { cloudFirestore } from "@/app/lib/firebase/firebase-admin";

export async function GET(req: NextRequest) {
  const ownEmail = req.headers.get("X-User-Email");
  try {
    let users = (
      await cloudFirestore
        .collection("users")
        .where("email", "!=", ownEmail)
        .get()
    ).docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users in Route Handler:", error);
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
