"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";
import { SignInButton, SignedOut } from "@clerk/nextjs";
import { Suspense } from "react";
import { FeaturedBlogSection } from "@/components/FeaturedBlogSection";
import { SpinnerLoader } from "@/components/ui/loader";
import { fetchWithCache, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";
import StructuredData from "@/components/StructuredData";

export default function Home() {
  const { user } = useUser();
  const [role, setRole] = useState<"admin" | "user" | null>(null);
  type Course = {
    id: string;
    title: string;
    description: string;
    slug?: string;
    imageUrl?: string;
    category?: string;
    level?: string;
    priceInINR: number;
    modules: Array<{ id: string }>;
  };

  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

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
    const fetchCourses = async () => {
      setCoursesLoading(true);
      try {
        const data = await fetchWithCache<Course[]>(
          "/api/courses",
          CACHE_KEYS.COURSES,
          CACHE_TTL.COURSES
        );
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <PageLayout>
      {/* Structured Data for SEO */}
      <StructuredData type="organization" />
      <StructuredData type="website" />
      <StructuredData type="course" />
      <StructuredData type="faq" />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="absolute inset-0 opacity-20">
          <div
            className="w-full h-full bg-gradient-to-br from-blue-800/20 to-indigo-800/20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-blue-800/50 backdrop-blur-sm rounded-full text-blue-200 text-sm font-medium border border-blue-700/50">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Trusted by 1,000+ Computer Science Teachers
              </div>

              <div>
                <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
                  Become a{" "}
                  <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                    CS Teacher
                  </span>
                  <br />
                  with Confidence
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-blue-100 font-medium leading-relaxed">
                  Master PGT STET & BPSE TRE 4 Computer Science exams with our
                  comprehensive written study materials, expert guidance, and
                  proven strategies.
                </p>
              </div>

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

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    5,000+
                  </div>
                  <div className="text-blue-200 text-sm">CS Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">90%</div>
                  <div className="text-blue-200 text-sm">Selection Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">2</div>
                  <div className="text-blue-200 text-sm">Major Exams</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">24/7</div>
                  <div className="text-blue-200 text-sm">WhatsApp Support</div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="absolute -inset-4">
                <div className="w-full h-full mx-auto opacity-30 blur-lg bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl"></div>
              </div>
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold">PGT STET Cleared</div>
                      <div className="text-blue-200 text-sm">Priya Sharma</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold">BPSE TRE 4 Selected</div>
                      <div className="text-blue-200 text-sm">
                        CS Teacher - Rahul Kumar
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold">PGT Computer Science</div>
                      <div className="text-blue-200 text-sm">
                        Selected - Amit Singh
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Government Exams */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block py-2 px-4 text-sm font-semibold bg-blue-100 text-blue-700 rounded-full mb-4">
              COMPUTER SCIENCE TEACHER EXAMS
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Master CS Teaching Exams
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive preparation materials for Computer Science teaching
              positions with updated syllabus, previous year questions, and
              expert guidance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
            {[
              {
                title: "PGT STET Computer Science",
                exams: [
                  "Programming Concepts",
                  "Data Structures & Algorithms",
                  "Computer Networks",
                  "Database Management",
                  "Software Engineering",
                  "Teaching Methodology",
                ],
                icon: "💻",
                color: "from-blue-500 to-blue-600",
                bgColor: "bg-blue-50",
                textColor: "text-blue-700",
              },
              {
                title: "BPSE TRE 4 Computer Science",
                exams: [
                  "Computer Fundamentals",
                  "Programming Languages",
                  "System Analysis",
                  "Web Technologies",
                  "Educational Psychology",
                  "Pedagogy",
                ],
                icon: "🎓",
                color: "from-green-500 to-green-600",
                bgColor: "bg-green-50",
                textColor: "text-green-700",
              },
            ].map((category, index) => (
              <Link key={index} href="/bpsc-previous-year-computer-science-question-paper">
                <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden cursor-pointer">
                  <div className={`${category.bgColor} p-6 text-center`}>
                    <div className="text-4xl mb-3">{category.icon}</div>
                    <h3
                      className={`text-xl font-bold ${category.textColor} mb-2`}
                    >
                      {category.title}
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-2 mb-6">
                      {category.exams.map((exam, examIndex) => (
                        <div
                          key={examIndex}
                          className="flex items-center gap-2 text-gray-600"
                        >
                          <svg
                            className="w-4 h-4 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{exam}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <Link href="/exams" onClick={(e) => e.stopPropagation()}>
                        <button
                          className={`flex-1 bg-gradient-to-r ${category.color} text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg cursor-pointer text-sm`}
                        >
                          Start Preparation
                        </button>
                      </Link>
                      <button
                        className="bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-sm"
                      >
                        View Papers
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Available Courses */}
          {courses.length > 0 && (
            <div className="mt-16">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Available Courses
                </h3>
                <p className="text-lg text-gray-600">
                  Start your preparation with our expertly crafted courses
                </p>
              </div>
              <div
                className={`grid gap-8 ${
                  courses.slice(0, 3).length === 1
                    ? "justify-center"
                    : courses.slice(0, 3).length === 2
                    ? "md:grid-cols-2 justify-center max-w-4xl mx-auto"
                    : "md:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {coursesLoading ? (
                  <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white rounded-2xl border-2 border-dashed">
                    <SpinnerLoader size="lg" className="mb-4" />
                    <p className="text-lg font-medium text-gray-600">
                      Loading courses...
                    </p>
                  </div>
                ) : (
                  courses.slice(0, 3).map((course) => (
                    <div
                      key={course.id}
                      className={`group bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-blue-200 transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] ${
                        courses.slice(0, 3).length === 1
                          ? "max-w-md w-full"
                          : ""
                      }`}
                    >
                      {course.imageUrl ? (
                        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
                          <img
                            src={course.imageUrl}
                            alt={course.title}
                            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                              <svg
                                className="w-5 h-5 text-blue-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
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
                        </div>
                      )}

                      <div className="p-8">
                        <div className="flex items-center gap-3 mb-5">
                          <span className="inline-flex items-center gap-1 py-2 px-4 text-xs font-bold bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 rounded-full border border-blue-200">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {course.category || "Government"}
                          </span>
                          <span className="inline-flex items-center gap-1 py-2 px-4 text-xs font-bold bg-gradient-to-r from-green-100 to-green-50 text-green-700 rounded-full border border-green-200">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            {course.modules.length} Modules
                          </span>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
                          {course.title}
                        </h3>

                        <p className="text-gray-600 mb-6 line-clamp-2 leading-relaxed">
                          {course.description}
                        </p>

                        <div className="flex items-center justify-between mb-8">
                          <div className="flex flex-col">
                            {course.priceInINR === 0 ? (
                              <div className="flex items-center gap-2">
                                <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                  Free
                                </span>
                                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                                  LIMITED TIME
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-4">
                                <div className="flex flex-col">
                                  <span className="text-sm text-gray-500 line-through font-medium">
                                    ₹999
                                  </span>
                                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    ₹499
                                  </span>
                                </div>
                                <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-2 rounded-xl text-sm font-bold shadow-lg">
                                  50% OFF
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-gray-500">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-sm font-medium">
                              Self-paced
                            </span>
                          </div>
                        </div>

                        <Link href={`/exams/${course.slug || course.id}`}>
                          <button className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/30 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer relative overflow-hidden group">
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              View Course Details
                              <svg
                                className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                                />
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
              {courses.length > 3 && (
                <div className="text-center mt-8">
                  <Link href="/exams">
                    <button className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 cursor-pointer">
                      View All Courses
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
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
              )}
            </div>
          )}
        </div>
      </section>

      {/* Previous Year Questions Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block py-2 px-4 text-sm font-semibold bg-purple-100 text-purple-700 rounded-full mb-4">
              PREVIOUS YEAR QUESTIONS
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Practice with Real Exam Papers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access comprehensive collection of previous year question papers for TRE 1, TRE 2, TRE 3
              across different classes to boost your preparation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[
              {
                title: "TRE 1 Papers",
                description: "Complete collection of TRE 1 question papers with solutions",
                icon: "📄",
                color: "from-blue-500 to-blue-600",
                bgColor: "bg-blue-50",
                textColor: "text-blue-700",
              },
              {
                title: "TRE 2 Papers",
                description: "Comprehensive TRE 2 question papers for thorough practice",
                icon: "📋",
                color: "from-green-500 to-green-600",
                bgColor: "bg-green-50",
                textColor: "text-green-700",
              },
              {
                title: "TRE 3 Papers",
                description: "Latest TRE 3 question papers with detailed analysis",
                icon: "📊",
                color: "from-purple-500 to-purple-600",
                bgColor: "bg-purple-50",
                textColor: "text-purple-700",
              },
            ].map((paper, index) => (
              <Link key={index} href="/bpsc-previous-year-computer-science-question-paper">
                <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden cursor-pointer">
                  <div className={`${paper.bgColor} p-6 text-center`}>
                    <div className="text-4xl mb-3">{paper.icon}</div>
                    <h3 className={`text-xl font-bold ${paper.textColor} mb-2`}>
                      {paper.title}
                    </h3>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {paper.description}
                    </p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Class 9-10 Papers</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Class 11-12 Papers</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>PDF Format</span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-3 text-center">
                      <span className="text-sm font-semibold text-gray-700">Click to view papers</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link href="/bpsc-previous-year-computer-science-question-paper">
              <button className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-700 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/30 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer relative overflow-hidden group">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  View All Question Papers
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block py-2 px-4 text-sm font-semibold bg-green-100 text-green-700 rounded-full mb-4">
              WHY CHOOSE US
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Your Success is Our Priority
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide everything you need to crack any government exam with
              confidence and achieve your career goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "📚",
                title: "Comprehensive Study Material",
                description:
                  "Updated syllabus coverage with detailed explanations, shortcuts, and exam-specific strategies written by experts.",
                color: "bg-blue-50 text-blue-600",
              },
              {
                icon: "📝",
                title: "Previous Year Questions",
                description:
                  "Extensive collection of PYQs from last 10+ years with detailed solutions and trend analysis.",
                color: "bg-green-50 text-green-600",
              },
              {
                icon: "🎯",
                title: "Mock Tests & Practice",
                description:
                  "Real exam-like mock tests with instant results, performance analysis, and improvement suggestions.",
                color: "bg-purple-50 text-purple-600",
              },
              {
                icon: "👨‍🏫",
                title: "Expert Guidance",
                description:
                  "Learn from successful candidates and experienced educators who understand exam patterns.",
                color: "bg-orange-50 text-orange-600",
              },
              {
                icon: "📊",
                title: "Progress Tracking",
                description:
                  "Monitor your preparation with detailed analytics, weak area identification, and improvement plans.",
                color: "bg-red-50 text-red-600",
              },
              {
                icon: "💬",
                title: "24/7 Support",
                description:
                  "Get your doubts cleared anytime through WhatsApp support and community discussions.",
                color: "bg-indigo-50 text-indigo-600",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${feature.color} text-3xl`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block py-2 px-4 text-sm font-semibold bg-yellow-100 text-yellow-700 rounded-full mb-4">
              SUCCESS STORIES
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Dreams Turned Into Reality
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of successful candidates who achieved their
              government job dreams with our guidance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Priya Sharma",
                exam: "PGT STET CS 2023",
                image: "👩‍🏫",
                quote:
                  "The comprehensive CS study material and programming practice helped me crack PGT STET in my first attempt. The WhatsApp support was incredibly helpful!",
              },
              {
                name: "Rahul Kumar",
                exam: "PGT Computer Science 2023",
                rank: "Selected as CS Teacher",
                image: "👨‍🏫",
                quote:
                  "Previous year questions and expert guidance made all the difference. I'm now working as a Computer Science teacher in a government school.",
              },
              {
                name: "Amit Singh",
                exam: "PGT Computer Science 2023",
                rank: "Selected",
                image: "👨‍💻",
                quote:
                  "The mock tests were exactly like the real exam. Thanks to the detailed preparation strategy, I cleared PGT Computer Science successfully.",
              },
            ].map((story, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">{story.image}</div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {story.name}
                  </h3>
                  <p className="text-blue-600 font-semibold">{story.exam}</p>
                  <p className="text-green-600 font-bold">{story.rank}</p>
                </div>
                <blockquote className="text-gray-600 italic text-center leading-relaxed">
                  &quot;{story.quote}&quot;
                </blockquote>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block py-2 px-4 text-sm font-semibold bg-purple-100 text-purple-700 rounded-full mb-4">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Got Questions? We&apos;ve Got Answers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to know about our Computer Science teaching
              exam preparation course
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "Which exams does this course cover?",
                answer:
                  "This course is designed for BPSC TRE 4.0 (Computer Science) and Bihar STET (Computer Science) exams, covering the complete latest syllabus.",
              },
              {
                question: "What do I get in this course?",
                answer:
                  "You get written notes, topic-wise explanations, solved examples, previous year questions, and practice questions — all in an easy-to-understand, exam-oriented format.",
              },
              {
                question: "How long do I get access?",
                answer:
                  "You get lifetime access, including free updates whenever the syllabus or exam pattern changes.",
              },
              {
                question: "Do you offer free demo content?",
                answer:
                  "Yes! We provide sample notes so you can check the quality before purchasing.",
              },
              {
                question: "Can I ask doubts if I get stuck?",
                answer:
                  "Yes, we offer Telegram/WhatsApp group support where you can get your doubts solved quickly.",
              },
              {
                question: "Is this course enough to crack the exam?",
                answer:
                  "If you follow the course seriously and practice regularly, it will be more than enough to clear the exam confidently.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    Q{index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Still have questions?
              </h3>
              <p className="text-gray-600 mb-6">
                Contact us directly for personalized guidance and support
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://wa.me/918789449507"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.087z" />
                  </svg>
                  WhatsApp Support
                </a>
                <a
                  href="tel:+918809586507"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  Call Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Blog Section */}
      <Suspense
        fallback={
          <div className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <SpinnerLoader size="lg" />
            </div>
          </div>
        }
      >
        <FeaturedBlogSection />
      </Suspense>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Start Your Success Journey?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join thousands of successful government job aspirants who
              transformed their careers with our expert guidance and
              comprehensive study materials.
            </p>
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
            <div className="mt-8 text-blue-200 text-sm">
              ✓ No Credit Card Required ✓ Instant Access ✓ Expert Support
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
