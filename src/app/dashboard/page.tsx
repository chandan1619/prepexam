"use client";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { user } = useUser();
  const [purchasedCourses, setPurchasedCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPurchases() {
      setLoading(true);
      try {
        const res = await fetch("/api/user/purchases");
        const data = await res.json();
        if (res.ok && data.purchases) {
          setPurchasedCourses(data.purchases);
        } else {
          setPurchasedCourses([]);
        }
      } catch {
        setPurchasedCourses([]);
      }
      setLoading(false);
    }
    if (user) fetchPurchases();
  }, [user]);

  const recentActivity = [
    {
      id: 1,
      type: "quiz",
      title: "Quantitative Aptitude Quiz",
      course: "SSC CGL",
      score: "85%",
      date: "2 days ago",
    },
    {
      id: 2,
      type: "lesson",
      title: "Previous Year Questions - 2023",
      course: "SSC CGL",
      status: "Completed",
      date: "3 days ago",
    },
    {
      id: 3,
      type: "quiz",
      title: "Reasoning Ability Test",
      course: "Bank PO",
      score: "72%",
      date: "1 week ago",
    },
  ];

  if (!user) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Please sign in to access your dashboard
            </h2>
            <p className="text-gray-600">
              You need to be signed in to view your learning progress.
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back,{" "}
              {user.firstName || user.emailAddresses[0]?.emailAddress}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-4">📚</div>
                <div>
                  <p className="text-sm text-gray-600">Courses Enrolled</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {purchasedCourses.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-4">🎯</div>
                <div>
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900">78%</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-4">⏱️</div>
                <div>
                  <p className="text-sm text-gray-600">Study Time</p>
                  <p className="text-2xl font-bold text-gray-900">24h</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-4">🏆</div>
                <div>
                  <p className="text-sm text-gray-600">Quizzes Taken</p>
                  <p className="text-2xl font-bold text-gray-900">15</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* My Courses */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  My Courses
                </h2>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">
                    Loading...
                  </div>
                ) : purchasedCourses.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📚</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No courses yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Start your learning journey by enrolling in a course
                    </p>
                    <Link href="/exams">
                      <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                        Browse Courses
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {purchasedCourses.map((purchase) => (
                      <div key={purchase.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="text-2xl mr-3">📚</div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {purchase.exam.title}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Purchased on{" "}
                                {new Date(
                                  purchase.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Link
                            href={`/exams/${
                              purchase.exam.slug || purchase.exam.id
                            }`}
                          >
                            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                              Continue
                            </button>
                          </Link>
                        </div>
                        {/* Optionally add progress bar if you have progress data */}
                        <p className="text-sm text-gray-500">
                          Price: ₹{purchase.exam.priceInINR}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Activity
                </h2>
              </div>
              <div className="p-6">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📊</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No activity yet
                    </h3>
                    <p className="text-gray-600">
                      Start learning to see your activity here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center">
                          <div className="text-2xl mr-3">
                            {activity.type === "quiz" ? "🎯" : "📖"}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {activity.title}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {activity.course}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {activity.type === "quiz" ? (
                            <span className="text-sm font-medium text-green-600">
                              {activity.score}
                            </span>
                          ) : (
                            <span className="text-sm font-medium text-blue-600">
                              {activity.status}
                            </span>
                          )}
                          <p className="text-xs text-gray-500">
                            {activity.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
