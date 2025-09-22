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

export default function ExamDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { user } = useUser();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("blogPosts");
  const [userAccess, setUserAccess] = useState<any>(null);
  const [accessLoading, setAccessLoading] = useState(false);

  useEffect(() => {
    async function fetchCourse() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchWithCache<{ course: any }>(
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
        
        const data = await fetchWithCache<any>(
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
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className="relative">
              {course.imageUrl ? (
                <div className="relative h-64 md:h-96">
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full h-full object-contain bg-gray-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>
              ) : (
                <div className="relative h-64 md:h-96">
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                    {course.title}
                  </div>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <div className="flex flex-wrap gap-3 mb-4">
                  {course.category && (
                    <Badge className="bg-blue-500/80 hover:bg-blue-600/80 text-white border-none">
                      {course.category}
                    </Badge>
                  )}
                  {course.level && (
                    <Badge
                      variant="outline"
                      className="text-white border-white/50 hover:bg-white/10"
                    >
                      {course.level}
                    </Badge>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                  {course.title}
                </h1>
              </div>
            </div>

            <div className="p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                  <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                    {course.description}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-blue-600 mb-1">
                        <BookOpen className="h-5 w-5" />
                        <span className="font-medium">Modules</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {course.modules.length}
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-purple-600 mb-1">
                        <Calendar className="h-5 w-5" />
                        <span className="font-medium">Duration</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {course.duration || "Flexible"}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-green-600 mb-1">
                        <FileText className="h-5 w-5" />
                        <span className="font-medium">Questions</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">1000+</p>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-yellow-600 mb-1">
                        <HelpCircle className="h-5 w-5" />
                        <span className="font-medium">Support</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">24/7</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    {user && userAccess?.isEnrolled ? (
                      <Link
                        href={`/exams/${course.slug || course.id}/study`}
                        className="w-full sm:w-auto"
                      >
                        <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer">
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
                            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200">
                              Sign In to Enroll
                            </button>
                          </Link>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-4 bg-gray-50 px-6 py-3 rounded-xl">
                      <div>
                        <p className="text-sm text-gray-500">Course Fee</p>
                        {course.priceInINR === 0 ? (
                          <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Free
                          </p>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-500 line-through">₹999</span>
                              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                ₹499
                              </p>
                            </div>
                            <div className="bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                              50% OFF
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:w-80 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Course Features</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3 text-gray-700">
                        <svg
                          className="h-5 w-5 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Expert-Curated Content
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <svg
                          className="h-5 w-5 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Practice Questions
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <svg
                          className="h-5 w-5 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Mock Tests
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <svg
                          className="h-5 w-5 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Performance Analytics
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <svg
                          className="h-5 w-5 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        24/7 Doubt Resolution
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Study Resources</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {course.modules.map((module: any, index: number) => {
                        const isFree = module.isFree;
                        const hasAccess = userAccess?.isEnrolled && (isFree || userAccess?.hasPaid);
                        
                        return (
                          <div
                            key={module.id}
                            className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-colors ${
                              hasAccess ? "hover:bg-gray-50" : "opacity-60"
                            }`}
                          >
                            {hasAccess ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <Lock className="h-5 w-5 text-gray-400" />
                            )}
                            <span className={`${hasAccess ? "text-gray-700" : "text-gray-500"}`}>
                              {module.title}
                            </span>
                            {isFree && (
                              <Badge variant="outline" className="ml-auto text-xs">
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
