import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { createCourse, updateCourse, getCourseById } from "../../api/courseService";

const levels = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

const emptyForm = {
  title: "",
  shortDescription: "",
  description: "",
  thumbnailUrl: "",
  level: "BEGINNER",
  language: "English",
  price: 0,
  courseCode: "",
};

export default function CourseFormModal({ courseId, onClose, onSaved }) {
  const isEdit = !!courseId;
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) {
      getCourseById(courseId)
        .then(({ data }) => {
          setForm({
            title: data.title || "",
            shortDescription: data.shortDescription || "",
            description: data.description || "",
            thumbnailUrl: data.thumbnailUrl || "",
            level: data.level || "BEGINNER",
            language: data.language || "English",
            price: data.price || 0,
            courseCode: data.courseCode || "",
          });
        })
        .catch(() => setError("Failed to load course"))
        .finally(() => setFetching(false));
    }
  }, [courseId, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save course");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:border-[#00A86B] focus:bg-white focus:outline-none transition-all duration-200";
  const labelCls = "block text-xs font-semibold text-slate-500 uppercase mb-1 tracking-wide";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full lg:max-w-lg max-h-[95vh] overflow-y-auto lg:max-h-none lg:overflow-visible">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-lg font-bold text-[#0B2545]">
            {isEdit ? "Edit Course" : "Create New Course"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {fetching ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A86B]" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label className={labelCls}>Course Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Complete Web Development Bootcamp"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Short Description</label>
              <input
                type="text"
                name="shortDescription"
                value={form.shortDescription}
                onChange={handleChange}
                placeholder="Brief one-line description"
                maxLength={500}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Describe what students will learn..."
                className={`${inputCls} resize-none`}
              />
            </div>

            <div>
              <label className={labelCls}>Thumbnail URL</label>
              <input
                type="url"
                name="thumbnailUrl"
                value={form.thumbnailUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className={inputCls}
              />
              {form.thumbnailUrl && (
                <img
                  src={form.thumbnailUrl}
                  alt="Preview"
                  className="mt-2 h-20 rounded-xl object-cover border border-slate-100"
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Level</label>
                <select
                  name="level"
                  value={form.level}
                  onChange={handleChange}
                  className={inputCls}
                >
                  {levels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl.charAt(0) + lvl.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Language</label>
                <input
                  type="text"
                  name="language"
                  value={form.language}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={inputCls}
                />
              </div>
            </div>
          </form>
        )}

        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100 sticky bottom-0 bg-white rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || fetching}
            className="flex items-center gap-2 px-5 py-2 bg-[#00A86B] hover:bg-[#008f5a] text-white text-sm font-bold rounded-xl shadow-md transition-all duration-200 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : isEdit ? "Update Course" : "Create Course"}
          </button>
        </div>
      </div>
    </div>
  );
}
