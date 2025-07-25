"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";
import { Calendar, BookOpen, ArrowRight } from "lucide-react";

interface FeaturedBlog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  module: {
    title: string;
    exam: {
      title: string;
      slug: string;
    };
  };
  createdAt: string;
}

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<FeaturedBlog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch('/api/blog/featured');
        if (response.ok) {
          const data = await response.json();
          setBlogs(data);
        }
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="text-center">
                <div className="inline-block">
                  <span className="inline-block py-1 px-3 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full mb-4">
                    FEATURED ARTICLES
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Expert Insights & Study Materials
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Discover in-depth articles and insights from our expert educators to boost your preparation
                </p>
              </div>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-2xl shadow-md p-8">
                    <div className="flex gap-2 mb-4">
                      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                      <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-16 bg-gray-200 rounded mb-6"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="inline-block">
                <span className="inline-block py-1 px-3 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full mb-4">
                  FEATURED ARTICLES
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Expert Insights & Study Materials
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover in-depth articles and insights from our expert educators to boost your preparation
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {blogs.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">📰</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                No articles available yet
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                We're working on creating amazing content for you. Check back soon for expert insights and study materials.
              </p>
              <Link href="/">
                <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                  Back to Home
                </button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.map((blog) => (
                  <Link
                    key={blog.id}
                    href={`/blog/${blog.slug}`}
                    className="group"
                  >
                    <article className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 h-full">
                      <div className="p-8 flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="py-1 px-2 text-xs font-semibold bg-blue-100 text-blue-700 rounded-md">
                            {blog.module.exam.title}
                          </span>
                          <span className="py-1 px-2 text-xs font-semibold bg-purple-100 text-purple-700 rounded-md">
                            {blog.module.title}
                          </span>
                        </div>
                        
                        <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 flex-grow">
                          {blog.title}
                        </h2>
                        
                        {blog.excerpt && (
                          <p className="text-gray-600 mb-6 line-clamp-3 flex-grow">
                            {blog.excerpt}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(blog.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                          <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors">
                            Read More
                            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>

              {/* CTA Section */}
              <div className="mt-16 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-12 text-center text-white">
                <h3 className="text-3xl font-bold mb-4">
                  Ready to Start Your Preparation?
                </h3>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  Access comprehensive study materials, practice tests, and expert guidance for your government exam preparation.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/exams">
                    <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl">
                      Explore Courses
                    </button>
                  </Link>
                  <Link href="/dashboard">
                    <button className="bg-yellow-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-yellow-400 transition-all duration-200 shadow-lg hover:shadow-xl">
                      Start Learning
                    </button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
}