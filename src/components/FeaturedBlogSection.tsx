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
              <div className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="py-1 px-2 text-xs font-semibold bg-blue-100 text-blue-700 rounded-md">
                      {blog.module.exam.title}
                    </span>
                    <span className="py-1 px-2 text-xs font-semibold bg-purple-100 text-purple-700 rounded-md">
                      {blog.module.title}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                  {blog.excerpt && (
                    <p className="text-gray-600 mb-6 line-clamp-3">
                      {blog.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {new Date(blog.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors">
                      Read More
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
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
