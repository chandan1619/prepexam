"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";
import { useToast } from "@/components/ui/use-toast";

interface Blog {
  id: string;
  title: string;
  excerpt: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
  module: {
    title: string;
    exam: {
      title: string;
      slug: string;
    };
  };
}

interface User {
  id: string;
  clerkId: string;
  email: string;
  role: "user" | "admin";
}

export default function BlogManagementPage() {
  const { user } = useUser();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBlogId, setExpandedBlogId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "featured" | "published" | "drafts">("all");
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          // Fetch current user
          const userResponse = await fetch("/api/user/current");
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setCurrentUser(userData);

            // Only fetch blogs if user is admin
            if (userData.role === "admin") {
              const blogsResponse = await fetch("/api/admin/blog");
              if (blogsResponse.ok) {
                const blogsData = await blogsResponse.json();
                setBlogs(blogsData.blogs);
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

  const handleToggleFeature = async (blogId: string, isFeatured: boolean) => {
    try {
      const response = await fetch(`/api/admin/blog/${blogId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isFeatured: !isFeatured }),
      });

      if (response.ok) {
        setBlogs(
          blogs.map((blog) =>
            blog.id === blogId
              ? { ...blog, isFeatured: !isFeatured, isPublished: true }
              : blog
          )
        );
        
        toast({
          title: !isFeatured ? "Blog Featured" : "Blog Unfeatured",
          description: !isFeatured
            ? "This blog post will now appear on the landing page"
            : "This blog post has been removed from featured posts",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update blog post",
      });
    }
  };

  // Filter blogs based on selected filter
  const filteredBlogs = blogs.filter((blog) => {
    switch (filter) {
      case "featured":
        return blog.isFeatured;
      case "published":
        return blog.isPublished;
      case "drafts":
        return !blog.isPublished;
      default:
        return true;
    }
  });

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
              Please sign in to access blog management
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
                  Blog Management
                </h1>
                <p className="text-gray-600 mt-2">
                  Feature blog posts on your landing page for marketing
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {["all", "featured", "published", "drafts"].map((filterOption) => (
                    <button
                      key={filterOption}
                      onClick={() => setFilter(filterOption as "all" | "featured" | "published" | "drafts")}
                      className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors ${
                        filter === filterOption
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {filterOption}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {filteredBlogs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-6">📰</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {filter === "all" ? "No blog posts yet" : `No ${filter} blog posts`}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {filter === "all" 
                  ? "Blog posts are created within course modules. Create courses and modules first, then add blog content."
                  : `No blog posts match the ${filter} filter.`
                }
              </p>
              <Link href="/admin/courses">
                <button className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 text-lg">
                  Manage Courses
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredBlogs.map((blog) => (
                <div key={blog.id} className="bg-white rounded-lg shadow p-6">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() =>
                      setExpandedBlogId(
                        expandedBlogId === blog.id ? null : blog.id
                      )
                    }
                  >
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 mr-3">
                          {blog.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full ${
                              blog.isPublished
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {blog.isPublished ? "Published" : "Draft"}
                          </span>
                          {blog.isFeatured && (
                            <span className="inline-block px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300">
                              ⭐ Featured on Landing Page
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {blog.excerpt || "No excerpt available"}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span>{blog.module.exam.title}</span>
                        <span>•</span>
                        <span>{blog.module.title}</span>
                        <span>•</span>
                        <span>
                          Created{" "}
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-6">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFeature(blog.id, blog.isFeatured);
                        }}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          blog.isFeatured
                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-300"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {blog.isFeatured ? "⭐ Remove from Landing" : "⭐ Feature on Landing"}
                      </button>
                      <Link
                        href={`/exams/${blog.module.exam.slug}/modules#${blog.module.title.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={(e) => e.stopPropagation()}
                        target="_blank"
                      >
                        <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200">
                          View
                        </button>
                      </Link>
                    </div>
                  </div>
                  {expandedBlogId === blog.id && (
                    <div className="mt-4 border-t pt-4">
                      <div className="mb-2 font-semibold">Blog Details</div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Course:</span>{" "}
                          {blog.module.exam.title}
                        </div>
                        <div>
                          <span className="font-medium">Module:</span>{" "}
                          {blog.module.title}
                        </div>
                        <div>
                          <span className="font-medium">Status:</span>{" "}
                          {blog.isPublished ? "Published" : "Draft"}
                        </div>
                        <div>
                          <span className="font-medium">Featured:</span>{" "}
                          {blog.isFeatured ? "Yes - Visible on landing page" : "No"}
                        </div>
                      </div>
                      {blog.excerpt && (
                        <div className="mt-3">
                          <span className="font-medium">Excerpt:</span>
                          <p className="text-gray-600 mt-1">{blog.excerpt}</p>
                        </div>
                      )}
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
