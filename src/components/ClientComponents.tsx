"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { SignInButton, SignedOut } from "@clerk/nextjs";

export function UserRoleButtons() {
  const { user } = useUser();
  const [role, setRole] = useState<"admin" | "user" | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      if (user) {
        const res = await fetch("/api/user/current");
        if (res.ok) {
          const data = await res.json();
          setRole(data.role);
        }
      }
    };
    fetchRole();
  }, [user]);

  return (
    <div className="flex flex-wrap gap-4">
      <Link href="/exams">
        <button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-xl font-bold hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer">
          Start Free Preparation
        </button>
      </Link>

      {role === "admin" && (
        <Link href="/admin">
          <button className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer">
            Admin Dashboard
          </button>
        </Link>
      )}

      {role === "user" && (
        <Link href="/dashboard">
          <button className="bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer">
            Continue Learning
          </button>
        </Link>
      )}

      {!user && (
        <SignedOut>
          <SignInButton mode="modal" forceRedirectUrl="/dashboard">
            <button className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer">
              Sign In to Continue
            </button>
          </SignInButton>
        </SignedOut>
      )}
    </div>
  );
}

export function CTAButtons() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Link href="/exams">
        <button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-10 py-4 rounded-xl font-bold hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer">
          Start Free Preparation Now
        </button>
      </Link>
      <SignedOut>
        <SignInButton mode="modal">
          <button className="bg-white/10 backdrop-blur-sm text-white px-10 py-4 rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer">
            Sign Up for Free
          </button>
        </SignInButton>
      </SignedOut>
    </div>
  );
}