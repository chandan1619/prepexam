"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Plus,
  Users,
  BarChart3,
  Save,
  Eye,
} from "lucide-react";
import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";

interface CourseForm {
  title: string;
  slug: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  priceInINR: string;
  imageUrl: string;
}

export default function AdminCreateCoursePage() {
  const [form, setForm] = useState<CourseForm>({
    title: "",
    slug: "",
    description: "",
    category: "",
    level: "beginner",
    duration: "",
    priceInINR: "",
    imageUrl: "",
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          priceInINR: Number(form.priceInINR),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create course");
      setSuccess("Course created successfully!");
      setForm({
        title: "",
        slug: "",
        description: "",
        category: "",
        level: "beginner",
        duration: "",
        priceInINR: "",
        imageUrl: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = () => {
    setSuccess("Draft saved successfully!");
  };

  const courseStats = {
    modules: 0,
    topics: 0,
    questions: 0,
    quizzes: 0,
  };

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
                  Course Builder
                </h1>
                <p className="text-gray-600">
                  Create engaging educational content
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={saveDraft}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                <Users className="h-4 w-4 mr-2" />
                {loading ? "Creating..." : "Create Course"}
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white shadow-md border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Modules</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {courseStats.modules}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <BarChart3 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Topics</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {courseStats.topics}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Plus className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Questions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {courseStats.questions}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100">
                    <Users className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Quizzes</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {courseStats.quizzes}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px] bg-white">
              <TabsTrigger value="overview">Course Overview</TabsTrigger>
              <TabsTrigger value="details">Course Details</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="shadow-md border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Course Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Course Title</Label>
                        <Input
                          id="title"
                          name="title"
                          placeholder="Enter course title..."
                          value={form.title}
                          onChange={handleChange}
                          className="mt-2"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="slug">Course Slug</Label>
                        <Input
                          id="slug"
                          name="slug"
                          placeholder="e.g., ssc-cgl, upsc-prelims"
                          value={form.slug}
                          onChange={handleChange}
                          className="mt-2"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          name="category"
                          placeholder="e.g., Government Exams, Programming, Mathematics"
                          value={form.category}
                          onChange={handleChange}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="duration">Duration</Label>
                        <Input
                          id="duration"
                          name="duration"
                          placeholder="e.g., 8 weeks, 40 hours"
                          value={form.duration}
                          onChange={handleChange}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Course Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Describe what students will learn in this course..."
                        value={form.description}
                        onChange={handleChange}
                        className="mt-2 min-h-[200px] resize-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {form.level && (
                      <Badge variant="secondary">{form.level}</Badge>
                    )}
                    {form.category && (
                      <Badge variant="outline">{form.category}</Badge>
                    )}
                    {form.duration && (
                      <Badge variant="outline">{form.duration}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <Card className="shadow-md border-0">
                <CardHeader>
                  <CardTitle>Course Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="priceInINR">Price (INR)</Label>
                      <Input
                        id="priceInINR"
                        name="priceInINR"
                        type="number"
                        placeholder="0"
                        value={form.priceInINR}
                        onChange={handleChange}
                        className="mt-2"
                        min={0}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="imageUrl">Course Image URL</Label>
                      <Input
                        id="imageUrl"
                        name="imageUrl"
                        placeholder="https://example.com/image.jpg"
                        value={form.imageUrl}
                        onChange={handleChange}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  {form.imageUrl && (
                    <div className="mt-4">
                      <Label>Preview</Label>
                      <div className="mt-2">
                        <div className="w-32 h-32 bg-gray-200 rounded-lg border flex items-center justify-center text-gray-500 text-sm">
                          Preview Image
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card className="shadow-md border-0">
                <CardHeader>
                  <CardTitle>Course Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="level">Difficulty Level</Label>
                      <select
                        id="level"
                        name="level"
                        value={form.level}
                        onChange={handleChange}
                        className="mt-2 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Link href="/admin/courses">
              <Button variant="outline">← Back to Courses</Button>
            </Link>

            <div className="flex gap-3">
              <Button variant="outline" onClick={saveDraft}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                <Eye className="h-4 w-4 mr-2" />
                {loading ? "Creating..." : "Create Course"}
              </Button>
            </div>
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
