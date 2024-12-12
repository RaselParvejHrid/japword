"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";

interface Lesson {
  id: string;
  name: string;
  number: number;
  vocabularyCount: number;
}

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLessonNumber, setCurrentLessonNumber] = useState<number | null>(
    null
  );
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);

  const fetchLessons = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const response = await fetch("/api/admin/lessons");
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

  const handleDelete = async (lessonNumber: number) => {
    try {
      const response = await fetch(`/api/admin/lessons/${lessonNumber}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Deleting Lesson Successful!", {
          position: "bottom-right",
        });
        fetchLessons();
      } else {
        console.error("Error deleting lesson:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting lesson:", error);
    }
  };

  const handleUpdate = async (
    lessonNumber: number,
    updatedLesson: Partial<Lesson> | null
  ) => {
    try {
      const response = await fetch(`/api/admin/lessons/${lessonNumber}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedLesson),
      });
      if (response.ok) {
        fetchLessons();
        toast.success("Updating Lesson Successful!", {
          position: "bottom-right",
        });
        setIsModalOpen(false);
      } else {
        console.error("Error updating lesson:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating lesson:", error);
    }
  };

  const openModal = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setCurrentLessonNumber(lesson.number);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setCurrentLesson(null);
    setIsModalOpen(false);
  };

  return (
    <div>
      {isLoading && <p className="text-center text-gray-500">Loading...</p>}
      {isError && (
        <p className="text-center text-red-500">Error fetching lessons</p>
      )}

      {!isLoading && !isError && (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Lesson Number
                </th>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Lesson Name
                </th>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Word Count
                </th>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {lessons?.map((lesson: Lesson) => (
                <tr
                  key={lesson.number}
                  className="bg-white border-b border-gray-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {lesson.number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {lesson.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {lesson.vocabularyCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <button
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      onClick={() => handleDelete(lesson.number)}
                    >
                      Delete
                    </button>
                    <button
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
                      onClick={() => {
                        setCurrentLessonNumber(lesson.number);
                        openModal(lesson);
                      }}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="modal bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-bold mb-4">Update Lesson</h2>
            <form>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Lesson Name:
                </label>
                <input
                  type="text"
                  id="name"
                  value={currentLesson?.name || ""}
                  onChange={(e) => {
                    if (currentLesson) {
                      setCurrentLesson({
                        ...currentLesson,
                        name: e.target.value,
                      });
                    }
                  }}
                  className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="number"
                  className="block text-sm font-medium text-gray-700"
                >
                  Lesson Number:
                </label>
                <input
                  type="number"
                  id="number"
                  value={currentLesson?.number || 0}
                  onChange={(e) => {
                    if (currentLesson) {
                      setCurrentLesson({
                        ...currentLesson,
                        number: parseInt(e.target.value),
                      });
                    }
                  }}
                  className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                  onClick={() => {
                    if (!currentLesson) return;
                    if (currentLessonNumber) {
                      const updateLesson = {} as Partial<Lesson>;
                      const lessonOnLessons = lessons.find(
                        (lesson) => lesson.number === currentLessonNumber
                      );
                      if (!lessonOnLessons) return;
                      if (lessonOnLessons.name !== currentLesson.name) {
                        updateLesson.name = currentLesson.name;
                      }

                      if (lessonOnLessons.number !== currentLesson.number) {
                        updateLesson.number = currentLesson.number;
                      }
                      handleUpdate(currentLessonNumber, updateLesson);
                    }
                  }}
                >
                  Update
                </button>
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}