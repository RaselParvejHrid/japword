"use client";

import { useState, useEffect } from "react";
import * as yup from "yup";
import { toast } from "react-toastify";

const schema = yup.object().shape({
  name: yup
    .string()
    .required("Lesson name is required")
    .min(1, "Name must be at least 1 characters long"),
  number: yup
    .number()
    .integer()
    .required("Lesson number is required")
    .min(1, "Lesson Number must be at least 1."),
});

export default function AddLessonPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    number: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsError(false);

    try {
      await schema.validate(formData, { abortEarly: false });

      const response = await fetch("/api/admin/lessons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ name: "", number: 0 });
        toast.success("Adding Lesson Successful!", {
          position: "bottom-right",
        });
        setIsLoading(false);
        setIsError(false);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Error adding lesson");

        setIsLoading(false);
        setIsError(true);
      }
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        setErrorMessage(error.errors.join(", "));
        toast.error(error.errors.join(", "), {
          position: "bottom-right",
        });
      } else {
        console.error("Error adding lesson:", error);
        setErrorMessage("An unexpected error occurred");
      }
      setIsLoading(false);
      setIsError(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "number" ? Number(value) : value,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {isLoading && <p className="text-center text-gray-500">Loading...</p>}
      {isError && <p className="text-center text-red-500">{errorMessage}</p>}

      <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto">
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
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
            name="number"
            value={formData.number}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 bg-indigo-500 text-white font-bold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          Add Lesson
        </button>
      </form>
    </div>
  );
}
