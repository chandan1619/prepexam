"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  modules: any[];
  purchases: any[];
}

interface User {
  id: string;
  clerkId: string;
  email: string;
  role: "user" | "admin";
}

export default function CoursesManagementPage() {
  const { user } = useUser();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          // Fetch current user
          const userResponse = await fetch("/api/user/current");
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setCurrentUser(userData);

            // Only fetch courses if user is admin
            if (userData.role === "admin") {
              const coursesResponse = await fetch("/api/admin/courses");
              if (coursesResponse.ok) {
                const coursesData = await coursesResponse.json();
                setCourses(coursesData);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm("Are you sure you want to delete this course?")) {
      try {
        const response = await fetch(`/api/admin/courses/${courseId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setCourses(courses.filter((course) => course.id !== courseId));
        }
      } catch (error) {
        console.error("Error deleting course:", error);
      }
    }
  };

  const handleTogglePublish = async (
    courseId: string,
    isPublished: boolean
  ) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublished: !isPublished }),
      });

      if (response.ok) {
        setCourses(
          courses.map((course) =>
            course.id === courseId
              ? { ...course, isPublished: !isPublished }
              : course
          )
        );
      }
    } catch (error) {
      console.error("Error updating course:", error);
    }
  };

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
              Please sign in to access course management
            </h2>
            <p className="text-gray-600">
              You need to be signed in to view admin features.
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

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
              You don't have admin privileges to access this page.
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
                  Course Management
                </h1>
                <p className="text-gray-600 mt-2">
                  Create, edit, and manage your courses
                </p>
              </div>
              <Link href="/admin/course/create">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 flex items-center">
                  <span className="mr-2">➕</span>
                  Create New Course
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-6">📚</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                No courses yet
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Create your first course to start building your learning
                platform. You can add modules, lessons, and quizzes to each
                course.
              </p>
              <Link href="/admin/course/create">
                <button className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 text-lg">
                  Create Your First Course
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-lg shadow p-6">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() =>
                      setExpandedCourseId(
                        expandedCourseId === course.id ? null : course.id
                      )
                    }
                  >
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 mr-3">
                          {course.title}
                        </h3>
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${
                            course.isPublished
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {course.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span>₹{course.price}</span>
                        <span>•</span>
                        <span>{course.modules.length} modules</span>
                        <span>•</span>
                        <span>{course.purchases.length} students</span>
                        <span>•</span>
                        <span>
                          Created{" "}
                          {new Date(course.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-6">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePublish(course.id, course.isPublished);
                        }}
                        className={`px-3 py-1 text-sm rounded-md ${
                          course.isPublished
                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                            : "bg-green-100 text-green-800 hover:bg-green-200"
                        }`}
                      >
                        {course.isPublished ? "Unpublish" : "Publish"}
                      </button>
                      <Link
                        href={`/admin/course/${course.id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200">
                          Edit
                        </button>
                      </Link>
                      <Link
                        href={`/admin/course/${course.id}/modules`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200">
                          Modules
                        </button>
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCourse(course.id);
                        }}
                        className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {expandedCourseId === course.id && (
                    <div className="mt-4 border-t pt-4">
                      <div className="mb-2 font-semibold">Course Details</div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Modules:</span>{" "}
                          {course.modules.length}
                        </div>
                        <div>
                          <span className="font-medium">Topics:</span>{" "}
                          {course.modules.reduce(
                            (acc, m) => acc + (m.blogPosts?.length || 0),
                            0
                          )}
                        </div>
                        <div>
                          <span className="font-medium">Quizzes:</span>{" "}
                          {course.modules.reduce(
                            (acc, m) => acc + (m.quizzes?.length || 0),
                            0
                          )}
                        </div>
                        <div>
                          <span className="font-medium">PYQs:</span>{" "}
                          {course.modules.reduce(
                            (acc, m) => acc + (m.pyqs?.length || 0),
                            0
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
