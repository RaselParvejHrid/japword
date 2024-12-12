import { NextRequest, NextResponse } from "next/server";
import { cloudFirestore } from "@/app/lib/firebase/firebase-admin";

export async function GET(
  req: NextRequest,
  { params }: { params: { userID: string } }
) {
  const userID = params.userID;

  try {
    let user = await cloudFirestore.doc(`tutorials/${userID}`).get();

    if (!user.exists) {
      return NextResponse.json(
        { message: "No User with this ID exists." },
        { status: 400 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user in Route Handler:", error);
    return NextResponse.json(
      { message: "Failed to fetch user." },
      { status: 500 }
    );
  }
}

interface UpdateUser {
  role: string;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { userID: string } }
) {
  const userID = params.userID;

  const updateUser = (await req.json()) as UpdateUser;

  try {
    let user = await cloudFirestore.doc(`users/${userID}`).get();

    if (!user.exists) {
      return NextResponse.json(
        { message: "No User with this ID exists." },
        { status: 400 }
      );
    }

    if (user.get("role") === updateUser.role) {
      return NextResponse.json(
        { message: "Already in Desired Role." },
        { status: 400 }
      );
    }

    await user.ref.update({ role: updateUser.role });
    return NextResponse.json(
      { message: "User Role Successfully Updated." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating lesson in Route Handler:", error);
    return NextResponse.json(
      { message: "Failed to update User Role." },
      { status: 500 }
    );
  }
}
