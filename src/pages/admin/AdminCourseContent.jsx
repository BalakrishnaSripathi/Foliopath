import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Save,
  X,
  Code,
  Type,
  Heading1,
} from "lucide-react";
import {
  getCourseById,
  getModules,
  addModule,
  deleteModule,
  addLesson,
  updateLesson,
  deleteLesson,
} from "../../api/courseService";

function parseContent(content) {
  if (!content) return [];
  try {
    return JSON.parse(content);
  } catch {
    return [{ type: "text", body: content }];
  }
}

function ContentBlockEditor({ initialBlocks, onChange }) {
  const [blocks, setBlocks] = useState(initialBlocks);

  useEffect(() => {
    setBlocks(initialBlocks);
  }, [initialBlocks]);

  const addBlock = (type) => {
    const newBlock =
      type === "code"
        ? { type: "code", body: "// Write your code here", language: "javascript" }
        : type === "heading"
        ? { type: "heading", body: "New Heading" }
        : { type: "text", body: "New text content" };
    const updated = [...blocks, newBlock];
    setBlocks(updated);
    onChange(updated);
  };

  const updateBlock = (index, field, value) => {
    const updated = blocks.map((b, i) =>
      i === index ? { ...b, [field]: value } : b
    );
    setBlocks(updated);
    onChange(updated);
  };

  const removeBlock = (index) => {
    const updated = blocks.filter((_, i) => i !== index);
    setBlocks(updated);
    onChange(updated);
  };

  const moveBlock = (index, direction) => {
    const newBlocks = [...blocks];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
    [newBlocks[index], newBlocks[targetIndex]] = [
      newBlocks[targetIndex],
      newBlocks[index],
    ];
    setBlocks(newBlocks);
    onChange(newBlocks);
  };

  return (
    <div className="space-y-3">
      {blocks.map((block, idx) => (
        <div
          key={idx}
          className="bg-slate-50 border border-slate-200 rounded-xl p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              {block.type}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveBlock(idx, -1)}
                disabled={idx === 0}
                className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
              >
                <GripVertical className="w-3 h-3 rotate-90" />
              </button>
              <button
                type="button"
                onClick={() => moveBlock(idx, 1)}
                disabled={idx === blocks.length - 1}
                className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
              >
                <GripVertical className="w-3 h-3 -rotate-90" />
              </button>
              <button
                type="button"
                onClick={() => removeBlock(idx)}
                className="p-1 text-red-400 hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {block.type === "heading" && (
            <input
              type="text"
              value={block.body}
              onChange={(e) => updateBlock(idx, "body", e.target.value)}
              className="w-full px-3 py-2 text-sm font-bold bg-white rounded-lg border border-slate-200 focus:border-[#00A86B] focus:outline-none"
              placeholder="Heading text"
            />
          )}

          {block.type === "text" && (
            <textarea
              value={block.body}
              onChange={(e) => updateBlock(idx, "body", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:border-[#00A86B] focus:outline-none resize-none"
              placeholder="Text content"
            />
          )}

          {block.type === "code" && (
            <>
              <select
                value={block.language || "javascript"}
                onChange={(e) => updateBlock(idx, "language", e.target.value)}
                className="mb-2 px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:border-[#00A86B] focus:outline-none"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="sql">SQL</option>
                <option value="json">JSON</option>
                <option value="bash">Bash</option>
                <option value="typescript">TypeScript</option>
              </select>
              <textarea
                value={block.body}
                onChange={(e) => updateBlock(idx, "body", e.target.value)}
                rows={6}
                className="w-full px-3 py-2 text-sm font-mono bg-[#0B2545] text-green-400 rounded-lg border border-slate-700 focus:outline-none resize-none"
                placeholder="Code here"
              />
            </>
          )}
        </div>
      ))}

      <div className="flex items-center gap-2">
        {[
          { value: "heading", label: "Heading", icon: Heading1 },
          { value: "text", label: "Text", icon: Type },
          { value: "code", label: "Code", icon: Code },
        ].map((ct) => (
          <button
            key={ct.value}
            type="button"
            onClick={() => addBlock(ct.value)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:border-[#00A86B] hover:text-[#00A86B] transition-all duration-200"
          >
            <ct.icon className="w-3 h-3" />
            {ct.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AdminCourseContent() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonContents, setLessonContents] = useState({});
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

  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) return;
    try {
      await addModule(courseId, { title: newModuleTitle, orderIndex: modules.length + 1 });
      setNewModuleTitle("");
      setShowAddModule(false);
      const { data } = await getModules(courseId);
      setModules(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!confirm("Delete this module and all its lessons?")) return;
    try {
      await deleteModule(moduleId);
      setModules(modules.filter((m) => m.id !== moduleId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLesson = async (moduleId) => {
    try {
      const mod = modules.find((m) => m.id === moduleId);
      const lessonCount = mod?.lessons?.length || 0;
      await addLesson(moduleId, {
        title: "New Lesson",
        orderIndex: lessonCount + 1,
        content: "[]",
      });
      const { data } = await getModules(courseId);
      setModules(data);
      setExpandedModule(moduleId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveLesson = async (lessonId) => {
    try {
      const lesson = modules
        .flatMap((m) => m.lessons || [])
        .find((l) => l.id === lessonId);
      const content = lessonContents[lessonId] || parseContent(lesson.content);
      await updateLesson(lessonId, {
        title: lesson.title,
        content: JSON.stringify(content),
        orderIndex: lesson.orderIndex,
      });
      const { data } = await getModules(courseId);
      setModules(data);
      setEditingLesson(null);
      setLessonContents((prev) => {
        const next = { ...prev };
        delete next[lessonId];
        return next;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm("Delete this lesson?")) return;
    try {
      await deleteLesson(lessonId);
      const { data } = await getModules(courseId);
      setModules(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateLessonTitle = async (lessonId, newTitle) => {
    try {
      const lesson = modules
        .flatMap((m) => m.lessons || [])
        .find((l) => l.id === lessonId);
      await updateLesson(lessonId, {
        title: newTitle,
        content: lesson.content,
        orderIndex: lesson.orderIndex,
      });
      const { data } = await getModules(courseId);
      setModules(data);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#00A86B] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="flex items-center justify-between mb-6">
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
          {modules.map((mod) => (
            <div
              key={mod.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-100">
                <button
                  onClick={() =>
                    setExpandedModule(
                      expandedModule === mod.id ? null : mod.id
                    )
                  }
                  className="flex items-center gap-3 flex-1"
                >
                  {expandedModule === mod.id ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                  <span className="font-bold text-[#0B2545]">
                    Module {mod.orderIndex}: {mod.title}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({mod.lessons?.length || 0} lessons)
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAddLesson(mod.id)}
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
                  {(mod.lessons || []).length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4">
                      No lessons yet. Click "+ Lesson" to add one.
                    </p>
                  )}

                  {(mod.lessons || []).map((lesson) => {
                    const isEditing = editingLesson === lesson.id;
                    const currentContent =
                      lessonContents[lesson.id] || parseContent(lesson.content);

                    return (
                      <div
                        key={lesson.id}
                        className="border border-slate-200 rounded-xl overflow-hidden"
                      >
                        <div className="flex items-center justify-between p-3 bg-slate-50">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-xs text-slate-400 font-mono">
                              L{lesson.orderIndex}
                            </span>
                            {isEditing ? (
                              <input
                                type="text"
                                defaultValue={lesson.title}
                                onBlur={(e) =>
                                  handleUpdateLessonTitle(
                                    lesson.id,
                                    e.target.value
                                  )
                                }
                                className="text-sm font-semibold bg-white px-2 py-1 rounded border border-[#00A86B] focus:outline-none"
                                autoFocus
                              />
                            ) : (
                              <span className="text-sm font-semibold text-[#0B2545]">
                                {lesson.title}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                setEditingLesson(isEditing ? null : lesson.id)
                              }
                              className="text-xs font-semibold text-blue-600 hover:underline px-2"
                            >
                              {isEditing ? "Close" : "Edit Content"}
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(lesson.id)}
                              className="p-1 text-red-400 hover:text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {isEditing && (
                          <div className="p-4">
                            <ContentBlockEditor
                              initialBlocks={currentContent}
                              onChange={(newBlocks) =>
                                setLessonContents((prev) => ({
                                  ...prev,
                                  [lesson.id]: newBlocks,
                                }))
                              }
                            />
                            <button
                              onClick={() => handleSaveLesson(lesson.id)}
                              className="mt-3 flex items-center gap-2 bg-[#00A86B] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#008f5a] transition-colors"
                            >
                              <Save className="w-3 h-3" />
                              Save Content
                            </button>
                          </div>
                        )}

                        {!isEditing && currentContent.length > 0 && (
                          <div className="px-4 pb-3">
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              {currentContent.map((b, i) => (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.5 bg-slate-100 rounded"
                                >
                                  {b.type}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
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
