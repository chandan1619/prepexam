"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";

interface User {
  id: string;
  clerkId: string;
  email: string;
  role: "user" | "admin";
}

export default function AdminDashboardPage() {
  const { user } = useUser();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (user) {
        try {
          const response = await fetch("/api/user/current");
          if (response.ok) {
            const userData = await response.json();
            setCurrentUser(userData);
          }
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, [user]);

  const stats = [
    {
      title: "Total Courses",
      value: "12",
      change: "+2",
      icon: "📚",
    },
    {
      title: "Active Users",
      value: "1,247",
      change: "+12%",
      icon: "👥",
    },
    {
      title: "Total Revenue",
      value: "₹2.4L",
      change: "+8%",
      icon: "💰",
    },
    {
      title: "Content Items",
      value: "456",
      change: "+23",
      icon: "📝",
    },
  ];

  const recentCourses = [
    {
      id: 1,
      title: "SSC CGL",
      students: 245,
      revenue: "₹24,500",
      status: "Active",
      created: "2 days ago",
    },
    {
      id: 2,
      title: "UPSC CSE",
      students: 189,
      revenue: "₹28,350",
      status: "Active",
      created: "1 week ago",
    },
    {
      id: 3,
      title: "Bank PO",
      students: 312,
      revenue: "₹24,960",
      status: "Active",
      created: "2 weeks ago",
    },
  ];

  const quickActions = [
    {
      title: "Manage Courses",
      description: "View, edit, and manage all courses",
      icon: "📚",
      href: "/admin/courses",
      color: "bg-blue-500",
    },
    {
      title: "Create New Course",
      description: "Add a new exam preparation course",
      icon: "➕",
      href: "/admin/course/create",
      color: "bg-green-500",
    },
    {
      title: "Manage Blogs",
      description: "Feature blogs on landing page for marketing",
      icon: "📰",
      href: "/admin/blog",
      color: "bg-indigo-500",
    },
    {
      title: "Manage Content",
      description: "Add lessons, quizzes, and PYQs",
      icon: "📝",
      href: "/admin/content",
      color: "bg-purple-500",
    },
    {
      title: "View Analytics",
      description: "Check user engagement and revenue",
      icon: "📊",
      href: "/admin/analytics",
      color: "bg-orange-500",
    },
    {
      title: "User Management",
      description: "Manage user accounts and roles",
      icon: "👥",
      href: "/admin/users",
      color: "bg-red-500",
    },
  ];

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Please sign in to access admin dashboard
            </h2>
            <p className="text-gray-600">
              You need to be signed in to view admin features.
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Check if user is admin
  if (!currentUser || currentUser.role !== "admin") {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6">
              You don&apos;t have admin privileges to access this page.
            </p>
            <Link href="/dashboard">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                Go to Dashboard
              </button>
            </Link>
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
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage your learning platform
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  Welcome,{" "}
                  {user.firstName || user.emailAddresses[0]?.emailAddress}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-sm text-green-600">{stat.change}</p>
                  </div>
                  <div className="text-3xl">{stat.icon}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Quick Actions
                </h2>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Link key={index} href={action.href}>
                      <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center mb-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-white mr-3 ${action.color}`}
                          >
                            <span className="text-xl">{action.icon}</span>
                          </div>
                          <h3 className="font-semibold text-gray-900">
                            {action.title}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600">
                          {action.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Courses */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Courses
                </h2>
              </div>
              <div className="p-6">
                {recentCourses.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📚</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No courses yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Create your first course to get started
                    </p>
                    <Link href="/admin/course/create">
                      <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                        Create Course
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentCourses.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Created {course.created}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {course.students} students
                          </p>
                          <p className="text-sm text-green-600">
                            {course.revenue}
                          </p>
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            {course.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Activity
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center p-3 border rounded-lg">
                  <div className="text-2xl mr-3">📚</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      New course &quot;SSC CHSL&quot; created
                    </p>
                    <p className="text-sm text-gray-500">2 days ago</p>
                  </div>
                </div>
                <div className="flex items-center p-3 border rounded-lg">
                  <div className="text-2xl mr-3">👥</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      25 new users registered
                    </p>
                    <p className="text-sm text-gray-500">3 days ago</p>
                  </div>
                </div>
                <div className="flex items-center p-3 border rounded-lg">
                  <div className="text-2xl mr-3">💰</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      Revenue milestone: ₹2L achieved
                    </p>
                    <p className="text-sm text-gray-500">1 week ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
