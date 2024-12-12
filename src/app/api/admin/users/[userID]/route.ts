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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { tutorialID: string } }
) {
  const tutorialID = params.tutorialID;

  try {
    let tutorial = await cloudFirestore.doc(`tutorials/${tutorialID}`).get();

    if (!tutorial.exists) {
      return NextResponse.json(
        { message: "No Tutorial with this ID exists." },
        { status: 400 }
      );
    }

    await tutorial.ref.delete();
    return NextResponse.json(
      { message: "Tutorial Successfully Deleted." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting tutorial in Route Handler:", error);
    return NextResponse.json(
      { message: "Failed to delete tutorial." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { tutorialID: string } }
) {
  const tutorialID = params.tutorialID;

  const updatedTutorial = await req.json();

  // Any other lesson with target Lesson Number?

  try {
    let tutorial = await cloudFirestore.doc(`tutorials/${tutorialID}`).get();

    if (!tutorial.exists) {
      return NextResponse.json(
        { message: "No Tutorial with this ID exists." },
        { status: 400 }
      );
    }

    await tutorial.ref.update(updatedTutorial);
    return NextResponse.json(
      { message: "Lesson Successfully Updated." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating lesson in Route Handler:", error);
    return NextResponse.json(
      { message: "Failed to update lesson." },
      { status: 500 }
    );
  }
}
