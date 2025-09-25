"use client";

import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";
import { useEffect, useState } from "react";
import { fetchWithCache, CACHE_KEYS, CACHE_TTL, clearUserCache } from "@/lib/cache";
import { useUser } from "@clerk/nextjs";

export default function ExamsPage() {
  type Course = {
    id: string;
    title: string;
    description: string;
    slug?: string;
    imageUrl?: string;
    category?: string;
    priceInINR: number;
    duration?: string;
    modules: Array<{ id: string }>;
  };

  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLoading] = useState(true);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        const data = await fetchWithCache<Course[]>(
          "/api/courses",
          CACHE_KEYS.COURSES,
          CACHE_TTL.COURSES
        );
        setCourses(data);
        setFilteredCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    }
    
    // Only fetch courses when Clerk has finished loading
    if (isLoaded) {
      fetchCourses();
    }
  }, [isLoaded]);

  // Clear cache when user authentication state changes
  useEffect(() => {
    if (isLoaded) {
      // Clear cache when user signs in/out to ensure fresh data
      clearUserCache();
    }
  }, [user?.id, isLoaded]);

  // Filter courses based on category and search query
  useEffect(() => {
    let filtered = courses;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(course =>
        course.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.category?.toLowerCase().includes(query)
      );
    }

    setFilteredCourses(filtered);
  }, [courses, selectedCategory, searchQuery]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

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
                  value={searchQuery}
                  onChange={handleSearchChange}
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
                  onClick={() => handleCategoryChange(category)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    category === selectedCategory
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
          <div className={`grid gap-6 ${
            filteredCourses.length === 1
              ? 'justify-center'
              : filteredCourses.length === 2
                ? 'md:grid-cols-2 justify-center max-w-4xl mx-auto'
                : 'md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {filteredCourses.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="bg-white rounded-2xl p-8 max-w-md mx-auto">
                  <div className="text-6xl mb-4">
                    {courses.length === 0 ? "📚" : "🔍"}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {courses.length === 0 ? "No Courses Available" : "No Results Found"}
                  </h3>
                  <p className="text-gray-600">
                    {courses.length === 0
                      ? "Check back soon for new courses!"
                      : "Try adjusting your search or filter criteria."
                    }
                  </p>
                </div>
              </div>
            ) : (
              filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className={`group bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-blue-200 transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] ${
                    filteredCourses.length === 1 ? 'max-w-md w-full' : ''
                  }`}
                >
                  {course.imageUrl ? (
                    <div className="relative h-56 bg-gradient-to-br from-blue-50 to-purple-50">
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {course.category && (
                        <div className="absolute top-4 left-4">
                          <span className="px-4 py-2 bg-white/95 backdrop-blur-sm text-blue-700 text-sm font-bold rounded-full shadow-lg border border-blue-200">
                            {course.category}
                          </span>
                        </div>
                      )}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-56 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700">
                      <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold relative z-10">
                        {course.title}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20"></div>
                      {course.category && (
                        <div className="absolute top-4 left-4">
                          <span className="px-4 py-2 bg-white/95 backdrop-blur-sm text-blue-700 text-sm font-bold rounded-full shadow-lg">
                            {course.category}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="p-8">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 leading-tight flex-1">
                        {course.title}
                      </h3>
                      <div className="flex flex-col items-end">
                        {course.priceInINR === 0 ? (
                          <div className="text-right">
                            <span className="text-sm text-gray-500 font-medium block mb-1">
                              Starting from
                            </span>
                            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                              Free
                            </span>
                          </div>
                        ) : (
                          <div className="text-right">
                            <div className="flex items-center gap-2 justify-end mb-1">
                              <span className="text-sm text-gray-500 line-through font-medium">₹999</span>
                              <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-md">
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
                    
                    <p className="text-gray-600 mb-6 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                    
                    <div className="flex items-center gap-6 py-4 mb-6 border-t border-gray-100">
                      <div className="flex items-center gap-3 text-gray-600">
                        <div className="bg-blue-100 rounded-full p-2">
                          <svg
                            className="w-4 h-4 text-blue-600"
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
                        </div>
                        <span className="font-medium">{course.modules.length} Modules</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <div className="bg-purple-100 rounded-full p-2">
                          <svg
                            className="w-4 h-4 text-purple-600"
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
                        </div>
                        <span className="font-medium">{course.duration || "Self-paced"}</span>
                      </div>
                    </div>
                    
                    <Link
                      href={`/exams/${course.slug || course.id}`}
                      className="block"
                    >
                      <button className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/30 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer relative overflow-hidden group">
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          View Course Details
                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                          </svg>
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
