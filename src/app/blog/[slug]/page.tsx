"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";
import { ArrowLeft, Calendar, BookOpen, Clock, Share2 } from "lucide-react";
import "@/styles/rich-text.css";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  createdAt: string;
  module: {
    title: string;
    exam: {
      title: string;
      slug: string;
    };
  };
}

export default function BlogPostPage() {
  const params = useParams();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`/api/blog/slug/${params.slug}`);
        if (response.ok) {
          const data = await response.json();
          setBlog(data);
        } else {
          setError("Blog post not found");
        }
      } catch (error) {
        setError("Failed to load blog post");
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchBlog();
    }
  }, [params.slug]);

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !blog) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-12">
            <div className="text-6xl mb-4">📰</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {error || "Blog post not found"}
            </h2>
            <p className="text-gray-600 mb-8">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200">
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt || blog.title,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Compact Navigation */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <article className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
            {/* Integrated Header */}
            <div className="px-8 md:px-12 pt-8 md:pt-10 pb-6 border-b border-gray-100">
              {/* Breadcrumb Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {blog.module.exam.title}
                </span>
                <span className="text-gray-300">•</span>
                <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded-md border border-purple-200">
                  {blog.module.title}
                </span>
              </div>
              
              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight mb-4">
                {blog.title}
              </h1>
              
              {/* Excerpt */}
              {blog.excerpt && (
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-6 max-w-4xl">
                  {blog.excerpt}
                </p>
              )}
              
              {/* Metadata Row */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                    {new Date(blog.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1.5 text-gray-400" />
                    {Math.ceil(blog.content.length / 1000)} min read
                  </div>
                </div>
                
                <button
                  onClick={handleShare}
                  className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <Share2 className="h-4 w-4 mr-1.5" />
                  Share
                </button>
              </div>
            </div>

            {/* Article Content */}
            <div className="px-8 md:px-12 py-8 md:py-10">
              <div
                className="prose max-w-none text-gray-800 richtext-content"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </div>
          </article>

          {/* Related Content */}
          <div className="mt-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
            <div className="px-8 md:px-12 py-8">
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                Continue Your Learning Journey
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Link
                  href={`/exams/${blog.module.exam.slug}`}
                  className="group flex items-center p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-blue-50/50 to-blue-100/30"
                >
                  <div className="bg-blue-500 text-white p-2.5 rounded-lg mr-4 group-hover:scale-105 transition-transform">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                      Explore Full Course
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Complete study materials for {blog.module.exam.title}
                    </p>
                  </div>
                </Link>
                
                <Link
                  href={`/exams/${blog.module.exam.slug}/modules`}
                  className="group flex items-center p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-purple-50/50 to-purple-100/30"
                >
                  <div className="bg-purple-500 text-white p-2.5 rounded-lg mr-4 group-hover:scale-105 transition-transform">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors mb-1">
                      More from {blog.module.title}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Additional resources from this module
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}