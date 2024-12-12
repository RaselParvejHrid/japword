import { NextRequest, NextResponse } from "next/server";
import * as yup from "yup";
import { cloudFirestore } from "@/app/lib/firebase/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    let words = (await cloudFirestore.collection("words").get()).docs.map(
      (doc) => ({ id: doc.id, ...doc.data() })
    );
    console.log("Words in Route", words);
    return NextResponse.json({ words }, { status: 200 });
  } catch (error) {
    console.error("Error fetching words in Route Handler:", error);
    return NextResponse.json(
      { message: "Failed to fetch words" },
      { status: 500 }
    );
  }
}

interface NewWord {
  word: string;
  meaning: string;
  pronunciation: string;
  whenToSay: string;
  lessonNumber: number;
}

const newWordSchema = yup.object().shape({
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

export async function POST(req: NextRequest) {
  const adminEmail = req.headers.get("X-User-Email");
  try {
    let newWord = (await req.json()) as NewWord;

    await newWordSchema.validate(newWord, { abortEarly: false });

    const anyEntryWithThisWord =
      (
        await cloudFirestore
          .collection("words")
          .where("word", "==", newWord.word)
          .get()
      ).docs.length !== 0;

    if (anyEntryWithThisWord) {
      return NextResponse.json(
        { message: "This word already exists." },
        { status: 400 }
      );
    }

    await cloudFirestore.collection("words").add({ ...newWord, adminEmail });

    return NextResponse.json(
      { message: "Successfully added the word." },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return NextResponse.json(
        { message: error.errors.join("\n") },
        { status: 400 }
      );
    }
    console.error("Error adding word:", error);
    return NextResponse.json(
      { message: "Failed to add word." },
      { status: 500 }
    );
  }
}
