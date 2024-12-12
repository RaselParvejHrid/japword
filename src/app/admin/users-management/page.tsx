"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  photo: Object;
}

function UsersManagementPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePromoteUser = async (userId: string) => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: "admin" }),
      });

      if (response.ok) {
        toast.success("Promoted to Admin.", { position: "bottom-right" });
        setIsLoading(false);
      } else {
        const responseBody = await response.json();
        toast.error(responseBody.message, { position: "bottom-right" });
        setIsLoading(false);
        setIsError(true);
      }
    } catch (error) {
      toast.error("Failed to Promote User", { position: "bottom-right" });
      setIsLoading(false);
      setIsError(true);
    }
  };

  const handleDemoteUser = async (userId: string) => {
    // ... (similar to your previous implementation)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: "standard" }),
      });

      if (response.ok) {
        // Handle success, e.g., update the user's role in the local state
      } else {
        // Handle error, e.g., display an error message to the user
      }
    } catch (error) {
      // Handle error, e.g., display an error message to the user
    }
  };

  return (
    <>
      {isLoading && <p>Loading...</p>}
      {isError && <p>Error fetching users</p>}

      {!isLoading && !isError && (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: User) => (
                <tr key={user.id} className="bg-white border-b border-gray-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.role === "admin" ? (
                      <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => handleDemoteUser(user.id)}
                      >
                        Demote to Standard
                      </button>
                    ) : (
                      <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => handlePromoteUser(user.id)}
                      >
                        Promote to Admin
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
