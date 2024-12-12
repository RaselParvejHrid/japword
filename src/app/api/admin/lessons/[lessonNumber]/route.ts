import { NextRequest, NextResponse } from "next/server";
import validator from "validator";
import { cloudFirestore } from "@/app/lib/firebase/firebase-admin";

export async function GET(
  req: NextRequest,
  { params }: { params: { lessonNumber: string } }
) {
  const lessonNumberParam = params.lessonNumber;

  if (!validator.isInt(String(lessonNumberParam))) {
    return NextResponse.json(
      { message: "Lesson Number must be an integer." },
      { status: 400 }
    );
  }
  const lessonNumber = Number(lessonNumberParam);

  try {
    let lesson = (
      await cloudFirestore
        .collection("lessons")
        .where("number", "==", lessonNumber)
        .get()
    ).docs.map((doc) => doc.data());

    if (lesson.length === 0) {
      return NextResponse.json(
        { message: "No Lesson with this lesson number exists." },
        { status: 400 }
      );
    }
    lesson = await Promise.all(
      lesson.map(async (lesson) => {
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
    return NextResponse.json({ lesson: lesson[0] }, { status: 200 });
  } catch (error) {
    console.error("Error fetching lesson in Route Handler:", error);
    return NextResponse.json(
      { message: "Failed to fetch lesson." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { lessonNumber: string } }
) {
  const lessonNumberParam = params.lessonNumber;

  if (!validator.isInt(String(lessonNumberParam))) {
    return NextResponse.json(
      { message: "Lesson Number must be an integer." },
      { status: 400 }
    );
  }
  const lessonNumber = Number(lessonNumberParam);

  try {
    let lesson = (
      await cloudFirestore
        .collection("lessons")
        .where("number", "==", lessonNumber)
        .get()
    ).docs;

    if (lesson.length === 0) {
      return NextResponse.json(
        { message: "No Lesson with this lesson number exists." },
        { status: 400 }
      );
    }

    await lesson[0].ref.delete();
    return NextResponse.json(
      { message: "Lesson Successfully Deleted." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting lesson in Route Handler:", error);
    return NextResponse.json(
      { message: "Failed to delete lesson." },
      { status: 500 }
    );
  }
}

type LessonPOSTBody = {
  name: string;
  number: number;
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: { lessonNumber: string } }
) {
  const lessonNumberParam = params.lessonNumber;

  if (!validator.isInt(String(lessonNumberParam))) {
    return NextResponse.json(
      { message: "Lesson Number must be an integer." },
      { status: 400 }
    );
  }
  const lessonNumber = Number(lessonNumberParam);

  const lessonUpdate = (await req.json()) as Partial<LessonPOSTBody>;

  if (!lessonUpdate.name && !lessonUpdate.number) {
    return NextResponse.json(
      { message: "Either Lesson Name or Lesson Number must be specified." },
      { status: 400 }
    );
  }
  if (lessonUpdate.name) {
    if (lessonUpdate.name.trim().length === 0) {
      return NextResponse.json(
        { message: "Lesson Name cannot be empty." },
        { status: 400 }
      );
    }
  }

  if (lessonUpdate.number) {
    if (!validator.isInt(String(lessonUpdate.number))) {
      return NextResponse.json(
        { message: "Lesson Number must be an integer." },
        { status: 400 }
      );
    }
    // Any other lesson with target Lesson Number?
    let lesson = (
      await cloudFirestore
        .collection("lessons")
        .where("number", "==", lessonUpdate.number)
        .get()
    ).docs;

    if (lesson.length !== 0) {
      return NextResponse.json(
        { message: "A lesson with desired lesson number already exists." },
        { status: 400 }
      );
    }
  }

  try {
    let lessons = (
      await cloudFirestore
        .collection("lessons")
        .where("number", "==", lessonNumber)
        .get()
    ).docs;

    if (lessons.length === 0) {
      return NextResponse.json(
        { message: "No Lesson with this lesson number exists." },
        { status: 400 }
      );
    }

    await lessons[0].ref.update(lessonUpdate);
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
