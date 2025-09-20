"use client";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  BookOpen,
  FileText,
  HelpCircle,
  ClipboardList,
  Calendar,
  Trash2,
  Edit,
  Save,
  Lock,
  Unlock,
  GripVertical,
  ArrowUpDown,
} from "lucide-react";
import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";
import { ModuleContentManager } from "@/components/ModuleContentManager";

interface Module {
  id: string;
  title: string;
  description?: string;
  isFree: boolean;
  order: number;
  blogPosts: Array<{
    id: string;
    title: string;
    content?: string;
  }>;
  pyqs: Array<{
    id: string;
    question: string;
    solution?: string;
    year?: number;
  }>;
  quizzes: Array<{
    id: string;
    title: string;
    description?: string;
    questions?: Array<{
      id: string;
      question: string;
      options?: string[];
      correct?: number;
    }>;
    timeLimit?: number;
    passingScore?: number;
  }>;
  moduleQuestions: Array<{
    id: string;
    question: string;
    type?: string;
    options?: string[];
    correct?: number;
  }>;
}

interface Course {
  id: string;
  title: string;
  description: string;
  modules: Module[];
}

export default function CourseModulesPage() {
  const params = useParams();
  const id = params?.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newModuleDescription, setNewModuleDescription] = useState("");
  const [newModuleIsFree, setNewModuleIsFree] = useState(false);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [draggedModule, setDraggedModule] = useState<Module | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  // Implement updateModule to persist new topics as blog posts
  const updateModule = async (moduleId: string, updatedModule: {
    topics?: Array<{ id?: string; title: string; content: string; duration?: string }>;
    quizzes?: Array<{ title?: string; question?: string; options?: string[]; correct?: number; questions?: Array<{ options?: string[]; correct?: number }> }>;
    previousYearQuestions?: Array<{ question: string; solution?: string; year?: number }>;
  }) => {
    if (!course) return;
    const currentModule = course.modules.find((m) => m.id === moduleId);
    
    // Handle Topic Updates (Blog Posts)
    if (updatedModule.topics) {
      const currentTopics = currentModule?.blogPosts || [];
      
      // Check if we're adding a new topic
      if (updatedModule.topics.length > currentTopics.length) {
        const newTopic = updatedModule.topics[updatedModule.topics.length - 1];
        if (!newTopic) return;
        
        try {
          const res = await fetch("/api/admin/blog", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              moduleId,
              title: newTopic.title,
              content: newTopic.content,
              isFree: false,
            }),
          });
          
          if (res.ok) {
            const newBlogPost = await res.json();
            setCourse(prevCourse => {
              if (!prevCourse) return prevCourse;
              return {
                ...prevCourse,
                modules: prevCourse.modules.map(module =>
                  module.id === moduleId
                    ? { ...module, blogPosts: [...module.blogPosts, newBlogPost.blogPost] }
                    : module
                )
              };
            });
            setSuccess("Topic added successfully!");
          }
        } catch (error) {
          setError("Failed to add topic");
        }
        return;
      }
      
      // Check if we're updating an existing topic
      for (const topic of updatedModule.topics) {
        if (topic.id) {
          const currentTopic = currentTopics.find(t => t.id === topic.id);
          if (currentTopic && (
            currentTopic.title !== topic.title ||
            currentTopic.content !== topic.content
          )) {
            try {
              const res = await fetch(`/api/admin/blog/${topic.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  title: topic.title,
                  content: topic.content,
                }),
              });
              
              if (res.ok) {
                const updatedBlogPost = await res.json();
                setCourse(prevCourse => {
                  if (!prevCourse) return prevCourse;
                  return {
                    ...prevCourse,
                    modules: prevCourse.modules.map(module =>
                      module.id === moduleId
                        ? {
                            ...module,
                            blogPosts: module.blogPosts.map(post =>
                              post.id === topic.id ? {
                                ...post,
                                title: updatedBlogPost.title,
                                content: updatedBlogPost.content
                              } : post
                            )
                          }
                        : module
                    )
                  };
                });
                setSuccess("Topic updated successfully!");
              } else {
                const errorData = await res.json();
                setError(errorData.error || "Failed to update topic");
              }
            } catch (error) {
              setError("Failed to update topic");
            }
            return;
          }
        }
      }
    }
    
    // Add Quiz (MCQ)
    if (
      updatedModule.quizzes &&
      updatedModule.quizzes.length > (currentModule?.quizzes?.length || 0)
    ) {
      const newQuiz = updatedModule.quizzes[updatedModule.quizzes.length - 1];
      if (!newQuiz) return;
      
      try {
        const res = await fetch("/api/admin/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            moduleId,
            question: newQuiz.title || newQuiz.question,
            options: newQuiz.questions?.[0]?.options || newQuiz.options || [],
            correct: newQuiz.questions?.[0]?.correct || newQuiz.correct || 0,
            isFree: false,
          }),
        });
        
        if (res.ok) {
          const newQuizData = await res.json();
          // Update state locally instead of full refresh
          setCourse(prevCourse => {
            if (!prevCourse) return prevCourse;
            return {
              ...prevCourse,
              modules: prevCourse.modules.map(module =>
                module.id === moduleId
                  ? { ...module, quizzes: [...module.quizzes, newQuizData.quiz] }
                  : module
              )
            };
          });
          setSuccess("Practice set added successfully!");
        }
      } catch (error) {
        setError("Failed to add practice set");
      }
      return;
    }
    
    // Add Previous Year Question (PYQ)
    if (
      updatedModule.previousYearQuestions &&
      updatedModule.previousYearQuestions.length >
        (currentModule?.pyqs?.length || 0)
    ) {
      const newPYQ =
        updatedModule.previousYearQuestions[
          updatedModule.previousYearQuestions.length - 1
        ];
      if (!newPYQ) return;
      
      try {
        const res = await fetch("/api/admin/pyq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            moduleId,
            question: newPYQ.question,
            solution: newPYQ.solution,
            year: newPYQ.year,
            type: (newPYQ as any).type || "descriptive",
            options: (newPYQ as any).options || [],
            correct: (newPYQ as any).correct || null,
            isFree: false,
          }),
        });
        
        if (res.ok) {
          const newPYQData = await res.json();
          // Update state locally instead of full refresh
          setCourse(prevCourse => {
            if (!prevCourse) return prevCourse;
            return {
              ...prevCourse,
              modules: prevCourse.modules.map(module =>
                module.id === moduleId
                  ? { ...module, pyqs: [...module.pyqs, newPYQData.pyq] }
                  : module
              )
            };
          });
          setSuccess("Previous year question added successfully!");
        }
      } catch (error) {
        setError("Failed to add previous year question");
      }
      return;
    }
  };

  const fetchCourse = useCallback(async () => {
    try {
      console.log("Fetching course with ID:", id);
      const res = await fetch(`/api/admin/course/${id}`);
      console.log("Course fetch response status:", res.status);

      if (res.ok) {
        const data = await res.json();
        console.log("Course data received:", data);
        setCourse(data.course);
      } else {
        const errorData = await res.json();
        console.error("Course fetch failed:", errorData);
        setError("Failed to load course");
      }
    } catch {
      console.error("Course fetch error");
      setError("Failed to load course");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const addModule = async () => {
    if (!newModuleTitle.trim()) {
      setError("Please enter a module title");
      return;
    }

    try {
      // Calculate the next order value
      const nextOrder = course ? course.modules.length : 0;

      console.log("Creating module with data:", {
        title: newModuleTitle,
        description: newModuleDescription,
        examId: id,
        order: nextOrder,
      });

      const res = await fetch("/api/admin/module", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newModuleTitle,
          description: newModuleDescription,
          examId: id,
          isFree: newModuleIsFree,
          order: nextOrder,
        }),
      });

      console.log("Module creation response status:", res.status);

      if (res.ok) {
        const data = await res.json();
        console.log("Module created successfully:", data);
        setSuccess("Module added successfully!");
        setNewModuleTitle("");
        setNewModuleDescription("");
        setNewModuleIsFree(false);
        setIsAddingModule(false);
        fetchCourse(); // Refresh the course data
      } else {
        const data = await res.json();
        console.error("Module creation failed:", data);
        setError(data.error || "Failed to add module");
      }
    } catch {
      console.error("Module creation error");
      setError("Failed to add module");
    }
  };

  const deleteModule = async (moduleId: string) => {
    try {
      const res = await fetch(`/api/admin/module/${moduleId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSuccess("Module deleted successfully!");
        fetchCourse(); // Refresh the course data
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete module");
      }
    } catch {
      setError("Failed to delete module");
    }
  };

  const toggleModuleAccess = async (moduleId: string, currentIsFree: boolean) => {
    try {
      const res = await fetch(`/api/admin/module/${moduleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isFree: !currentIsFree,
        }),
      });

      if (res.ok) {
        setSuccess(`Module access changed to ${!currentIsFree ? 'Free' : 'Paid'} successfully!`);
        fetchCourse(); // Refresh the course data
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update module access");
      }
    } catch {
      setError("Failed to update module access");
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, module: Module) => {
    setDraggedModule(module);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetModule: Module) => {
    e.preventDefault();
    if (!draggedModule || draggedModule.id === targetModule.id || !course) return;

    const newModules = [...course.modules];
    const draggedIndex = newModules.findIndex(m => m.id === draggedModule.id);
    const targetIndex = newModules.findIndex(m => m.id === targetModule.id);

    // Remove dragged module and insert at target position
    const [removed] = newModules.splice(draggedIndex, 1);
    newModules.splice(targetIndex, 0, removed);

    // Update order values
    const updatedModules = newModules.map((module, index) => ({
      ...module,
      order: index,
    }));

    setCourse({
      ...course,
      modules: updatedModules,
    });
    setDraggedModule(null);
    setIsReordering(true);
  };

  const saveModuleOrder = async () => {
    if (!course) return;
    
    setSavingOrder(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch('/api/admin/modules/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          modules: course.modules.map(module => ({
            id: module.id,
            order: module.order,
          })),
        }),
      });

      if (res.ok) {
        setSuccess("Module order saved successfully!");
        setIsReordering(false);
        fetchCourse(); // Refresh to get the latest data
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save module order");
      }
    } catch (err) {
      setError("Failed to save module order");
    } finally {
      setSavingOrder(false);
    }
  };

  const cancelReorder = () => {
    setIsReordering(false);
    fetchCourse(); // Reset to original order
  };

  const getModuleStats = (module: Module) => ({
    topics: module.blogPosts.length,
    questions: module.quizzes.length,
    quizzes: module.quizzes.length,
    previousYear: module.pyqs.length,
  });

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading course...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!course) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Course not found
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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Course Modules
                </h1>
                <p className="text-gray-600">{course.title}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Link href={`/admin/course/${id}/content`}>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Manage Content
                </Button>
              </Link>
              {course && course.modules.length > 1 && !isReordering && (
                <Button
                  variant="outline"
                  onClick={() => setIsReordering(true)}
                >
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  Reorder Modules
                </Button>
              )}
              {isReordering && (
                <>
                  <Button
                    onClick={saveModuleOrder}
                    disabled={savingOrder}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {savingOrder ? "Saving..." : "Save Order"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={cancelReorder}
                    disabled={savingOrder}
                  >
                    Cancel
                  </Button>
                </>
              )}
              <Button onClick={() => setIsAddingModule(true)} disabled={isReordering}>
                <Plus className="h-4 w-4 mr-2" />
                Add Module
              </Button>
            </div>
          </div>

          {/* Add Module Form */}
          {isAddingModule && (
            <Card className="shadow-md border-0 mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Create New Module</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="module-title">Module Title</Label>
                  <Input
                    id="module-title"
                    placeholder="Enter module title..."
                    value={newModuleTitle}
                    onChange={(e) => setNewModuleTitle(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="module-description">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="module-description"
                    placeholder="Brief description of this module..."
                    value={newModuleDescription}
                    onChange={(e) => setNewModuleDescription(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="module-access">Access Type</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="moduleAccess"
                        checked={newModuleIsFree}
                        onChange={() => setNewModuleIsFree(true)}
                        className="text-green-600"
                      />
                      <div className="flex items-center gap-1">
                        <Unlock className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">Free</span>
                      </div>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="moduleAccess"
                        checked={!newModuleIsFree}
                        onChange={() => setNewModuleIsFree(false)}
                        className="text-orange-600"
                      />
                      <div className="flex items-center gap-1">
                        <Lock className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-600">Paid</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={addModule}>
                    <Save className="h-4 w-4 mr-2" />
                    Create Module
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddingModule(false);
                      setNewModuleTitle("");
                      setNewModuleDescription("");
                      setNewModuleIsFree(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Modules List */}
          {course.modules.length === 0 ? (
            <Card className="shadow-md border-0">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No modules yet
                </h3>
                <p className="text-gray-600 text-center mb-4">
                  Start by creating your first module to organize your course
                  content
                </p>
                <Button onClick={() => setIsAddingModule(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Module
                </Button>
              </CardContent>
            </Card>
          ) : (
            isReordering ? (
              <div className="space-y-4">
                <Card className="shadow-md border-0 mb-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowUpDown className="h-5 w-5 text-blue-600" />
                      Reorder Modules
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Drag and drop modules to reorder them. The order will affect how students see the modules.
                    </p>
                  </CardHeader>
                </Card>
                {course.modules.map((module, index) => {
                  const stats = getModuleStats(module);
                  return (
                    <Card
                      key={module.id}
                      className="shadow-md border-0 cursor-move hover:shadow-lg transition-shadow"
                      draggable
                      onDragStart={(e) => handleDragStart(e, module)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, module)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-gray-400">
                            <GripVertical className="h-5 w-5" />
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white text-sm font-semibold">
                              {index + 1}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {module.title}
                            </h3>
                            {module.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {module.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge
                              variant={module.isFree ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {module.isFree ? (
                                <><Unlock className="h-3 w-3 mr-1" />Free</>
                              ) : (
                                <><Lock className="h-3 w-3 mr-1" />Paid</>
                              )}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              <FileText className="h-3 w-3 mr-1" />
                              {stats.topics}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              <HelpCircle className="h-3 w-3 mr-1" />
                              {stats.questions}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              <ClipboardList className="h-3 w-3 mr-1" />
                              {stats.quizzes}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              {stats.previousYear}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Accordion type="single" collapsible className="space-y-4">
                {course.modules.map((module, index) => {
                  const stats = getModuleStats(module);
                  return (
                    <AccordionItem key={module.id} value={module.id}>
                      <Card className="shadow-md border-0">
                        <AccordionTrigger className="px-6 py-4 hover:no-underline">
                          <div className="flex items-center justify-between w-full mr-4">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white text-sm font-semibold">
                                {index + 1}
                              </div>
                              <div className="text-left">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {module.title}
                                </h3>
                                {module.description && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {module.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleModuleAccess(module.id, module.isFree);
                                }}
                                className="cursor-pointer"
                              >
                                <Badge
                                  variant={module.isFree ? "default" : "destructive"}
                                  className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
                                >
                                  {module.isFree ? (
                                    <><Unlock className="h-3 w-3 mr-1" />Free</>
                                  ) : (
                                    <><Lock className="h-3 w-3 mr-1" />Paid</>
                                  )}
                                </Badge>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                <FileText className="h-3 w-3 mr-1" />
                                {stats.topics}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                <HelpCircle className="h-3 w-3 mr-1" />
                                {stats.questions}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                <ClipboardList className="h-3 w-3 mr-1" />
                                {stats.quizzes}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                <Calendar className="h-3 w-3 mr-1" />
                                {stats.previousYear}
                              </Badge>
                            </div>
                          </div>
                        </AccordionTrigger>

                      <AccordionContent className="px-6 pb-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Link href={`/admin/module/${module.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Module
                            </Button>
                          </Link>
                          <Link href={`/admin/module/${module.id}/content`}>
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-2" />
                              Manage Content
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteModule(module.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-2">
                              Blog Posts
                            </h4>
                            <p className="text-sm text-gray-600">
                              {stats.topics} posts
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-2">
                              Quizzes
                            </h4>
                            <p className="text-sm text-gray-600">
                              {stats.quizzes} quizzes
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-2">
                              PYQs
                            </h4>
                            <p className="text-sm text-gray-600">
                              {stats.previousYear} questions
                            </p>
                          </div>
                        </div>

                        {/* Module Content Manager */}
                        <div className="mt-6">
                          <ModuleContentManager
                           module={{
                             ...module,
                             description: module.description || "",
                             topics: (module.blogPosts || []).map(post => ({
                               ...post,
                               content: post.content || "",
                               duration: "30 minutes"
                             })),
                             questions: (module.moduleQuestions || []).map(q => ({
                               ...q,
                               type: "multiple-choice" as const,
                               correctAnswer: q.correct?.toString() || "0",
                               explanation: ""
                             })),
                             quizzes: (module.quizzes || []).map(quiz => ({
                               ...quiz,
                               title: quiz.title || "Untitled Quiz",
                               description: quiz.description || "",
                               type: (quiz as any).type || 'ASSESSMENT' as 'PRACTICE' | 'ASSESSMENT',
                               questions: (quiz.questions || []).map(q => ({
                                 ...q,
                                 type: "multiple-choice" as const,
                                 correctAnswer: q.correct?.toString() || "0",
                                 explanation: ""
                               })),
                               timeLimit: quiz.timeLimit || 30,
                               passingScore: quiz.passingScore || 70
                             })),
                             previousYearQuestions: (module.pyqs || []).map(pyq => ({
                               ...pyq,
                               year: pyq.year || new Date().getFullYear(),
                               solution: pyq.solution || "",
                               difficulty: "medium" as const,
                               marks: 1
                             })),
                             moduleQuestions: module.moduleQuestions || [],
                           }}
                            onModuleUpdate={(updatedModule) => {
                              // If updateModule is not defined, use a no-op
                              if (typeof updateModule === "function") {
                                updateModule(module.id, updatedModule);
                              }
                            }}
                          />
                        </div>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>
                );
              })}
            </Accordion>
            )
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Link href="/admin/courses">
              <Button variant="outline">← Back to Courses</Button>
            </Link>

            <Link href={`/admin/course/${id}/content`}>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Manage Course Content
              </Button>
            </Link>
          </div>

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

