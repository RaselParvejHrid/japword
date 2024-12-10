import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import Link from "next/link";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Learn Japanese",
  description: "Assigned by Programming Hero",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isUserLoggedIn = headers().get("X-User-Logged-In") === "true";
  const userRole = headers().get("X-User-Role");

  return (
    <html lang="en">
      <head>
        <title>JapWord</title>
      </head>
      <body className={inter.className}>
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
                    <Link href="/lessons" className="text-white">
                      Lessons
                    </Link>
                    <Link href="/tutorials" className="text-white">
                      Tutorials
                    </Link>
                  </>
                ) : null}

                {!isUserLoggedIn ? (
                  <>
                    <Link href="/log-in" className="text-white">
                      Log In
                    </Link>
                    <Link href="/registration" className="text-white">
                      Registration
                    </Link>
                  </>
                ) : null}
              </div>
            </div>
          </nav>
        </header>

        <main className="max-w-7xl mx-auto p-4">{children}</main>

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
        <ToastContainer />
      </body>
    </html>
  );
}
