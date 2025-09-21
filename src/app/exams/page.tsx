"use client";

import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";
import { useEffect, useState } from "react";

export default function ExamsPage() {
  const [courses, setCourses] = useState<Array<{
    id: string;
    title: string;
    description: string;
    slug?: string;
    imageUrl?: string;
    category?: string;
    priceInINR: number;
    duration?: string;
    modules: Array<{ id: string }>;
  }>>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        const res = await fetch("/api/courses");
        const data = await res.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  const categories = ["All", "SSC", "UPSC", "Banking", "Railway", "Teaching"];

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Prepare for Success
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Comprehensive exam preparation courses designed to help you
                excel in government recruitment exams
              </p>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2">
                <input
                  type="text"
                  placeholder="Search for exams, courses, or topics..."
                  className="w-full px-6 py-4 bg-white rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Categories */}
          <div className="mb-12">
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    category === "All"
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                      : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Exams Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.length === 0 ? (
              <div className="col-span-3 text-center py-12">
                <div className="bg-white rounded-2xl p-8 max-w-md mx-auto">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Courses Available
                  </h3>
                  <p className="text-gray-600">
                    Check back soon for new courses!
                  </p>
                </div>
              </div>
            ) : (
              courses.map((course) => (
                <div
                  key={course.id}
                  className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {course.imageUrl ? (
                    <div className="relative h-48">
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      {course.category && (
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-blue-500/90 text-white text-sm font-medium rounded-lg">
                            {course.category}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative h-48">
                      <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                        {course.title}
                      </div>
                      {course.category && (
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-blue-500/90 text-white text-sm font-medium rounded-lg">
                            {course.category}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>
                      <div className="flex flex-col items-end">
                        {course.priceInINR === 0 ? (
                          <>
                            <span className="text-sm text-gray-500">
                              Starting from
                            </span>
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              Free
                            </span>
                          </>
                        ) : (
                          <div className="text-right">
                            <div className="flex items-center gap-2 justify-end mb-1">
                              <span className="text-sm text-gray-500 line-through">₹999</span>
                              <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                                50% OFF
                              </div>
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              ₹499
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 mt-2 mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-6 py-4 border-t">
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg
                          className="w-5 h-5 text-blue-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                        <span>{course.modules.length} Modules</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg
                          className="w-5 h-5 text-blue-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>{course.duration || "Self-paced"}</span>
                      </div>
                    </div>
                    <Link
                      href={`/exams/${course.slug || course.id}`}
                      className="block mt-4"
                    >
                      <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 cursor-pointer">
                        View Course Details
                      </button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
