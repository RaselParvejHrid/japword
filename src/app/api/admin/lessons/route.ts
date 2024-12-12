import { NextRequest, NextResponse } from "next/server";
import validator from "validator";
import { cloudFirestore } from "@/app/lib/firebase/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    let lessons = (await cloudFirestore.collection("lessons").get()).docs.map(
      (doc) => doc.data()
    );
    lessons = await Promise.all(
      lessons.map(async (lesson) => {
        const lessonNumber = lesson.number;
        const words = await cloudFirestore
          .collection("words")
          .where("lessonNumber", "==", lessonNumber)
          .get();

        const vocabularyCount = words.docs.length;
        return {
          ...lesson,
          vocabularyCount,
        };
      })
    );
    return NextResponse.json({ lessons }, { status: 200 });
  } catch (error) {
    console.error("Error fetching lessons in Route Handler:", error);
    return NextResponse.json(
      { message: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}

type LessonPOSTBody = {
  name: string;
  number: number;
};

export async function POST(req: NextRequest) {
  try {
    let lessonData = (await req.json()) as LessonPOSTBody;

    if (lessonData.name.trim().length === 0) {
      return NextResponse.json(
        { message: "Lesson Name cannot be empty." },
        { status: 400 }
      );
    }
    if (!validator.isInt(String(lessonData.number))) {
      return NextResponse.json(
        { message: "Lesson Number must be an integer." },
        { status: 400 }
      );
    }
    const lessonNumber = Number(lessonData.number);
    const lessons = await cloudFirestore
      .collection("lessons")
      .where("number", "==", lessonNumber)
      .get();
    if (!lessons.empty) {
      return NextResponse.json(
        { message: "A lesson with this lesson number already exists." },
        { status: 400 }
      );
    }
    await cloudFirestore
      .collection("lessons")
      .add({ ...lessonData, number: lessonNumber });
    return NextResponse.json(
      { message: "Successfully added the lesson." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding lesson:", error);
    return NextResponse.json(
      { message: "Failed to add lesson." },
      { status: 500 }
    );
  }
}
