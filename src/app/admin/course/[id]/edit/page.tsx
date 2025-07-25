"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageLayout from "@/components/layout/PageLayout";
import Link from "next/link";

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    category: "",
    level: "",
    duration: "",
    priceInINR: 0,
    imageUrl: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchCourse() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/admin/course/${id}`);
        const data = await res.json();
        if (res.ok && data.course) {
          setForm({
            title: data.course.title || "",
            slug: data.course.slug || "",
            description: data.course.description || "",
            category: data.course.category || "",
            level: data.course.level || "",
            duration: data.course.duration || "",
            priceInINR: data.course.priceInINR || 0,
            imageUrl: data.course.imageUrl || "",
          });
        } else {
          setError(data.error || "Failed to fetch course");
        }
      } catch (e) {
        setError("Failed to fetch course");
      }
      setLoading(false);
    }
    if (id) fetchCourse();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "priceInINR" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess("Course updated successfully!");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update course");
      }
    } catch (e) {
      setError("Failed to update course");
    }
  };

  return (
    <PageLayout>
      <div className="max-w-xl mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit Course</h1>
          <Link href="/admin/courses">
            <button className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md">
              All Courses
            </button>
          </Link>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500 mb-4">{error}</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium">Title</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
                minLength={3}
              />
            </div>
            <div>
              <label className="block font-medium">Slug</label>
              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
                minLength={3}
                pattern="[a-z0-9-]+"
                title="Lowercase letters, numbers, and hyphens only"
              />
            </div>
            <div>
              <label className="block font-medium">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
                minLength={10}
              />
            </div>
            <div>
              <label className="block font-medium">Category</label>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-medium">Level</label>
              <input
                type="text"
                name="level"
                value={form.level}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-medium">Duration</label>
              <input
                type="text"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-medium">Price (INR)</label>
              <input
                type="number"
                name="priceInINR"
                value={form.priceInINR}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                min={0}
                required
              />
            </div>
            <div>
              <label className="block font-medium">Image URL</label>
              <input
                type="url"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Update Course
            </button>
            {success && <div className="text-green-600 mt-2">{success}</div>}
            {error && <div className="text-red-600 mt-2">{error}</div>}
          </form>
        )}
      </div>
    </PageLayout>
  );
}
