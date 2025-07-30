"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { MessageCircle, Send, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    clerkId: string;
  };
}

interface BlogCommentsProps {
  blogSlug: string;
}

export default function BlogComments({ blogSlug }: BlogCommentsProps) {
  const { user, isSignedIn } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/blog/comments?slug=${blogSlug}`);
        if (response.ok) {
          const data = await response.json();
          setComments(data);
        } else {
          // Only log error for actual server errors, not empty results
          const errorData = await response.json().catch(() => ({}));
          console.error("Failed to fetch comments:", errorData.error || `HTTP ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [blogSlug]);

  // Submit new comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSignedIn) {
      setError("Please sign in to comment");
      return;
    }

    if (!newComment.trim()) {
      setError("Please enter a comment");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/blog/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: blogSlug,
          content: newComment.trim()
        }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments([comment, ...comments]);
        setNewComment("");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to post comment");
      }
    } catch (error) {
      setError("Failed to post comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Get user display name
  const getUserDisplayName = (comment: Comment) => {
    if (comment.user.clerkId === user?.id) {
      return user?.fullName || user?.firstName || "You";
    }
    return comment.user.email.split("@")[0];
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes < 1 ? "Just now" : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
      <div className="px-8 md:px-12 py-8">
        <div className="flex items-center gap-3 mb-6">
          <MessageCircle className="h-6 w-6 text-blue-600" />
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Discussion ({comments.length})
          </h3>
        </div>

        {/* Comment Form */}
        {isSignedIn ? (
          <form onSubmit={handleSubmitComment} className="mb-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress[0] || "U"}
              </div>
              <div className="flex-1">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts about this article..."
                  className="min-h-[100px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  disabled={submitting}
                />
                {error && (
                  <p className="text-red-600 text-sm mt-2">{error}</p>
                )}
                <div className="flex justify-end mt-3">
                  <Button
                    type="submit"
                    disabled={submitting || !newComment.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Posting...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Post Comment
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-blue-800 text-center">
              <a href="/sign-in" className="font-semibold hover:underline">
                Sign in
              </a>{" "}
              to join the discussion and share your thoughts!
            </p>
          </div>
        )}

        {/* Comments List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-600 mb-2">
              No comments yet
            </h4>
            <p className="text-gray-500">
              Be the first to share your thoughts about this article!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {comment.user.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900">
                      {getUserDisplayName(comment)}
                    </span>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Clock className="h-3 w-3" />
                      {formatDate(comment.createdAt)}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}