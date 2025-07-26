"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";
import { SignInButton, SignedOut } from "@clerk/nextjs";

import { Suspense } from "react";
import { FeaturedBlogSection } from "@/components/FeaturedBlogSection";

export default function Home() {
  const { user } = useUser();
  const [role, setRole] = useState<"admin" | "user" | null>(null);
  const [courses, setCourses] = useState<Array<{
    id: string;
    title: string;
    description: string;
    slug?: string;
    imageUrl?: string;
    category?: string;
    level?: string;
    priceInINR: number;
    modules: Array<{ id: string }>;
  }>>([]);

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

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.json())
      .then((data) => setCourses(data));
  }, []);

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white">
        <div className="absolute inset-0 bg-[url('/globe.svg')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left space-y-8">
              <div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                  Your Gateway to{" "}
                  <span className="text-yellow-400">Success</span> in Government
                  Exams
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-blue-100">
                  Expert-curated study materials, real exam simulations, and
                  personalized guidance to help you achieve your dreams of a
                  government job.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link href="/exams">
                  <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl">
                    Explore Free Resources
                  </button>
                </Link>
                {/* Role-based CTA */}
                {role === "admin" && (
                  <Link href="/admin">
                    <button className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                      Admin Dashboard
                    </button>
                  </Link>
                )}
                {role === "user" && (
                  <Link href="/dashboard">
                    <button className="bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                      Continue Learning
                    </button>
                  </Link>
                )}
                {!user && (
                  <SignedOut>
                    <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                      <button className="group relative bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105">
                        Start Free Trial
                        <span className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      </button>
                    </SignInButton>
                  </SignedOut>
                )}
              </div>
              <div className="flex items-center gap-8 text-blue-100">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Updated Syllabus</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Expert Faculty</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Success Guarantee</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="absolute -inset-4">
                <div className="w-full h-full mx-auto opacity-30 blur-lg bg-gradient-to-r from-yellow-400 to-pink-400"></div>
              </div>
              <div className="relative bg-gradient-to-b from-blue-900 to-purple-900 rounded-2xl p-8 shadow-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                    <h3 className="text-2xl font-bold mb-2">100+</h3>
                    <p className="text-blue-100">Students Enrolled</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                    <h3 className="text-2xl font-bold mb-2">95%</h3>
                    <p className="text-blue-100">Success Rate</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                    <h3 className="text-2xl font-bold mb-2">1</h3>
                    <p className="text-blue-100">Exam Category</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                    <h3 className="text-2xl font-bold mb-2">24/7</h3>
                    <p className="text-blue-100">Expert Support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Exams */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block">
              <span className="inline-block py-1 px-3 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full mb-4">
                FEATURED COURSES
              </span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Prepare for Top Government Exams
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Expertly designed courses with comprehensive study materials, mock
              tests, and personalized feedback to maximize your success rate
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {courses.length === 0 ? (
              <div className="col-span-3 text-center text-gray-500 p-12 bg-white rounded-2xl border-2 border-dashed">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto mb-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <p className="text-lg font-medium">No courses available yet.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Check back soon for new courses!
                </p>
              </div>
            ) : (
              courses.map((course) => (
                <div
                  key={course.id}
                  className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {course.imageUrl && (
                    <div className="relative">
                      <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                        {course.title}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>
                  )}
                  <div className="p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="py-1 px-2 text-xs font-semibold bg-blue-100 text-blue-700 rounded-md">
                        {course.category || "Government"}
                      </span>
                      <span className="py-1 px-2 text-xs font-semibold bg-purple-100 text-purple-700 rounded-md">
                        {course.level || "All Levels"}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 mb-6 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <span className="block text-sm text-gray-500 mb-1">
                          Course Fee
                        </span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          ₹{course.priceInINR}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="block text-sm text-gray-500 mb-1">
                          Duration
                        </span>
                        <span className="font-semibold text-gray-900">
                          {course.modules.length} Modules
                        </span>
                      </div>
                    </div>
                    <Link href={`/exams/${course.slug || course.id}`}>
                      <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2">
                        View Course Details
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="text-center mt-12">
            <Link href="/exams">
              <button className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold border-2 border-blue-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200">
                View All Courses
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block py-1 px-3 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full mb-4">
              WHY CHOOSE US
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Your Success is Our Mission
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide everything you need to excel in government examinations
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-2xl p-8 shadow-lg group-hover:shadow-2xl transition-all duration-300">
                <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/10 group-hover:text-white transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-white transition-colors">
                  Expert-Curated Content
                </h3>
                <p className="text-gray-600 group-hover:text-white/90 transition-colors">
                  Study materials prepared by experienced educators and
                  successful candidates
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-2xl p-8 shadow-lg group-hover:shadow-2xl transition-all duration-300">
                <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/10 group-hover:text-white transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-white transition-colors">
                  Real Exam Simulations
                </h3>
                <p className="text-gray-600 group-hover:text-white/90 transition-colors">
                  Practice with previous year questions and real exam-like
                  environment
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-2xl p-8 shadow-lg group-hover:shadow-2xl transition-all duration-300">
                <div className="bg-green-100 text-green-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/10 group-hover:text-white transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-white transition-colors">
                  Personalized Schedule
                </h3>
                <p className="text-gray-600 group-hover:text-white/90 transition-colors">
                  Customized study plans based on your target exam and
                  preparation level
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-2xl p-8 shadow-lg group-hover:shadow-2xl transition-all duration-300">
                <div className="bg-yellow-100 text-yellow-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/10 group-hover:text-white transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-white transition-colors">
                  Progress Tracking
                </h3>
                <p className="text-gray-600 group-hover:text-white/90 transition-colors">
                  Monitor your improvement with detailed analytics and
                  performance reports
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-2xl p-8 shadow-lg group-hover:shadow-2xl transition-all duration-300">
                <div className="bg-red-100 text-red-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/10 group-hover:text-white transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-white transition-colors">
                  Community Support
                </h3>
                <p className="text-gray-600 group-hover:text-white/90 transition-colors">
                  Connect with fellow aspirants and learn from their experiences
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-2xl p-8 shadow-lg group-hover:shadow-2xl transition-all duration-300">
                <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/10 group-hover:text-white transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-white transition-colors">
                  24/7 Expert Support
                </h3>
                <p className="text-gray-600 group-hover:text-white/90 transition-colors">
                  Get your doubts cleared anytime with our dedicated support
                  team
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Blog Section */}
      <Suspense>
        <FeaturedBlogSection />
      </Suspense>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of successful candidates who have achieved their
              dreams with PrepExam
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/exams">
                <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl">
                  Explore Free Resources
                </button>
              </Link>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="bg-yellow-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-yellow-400 transition-all duration-200 shadow-lg hover:shadow-xl">
                    Get Started Now
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
