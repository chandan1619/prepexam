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
                    <article className="relative bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100/50 backdrop-blur-sm h-full">
                      {/* Gradient overlay for visual appeal */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Decorative top border */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                      
                      <div className="relative p-8 flex flex-col h-full">
                        {/* Category badges with enhanced styling */}
                        <div className="flex items-center gap-2 mb-6">
                          <span className="relative py-2 px-3 text-xs font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-md hover:shadow-lg transition-shadow">
                            <span className="relative z-10">{blog.module.exam.title}</span>
                            <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </span>
                          <span className="relative py-2 px-3 text-xs font-bold bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full shadow-md hover:shadow-lg transition-shadow">
                            <span className="relative z-10">{blog.module.title}</span>
                            <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </span>
                        </div>
                        
                        {/* Enhanced title with gradient text */}
                        <h2 className="text-xl font-bold text-gray-900 mb-4 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 line-clamp-2 leading-tight flex-grow">
                          {blog.title}
                        </h2>
                        
                        {/* Enhanced excerpt */}
                        {blog.excerpt && (
                          <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed group-hover:text-gray-700 transition-colors flex-grow">
                            {blog.excerpt}
                          </p>
                        )}
                        
                        {/* Enhanced footer with better spacing and styling */}
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100/50">
                          <div className="flex items-center text-sm text-gray-500 group-hover:text-gray-600 transition-colors">
                            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                            {new Date(blog.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                          <div className="flex items-center text-blue-600 text-sm font-semibold group-hover:text-purple-600 transition-all duration-300">
                            <span className="mr-2">Read More</span>
                            <div className="relative">
                              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity -z-10"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Subtle shine effect on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
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