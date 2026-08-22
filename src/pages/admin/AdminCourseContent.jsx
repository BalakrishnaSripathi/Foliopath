import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Save,
  X,
  Pencil,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  getCourseById,
  getModules,
  addModule,
  deleteModule,
  getLessons,
  addLesson,
  updateLesson,
  deleteLesson,
} from "../../api/courseService";
import Header from "../../components/layout/Header";
import RichTextEditor from "../../components/RichTextEditor";

const LESSON_TYPES = ["CONCEPT", "TEXT_ONLY", "CODE_ONLY", "TEXT_AND_CODE"];
const CONTENT_TYPES = ["TEXT", "CODE", "TEXT_AND_CODE", "DOCUMENT", "TEXT_AND_DOCUMENT"];
const CODE_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "csharp",
  "html",
  "css",
  "sql",
  "json",
  "bash",
];

const emptyItem = (displayOrder) => ({
  title: "",
  description: "",
  content: "",
  codeContent: "",
  codeLanguage: "javascript",
  displayOrder,
});

const emptyForm = (displayOrder) => ({
  lessonCode: "",
  title: "",
  description: "",
  lessonType: "TEXT_ONLY",
  contentType: "TEXT",
  content: "",
  codeContent: "",
  codeLanguage: "javascript",
  documentUrl: "",
  displayOrder,
  estimatedMinutes: 10,
  items: [],
});

function LessonItemsEditor({ items, onChange }) {
  const updateItem = (index, field, value) => {
    onChange(
      items.map((it, i) => (i === index ? { ...it, [field]: value } : it))
    );
  };

  const moveItem = (index, dir) => {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((it, i) => ({ ...it, displayOrder: i + 1 })));
  };

  const addItem = () => {
    onChange([...items, emptyItem(items.length + 1)]);
  };

  const removeItem = (index) => {
    onChange(
      items
        .filter((_, i) => i !== index)
        .map((it, i) => ({ ...it, displayOrder: i + 1 }))
    );
  };

  const inputCls =
    "w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:border-[#00A86B] focus:outline-none";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Lesson Items ({items.length})
        </label>
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:border-[#00A86B] hover:text-[#00A86B] transition-all duration-200"
        >
          <Plus className="w-3 h-3" />
          Add Item
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-xs text-slate-400">
          No items yet. Add items to build this lesson step by step.
        </p>
      )}

      {items.map((item, idx) => (
        <div
          key={idx}
          className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              Item {idx + 1}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveItem(idx, -1)}
                disabled={idx === 0}
                className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
              >
                <ArrowUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => moveItem(idx, 1)}
                disabled={idx === items.length - 1}
                className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
              >
                <ArrowDown className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="p-1 text-red-400 hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          <input
            type="text"
            value={item.title}
            onChange={(e) => updateItem(idx, "title", e.target.value)}
            className={`${inputCls} font-semibold`}
            placeholder="Item title *"
          />

          <input
            type="text"
            value={item.description}
            onChange={(e) => updateItem(idx, "description", e.target.value)}
            className={inputCls}
            placeholder="Short description"
          />

          <RichTextEditor
            value={item.content}
            onChange={(html) => updateItem(idx, "content", html)}
            placeholder="Text content (bold, lists supported)"
            minHeight="80px"
          />

          <select
            value={item.codeLanguage || "javascript"}
            onChange={(e) => updateItem(idx, "codeLanguage", e.target.value)}
            className="px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:border-[#00A86B] focus:outline-none"
          >
            {CODE_LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          <textarea
            value={item.codeContent}
            onChange={(e) => updateItem(idx, "codeContent", e.target.value)}
            rows={4}
            className="w-full px-3 py-2 text-sm font-mono bg-[#0B2545] text-green-400 rounded-lg border border-slate-700 focus:outline-none resize-none"
            placeholder="// Code for this item (optional)"
          />
        </div>
      ))}
    </div>
  );
}

function LessonForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const showCode =
    ["CODE", "TEXT_AND_CODE"].includes(form.contentType) ||
    ["CODE_ONLY", "TEXT_AND_CODE"].includes(form.lessonType);
  const showDocument = ["DOCUMENT", "TEXT_AND_DOCUMENT"].includes(
    form.contentType
  );

  const inputCls =
    "w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:border-[#00A86B] focus:outline-none";
  const labelCls =
    "block text-xs font-semibold text-slate-500 uppercase mb-1 tracking-wide";

  return (
    <div className="p-4 space-y-4 bg-slate-50 border-t border-slate-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={set("title")}
            className={inputCls}
            placeholder="Lesson title"
          />
        </div>
        <div>
          <label className={labelCls}>Lesson Code</label>
          <input
            type="text"
            value={form.lessonCode}
            onChange={set("lessonCode")}
            className={inputCls}
            placeholder="Auto-generated if left blank"
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea
          value={form.description}
          onChange={set("description")}
          rows={2}
          className={`${inputCls} resize-none`}
          placeholder="Short description of the lesson"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Lesson Type</label>
          <select value={form.lessonType} onChange={set("lessonType")} className={inputCls}>
            {LESSON_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Content Type</label>
          <select value={form.contentType} onChange={set("contentType")} className={inputCls}>
            {CONTENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>
          Content
          <span className="ml-2 normal-case font-medium text-slate-400">
            (formatting like bold is shown to students as-is)
          </span>
        </label>
        <RichTextEditor
          value={form.content}
          onChange={(html) => setForm((prev) => ({ ...prev, content: html }))}
          placeholder="Main lesson content — use the toolbar for bold, italic, underline and lists"
          minHeight="140px"
        />
      </div>

      {showCode && (
        <div className="space-y-2">
          <label className={labelCls}>Code Content</label>
          <select
            value={form.codeLanguage}
            onChange={set("codeLanguage")}
            className="px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:border-[#00A86B] focus:outline-none"
          >
            {CODE_LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <textarea
            value={form.codeContent}
            onChange={set("codeContent")}
            rows={6}
            className="w-full px-3 py-2 text-sm font-mono bg-[#0B2545] text-green-400 rounded-lg border border-slate-700 focus:outline-none resize-y"
            placeholder="// Write your code here"
          />
        </div>
      )}

      {showDocument && (
        <div>
          <label className={labelCls}>Document URL</label>
          <input
            type="text"
            value={form.documentUrl}
            onChange={set("documentUrl")}
            className={inputCls}
            placeholder="https://example.com/document.pdf"
          />
        </div>
      )}

      <LessonItemsEditor
        items={form.items}
        onChange={(items) => setForm((prev) => ({ ...prev, items }))}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Display Order</label>
          <input
            type="number"
            min={1}
            value={form.displayOrder}
            onChange={set("displayOrder")}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Estimated Minutes</label>
          <input
            type="number"
            min={0}
            value={form.estimatedMinutes}
            onChange={set("estimatedMinutes")}
            className={inputCls}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => onSave(form)}
          disabled={saving || !form.title.trim()}
          className="flex items-center gap-2 bg-[#00A86B] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#008f5a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-3 h-3" />
          {saving ? "Saving..." : "Save Lesson"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-semibold text-slate-500 hover:text-slate-700 px-3 py-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function AdminCourseContent() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessonsByModule, setLessonsByModule] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState(null);
  const [formState, setFormState] = useState(null); // { moduleId, lessonId | null }
  const [saving, setSaving] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [showAddModule, setShowAddModule] = useState(false);

  useEffect(() => {
    loadData();
  }, [courseId]);

  const loadData = async () => {
    try {
      const [courseRes, modulesRes] = await Promise.all([
        getCourseById(courseId),
        getModules(courseId),
      ]);
      setCourse(courseRes.data);
      setModules(modulesRes.data);
    } catch (err) {
      console.error("Failed to load:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadLessons = async (moduleId) => {
    try {
      const { data } = await getLessons(moduleId);
      setLessonsByModule((prev) => ({ ...prev, [moduleId]: data }));
    } catch (err) {
      console.error("Failed to load lessons:", err);
      setLessonsByModule((prev) => ({ ...prev, [moduleId]: [] }));
    }
  };

  const handleToggleModule = (moduleId) => {
    const next = expandedModule === moduleId ? null : moduleId;
    setExpandedModule(next);
    if (next && !lessonsByModule[moduleId]) {
      loadLessons(moduleId);
    }
  };

  const refreshLessons = async (moduleId) => {
    await loadLessons(moduleId);
  };

  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) return;
    try {
      await addModule(courseId, {
        title: newModuleTitle,
        displayOrder: modules.length + 1,
      });
      setNewModuleTitle("");
      setShowAddModule(false);
      const { data } = await getModules(courseId);
      setModules(data);
      const created = [...data].sort(
        (a, b) => (b.displayOrder || 0) - (a.displayOrder || 0)
      )[0];
      if (created) {
        setExpandedModule(created.id);
        loadLessons(created.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!confirm("Delete this module and all its lessons?")) return;
    try {
      await deleteModule(courseId, moduleId);
      setModules(modules.filter((m) => m.id !== moduleId));
      setLessonsByModule((prev) => {
        const next = { ...prev };
        delete next[moduleId];
        return next;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const openAddLesson = (mod) => {
    const count = (lessonsByModule[mod.id] || []).length;
    setFormState({
      moduleId: mod.id,
      lessonId: null,
      initial: emptyForm(count + 1),
    });
  };

  const openEditLesson = (mod, lesson) => {
    setFormState({
      moduleId: mod.id,
      lessonId: lesson.id,
      initial: {
        lessonCode: lesson.lessonCode || "",
        title: lesson.title || "",
        description: lesson.description || "",
        lessonType: lesson.lessonType || "TEXT_ONLY",
        contentType: lesson.contentType || "TEXT",
        content: lesson.content || "",
        codeContent: lesson.codeContent || "",
        codeLanguage: lesson.codeLanguage || "javascript",
        documentUrl: lesson.documentUrl || "",
        displayOrder: lesson.displayOrder || 1,
        estimatedMinutes: lesson.estimatedMinutes || 10,
        items: (lesson.items || []).map((it, i) => ({
          title: it.title || "",
          description: it.description || "",
          content: it.content || "",
          codeContent: it.codeContent || "",
          codeLanguage: it.codeLanguage || "javascript",
          displayOrder: it.displayOrder || i + 1,
        })),
      },
    });
  };

  const handleSaveLesson = async (form) => {
    if (!formState) return;
    setSaving(true);
    try {
      const { moduleId, lessonId } = formState;
      const payload = {
        ...form,
        items: form.items.map((it, i) => ({
          title: it.title,
          description: it.description || "",
          content: it.content || "",
          codeContent: it.codeContent || "",
          codeLanguage: it.codeLanguage || "",
          displayOrder: Number(it.displayOrder) || i + 1,
        })),
      };
      if (lessonId) {
        await updateLesson(moduleId, lessonId, payload);
      } else {
        await addLesson(moduleId, payload);
      }
      await refreshLessons(moduleId);
      setFormState(null);
    } catch (err) {
      console.error("Failed to save lesson:", err);
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save lesson"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = async (lessonId, moduleId) => {
    if (!confirm("Delete this lesson?")) return;
    try {
      await deleteLesson(moduleId, lessonId);
      await refreshLessons(moduleId);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A86B]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#00A86B] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0B2545]">
              Course Content
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {course?.title} &middot; {modules.length} modules
            </p>
          </div>
          <button
            onClick={() => setShowAddModule(true)}
            className="flex items-center gap-2 bg-[#00A86B] hover:bg-[#008f5a] text-white font-semibold px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Module
          </button>
        </div>

        {successMessage && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600">
            {successMessage}
          </div>
        )}

        {showAddModule && (
          <div className="mb-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <input
              type="text"
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              placeholder="Module title"
              className="flex-1 px-4 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:border-[#00A86B] focus:outline-none"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleAddModule()}
            />
            <button
              onClick={handleAddModule}
              className="bg-[#00A86B] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#008f5a] transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddModule(false);
                setNewModuleTitle("");
              }}
              className="text-slate-400 hover:text-slate-600 p-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="space-y-4">
          {modules
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
            .map((mod) => {
              const lessons = lessonsByModule[mod.id];
              return (
                <div
                  key={mod.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                >
                  <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-100">
                    <button
                      onClick={() => handleToggleModule(mod.id)}
                      className="flex items-center gap-3 flex-1"
                    >
                      {expandedModule === mod.id ? (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      )}
                      <span className="font-bold text-[#0B2545]">
                        Module {mod.displayOrder}: {mod.title}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({lessons ? `${lessons.length} lessons` : "click to load"})
                      </span>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openAddLesson(mod)}
                        className="text-xs font-semibold text-[#00A86B] hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Lesson
                      </button>
                      <button
                        onClick={() => handleDeleteModule(mod.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {expandedModule === mod.id && (
                    <div className="p-4 space-y-3">
                      {!lessons && (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00A86B]" />
                        </div>
                      )}

                      {lessons && lessons.length === 0 && !formState && (
                        <p className="text-sm text-slate-400 text-center py-4">
                          No lessons yet. Click &quot;+ Lesson&quot; to add one.
                        </p>
                      )}

                      {lessons &&
                        lessons
                          .sort(
                            (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
                          )
                          .map((lesson) => {
                            const isEditing =
                              formState?.lessonId === lesson.id;

                            return (
                              <div
                                key={lesson.id}
                                className="border border-slate-200 rounded-xl overflow-hidden"
                              >
                                <div className="flex items-center justify-between p-3 bg-slate-50">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span className="text-xs text-slate-400 font-mono flex-shrink-0">
                                      L{lesson.displayOrder}
                                    </span>
                                    <span className="text-sm font-semibold text-[#0B2545] truncate">
                                      {lesson.title}
                                    </span>
                                    <span className="text-xs px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded flex-shrink-0">
                                      {lesson.lessonType}
                                    </span>
                                    {(lesson.items?.length || 0) > 0 && (
                                      <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded flex-shrink-0">
                                        {lesson.items.length} items
                                      </span>
                                    )}
                                    <span className="text-xs text-slate-400 hidden sm:inline flex-shrink-0">
                                      {lesson.estimatedMinutes} min
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <button
                                      onClick={() => openEditLesson(mod, lesson)}
                                      className="text-xs font-semibold text-blue-600 hover:underline px-2 flex items-center gap-1"
                                    >
                                      <Pencil className="w-3 h-3" />
                                      Edit
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteLesson(lesson.id, mod.id)
                                      }
                                      className="p-1 text-red-400 hover:text-red-600"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                {isEditing && (
                                  <LessonForm
                                    initial={formState.initial}
                                    onSave={handleSaveLesson}
                                    onCancel={() => setFormState(null)}
                                    saving={saving}
                                  />
                                )}
                              </div>
                            );
                          })}

                      {formState?.moduleId === mod.id &&
                        !formState.lessonId && (
                          <div className="border border-[#00A86B]/30 rounded-xl overflow-hidden">
                            <div className="p-3 bg-[#00A86B]/5 text-sm font-semibold text-[#0B2545]">
                              New Lesson &mdash; Module {mod.displayOrder}:{" "}
                              {mod.title}
                            </div>
                            <LessonForm
                              initial={formState.initial}
                              onSave={handleSaveLesson}
                              onCancel={() => setFormState(null)}
                              saving={saving}
                            />
                          </div>
                        )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {modules.length === 0 && !showAddModule && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <p className="text-slate-500 mb-4">
              No modules yet. Start building your course curriculum.
            </p>
            <button
              onClick={() => setShowAddModule(true)}
              className="text-[#00A86B] font-semibold hover:underline"
            >
              Add your first module
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
