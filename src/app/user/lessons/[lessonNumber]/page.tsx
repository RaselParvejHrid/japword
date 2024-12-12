"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as yup from "yup";
import usePagination from "paginact";
import Confetti from "react-confetti";

interface Lesson {
  id: string;
  number: number;
  name: string;
  words: Word[];
}

interface Word {
  id: string;
  word: string;
  meaning: string;
  pronunciation: string;
  whenToSay: string;
}

const lessonSchema = yup.number().positive().required();

export default function LessonPage({
  params,
}: Readonly<{
  params: { lessonNumber: string };
}>) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const {
    totalNumberOfItems,
    setTotalNumberOfItems,
    itemsPerPage,
    setItemsPerPage,
    currentPageIndex,
    setCurrentPageIndex,
    previousPageIndex,
    nextPageIndex,
  } = usePagination(0, 0, undefined);
  const router = useRouter();

  const showAndHideConfetti = () => {
    setShowConfetti(true);
    // After a short delay, hide the confetti
    setTimeout(() => {
      setShowConfetti(false);
      router.push("/user/lessons");
    }, 5000);
  };

  useEffect(() => {
    const fetchLesson = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const lessonNumber = parseInt(params.lessonNumber);
        await lessonSchema.validate(lessonNumber);
        const response = await fetch(`/api/user/lessons/${lessonNumber}`);
        const data = await response.json();
        const lessonData = data.lesson as Lesson;
        setLesson(lessonData);
        setWords(lessonData.words);
        console.log("Lesson Received", lessonData);
      } catch (error) {
        console.error("Error fetching lesson:", error);
        setIsError(true);
        setErrorMessage("Error fetching lesson. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLesson();
  }, [params.lessonNumber]);

  useEffect(() => {
    if (words.length === 0) {
      setTotalNumberOfItems(0);
      return;
    }
    setTotalNumberOfItems(words.length);
  }, [words.length]);

  useEffect(() => {
    if (totalNumberOfItems) {
      setItemsPerPage(1);
      return;
    }
  }, [totalNumberOfItems]);

  useEffect(() => {
    if (itemsPerPage) {
      setCurrentPageIndex(1);
      return;
    }
  }, [itemsPerPage]);

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {isError && <p>{errorMessage}</p>}

      {lesson && (
        <div className="max-w-3xl p-8 mx-auto">
          <h2 className="text-center text-3xl bg-white py-4">
            Lesson {lesson.number}: {lesson.name}
          </h2>
          {!totalNumberOfItems ? (
            <p className="text-red-800 text-center">No Words to Show.</p>
          ) : null}

          {totalNumberOfItems && currentPageIndex ? (
            <>
              <WordCard word={words[currentPageIndex - 1]} />
              <div className="flex justify-between my-4">
                <button
                  onClick={() => {
                    setCurrentPageIndex(currentPageIndex - 1);
                  }}
                  disabled={previousPageIndex === null}
                  className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
                >
                  Previous
                </button>
                {nextPageIndex ? (
                  <button
                    onClick={() => {
                      setCurrentPageIndex(currentPageIndex + 1);
                    }}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                  >
                    Next
                  </button>
                ) : null}

                {!nextPageIndex ? (
                  <button
                    onClick={showAndHideConfetti}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Complete
                  </button>
                ) : null}

                {showConfetti && <Confetti />}
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

function pronounceWord(word: string) {
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "ja-JP"; // Japanese
  window.speechSynthesis.speak(utterance);
}

function WordCard({ word }: Readonly<{ word: Word }>) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2
        className="text-lg font-bold mb-2"
        onClick={() => pronounceWord(word.word)}
      >
        {word.word}
      </h2>
      <p className="text-gray-700 mb-2">
        <span className="text-blue-600 font-bold">Meaning:</span> {word.meaning}
      </p>
      <p className="text-gray-700 mb-2">
        <span className="text-blue-600 font-bold">Pronunciation:</span>{" "}
        {word.pronunciation}
      </p>
      <p className="text-gray-700 mb-2">
        <span className="text-blue-600 font-bold">When to Say: </span>
        {word.whenToSay}
      </p>
    </div>
  );
}
