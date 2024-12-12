import { NextRequest, NextResponse } from "next/server";
import * as yup from "yup";
import { cloudFirestore } from "@/app/lib/firebase/firebase-admin";

const lessonNumberSchema = yup.number().positive().required();

export async function GET(
  req: NextRequest,
  { params }: { params: { lessonNumber: string } }
) {
  try {
    const lessonNumber = parseInt(params.lessonNumber);
    await lessonNumberSchema.validate(lessonNumber);
    let lessons = (
      await cloudFirestore
        .collection("lessons")
        .where("number", "==", lessonNumber)
        .get()
    ).docs.map((doc) => ({ id: doc.id, ...doc.data() } as any));

    if (lessons.length === 0) {
      return NextResponse.json(
        { message: "No Lesson with this lesson number exists." },
        { status: 400 }
      );
    }
    const lesson = lessons[0];
    const words = (
      await cloudFirestore
        .collection("words")
        .where("lessonNumber", "==", lesson.number)
        .get()
    ).docs.map((doc) => ({ id: doc.id, ...doc.data() } as any));

    lesson.words = words;

    // console.log("Lesson in Route", lesson);

    return NextResponse.json({ lesson: { ...lesson, words } }, { status: 200 });
  } catch (error) {
    console.error("Error fetching lesson in Route Handler:", error);
    return NextResponse.json(
      { message: "Failed to fetch lesson." },
      { status: 500 }
    );
  }
}
