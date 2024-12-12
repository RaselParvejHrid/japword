import { NextRequest, NextResponse } from "next/server";
import * as yup from "yup";
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

interface NewTutorial {
  title: string;
  link: string;
}

const youtubeUrlSchema = yup
  .string()
  .url()
  .test("is-youtube-url", "Invalid YouTube URL", (value) => {
    if (!value) return false;
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})$/;
    return youtubeRegex.test(value);
  });

const newTutorialSchema = yup.object().shape({
  title: yup
    .string()
    .required("Title is required")
    .min(1, "Title must be at least 1 character long."),
  link: youtubeUrlSchema.required("Link is required"),
});

export async function POST(req: NextRequest) {
  try {
    let newTutorial = (await req.json()) as NewTutorial;

    await newTutorialSchema.validate(newTutorial, { abortEarly: false });

    const link = newTutorial.link;

    const anyTutorialWithThisLink =
      (
        await cloudFirestore
          .collection("tutorials")
          .where("link", "==", link)
          .get()
      ).docs.length !== 0;

    if (anyTutorialWithThisLink) {
      return NextResponse.json(
        { message: "A tutorial with this link already exists." },
        { status: 400 }
      );
    }

    await cloudFirestore.collection("tutorials").add(newTutorial);

    return NextResponse.json(
      { message: "Successfully added the lesson." },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return NextResponse.json(
        { message: error.errors.join("\n") },
        { status: 400 }
      );
    }
    console.error("Error adding tutorial:", error);
    return NextResponse.json(
      { message: "Failed to add tutorial." },
      { status: 500 }
    );
  }
}
