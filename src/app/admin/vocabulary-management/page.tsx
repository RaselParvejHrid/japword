"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import * as yup from "yup";

interface Lesson {
  id: string;
  name: string;
  number: number;
}
interface Word {
  id: string;
  word: string;
  meaning: string;
  pronunciation: string;
  whenToSay: string;
  lessonNumber: number;
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

export default function WordsManagementPage() {
  const [words, setWords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [newWord, setNewWord] = useState<NewWord>({
    word: "",
    meaning: "",
    pronunciation: "",
    whenToSay: "",
    lessonNumber: 0,
  });
  const [currentWord, setCurrentWord] = useState<Word | null>(null);

  const fetchWords = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const response = await fetch("/api/admin/words");
      if (!response.ok) {
        throw new Error("Failed to fetch words");
      }

      const data = await response.json();
      setWords(data.words);
    } catch (error) {
      console.error("Error fetching words:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

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
    fetchWords();
    fetchLessons();
  }, []);

  const openAddModal = () => {
    setNewWord({
      word: "",
      meaning: "",
      pronunciation: "",
      whenToSay: "",
      lessonNumber: lessons[0].number,
    });
    setIsAddModalOpen(true);
  };

  const openUpdateModal = (word: Word) => {
    console.log("While opening dialog", word);
    setCurrentWord(word);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteWord = async (wordId: string) => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await fetch(`/api/admin/words/${wordId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const responseBody = await response.json();
        toast.error(responseBody.message, { position: "bottom-right" });
        setIsError(true);
        fetchWords();
        fetchLessons();
      } else {
        toast.success("Word Deleted.", { position: "bottom-right" });
      }
    } catch (error) {
      console.error("Error deleting word:", error);
      toast.error("Error deleting word.", { position: "bottom-right" });
      setIsError(true);
    }
    setIsLoading(false);
  };

  const handleNewWordSubmit = async (event: React.FormEvent) => {
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
        setIsAddModalOpen(false);
        fetchWords();
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

  const handleUpdateWord = async () => {
    if (!currentWord) {
      return;
    }
    setIsLoading(true);
    setIsError(false);
    try {
      await newWordSchema.validate(currentWord, { abortEarly: false });

      const response = await fetch(`/api/admin/words/${currentWord.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentWord),
      });

      if (response.ok) {
        toast.success("Added Updated Successfully.", {
          position: "bottom-right",
        });
        setIsUpdateModalOpen(false);
        setCurrentWord(null);

        fetchWords();
        fetchLessons();
      } else {
        console.error("Error updating word:", response.statusText);
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
        console.error("Error updating word:", error);
        toast.error("Error updating word.", { position: "bottom-right" });
      }
    }
    setIsLoading(false);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
  };

  console.log("Words", words);

  return (
    <>
      <div className="flex justify-end">
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
          onClick={openAddModal}
        >
          Add New Word
        </button>
      </div>
      {isLoading && <p>Loading...</p>}
      {isError && <p>Error fetching words</p>}

      {!isLoading && !isError && (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Word
                </th>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Meaning
                </th>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Pronunciation
                </th>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  When to Say
                </th>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Lesson Number
                </th>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {words.map((word: Word) => (
                <tr key={word.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {word.word}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {word.meaning}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {word.pronunciation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {word.whenToSay}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {word.lessonNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <button
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      onClick={() => openUpdateModal({ ...word })}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2"
                      onClick={() => handleDeleteWord(word.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed w-screen inset-0 flex items-center justify-center z-50">
          <div className="modal-lg modal bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-1/2">
            <h2 className="text-lg font-bold mb-4">Add New Word</h2>
            <form onSubmit={handleNewWordSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="word"
                  className="block text-gray-700 font-bold mb-2"
                >
                  Word:
                </label>
                <input
                  type="text"
                  id="word"
                  name="word"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-teal-500 focus:border-transparent"
                  value={newWord.word}
                  onChange={(e) =>
                    setNewWord({ ...newWord, word: e.target.value })
                  }
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
              <label className="text-gray-700 font-bold mb-2">
                Lesson Number:{" "}
              </label>
              <select
                value={newWord?.lessonNumber ?? 1}
                onChange={(e) =>
                  setNewWord({
                    ...newWord,
                    lessonNumber: parseInt(e.target.value),
                  } as Word)
                }
              >
                {lessons.map(
                  (lesson: { id: string; name: string; number: number }) => (
                    <option key={lesson.number} value={lesson.number}>
                      Lesson {lesson.number}: {lesson.name}
                    </option>
                  )
                )}
              </select>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded mr-2"
                  onClick={closeAddModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Add Word
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isUpdateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="modal bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-1/2">
            <h2 className="text-lg font-bold mb-4">Update Word</h2>
            <form
              onSubmit={(e: React.FormEvent) => {
                e.preventDefault();
                if (currentWord) {
                  handleUpdateWord();
                }
              }}
            >
              <div className="mb-4">
                <label
                  htmlFor="word"
                  className="block text-gray-700 font-bold mb-2"
                >
                  Word:
                </label>
                <input
                  type="text"
                  id="word"
                  name="word"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-teal-500 focus:border-transparent"
                  value={currentWord?.word ?? ""} // Pre-fill with currentWord.word if available
                  onChange={(e) =>
                    setCurrentWord({
                      ...currentWord,
                      word: e.target.value,
                    } as Word)
                  }
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
                  value={currentWord?.meaning ?? ""} // Pre-fill with currentWord.meaning if available
                  onChange={(e) => {
                    console.log("Meaning:", e.target.value);
                    setCurrentWord({
                      ...currentWord,
                      meaning: e.target.value,
                    } as Word);
                  }}
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
                  value={currentWord?.pronunciation ?? ""} // Pre-fill with currentWord.pronunciation if available
                  onChange={(e) =>
                    setCurrentWord({
                      ...currentWord,
                      pronunciation: e.target.value,
                    } as Word)
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
                  value={currentWord?.whenToSay ?? ""} // Pre-fill with currentWord.whenToSay if available
                  onChange={(e) =>
                    setCurrentWord({
                      ...currentWord,
                      whenToSay: e.target.value,
                    } as Word)
                  }
                />
              </div>
              <label className="text-gray-700 font-bold mb-2">
                Lesson Number:{" "}
              </label>
              <select
                value={currentWord?.lessonNumber ?? 1}
                onChange={(e) =>
                  setCurrentWord({
                    ...currentWord,
                    lessonNumber: parseInt(e.target.value),
                  } as Word)
                }
              >
                {lessons.map(
                  (lesson: { id: string; name: string; number: number }) => (
                    <option key={lesson.number} value={lesson.number}>
                      Lesson {lesson.number}: {lesson.name}
                    </option>
                  )
                )}
              </select>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded mr-2"
                  onClick={closeUpdateModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
