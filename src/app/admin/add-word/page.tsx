"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import * as yup from "yup";

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
    .required("Pronunciation is required")
    .min(1, "Pronunciation must be at least 1 character long."),
  whenToSay: yup
    .string()
    .required("When To Say is required")
    .min(1, "When To Say must be at least 1 character long."),
  lessonNumber: yup.number().required("Lesson Number is Required").min(1),
});

export default function AddWordPage() {
  const [newWord, setNewWord] = useState({
    word: "",
    meaning: "",
    pronunciation: "",
    whenToSay: "",
    lessonNumber: 0,
  });
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchLessons = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const response = await fetch("/api/admin/lessons");
      if (!response.ok) {
        throw new Error("Failed to fetch lessons");
      }

      const data = await response.json();
      setLessons(data.lessons);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setIsError(false);

    try {
      await newWordSchema.validate(newWord, { abortEarly: false });

      const response = await fetch("/api/admin/words", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newWord),
      });

      if (response.ok) {
        setNewWord({
          word: "",
          meaning: "",
          pronunciation: "",
          whenToSay: "",
          lessonNumber: 0,
        });
        toast.success("Added Word Successfully.", { position: "bottom-right" });
        fetchLessons();
      } else {
        console.error("Error adding word:", response.statusText);
        setIsError(true);
        const responseBody = await response.json();
        toast.error(responseBody.message, { position: "bottom-right" });
      }
    } catch (error) {
      setIsError(true);
      if (error instanceof yup.ValidationError) {
        console.error("Validation errors:", error.errors);
        toast.error(error.errors.join("\n"), { position: "bottom-right" });
      } else {
        console.error("Error adding word:", error);
        toast.error("Error adding word.", { position: "bottom-right" });
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="mx-auto">
        <div className="mb-4">
          <label htmlFor="word" className="block text-gray-700 font-bold mb-2">
            Word:
          </label>
          <input
            type="text"
            id="word"
            name="word"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-teal-500 focus:border-transparent"
            value={newWord.word}
            onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="meaning"
            className="block text-gray-700 font-bold mb-2"
          >
            Meaning:
          </label>
          <input
            type="text"
            id="meaning"
            name="meaning"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-teal-500 focus:border-transparent"
            value={newWord.meaning}
            onChange={(e) =>
              setNewWord({ ...newWord, meaning: e.target.value })
            }
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="pronunciation"
            className="block text-gray-700 font-bold mb-2"
          >
            Pronunciation:
          </label>
          <input
            type="text"
            id="pronunciation"
            name="pronunciation"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-teal-500 focus:border-transparent"
            value={newWord.pronunciation}
            onChange={(e) =>
              setNewWord({ ...newWord, pronunciation: e.target.value })
            }
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="whenToSay"
            className="block text-gray-700 font-bold mb-2"
          >
            When To Say:
          </label>
          <input
            type="text"
            id="whenToSay"
            name="whenToSay"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-teal-500 focus:border-transparent"
            value={newWord.whenToSay}
            onChange={(e) =>
              setNewWord({ ...newWord, whenToSay: e.target.value })
            }
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="lessonNumber"
            className="text-gray-700 font-bold mb-2"
          >
            Lesson Number:{" "}
          </label>
          <select
            id="lessonNumber"
            name="lessonNumber"
            value={newWord.lessonNumber}
            onChange={(e) =>
              setNewWord({ ...newWord, lessonNumber: parseInt(e.target.value) })
            }
          >
            {lessons.map(
              (lesson: { id: string; name: string; number: number }) => (
                <option key={lesson.id} value={lesson.number}>
                  Lesson {lesson.number}: {lesson.name}
                </option>
              )
            )}
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Word
        </button>{" "}
      </form>
    </div>
  );
}
