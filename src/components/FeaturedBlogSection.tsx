"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

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

export function FeaturedBlogSection() {
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
        console.error("Failed to fetch featured blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block">
              <span className="inline-block py-1 px-3 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full mb-4">
                FEATURED ARTICLES
              </span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Expert Insights & Study Materials
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover in-depth articles and insights from our expert educators to boost your preparation
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-2xl shadow-md p-8">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-16 bg-gray-200 rounded mb-6"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (blogs.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block">
            <span className="inline-block py-1 px-3 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full mb-4">
              FEATURED ARTICLES
            </span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Expert Insights & Study Materials
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover in-depth articles and insights from our expert educators to boost your preparation
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <Link
              key={blog.id}
              href={`/blog/${blog.slug}`}
              className="group"
            >
              <article className="relative bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100/50 backdrop-blur-sm">
                {/* Gradient overlay for visual appeal */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Decorative top border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                
                <div className="relative p-8">
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
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 line-clamp-2 leading-tight">
                    {blog.title}
                  </h3>
                  
                  {/* Enhanced excerpt */}
                  {blog.excerpt && (
                    <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed group-hover:text-gray-700 transition-colors">
                      {blog.excerpt}
                    </p>
                  )}
                  
                  {/* Enhanced footer with better spacing and styling */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100/50">
                    <div className="flex items-center text-sm text-gray-500 group-hover:text-gray-600 transition-colors">
                      <svg className="h-4 w-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(blog.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <div className="flex items-center text-blue-600 text-sm font-semibold group-hover:text-purple-600 transition-all duration-300">
                      <span className="mr-2">Read More</span>
                      <div className="relative">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
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
        <div className="text-center mt-12">
          <Link href="/blog">
            <button className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold border-2 border-blue-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200">
              View All Articles
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
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
      </div>
    </section>
  );
}
