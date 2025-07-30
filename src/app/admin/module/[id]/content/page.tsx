"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Save,
  ArrowLeft,
  GripVertical,
  FileText,
  HelpCircle,
  ClipboardList,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";

interface ContentItem {
  id: string;
  type: 'blogPost' | 'quiz' | 'pyq' | 'moduleQuestion';
  title: string;
  order: number;
  data: any;
}

interface Module {
  id: string;
  title: string;
  description?: string;
  examId: string;
  blogPosts: Array<{
    id: string;
    title: string;
    order: number;
  }>;
  quizzes: Array<{
    id: string;
    title: string;
    order: number;
  }>;
  pyqs: Array<{
    id: string;
    question: string;
    year: number;
    order: number;
  }>;
  moduleQuestions: Array<{
    id: string;
    question: string;
    order: number;
  }>;
}

export default function ModuleContentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [module, setModule] = useState<Module | null>(null);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<ContentItem | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchModule() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/admin/module/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch module");
        }
        const data = await res.json();
        if (data.module) {
          setModule(data.module);
          
          // Combine all content items into a single array
          const items: ContentItem[] = [
            ...data.module.blogPosts.map((post: any) => ({
              id: post.id,
              type: 'blogPost' as const,
              title: post.title,
              order: post.order || 0,
              data: post,
            })),
            ...data.module.quizzes.map((quiz: any) => ({
              id: quiz.id,
              type: 'quiz' as const,
              title: quiz.title,
              order: quiz.order || 0,
              data: quiz,
            })),
            ...data.module.pyqs.map((pyq: any) => ({
              id: pyq.id,
              type: 'pyq' as const,
              title: `${pyq.year} - ${pyq.question.substring(0, 50)}...`,
              order: pyq.order || 0,
              data: pyq,
            })),
            ...data.module.moduleQuestions.map((question: any) => ({
              id: question.id,
              type: 'moduleQuestion' as const,
              title: question.question.substring(0, 50) + '...',
              order: question.order || 0,
              data: question,
            })),
          ];
          
          // Sort by order
          items.sort((a, b) => a.order - b.order);
          setContentItems(items);
        } else {
          setError("Module not found");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch module");
      }
      setLoading(false);
    }
    if (id) fetchModule();
  }, [id]);

  const handleDragStart = (e: React.DragEvent, item: ContentItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetItem: ContentItem) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetItem.id) return;

    const newItems = [...contentItems];
    const draggedIndex = newItems.findIndex(item => item.id === draggedItem.id);
    const targetIndex = newItems.findIndex(item => item.id === targetItem.id);

    // Remove dragged item and insert at target position
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, removed);

    // Update order values
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      order: index,
    }));

    setContentItems(updatedItems);
    setDraggedItem(null);
  };

  const handleSaveOrder = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    
    try {
      // Group items by type for batch updates
      const updates = {
        blogPosts: contentItems.filter(item => item.type === 'blogPost'),
        quizzes: contentItems.filter(item => item.type === 'quiz'),
        pyqs: contentItems.filter(item => item.type === 'pyq'),
        moduleQuestions: contentItems.filter(item => item.type === 'moduleQuestion'),
      };

      // Send update requests for each type
      const promises = [];

      if (updates.blogPosts.length > 0) {
        promises.push(
          fetch('/api/admin/content/reorder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'blogPost',
              items: updates.blogPosts.map(item => ({ id: item.id, order: item.order })),
            }),
          })
        );
      }

      if (updates.quizzes.length > 0) {
        promises.push(
          fetch('/api/admin/content/reorder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'quiz',
              items: updates.quizzes.map(item => ({ id: item.id, order: item.order })),
            }),
          })
        );
      }

      if (updates.pyqs.length > 0) {
        promises.push(
          fetch('/api/admin/content/reorder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'pyq',
              items: updates.pyqs.map(item => ({ id: item.id, order: item.order })),
            }),
          })
        );
      }

      if (updates.moduleQuestions.length > 0) {
        promises.push(
          fetch('/api/admin/content/reorder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'moduleQuestion',
              items: updates.moduleQuestions.map(item => ({ id: item.id, order: item.order })),
            }),
          })
        );
      }

      await Promise.all(promises);
      setSuccess("Content order saved successfully!");
      
      // Optionally redirect back after a delay
      setTimeout(() => {
        if (module?.examId) {
          router.push(`/admin/course/${module.examId}/modules`);
        }
      }, 1500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save content order");
    } finally {
      setSaving(false);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'blogPost':
        return <FileText className="h-4 w-4" />;
      case 'quiz':
        return <ClipboardList className="h-4 w-4" />;
      case 'pyq':
        return <Calendar className="h-4 w-4" />;
      case 'moduleQuestion':
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'blogPost':
        return 'Blog Post';
      case 'quiz':
        return 'Quiz';
      case 'pyq':
        return 'PYQ';
      case 'moduleQuestion':
        return 'Question';
      default:
        return 'Content';
    }
  };

  const getContentTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'blogPost':
        return 'default';
      case 'quiz':
        return 'secondary';
      case 'pyq':
        return 'outline';
      case 'moduleQuestion':
        return 'destructive';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading module content...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!module) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Module not found
            </h2>
            <Link href="/admin/courses">
              <Button>Back to Courses</Button>
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Manage Content Order
                </h1>
                <p className="text-gray-600">
                  {module.title} - Drag and drop to reorder content
                </p>
              </div>
            </div>

            <Link href={`/admin/course/${module.examId}/modules`}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Modules
              </Button>
            </Link>
          </div>

          {/* Content List */}
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Module Content ({contentItems.length} items)
              </CardTitle>
              <p className="text-sm text-gray-600">
                Drag and drop items to reorder them. The order will affect how students see the content.
              </p>
            </CardHeader>
            <CardContent>
              {contentItems.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No content yet
                  </h3>
                  <p className="text-gray-600">
                    Add blog posts, quizzes, or questions to this module first.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {contentItems.map((item, index) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, item)}
                      className="flex items-center gap-4 p-4 bg-white border rounded-lg cursor-move hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-2 text-gray-400">
                        <GripVertical className="h-5 w-5" />
                        <span className="text-sm font-mono">{index + 1}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getContentIcon(item.type)}
                        <Badge variant={getContentTypeBadgeVariant(item.type) as any} className="text-xs">
                          {getContentTypeLabel(item.type)}
                        </Badge>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Save Button */}
              {contentItems.length > 0 && (
                <div className="flex justify-between items-center pt-6 border-t mt-6">
                  <Link href={`/admin/course/${module.examId}/modules`}>
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Link>

                  <Button onClick={handleSaveOrder} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Order"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Messages */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          {success && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-600">{success}</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}