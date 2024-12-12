import { NextRequest, NextResponse } from "next/server";
import { cloudFirestore } from "@/app/lib/firebase/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    let tutorials = (
      await cloudFirestore.collection("tutorials").get()
    ).docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ tutorials }, { status: 200 });
  } catch (error) {
    console.error("Error fetching lessons in Route Handler:", error);
    return NextResponse.json(
      { message: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}
