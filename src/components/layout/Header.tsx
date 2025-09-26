"use client";
import { SignInButton, UserButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (user) {
        try {
          const response = await fetch("/api/user/current", {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
            },
          });
          if (response.ok) {
            const userData = await response.json();
            setIsAdmin(userData.role === "admin");
            console.log('Header: User role check -', userData.role, 'Is Admin:', userData.role === "admin");
          }
        } catch (error) {
          console.error("Error checking admin role:", error);
        }
      }
    };

    checkAdminRole();
  }, [user]);

  // Add a manual refresh function for debugging
  const refreshAdminStatus = async () => {
    if (user) {
      try {
        const response = await fetch("/api/user/current", {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        if (response.ok) {
          const userData = await response.json();
          setIsAdmin(userData.role === "admin");
          console.log('Manual refresh - User role:', userData.role, 'Is Admin:', userData.role === "admin");
        }
      } catch (error) {
        console.error("Error refreshing admin role:", error);
      }
    }
  };

  // Expose refresh function to window for debugging (remove in production)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).refreshAdminStatus = refreshAdminStatus;
    }
  }, [user]);
  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Edmission
                </h1>
                <p className="text-xs text-gray-500 -mt-1">
                  Master Your Future
                </p>
              </div>
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/exams"
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                Exam Catalog
              </Link>
              <Link
                href="/bpsc-previous-year-computer-science-question-paper"
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                BPSC Previous Year Questions
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                My Dashboard
              </Link>
              {isAdmin && (
                <>
                  <Link
                    href="/admin"
                    className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                  >
                    Admin
                  </Link>
                  <Link
                    href="/admin/blog"
                    className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                  >
                    Blog Management
                  </Link>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center space-x-8">
            <SignedOut>
              <Link
                href="/exams"
                className="text-gray-600 hover:text-blue-600 font-medium hidden md:block"
              >
                Browse Courses
              </Link>
              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200">
                  Get Started
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
  
              <div className="transform scale-150">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox:
                        "rounded-2xl border-2 border-blue-100 hover:border-blue-200 transition-colors shadow-md hover:shadow-lg",
                      avatarImage: "rounded-xl",
                    },
                  }}
                ></UserButton>
              </div>
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
}
