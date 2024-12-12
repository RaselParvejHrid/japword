"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import YouTube from "react-youtube";

interface Tutorial {
  id: string;
  title: string;
  link: string;
}

export default function TutorialsManagementPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchTutorials = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const response = await fetch("/api/user/tutorials");
      const data = await response.json();
      setTutorials(data.tutorials);
    } catch (error) {
      console.error("Error fetching tutorials:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTutorials();
  }, []);

  return (
    <div>
      {isLoading && <p className="text-center text-gray-500">Loading...</p>}
      {isError && (
        <p className="text-center text-red-500">Error fetching tutorials</p>
      )}

      {!isLoading && !isError && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tutorials.map((tutorial: Tutorial) => (
            <div key={tutorial.link} className="flex flex-col w-full p-4">
              <div className="rounded-lg shadow-md w-full">
                <YouTube
                  videoId={new URL(tutorial.link).pathname}
                  opts={{ width: "100%" }}
                />

                <div className="px-4 py-2 bg-gray-900 text-white opacity-75 w-full">
                  {tutorial.title}
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-xs"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(tutorial.link);
                      toast.success("Successfully copied the link.", {
                        position: "bottom-right",
                      });
                    } catch (e) {
                      toast.error("Failed to Copy the link.", {
                        position: "bottom-right",
                      });
                    }
                  }} // Copy link to clipboard
                >
                  Copy Link
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
