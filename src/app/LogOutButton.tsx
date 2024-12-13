"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const LogOutButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      });
      setIsLoading(false);

      if (response.ok) {
        router.replace("/login"); // Redirect to login page
      } else {
        console.error("Failed to log out");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`px-4 py-2 rounded text-white ${
        isLoading
          ? "bg-red-100 cursor-not-allowed"
          : "bg-red-500 hover:bg-blue-600"
      }`}
    >
      {isLoading ? "Logging out..." : "Log Out"}
    </button>
  );
};

export default LogOutButton;
