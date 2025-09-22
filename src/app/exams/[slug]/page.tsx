"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import PageLayout from "@/components/layout/PageLayout";
import { Loader } from "@/components/ui/loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  ClipboardList,
  HelpCircle,
  Calendar,
  FileText,
  Lock,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import PaymentButton from "@/components/PaymentButton";
import { fetchWithCache, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";

interface CourseModule {
  id: string;
  title: string;
  isFree?: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  slug?: string;
  imageUrl?: string;
  category?: string;
  level?: string;
  priceInINR: number;
  duration?: string;
  modules: CourseModule[];
}

interface UserAccess {
  isEnrolled: boolean;
  hasPaid: boolean;
}

export default function ExamDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { user } = useUser();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userAccess, setUserAccess] = useState<UserAccess | null>(null);
  const [accessLoading, setAccessLoading] = useState(false);

  useEffect(() => {
    async function fetchCourse() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchWithCache<{ course: Course }>(
          `/api/course/${slug}`,
          CACHE_KEYS.COURSE_DETAIL(slug),
          CACHE_TTL.COURSE_DETAIL
        );
        if (data.course) {
          setCourse(data.course);
        } else {
          setError("Course not found");
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        setError("Failed to load course");
      }
      setLoading(false);
    }
    if (slug) fetchCourse();
  }, [slug]);

  useEffect(() => {
    async function checkUserAccess() {
      if (!user || !course) {
        console.log("User or course not available:", { user: !!user, course: !!course });
        return;
      }
      
      setAccessLoading(true);
      try {
        console.log("Checking user access for course:", course.id);
        const res = await fetch(`/api/user/access?examId=${course.id}`);
        const data = await res.json();
        console.log("User access response:", data);
        if (res.ok) {
          setUserAccess(data);
        } else {
          console.error("Access check failed:", data);
        }
      } catch (err) {
        console.error("Failed to check user access:", err);
      }
      setAccessLoading(false);
    }
    
    checkUserAccess();
  }, [user, course]);

  const handleEnrollmentSuccess = async () => {
    // Refresh user access after enrollment and clear cache
    if (course) {
      try {
        // Clear the user access cache to force refresh
        const cacheKey = CACHE_KEYS.USER_ACCESS(course.id);
        const { clientCache } = await import("@/lib/cache");
        clientCache.delete(cacheKey);
        
        const data = await fetchWithCache<UserAccess>(
          `/api/user/access?examId=${course.id}`,
          cacheKey,
          CACHE_TTL.USER_ACCESS
        );
        setUserAccess(data);
      } catch (err) {
        console.error("Failed to refresh user access:", err);
      }
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader size="lg" className="mx-auto mb-4" />
            <p className="text-gray-600">Loading course...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !course) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {error || "Course not found"}
            </h2>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-10">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border border-gray-100">
            {/* Image Section */}
            <div className="relative">
              {course.imageUrl ? (
                <div className="relative h-48 md:h-64 lg:h-80 bg-gradient-to-br from-blue-50 to-purple-50">
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full h-full object-contain p-6"
                  />
                </div>
              ) : (
                <div className="relative h-48 md:h-64 lg:h-80 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 flex items-center justify-center">
                  <div className="text-white text-2xl md:text-3xl font-bold text-center px-6">
                    {course.title}
                  </div>
                </div>
              )}
            </div>

            {/* Content Section - Separated from Image */}
            <div className="p-6 md:p-8 lg:p-10">
              {/* Title and Badges */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-3 mb-4">
                  {course.category && (
                    <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-none px-4 py-2 text-sm font-semibold">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      {course.category}
                    </Badge>
                  )}
                  {course.level && (
                    <Badge
                      variant="outline"
                      className="border-purple-200 text-purple-700 hover:bg-purple-50 px-4 py-2 text-sm font-semibold"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {course.level}
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
                  {course.title}
                </h1>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                  {course.description}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 md:p-6 border border-blue-200">
                  <div className="flex items-center gap-3 text-blue-600 mb-2">
                    <div className="bg-blue-500 rounded-full p-2">
                      <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </div>
                    <span className="font-semibold text-sm md:text-base">Modules</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {course.modules.length}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 md:p-6 border border-purple-200">
                  <div className="flex items-center gap-3 text-purple-600 mb-2">
                    <div className="bg-purple-500 rounded-full p-2">
                      <Calendar className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </div>
                    <span className="font-semibold text-sm md:text-base">Duration</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {course.duration || "Flexible"}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 md:p-6 border border-green-200">
                  <div className="flex items-center gap-3 text-green-600 mb-2">
                    <div className="bg-green-500 rounded-full p-2">
                      <FileText className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </div>
                    <span className="font-semibold text-sm md:text-base">Questions</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">1000+</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-4 md:p-6 border border-yellow-200">
                  <div className="flex items-center gap-3 text-yellow-600 mb-2">
                    <div className="bg-yellow-500 rounded-full p-2">
                      <HelpCircle className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </div>
                    <span className="font-semibold text-sm md:text-base">Support</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">24/7</p>
                </div>
              </div>

              {/* Action Section */}
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    {user && userAccess?.isEnrolled ? (
                      <Link
                        href={`/exams/${course.slug || course.id}/study`}
                        className="w-full sm:w-auto"
                      >
                        <button className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]">
                          <ClipboardList className="h-5 w-5" />
                          Start Preparing Now
                        </button>
                      </Link>
                    ) : (
                      <div className="w-full sm:w-auto">
                        {user ? (
                          <PaymentButton
                            examId={course.id}
                            examTitle={course.title}
                            amount={course.priceInINR}
                            isEnrolled={userAccess?.isEnrolled || false}
                            onEnrollmentSuccess={handleEnrollmentSuccess}
                          />
                        ) : (
                          <Link href="/sign-in" className="w-full block">
                            <button className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]">
                              Sign In to Enroll
                            </button>
                          </Link>
                        )}
                      </div>
                    )}
                    
                    {/* Price Display */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-4 rounded-2xl border border-gray-200 min-w-fit">
                      <p className="text-sm font-medium text-gray-600 mb-1">Course Fee</p>
                      {course.priceInINR === 0 ? (
                        <div className="flex items-center gap-2">
                          <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            Free
                          </p>
                          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                            LIMITED
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-500 line-through font-medium">₹999</span>
                            <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              ₹499
                            </p>
                          </div>
                          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-2 rounded-xl text-sm font-bold shadow-lg">
                            50% OFF
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:w-80 space-y-6">
                  <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <div className="bg-green-100 rounded-full p-2">
                          <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        Course Features
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { icon: "📚", text: "Expert-Curated Content" },
                        { icon: "❓", text: "Practice Questions" },
                        { icon: "📝", text: "Mock Tests" },
                        { icon: "📊", text: "Performance Analytics" },
                        { icon: "💬", text: "24/7 Doubt Resolution" }
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-white border border-gray-100 hover:border-green-200 hover:bg-green-50/50 transition-all duration-200">
                          <div className="text-2xl">{feature.icon}</div>
                          <span className="font-medium text-gray-700">{feature.text}</span>
                          <div className="ml-auto">
                            <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <div className="bg-blue-100 rounded-full p-2">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        Study Resources
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {course.modules.map((module: CourseModule) => {
                        const isFree = module.isFree;
                        const hasAccess = userAccess?.isEnrolled && (isFree || userAccess?.hasPaid);
                        
                        return (
                          <div
                            key={module.id}
                            className={`flex items-center gap-4 py-3 px-4 rounded-xl border transition-all duration-200 ${
                              hasAccess
                                ? "bg-white border-green-200 hover:border-green-300 hover:bg-green-50/50"
                                : "bg-gray-50 border-gray-200 opacity-60"
                            }`}
                          >
                            <div className={`rounded-full p-2 ${hasAccess ? "bg-green-100" : "bg-gray-200"}`}>
                              {hasAccess ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <Lock className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                            <span className={`font-medium flex-1 ${hasAccess ? "text-gray-700" : "text-gray-500"}`}>
                              {module.title}
                            </span>
                            {isFree && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs font-semibold">
                                Free
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
