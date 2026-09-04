import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  X,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Save,
  Pencil,
  ArrowUp,
  ArrowDown,
  ClipboardList,
  BookOpen,
} from "lucide-react";
import {
  getCourseById,
  getAllCourses,
  getModules,
  addModule,
  deleteModule,
  getLessons,
  addLesson,
  updateLesson,
  deleteLesson,
  getCourseModules,
  addCourseModule,
  removeCourseModule,
} from "../../api/courseService";
import RichTextEditor from "../RichTextEditor";
import DeleteConfirmModal from "../ui/DeleteConfirmModal";
import CourseModulePickerModal from "./CourseModulePickerModal";

const LESSON_TYPES = ["CONCEPT", "TEXT_ONLY", "CODE_ONLY", "TEXT_AND_CODE"];
const CONTENT_TYPES = ["TEXT", "CODE", "TEXT_AND_CODE", "DOCUMENT", "TEXT_AND_DOCUMENT"];
const CODE_LANGUAGES = [
  "javascript", "typescript", "python", "java", "csharp", "html", "css", "sql", "json", "bash",
];

const emptyItem = (displayOrder) => ({
  title: "", description: "", content: "", codeContent: "", codeLanguage: "javascript", displayOrder,
});

const emptyForm = (displayOrder) => ({
  lessonCode: "", title: "", description: "", lessonType: "TEXT_AND_CODE", contentType: "TEXT_AND_CODE",
  content: "", codeContent: "", codeLanguage: "javascript", documentUrl: "",
  displayOrder, estimatedMinutes: 15, items: [],
});

function LessonItemsEditor({ items, onChange }) {
  const updateItem = (index, field, value) =>
    onChange(items.map((it, i) => (i === index ? { ...it, [field]: value } : it)));

  const moveItem = (index, dir) => {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((it, i) => ({ ...it, displayOrder: i + 1 })));
  };

  const addItem = () => onChange([...items, emptyItem(items.length + 1)]);

  const removeItem = (index) =>
    onChange(items.filter((_, i) => i !== index).map((it, i) => ({ ...it, displayOrder: i + 1 })));

  const inputCls = "w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:border-[#00A86B] focus:outline-none";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Lesson Items ({items.length})
        </label>
        <button type="button" onClick={addItem}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:border-[#00A86B] hover:text-[#00A86B] transition-all duration-200">
          <Plus className="w-3 h-3" /> Add Item
        </button>
      </div>
      {items.length === 0 && (
        <p className="text-xs text-slate-400">No items yet. Add items to build this lesson step by step.</p>
      )}
      {items.map((item, idx) => (
        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Item {idx + 1}</span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => moveItem(idx, -1)} disabled={idx === 0} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30">
                <ArrowUp className="w-3 h-3" />
              </button>
              <button type="button" onClick={() => moveItem(idx, 1)} disabled={idx === items.length - 1} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30">
                <ArrowDown className="w-3 h-3" />
              </button>
              <button type="button" onClick={() => removeItem(idx)} className="p-1 text-red-400 hover:text-red-600">
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
          <input type="text" value={item.title} onChange={(e) => updateItem(idx, "title", e.target.value)} className={`${inputCls} font-semibold`} placeholder="Item title *" />
          <input type="text" value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)} className={inputCls} placeholder="Short description" />
          <RichTextEditor value={item.content} onChange={(html) => updateItem(idx, "content", html)} placeholder="Text content" minHeight="80px" />
          <select value={item.codeLanguage || "javascript"} onChange={(e) => updateItem(idx, "codeLanguage", e.target.value)} className="px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:border-[#00A86B] focus:outline-none">
            {CODE_LANGUAGES.map((l) => (<option key={l} value={l}>{l}</option>))}
          </select>
          <textarea value={item.codeContent} onChange={(e) => updateItem(idx, "codeContent", e.target.value)} rows={4} className="w-full px-3 py-2 text-sm font-mono bg-[#0B2545] text-green-400 rounded-lg border border-slate-700 focus:outline-none resize-none" placeholder="// Code for this item (optional)" />
        </div>
      ))}
    </div>
  );
}

function LessonForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial);
  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const showCode = ["CODE", "TEXT_AND_CODE"].includes(form.contentType) || ["CODE_ONLY", "TEXT_AND_CODE"].includes(form.lessonType);
  const showDocument = ["DOCUMENT", "TEXT_AND_DOCUMENT"].includes(form.contentType);

  const inputCls = "w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:border-[#00A86B] focus:outline-none";
  const labelCls = "block text-xs font-semibold text-slate-500 uppercase mb-1 tracking-wide";

  return (
    <div className="p-4 space-y-4 bg-slate-50 border-t border-slate-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Title *</label>
          <input type="text" value={form.title} onChange={set("title")} className={inputCls} placeholder="Lesson title" />
        </div>
        <div>
          <label className={labelCls}>Lesson Code</label>
          <input type="text" value={form.lessonCode} onChange={set("lessonCode")} className={inputCls} placeholder="Auto-generated if left blank" />
        </div>
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <textarea value={form.description} onChange={set("description")} rows={2} className={`${inputCls} resize-none`} placeholder="Short description of the lesson" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Lesson Type</label>
          <select value={form.lessonType} onChange={set("lessonType")} className={inputCls}>
            {LESSON_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Content Type</label>
          <select value={form.contentType} onChange={set("contentType")} className={inputCls}>
            {CONTENT_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
        </div>
      </div>
      <div>
        <label className={labelCls}>Content</label>
        <RichTextEditor value={form.content} onChange={(html) => setForm((prev) => ({ ...prev, content: html }))} placeholder="Main lesson content" minHeight="140px" />
      </div>
      {showCode && (
        <div className="space-y-2">
          <label className={labelCls}>Code Content</label>
          <select value={form.codeLanguage} onChange={set("codeLanguage")} className="px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:border-[#00A86B] focus:outline-none">
            {CODE_LANGUAGES.map((l) => (<option key={l} value={l}>{l}</option>))}
          </select>
          <textarea value={form.codeContent} onChange={set("codeContent")} rows={6} className="w-full px-3 py-2 text-sm font-mono bg-[#0B2545] text-green-400 rounded-lg border border-slate-700 focus:outline-none resize-y" placeholder="// Write your code here" />
        </div>
      )}
      {showDocument && (
        <div>
          <label className={labelCls}>Document URL</label>
          <input type="text" value={form.documentUrl} onChange={set("documentUrl")} className={inputCls} placeholder="https://example.com/document.pdf" />
        </div>
      )}
      <LessonItemsEditor items={form.items} onChange={(items) => setForm((prev) => ({ ...prev, items }))} />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Display Order</label>
          <input type="number" min={1} value={form.displayOrder} onChange={set("displayOrder")} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Estimated Minutes</label>
          <input type="number" min={0} value={form.estimatedMinutes} onChange={set("estimatedMinutes")} className={inputCls} />
        </div>
      </div>
      <div className="flex items-center gap-2 pt-1">
        <button type="button" onClick={() => onSave(form)} disabled={saving || !form.title.trim()}
          className="flex items-center gap-2 bg-[#00A86B] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#008f5a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <Save className="w-3 h-3" /> {saving ? "Saving..." : "Save Lesson"}
        </button>
        <button type="button" onClick={onCancel} className="text-sm font-semibold text-slate-500 hover:text-slate-700 px-3 py-2">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function CourseContentModal({ courseId, onClose }) {
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessonsByModule, setLessonsByModule] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState(null);
  const [formState, setFormState] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [showAddModule, setShowAddModule] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [courseModules, setCourseModules] = useState([]);
  const [coursePickerOpen, setCoursePickerOpen] = useState(false);
  const [allCourses, setAllCourses] = useState([]);
  const [courseModuleSaving, setCourseModuleSaving] = useState(false);

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
      try {
        const cmRes = await getCourseModules(courseId);
        setCourseModules(cmRes.data || []);
      } catch (cmErr) {
        console.error("Failed to load course modules:", cmErr);
        setCourseModules([]);
      }
    } catch (err) {
      console.error("Failed to load:", err);
    } finally {
      setLoading(false);
    }
  };

  const openCoursePicker = async () => {
    if (allCourses.length === 0) {
      try {
        const { data } = await getAllCourses();
        setAllCourses(data);
      } catch (err) {
        console.error("Failed to load available courses:", err);
        toast.error("Unable to load available courses. Please try again.");
        return;
      }
    }
    setCoursePickerOpen(true);
  };

  const handleAddCourseModule = async (selectedCourseId) => {
    setCourseModuleSaving(true);
    try {
      await addCourseModule(courseId, {
        courseId: selectedCourseId,
        displayOrder: courseModules.length + 1,
      });
      setCoursePickerOpen(false);
      const cmRes = await getCourseModules(courseId);
      setCourseModules(cmRes.data || []);
      toast.success("Existing course was added as a module.");
    } catch (err) {
      console.error("Failed to add course module:", err);
      toast.error(mapCourseModuleError(err));
    } finally {
      setCourseModuleSaving(false);
    }
  };

  const handleRemoveCourseModule = (cm) => {
    const linkedCourseTitle = cm?.title || "Course";
    setDeleteModal({
      type: "courseModule",
      title: "Remove Course Module",
      entityName: linkedCourseTitle,
      entityType: "course module",
      metaFields: [
        { label: "Course ID", value: `${cm?.courseId || cm?.id || ""}` },
        { label: "Type", value: "Existing Course" },
      ],
      confirmLabel: "Remove Course",
      description: `This will remove ${linkedCourseTitle} from the ${course?.title || "current"} course, but the ${linkedCourseTitle} course itself will not be deleted.`,
      onConfirm: async () => {
        try {
          await removeCourseModule(courseId, cm.id);
          setCourseModules(courseModules.filter((x) => x.id !== cm.id));
          setDeleteModal(null);
          toast.success(`Removed "${linkedCourseTitle}" as a module.`);
        } catch (err) {
          throw new Error(
            err?.response?.data?.message ||
              "Unable to remove the course module. Please try again."
          );
        }
      },
    });
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
    if (next && !lessonsByModule[moduleId]) loadLessons(moduleId);
  };

  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) return;
    try {
      await addModule(courseId, { title: newModuleTitle, displayOrder: modules.length + 1 });
      setNewModuleTitle("");
      setShowAddModule(false);
      const { data } = await getModules(courseId);
      setModules(data);
      const created = [...data].sort((a, b) => (b.displayOrder || 0) - (a.displayOrder || 0))[0];
      if (created) { setExpandedModule(created.id); loadLessons(created.id); }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteModule = (mod) => {
    const moduleId = mod.id;
    const lessons = lessonsByModule[moduleId] || [];
    setDeleteModal({
      type: "module",
      title: "Delete Module",
      entityName: mod?.title || "Module",
      entityType: "module",
      metaFields: [
        { label: "Module ID", value: `${moduleId}` },
        { label: "Lessons", value: lessons.length > 0 ? `${lessons.length}` : "" },
      ],
      description:
        "Are you sure you want to delete this module and all of its lessons? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await deleteModule(courseId, moduleId);
          setModules(modules.filter((m) => m.id !== moduleId));
          setLessonsByModule((prev) => { const next = { ...prev }; delete next[moduleId]; return next; });
          setDeleteModal(null);
          toast.success(`Module "${mod?.title || ""}" was deleted successfully.`);
        } catch (err) {
          throw new Error(mapDeleteError("module", err));
        }
      },
    });
  };

  const openAddLesson = (mod) => {
    const count = (lessonsByModule[mod.id] || []).length;
    setFormState({ moduleId: mod.id, lessonId: null, initial: emptyForm(count + 1) });
  };

  const openEditLesson = (mod, lesson) => {
    setFormState({
      moduleId: mod.id,
      lessonId: lesson.id,
      initial: {
        lessonCode: lesson.lessonCode || "", title: lesson.title || "", description: lesson.description || "",
        lessonType: lesson.lessonType || "TEXT_AND_CODE", contentType: lesson.contentType || "TEXT_AND_CODE",
        content: lesson.content || "", codeContent: lesson.codeContent || "",
        codeLanguage: lesson.codeLanguage || "javascript", documentUrl: lesson.documentUrl || "",
        displayOrder: lesson.displayOrder || 1, estimatedMinutes: lesson.estimatedMinutes || 15,
        items: (lesson.items || []).map((it, i) => ({
          title: it.title || "", description: it.description || "", content: it.content || "",
          codeContent: it.codeContent || "", codeLanguage: it.codeLanguage || "javascript",
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
          title: it.title, description: it.description || "", content: it.content || "",
          codeContent: it.codeContent || "", codeLanguage: it.codeLanguage || "",
          displayOrder: Number(it.displayOrder) || i + 1,
        })),
      };
      if (lessonId) { await updateLesson(moduleId, lessonId, payload); }
      else { await addLesson(moduleId, payload); }
      await loadLessons(moduleId);
      setFormState(null);
    } catch (err) {
      console.error("Failed to save lesson:", err);
      alert(err?.response?.data?.message || err?.message || "Failed to save lesson");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = (lesson, moduleId) => {
    setDeleteModal({
      type: "lesson",
      title: "Delete Lesson",
      entityName: lesson?.title || "Lesson",
      entityType: "lesson",
      metaFields: [
        { label: "Lesson ID", value: `${lesson?.id || ""}` },
        { label: "Module", value: modules.find((m) => m.id === moduleId)?.title || "" },
      ],
      onConfirm: async () => {
        try {
          await deleteLesson(moduleId, lesson.id);
          await loadLessons(moduleId);
          setDeleteModal(null);
          toast.success(`Lesson "${lesson?.title || ""}" was deleted successfully.`);
        } catch (err) {
          throw new Error(mapDeleteError("lesson", err));
        }
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-[#0B2545]">Course Content</h2>
            <p className="text-sm text-slate-500 mt-0.5">{course?.title} &middot; {modules.length} modules{courseModules.length > 0 && ` + ${courseModules.length} course module(s)`}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openCoursePicker}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-[#0B2545] border border-slate-200 font-semibold px-3 py-1.5 rounded-xl text-sm transition-all duration-200"
            >
              <BookOpen className="w-3.5 h-3.5" /> Add Existing Course
            </button>
            <button
              onClick={() => setShowAddModule(true)}
              className="flex items-center gap-2 bg-[#00A86B] hover:bg-[#008f5a] text-white font-semibold px-3 py-1.5 rounded-xl text-sm transition-all duration-200"
            >
              <Plus className="w-3 h-3" /> Add Module
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A86B]" />
            </div>
          ) : (
            <>
              {showAddModule && (
                <div className="mb-4 bg-slate-50 rounded-xl border border-slate-200 p-3 flex items-center gap-3">
                  <input type="text" value={newModuleTitle} onChange={(e) => setNewModuleTitle(e.target.value)}
                    placeholder="Module title" className="flex-1 px-4 py-2 text-sm bg-white rounded-xl border border-slate-200 focus:border-[#00A86B] focus:outline-none" autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleAddModule()} />
                  <button onClick={handleAddModule} className="bg-[#00A86B] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#008f5a] transition-colors">Add</button>
                  <button onClick={() => { setShowAddModule(false); setNewModuleTitle(""); }} className="text-slate-400 hover:text-slate-600 p-2">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {courseModules.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-[#00A86B]" />
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Existing Courses as Modules ({courseModules.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {courseModules.map((cm) => (
                      <div key={cm.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="flex items-center justify-between p-3 bg-slate-50 border-b border-slate-100">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <BookOpen className="w-4 h-4 text-[#00A86B] flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="font-bold text-[#0B2545] text-sm truncate">{cm.displayOrder}. {cm.title}</div>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-xs text-slate-500">
                                <span className="px-1.5 py-0.5 bg-[#00A86B]/10 text-[#008f5a] rounded flex-shrink-0 font-semibold">Type: Existing Course</span>
                                <span className="font-mono">Course ID: {cm.courseId}</span>
                                <span className={`px-1.5 py-0.5 rounded font-medium ${cm.status === "PUBLISHED" ? "bg-green-100 text-green-700" : cm.status === "DRAFT" ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-600"}`}>{cm.status || "DRAFT"}</span>
                              </div>
                            </div>
                          </div>
                          <button onClick={() => handleRemoveCourseModule(cm)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {modules.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((mod) => {
                  const lessons = lessonsByModule[mod.id];
                  return (
                    <div key={mod.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <div className="flex items-center justify-between p-3 bg-slate-50 border-b border-slate-100">
                        <button onClick={() => handleToggleModule(mod.id)} className="flex items-center gap-3 flex-1">
                          {expandedModule === mod.id ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                          <span className="font-bold text-[#0B2545] text-sm">Module {mod.displayOrder}: {mod.title}</span>
                          <span className="text-xs text-slate-400">({lessons ? `${lessons.length} lessons` : "click to load"})</span>
                        </button>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openAddLesson(mod)}
                            className="text-xs font-semibold text-[#00A86B] hover:underline flex items-center gap-1 px-1.5"
                          >
                            <Plus className="w-3 h-3" /> Lesson
                          </button>
                          <button onClick={() => handleDeleteModule(mod)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {expandedModule === mod.id && (
                        <div className="p-3 space-y-2">
                          {!lessons && (
                            <div className="flex items-center justify-center py-4">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00A86B]" />
                            </div>
                          )}
                          {lessons && lessons.length === 0 && !formState && (
                            <p className="text-sm text-slate-400 text-center py-4">No lessons yet. Click &quot;+ Lesson&quot; to add one.</p>
                          )}
                          {lessons && lessons.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((lesson) => {
                            const isEditing = formState?.lessonId === lesson.id;
                            return (
                              <div key={lesson.id} className="border border-slate-200 rounded-lg overflow-hidden">
                                <div className="flex items-center justify-between p-2.5 bg-slate-50">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span className="text-xs text-slate-400 font-mono flex-shrink-0">L{lesson.displayOrder}</span>
                                    <span className="text-sm font-semibold text-[#0B2545] truncate">{lesson.title}</span>
                                    <span className="text-xs px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded flex-shrink-0">{lesson.lessonType}</span>
                                    {(lesson.items?.length || 0) > 0 && (
                                      <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded flex-shrink-0">{lesson.items.length} items</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <button onClick={() => openEditLesson(mod, lesson)} className="text-xs font-semibold text-blue-600 hover:underline px-1.5 flex items-center gap-1">
                                      <Pencil className="w-3 h-3" /> Edit
                                    </button>
                                    <button onClick={() => handleDeleteLesson(lesson, mod.id)} className="p-1 text-red-400 hover:text-red-600">
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                                {isEditing && (
                                  <LessonForm initial={formState.initial} onSave={handleSaveLesson} onCancel={() => setFormState(null)} saving={saving} />
                                )}
                              </div>
                            );
                          })}
                          {formState?.moduleId === mod.id && !formState.lessonId && (
                            <div className="border border-[#00A86B]/30 rounded-lg overflow-hidden">
                              <div className="p-2.5 bg-[#00A86B]/5 text-sm font-semibold text-[#0B2545]">
                                New Lesson &mdash; Module {mod.displayOrder}: {mod.title}
                              </div>
                              <LessonForm initial={formState.initial} onSave={handleSaveLesson} onCancel={() => setFormState(null)} saving={saving} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {modules.length === 0 && courseModules.length === 0 && !showAddModule && (
                <div className="text-center py-12 bg-slate-50 rounded-xl">
                  <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 mb-3">No modules yet. Start building your course curriculum.</p>
                  <button onClick={() => setShowAddModule(true)} className="text-[#00A86B] font-semibold hover:underline">
                    Add your first module
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {deleteModal && (
        <DeleteConfirmModal
          open={!!deleteModal}
          onOpenChange={(open) => {
            if (!open) setDeleteModal(null);
          }}
          title={deleteModal.title}
          entityName={deleteModal.entityName}
          entityType={deleteModal.entityType}
          description={deleteModal.description}
          metaFields={deleteModal.metaFields}
          confirmLabel={deleteModal.confirmLabel}
          onConfirm={deleteModal.onConfirm}
        />
      )}

      <CourseModulePickerModal
        open={coursePickerOpen}
        onOpenChange={setCoursePickerOpen}
        courses={allCourses}
        currentCourseId={courseId}
        existingCourseModuleIds={courseModules.map((cm) => cm.courseId)}
        onAdd={handleAddCourseModule}
        saving={courseModuleSaving}
      />
    </div>
  );
}

function mapDeleteError(entityType, err) {
  const rawMsg = (err?.response?.data?.message || err?.message || "").toLowerCase();
  const msg = err?.response?.data?.message || err?.message || "";
  if (
    rawMsg.includes("enrolled") ||
    rawMsg.includes("enrollment") ||
    rawMsg.includes("student") ||
    rawMsg.includes("cannot delete") ||
    rawMsg.includes("in use") ||
    rawMsg.includes("associated")
  ) {
    return entityType === "module"
      ? "Unable to delete this module because it is used by one or more courses. Please remove the associations before deleting."
      : `Unable to delete this ${entityType} because it is currently in use. Please remove or reassign related content before deleting.`;
  }
  if (rawMsg.includes("forbidden") || rawMsg.includes("unauthorized")) {
    return "You do not have permission to perform this action. Please contact your administrator.";
  }
  if (rawMsg.includes("not found") || rawMsg.includes("no longer exists")) {
    return "The requested item no longer exists. It may have already been deleted.";
  }
  return (msg || `Failed to delete this ${entityType}. Please try again.`).replace(/^Error:\s*/i, "");
}

function mapCourseModuleError(err) {
  const rawMsg = (err?.response?.data?.message || err?.message || "").toLowerCase();
  if (rawMsg.includes("itself") || rawMsg.includes("self")) {
    return "A course cannot be added as a module to itself.";
  }
  if (rawMsg.includes("already added")) {
    return "This course is already added as a module.";
  }
  if (rawMsg.includes("circular")) {
    return "This course cannot be added because it would create a circular course dependency.";
  }
  return "Unable to add the course module. Please try again.";
}
