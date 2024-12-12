"use client";

import React, { useState, useEffect } from "react";
import * as yup from "yup";
import { toast } from "react-toastify";
import YouTube from "react-youtube";

interface Tutorial {
  id: string;
  title: string;
  link: string;
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

export default function TutorialsManagementPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [currentUpdateID, setCurrentUpdateID] = useState<string | null>(null);
  const [newTutorial, setNewTutorial] = useState<NewTutorial>({
    title: "",
    link: "",
  });
  const [currentTutorial, setCurrentTutorial] = useState<Tutorial | null>(null);

  const fetchTutorials = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const response = await fetch("/api/admin/tutorials");
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

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/tutorials/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchTutorials();
        toast.success("Deleting Tutorial Successful.", {
          position: "bottom-right",
        });
      } else {
        console.error("Error deleting tutorial:", response.statusText);
        toast.error("Failed to delete Tutorial.", { position: "bottom-right" });
      }
    } catch (error) {
      console.error("Error deleting tutorial:", error);
      toast.error("Failed to delete Tutorial.", { position: "bottom-right" });
    }
  };

  const handleUpdate = async (updatedTutorial: Tutorial) => {
    try {
      const response = await fetch(`/api/admin/tutorials/${currentUpdateID}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTutorial),
      });

      if (response.ok) {
        toast.success("Success Updating Tutorial.", {
          position: "bottom-right",
        });
        fetchTutorials();
        setIsUpdateModalOpen(false);
      } else {
        const responseBody = await response.json();
        console.error("Error updating tutorial:", response.statusText);
        toast.error(responseBody.message, { position: "bottom-right" });
      }
    } catch (error) {
      console.error("Error updating tutorial:", error);
      toast.error("Failed to Update Tutorial.", { position: "bottom-right" });
    }
  };

  const handleNewTutorialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await newTutorialSchema.validate(newTutorial, { abortEarly: false });

      const response = await fetch("/api/admin/tutorials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTutorial),
      });

      if (response.ok) {
        toast.success("Tutorial Added.", { position: "bottom-right" });
        fetchTutorials();
        setNewTutorial({ title: "", link: "" });
        setIsAddModalOpen(false);
      } else {
        const errorData = await response.json();
        console.error(
          "Error adding tutorial:",
          errorData.message || "Error adding tutorial"
        );
        toast.error(errorData.message, { position: "bottom-right" });
      }
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        toast.error(error.errors.join(", "), { position: "bottom-right" });
        console.error("Validation error:", error.errors.join(", "));
      } else {
        console.error("Error adding tutorial:", error);
        toast.error("Error adding tutorial", { position: "bottom-right" });
      }
    }
  };

  const openAddModal = () => {
    setNewTutorial({ title: "", link: "" });
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setIsUpdateModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-end">
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
          onClick={openAddModal}
        >
          Add New Tutorial
        </button>
      </div>

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
              <div className="flex justify-around mt-4">
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
                <button
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-xs"
                  onClick={() => handleDelete(tutorial.id)}
                >
                  Delete
                </button>
                <button
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-xs"
                  onClick={() => {
                    setCurrentTutorial(tutorial);
                    setCurrentUpdateID(tutorial.id);
                    setIsUpdateModalOpen(true);
                  }}
                >
                  Update
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="modal bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-bold mb-4">Add New Tutorial</h2>
            <form
              onSubmit={(e: React.FormEvent) => {
                handleNewTutorialSubmit(e);
              }}
            >
              <div className="mb-4">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Title:
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newTutorial.title}
                  onChange={(e) =>
                    setNewTutorial({ ...newTutorial, title: e.target.value })
                  }
                  className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="link"
                  className="block text-sm font-medium text-gray-700"
                >
                  Link:
                </label>
                <input
                  type="text"
                  id="link"
                  name="link"
                  value={newTutorial.link}
                  onChange={(e) =>
                    setNewTutorial({ ...newTutorial, link: e.target.value })
                  }
                  className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Add Tutorial
              </button>
              <button
                type="button"
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded ml-2"
                onClick={closeModal}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {isUpdateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="modal bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-bold mb-4">Update Tutorial</h2>
            <form
              onSubmit={(e: React.FormEvent) => {
                e.preventDefault();
                if (currentTutorial && currentUpdateID) {
                  handleUpdate(currentTutorial);
                }
              }}
            >
              <div className="mb-4">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Title:
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={currentTutorial?.title || ""}
                  onChange={(e) => {
                    if (currentTutorial) {
                      setCurrentTutorial({
                        ...currentTutorial,
                        title: e.target.value,
                      });
                    }
                  }}
                  className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="link"
                  className="block text-sm font-medium text-gray-700"
                >
                  Link:
                </label>
                <input
                  type="text"
                  id="link"
                  name="link"
                  value={currentTutorial?.link || ""}
                  onChange={(e) => {
                    if (currentTutorial) {
                      setCurrentTutorial({
                        ...currentTutorial,
                        link: e.target.value,
                      });
                    }
                  }}
                  className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Update Tutorial
              </button>
              <button
                type="button"
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded ml-2"
                onClick={closeModal}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
