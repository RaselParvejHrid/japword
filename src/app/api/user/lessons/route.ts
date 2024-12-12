import { NextRequest, NextResponse } from "next/server";
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
