"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import LogOutButton from "./LogOutButton";

export default function RootTemplate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>("guest");

  useEffect(() => {
    console.log("Pathname:", pathname);
    setIsUserLoggedIn(localStorage.getItem("isUserLoggedIn") === "true");
  }, [pathname]);

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole") ?? "guest");
  }, [isUserLoggedIn]);

  console.log(isUserLoggedIn, userRole);
  return (
    <>
      <header>
        <nav className="bg-blue-600 p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            {/* Logo */}
            <div className="text-white text-2xl font-semibold">
              <Link href="/">JapWord</Link>
            </div>

            {/* Navbar Links */}
            <div className="space-x-6">
              {isUserLoggedIn && userRole === "admin" ? (
                <Link href="/admin/dashboard" className="text-white">
                  Dashboard
                </Link>
              ) : null}

              {isUserLoggedIn && userRole === "standard" ? (
                <>
                  <Link href="/user/lessons" className="text-white">
                    Lessons
                  </Link>
                  <Link href="/user/tutorials" className="text-white">
                    Tutorials
                  </Link>
                </>
              ) : null}

              {!isUserLoggedIn ? (
                <>
                  <Link href="/login" className="text-white">
                    Log In
                  </Link>
                  <Link href="/registration" className="text-white">
                    Registration
                  </Link>
                </>
              ) : null}

              {isUserLoggedIn ? <LogOutButton /> : null}
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto p-4 min-h-[75vh]">{children}</main>

      {/* Admin Interface Should not have a footer */}
      {!isUserLoggedIn || userRole !== "admin" ? (
        <footer className="bg-gray-800 text-white p-6 mt-8">
          <div className="max-w-7xl mx-auto flex justify-between">
            <div className="flex space-x-6">
              <Link href="/about" className="hover:underline">
                About
              </Link>
              <Link href="/contact" className="hover:underline">
                Contact
              </Link>
            </div>
            <div className="text-sm">&copy; 2024 JapWord</div>
          </div>
        </footer>
      ) : null}
    </>
  );
}
