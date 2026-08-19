import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import {
  createCourse,
  updateCourse,
  getCourseById,
} from "../../api/courseService";

const categories = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "AI & Machine Learning",
  "DevOps",
  "Cybersecurity",
  "Business",
  "Design",
  "Marketing",
];

const levels = ["Beginner", "Intermediate", "Advanced"];

export default function AdminCourseForm() {
  const { courseId } = useParams();
  const isEdit = !!courseId;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    category: "",
    level: "Beginner",
    language: "English",
    price: 0,
    published: false,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) {
      getCourseById(courseId)
        .then(({ data }) => {
          setForm({
            title: data.title || "",
            description: data.description || "",
            imageUrl: data.imageUrl || "",
            category: data.category || "",
            level: data.level || "Beginner",
            language: data.language || "English",
            price: data.price || 0,
            published: data.published || false,
          });
        })
        .catch(() => setError("Failed to load course"))
        .finally(() => setFetching(false));
    }
  }, [courseId, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      if (isEdit) {
        await updateCourse(courseId, form);
      } else {
        await createCourse(form);
      }
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save course");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A86B]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#00A86B] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <h1 className="text-2xl font-bold text-[#0B2545] mb-6">
          {isEdit ? "Edit Course" : "Create New Course"}
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Course Title *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Complete Web Development Bootcamp"
              className="w-full px-4 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:border-[#00A86B] focus:bg-white focus:outline-none transition-all duration-200"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe what students will learn..."
              className="w-full px-4 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:border-[#00A86B] focus:bg-white focus:outline-none transition-all duration-200 resize-none"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Image URL
            </label>
            <input
              type="url"
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:border-[#00A86B] focus:bg-white focus:outline-none transition-all duration-200"
            />
            {form.imageUrl && (
              <img
                src={form.imageUrl}
                alt="Preview"
                className="mt-3 h-32 rounded-xl object-cover border border-slate-100"
              />
            )}
          </div>

          {/* Category, Level, Language */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:border-[#00A86B] focus:bg-white focus:outline-none transition-all duration-200"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Level
              </label>
              <select
                name="level"
                value={form.level}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:border-[#00A86B] focus:bg-white focus:outline-none transition-all duration-200"
              >
                {levels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Language
              </label>
              <input
                type="text"
                name="language"
                value={form.language}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:border-[#00A86B] focus:bg-white focus:outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Price (₹)
            </label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-4 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:border-[#00A86B] focus:bg-white focus:outline-none transition-all duration-200"
            />
          </div>

          {/* Published */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="published"
              checked={form.published}
              onChange={handleChange}
              className="w-4 h-4 rounded border-slate-300 text-[#00A86B] focus:ring-[#00A86B]"
            />
            <span className="text-sm font-semibold text-slate-700">
              Publish course
            </span>
          </label>

          {/* Submit */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-[#00A86B] hover:bg-[#008f5a] text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {loading ? "Saving..." : isEdit ? "Update Course" : "Create Course"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              className="px-6 py-3 text-sm font-semibold text-slate-600 hover:text-[#0B2545] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
