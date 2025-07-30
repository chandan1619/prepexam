"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Save,
  ArrowLeft,
  Lock,
  Unlock,
} from "lucide-react";
import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";

interface Module {
  id: string;
  title: string;
  description?: string;
  isFree: boolean;
  examId: string;
}

export default function EditModulePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [module, setModule] = useState<Module | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    isFree: false,
  });
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
          setForm({
            title: data.module.title || "",
            description: data.module.description || "",
            isFree: data.module.isFree || false,
          });
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/admin/module/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      if (res.ok) {
        setSuccess("Module updated successfully!");
        // Optionally redirect back to the course modules page
        setTimeout(() => {
          if (module?.examId) {
            router.push(`/admin/course/${module.examId}/modules`);
          }
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update module");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update module");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading module...</p>
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
                  Edit Module
                </h1>
                <p className="text-gray-600">
                  Update module details and access settings
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

          {/* Edit Form */}
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Module Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Module Title</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="Enter module title..."
                        value={form.title}
                        onChange={handleChange}
                        className="mt-2"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="isFree">Access Type</Label>
                      <div className="mt-2 flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="isFree"
                            checked={form.isFree}
                            onChange={() => setForm(prev => ({ ...prev, isFree: true }))}
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
                            name="isFree"
                            checked={!form.isFree}
                            onChange={() => setForm(prev => ({ ...prev, isFree: false }))}
                            className="text-orange-600"
                          />
                          <div className="flex items-center gap-1">
                            <Lock className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-medium text-orange-600">Paid</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Current Status Preview */}
                    <div>
                      <Label>Current Status</Label>
                      <div className="mt-2">
                        <Badge 
                          variant={form.isFree ? "default" : "destructive"} 
                          className="text-sm"
                        >
                          {form.isFree ? (
                            <><Unlock className="h-4 w-4 mr-1" />Free Access</>
                          ) : (
                            <><Lock className="h-4 w-4 mr-1" />Paid Access</>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Module Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Brief description of this module..."
                      value={form.description}
                      onChange={handleChange}
                      className="mt-2 min-h-[200px] resize-none"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-6 border-t">
                  <Link href={`/admin/course/${module.examId}/modules`}>
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Link>

                  <Button type="submit" disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
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