"use client";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Clock,
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  ArrowRight,
  Star,
  CheckCircle,
  PlayCircle,
} from "lucide-react";

interface EnrolledCourse {
  id: string;
  exam: {
    id: string;
    title: string;
    slug: string;
    modules: Array<{ id: string; title: string; isFree: boolean }>;
  };
  createdAt: string;
  hasPaid: boolean;
}

interface UserProgress {
  totalCourses: number;
  completedModules: number;
  totalModules: number;
  averageScore: number;
  studyStreak: number;
}

export default function DashboardPage() {
  const { user } = useUser();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalCourses: 0,
    completedModules: 0,
    totalModules: 0,
    averageScore: 0,
    studyStreak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching enrollment data for user:", user?.id);

        // Fetch enrollments
        const enrollmentRes = await fetch("/api/enrollment");
        const enrollmentData = await enrollmentRes.json();

        console.log("Enrollment response:", {
          ok: enrollmentRes.ok,
          status: enrollmentRes.status,
          data: enrollmentData,
        });

        if (enrollmentRes.ok) {
          setEnrolledCourses(enrollmentData);

          // Calculate progress from real data
          const totalCourses = enrollmentData.length;
          const totalModules = enrollmentData.reduce(
            (sum: number, course: EnrolledCourse) =>
              sum + course.exam.modules.length,
            0
          );

          setUserProgress((prev) => ({
            ...prev,
            totalCourses,
            totalModules,
            completedModules: Math.floor(totalModules * 0.3), // Placeholder calculation
            studyStreak: 5, // Placeholder
          }));
        } else {
          setError(
            `Failed to fetch enrollments: ${
              enrollmentData.error || "Unknown error"
            }`
          );
        }

        // Fetch user progress if API exists
        try {
          const progressRes = await fetch("/api/user/progress");
          if (progressRes.ok) {
            const progressData = await progressRes.json();
            setUserProgress((prev) => ({ ...prev, ...progressData }));
          }
        } catch (err) {
          console.log("Progress API not available, using calculated data");
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setError(
          `Network error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
      setLoading(false);
    }
    if (user) fetchUserData();
  }, [user]);

  if (!user) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-12">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Please sign in to access your dashboard
            </h2>
            <p className="text-gray-600 mb-6">
              You need to be signed in to view your learning progress.
            </p>
            <Link href="/sign-in">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
              <h3 className="text-red-800 font-semibold mb-2">
                Error Loading Dashboard
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  const progressPercentage =
    userProgress.totalModules > 0
      ? Math.round(
          (userProgress.completedModules / userProgress.totalModules) * 100
        )
      : 0;

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Welcome Header */}
        <div className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Welcome back, {user.firstName || "Student"}! 👋
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  Continue your journey to become a Computer Science teacher
                </p>
              </div>
              <div className="hidden md:flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {userProgress.studyStreak}
                  </div>
                  <div className="text-sm text-gray-500">Day Streak 🔥</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Overview */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-blue-100 text-blue-600 mr-4">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Enrolled Courses
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userProgress.totalCourses}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-green-100 text-green-600 mr-4">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {progressPercentage}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-purple-100 text-purple-600 mr-4">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userProgress.completedModules}/{userProgress.totalModules}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-orange-100 text-orange-600 mr-4">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Study Streak
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userProgress.studyStreak} days
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {/* My Courses */}
            <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
              <div className="p-6 border-b border-gray-200/50">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    My Courses
                  </h2>
                  <Link href="/exams">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                      Browse All <ArrowRight className="h-4 w-4" />
                    </button>
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {enrolledCourses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎓</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Start Your CS Teaching Journey
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Enroll in courses designed for PGT STET & BPSE TRE 4 exams
                    </p>
                    <Link href="/exams">
                      <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 cursor-pointer">
                        Explore Courses
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enrolledCourses.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-blue-50/50 to-purple-50/50"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 mr-4">
                              <BookOpen className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {enrollment.exam.title}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Enrolled on{" "}
                                {new Date(
                                  enrollment.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {enrollment.hasPaid && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Star className="h-3 w-3 mr-1" />
                                Premium
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-1" />
                            {enrollment.exam.modules.length} modules available
                          </div>
                          <Link
                            href={`/exams/${
                              enrollment.exam.slug || enrollment.exam.id
                            }/study`}
                          >
                            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2">
                              <PlayCircle className="h-4 w-4" />
                              Continue Learning
                            </button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
              <div className="p-6 border-b border-gray-200/50">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Quick Actions
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <Link href="/exams">
                  <div className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200 cursor-pointer bg-gradient-to-r from-blue-50/50 to-blue-100/50 hover:from-blue-100/50 hover:to-blue-200/50">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600 mr-3">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Browse Courses
                        </h4>
                        <p className="text-sm text-gray-600">
                          Find new courses to enroll
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/blog">
                  <div className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200 cursor-pointer bg-gradient-to-r from-green-50/50 to-green-100/50 hover:from-green-100/50 hover:to-green-200/50">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-green-100 text-green-600 mr-3">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Study Articles
                        </h4>
                        <p className="text-sm text-gray-600">
                          Read expert insights
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>

                {enrolledCourses.length > 0 && (
                  <div className="p-4 border border-gray-200 rounded-xl bg-gradient-to-r from-purple-50/50 to-purple-100/50">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-purple-100 text-purple-600 mr-3">
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Your Progress
                        </h4>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progressPercentage}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {progressPercentage}% Complete
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Motivational Section */}
          {enrolledCourses.length > 0 && (
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Keep Going! 🚀</h3>
                  <p className="text-blue-100 text-lg">
                    You're on track to become a successful Computer Science
                    teacher.
                    {progressPercentage > 50
                      ? " You're more than halfway there!"
                      : " Every step counts towards your goal!"}
                  </p>
                </div>
                <div className="hidden md:block text-6xl opacity-20">🎯</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
