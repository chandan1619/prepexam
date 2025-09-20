"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";
import { SignInButton, SignedOut } from "@clerk/nextjs";
import { Suspense } from "react";
import { FeaturedBlogSection } from "@/components/FeaturedBlogSection";
import { SpinnerLoader } from "@/components/ui/loader";

export default function Home() {
  const { user } = useUser();
  const [role, setRole] = useState<"admin" | "user" | null>(null);
  const [courses, setCourses] = useState<
    Array<{
      id: string;
      title: string;
      description: string;
      slug?: string;
      imageUrl?: string;
      category?: string;
      level?: string;
      priceInINR: number;
      modules: Array<{ id: string }>;
    }>
  >([]);

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

  const [coursesLoading, setCoursesLoading] = useState(true);

  useEffect(() => {
    setCoursesLoading(true);
    fetch("/api/courses")
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
        setCoursesLoading(false);
      })
      .catch(() => setCoursesLoading(false));
  }, []);

  return (
    <PageLayout>
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
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
              >
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
                  <Link href="/exams">
                    <button
                      className={`w-full bg-gradient-to-r ${category.color} text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg cursor-pointer`}
                    >
                      Start Preparation
                    </button>
                  </Link>
                </div>
              </div>
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {coursesLoading ? (
                  <div className="col-span-3 flex flex-col items-center justify-center p-12 bg-white rounded-2xl border-2 border-dashed">
                    <SpinnerLoader size="lg" className="mb-4" />
                    <p className="text-lg font-medium text-gray-600">
                      Loading courses...
                    </p>
                  </div>
                ) : (
                  courses.slice(0, 3).map((course) => (
                    <div
                      key={course.id}
                      className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      {course.imageUrl ? (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={course.imageUrl}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        </div>
                      ) : (
                        <div className="relative h-48">
                          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                            {course.title}
                          </div>
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="py-1 px-3 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                            {course.category || "Government"}
                          </span>
                          <span className="py-1 px-3 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                            {course.modules.length} Modules
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
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              {course.priceInINR === 0
                                ? "Free"
                                : `₹${course.priceInINR}`}
                            </span>
                          </div>
                        </div>
                        <Link href={`/exams/${course.slug || course.id}`}>
                          <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 cursor-pointer">
                            View Course Details
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
                exam: "BPSE TRE 4 CS 2023",
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
