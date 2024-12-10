"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import validator from "validator";
import { toast } from "react-toastify";

const Registration = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [waiting, setWaiting] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setWaiting(true);
    setError(null);

    if (validator.isEmpty(name.trim())) {
      setError("Name is invalid.");
      setWaiting(false);
      return;
    }

    if (!validator.isEmail(email.trim())) {
      setError("Email is invalid.");
      setWaiting(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setWaiting(false);
      return;
    }

    if (!photo) {
      setError("Upload a Photo.");
      setWaiting(false);
      return;
    }

    // Prepare form data to send to the API route
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("photo", photo);

    try {
      const res = await fetch("/api/registration", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        setError("Registration Failed.");
        setWaiting(false);
        return;
      }
      setName("");
      setEmail("");
      setPassword("");
      setPhoto(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setError(null);
      setWaiting(false);
      toast.success("Registration Successful!", { position: "bottom-right" });
      router.replace("/log-in");
    } catch (err) {
      console.log(err);
      setError("Registration Failed.");
      setWaiting(false);
      return;
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Register</h1>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold">
            Name
          </label>
          <input
            disabled={waiting === true}
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold">
            Email
          </label>
          <input
            disabled={waiting === true}
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold">
            Password
          </label>
          <input
            disabled={waiting === true}
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="photo" className="block text-sm font-semibold">
            Photo
          </label>
          <input
            ref={(el) => (fileInputRef.current = el)}
            disabled={waiting === true}
            type="file"
            id="photo"
            accept="image/*"
            onChange={(e) =>
              setPhoto(e.target.files ? e.target.files[0] : null)
            }
            className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <button
          disabled={waiting === true}
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Registration;
