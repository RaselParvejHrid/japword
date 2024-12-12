import { NextRequest, NextResponse } from "next/server";
import * as yup from "yup";
import { cloudFirestore } from "@/app/lib/firebase/firebase-admin";

export async function GET(
  req: NextRequest,
  { params }: { params: { wordID: string } }
) {
  const wordID = params.wordID;

  try {
    let word = await cloudFirestore.doc(`words/${wordID}`).get();

    if (!word.exists) {
      return NextResponse.json(
        { message: "No Word with this ID exists." },
        { status: 400 }
      );
    }

    return NextResponse.json({ word }, { status: 200 });
  } catch (error) {
    console.error("Error fetching word in Route Handler:", error);
    return NextResponse.json(
      { message: "Failed to fetch word." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { wordID: string } }
) {
  const wordID = params.wordID;

  try {
    let word = await cloudFirestore.doc(`words/${wordID}`).get();

    if (!word.exists) {
      return NextResponse.json(
        { message: "No Word with this ID exists." },
        { status: 400 }
      );
    }

    await word.ref.delete();

    return NextResponse.json(
      { message: "Word Successfully deleted." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting word in Route Handler:", error);
    return NextResponse.json(
      { message: "Failed to delete word." },
      { status: 500 }
    );
  }
}

interface WordUpdate {
  word: string;
  meaning: string;
  pronunciation: string;
  whenToSay: string;
  lessonNumber: number;
}

const wordUpdateSchema = yup.object().shape({
  word: yup
    .string()
    .required("Word is required")
    .min(1, "Word must be at least 1 character long."),
  meaning: yup
    .string()
    .required("Meaning is required")
    .min(1, "Meaning must be at least 1 character long."),
  pronunciation: yup
    .string()
    .required("pronunciation is required")
    .min(1, "pronunciation must be at least 1 character long."),
  whenToSay: yup
    .string()
    .required("'When To Say' is required")
    .min(1, "'When to Say' must be at least 1 character long."),
  lessonNumber: yup.number().required("Lesson Number is Required.").min(1),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { wordID: string } }
) {
  const wordID = params.wordID;

  const wordUpdate = (await req.json()) as WordUpdate;

  try {
    await wordUpdateSchema.validate(wordUpdate, { abortEarly: false });
    let word = await cloudFirestore.doc(`words/${wordID}`).get();

    if (!word.exists) {
      return NextResponse.json(
        { message: "No Word with this ID exists." },
        { status: 400 }
      );
    }

    await word.ref.update({ ...wordUpdate });
    return NextResponse.json(
      { message: "Word Successfully Updated." },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return NextResponse.json(
        { message: error.errors.join("\n") },
        { status: 400 }
      );
    }
    console.error("Error updating word in Route Handler:", error);
    return NextResponse.json(
      { message: "Failed to update word." },
      { status: 500 }
    );
  }
}
