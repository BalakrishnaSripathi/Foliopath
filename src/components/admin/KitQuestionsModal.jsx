import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import {
  X,
  Plus,
  Pencil,
  Trash2,
  Code,
  FileText,
  Eye,
  EyeOff,
  Braces,
  Bold,
  GripVertical,
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  FolderOpen,
} from "lucide-react";
import {
  getKitById,
  addKitQuestion,
  updateKitQuestion,
  deleteKitQuestion,
  addKitModule,
  updateKitModule,
  deleteKitModule,
  reorderKitModules,
  reorderKitQuestions,
} from "../../api/interviewKitService";
import RenderAnswer from "./RenderAnswer";
import DeleteConfirmModal from "../ui/DeleteConfirmModal";

const FENCE = "\u0060\u0060\u0060";

// ─── Rich Answer Editor ─────────────────────────────────────────────

function RichAnswerEditor({ value, onChange, error }) {
  const [tab, setTab] = useState("write");
  const textareaRef = useRef(null);

  const insertAtCursor = useCallback(
    (before, after = "") => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = value.slice(start, end);
      const replacement = before + selected + after;
      const next = value.slice(0, start) + replacement + value.slice(end);
      onChange(next);
      setTimeout(() => {
        ta.focus();
        const pos = start + before.length + selected.length;
        ta.setSelectionRange(pos, pos);
      }, 0);
    },
    [value, onChange]
  );

  const insertCodeBlock = () => {
    const ta = textareaRef.current;
    const start = ta?.selectionStart ?? value.length;
    const before = value.slice(0, start);
    const needsNewline = before.length > 0 && !before.endsWith("\n\n");
    const prefix = needsNewline ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
    insertAtCursor(prefix + FENCE + "\n", "\n" + FENCE);
  };

  const insertInlineCode = () => {
    insertAtCursor("`", "`");
  };

  const insertBold = () => {
    insertAtCursor("**", "**");
  };

  return (
    <div className={`rounded-xl border overflow-hidden ${error ? "border-red-400" : "border-slate-200"}`}>
      <div className="flex items-center justify-between bg-slate-50 border-b border-slate-200 px-2 py-1.5">
        <div className="flex gap-1">
          <button
            onClick={() => setTab("write")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              tab === "write"
                ? "bg-white text-[#00A86B] shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Write
          </button>
          <button
            onClick={() => setTab("preview")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              tab === "preview"
                ? "bg-white text-[#00A86B] shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Preview
          </button>
        </div>
        {tab === "write" && (
          <div className="flex items-center gap-2">
            <button onClick={insertBold} title="Bold" className="text-slate-400 hover:text-slate-600 transition-colors">
              <Bold className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-200" />
            <button onClick={insertInlineCode} title="Inline code" className="text-slate-400 hover:text-slate-600 transition-colors">
              <Code className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-200" />
            <button onClick={insertCodeBlock} title="Insert code block" className="text-slate-400 hover:text-slate-600 transition-colors">
              <Braces className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      {tab === "write" ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3 py-2.5 text-sm bg-white resize-none focus:outline-none min-h-[100px] font-mono leading-relaxed ${error ? "border-red-400" : ""}`}
          rows={5}
          placeholder={"Type your answer here...\n\nUse the { } button to insert a code block.\nUse the ` button for inline code."}
        />
      ) : (
        <div className="px-3 py-3 bg-white min-h-[100px]">
          {value ? (
            <RenderAnswer content={value} />
          ) : (
            <p className="text-sm text-slate-400 italic">Nothing to preview</p>
          )}
        </div>
      )}
      {error && <p className="text-xs text-red-500 px-3 pb-2">{error}</p>}
      <div className="bg-slate-50 border-t border-slate-100 px-3 py-1.5">
        <p className="text-[10px] text-slate-400">
          Tip: Select text and click <Bold className="w-2.5 h-2.5 inline" /> for bold, <Code className="w-2.5 h-2.5 inline" /> for inline code, or <Braces className="w-2.5 h-2.5 inline" /> for a code block.
        </p>
      </div>
    </div>
  );
}

// ─── Question Form ──────────────────────────────────────────────────

function QuestionForm({ initial, isEdit, onSave, onCancel, modules, selectedModuleId }) {
  const [form, setForm] = useState({
    questionType: initial?.questionType || "TEXT",
    codeLanguage: initial?.codeLanguage || "",
    question: initial?.question || "",
    codeSnippet: initial?.codeSnippet || "",
    answer: initial?.answer || "",
    displayOrder: initial?.displayOrder || 0,
    moduleId: initial?.moduleId || selectedModuleId || "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!form.question.trim()) next.question = "Question is required";
    if (!form.answer.trim()) next.answer = "Answer is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    setError("");
    try {
      await onSave(form);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save question");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:border-[#00A86B] focus:bg-white focus:outline-none transition-all duration-200";

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#0B2545]">
          {isEdit ? "Edit Question" : "New Question"}
        </h3>
        <button onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600">
          Cancel
        </button>
      </div>
      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Question Type *</label>
          <select value={form.questionType} onChange={set("questionType")} className={inputCls}>
            <option value="TEXT">Text</option>
            <option value="CODE">Code</option>
          </select>
        </div>
        {form.questionType === "CODE" && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Code Language</label>
            <input type="text" value={form.codeLanguage} onChange={set("codeLanguage")} className={inputCls} placeholder="e.g. Java, Python, JavaScript" />
          </div>
        )}
      </div>
      {modules && modules.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Module</label>
          <select value={form.moduleId} onChange={set("moduleId")} className={inputCls}>
            <option value="">No Module (Unassigned)</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Question *</label>
        <textarea
          value={form.question}
          onChange={set("question")}
          className={`${inputCls} resize-none ${errors.question ? "border-red-400" : ""}`}
          rows={2}
          placeholder="Enter the interview question..."
        />
        {errors.question && <p className="text-xs text-red-500 mt-1">{errors.question}</p>}
      </div>
      {form.questionType === "CODE" && (
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Code Snippet</label>
          <textarea
            value={form.codeSnippet}
            onChange={set("codeSnippet")}
            className={`${inputCls} font-mono text-xs resize-none`}
            rows={4}
            placeholder="Paste code snippet here..."
          />
        </div>
      )}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Answer *</label>
        <RichAnswerEditor
          value={form.answer}
          onChange={(val) => setForm((prev) => ({ ...prev, answer: val }))}
          error={errors.answer}
        />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button onClick={onCancel} className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-4 py-1.5 bg-[#00A86B] hover:bg-[#008f5a] text-white text-xs font-bold rounded-lg shadow-md transition-all duration-200 disabled:opacity-60"
        >
          {saving ? "Saving..." : isEdit ? "Update" : "Add"}
        </button>
      </div>
    </div>
  );
}

// ─── Module Form ────────────────────────────────────────────────────

function ModuleForm({ initial, isEdit, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Module name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({ name: name.trim(), displayOrder: initial?.displayOrder || 0 });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save module");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:border-[#00A86B] focus:bg-white focus:outline-none transition-all duration-200";

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#0B2545]">
          {isEdit ? "Edit Module" : "New Module"}
        </h3>
        <button onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600">
          Cancel
        </button>
      </div>
      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
          {error}
        </div>
      )}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Module Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`${inputCls} ${error ? "border-red-400" : ""}`}
          placeholder="e.g. Core Java, OOP Concepts..."
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button onClick={onCancel} className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-4 py-1.5 bg-[#00A86B] hover:bg-[#008f5a] text-white text-xs font-bold rounded-lg shadow-md transition-all duration-200 disabled:opacity-60"
        >
          {saving ? "Saving..." : isEdit ? "Update" : "Add Module"}
        </button>
      </div>
    </div>
  );
}

// ─── Reorderable List Item ──────────────────────────────────────────

function ReorderableItem({ children, onMoveUp, onMoveDown, canUp, canDown, onDragStart, onDragOver, onDrop, dragId }) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", dragId);
        e.dataTransfer.effectAllowed = "move";
        onDragStart?.();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        onDragOver?.(e);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop?.(e.dataTransfer.getData("text/plain"));
      }}
      className="flex items-center gap-2"
    >
      <div className="flex flex-col gap-0.5 shrink-0 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500">
        <GripVertical className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">{children}</div>
      <div className="flex flex-col gap-0.5 shrink-0">
        <button
          onClick={onMoveUp}
          disabled={!canUp}
          title="Move up"
          className="w-6 h-6 rounded flex items-center justify-center transition-colors disabled:opacity-20 hover:bg-slate-100 text-slate-400"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onMoveDown}
          disabled={!canDown}
          title="Move down"
          className="w-6 h-6 rounded flex items-center justify-center transition-colors disabled:opacity-20 hover:bg-slate-100 text-slate-400"
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Modal ─────────────────────────────────────────────────────

export default function KitQuestionsModal({ kit, onClose }) {
  const [kitData, setKitData] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAnswers, setShowAnswers] = useState({});
  const [error, setError] = useState("");

  // Module state
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => {
    loadKit();
  }, []);

  const loadKit = async () => {
    setLoading(true);
    try {
      const { data } = await getKitById(kit.id);
      setKitData(data);
      setModules(data.modules || []);
      // Expand all modules by default
      const expanded = {};
      (data.modules || []).forEach((m) => {
        expanded[m.id] = true;
      });
      setExpandedModules(expanded);
    } catch (err) {
      console.error("Failed to load kit:", err);
      setError("Failed to load kit details");
    } finally {
      setLoading(false);
    }
  };

  // ── Module handlers ──

  const handleAddModule = async (form) => {
    try {
      await addKitModule(kit.id, { ...form, displayOrder: modules.length + 1 });
      setShowModuleForm(false);
      loadKit();
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateModule = async (moduleId, form) => {
    try {
      await updateKitModule(kit.id, moduleId, form);
      setEditingModule(null);
      loadKit();
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteModule = (mod) => {
    setDeleteModal({
      type: "kitmodule",
      title: "Delete Module",
      entityName: mod?.name || "Module",
      entityType: "module",
      metaFields: [
        { label: "Module ID", value: `${mod?.id || ""}` },
        { label: "Questions in Module", value: (mod?.questions || []).length > 0 ? `${(mod?.questions || []).length}` : "" },
      ],
      description:
        "Are you sure you want to delete this module? Questions inside will be moved to unassigned. This action cannot be undone.",
      onConfirm: async () => {
        try {
          await deleteKitModule(kit.id, mod.id);
          loadKit();
          setDeleteModal(null);
          toast.success(`Module "${mod?.name || ""}" was deleted successfully.`);
        } catch (err) {
          throw new Error(mapDeleteError("module", err));
        }
      },
    });
  };

  const handleReorderModules = async (newModules) => {
    setModules(newModules);
    try {
      await reorderKitModules(
        kit.id,
        newModules.map((m, i) => ({ name: m.name, displayOrder: i + 1 }))
      );
    } catch (err) {
      console.error("Failed to reorder modules:", err);
      loadKit();
    }
  };

  const moveModuleUp = (idx) => {
    if (idx <= 0) return;
    const next = [...modules];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    handleReorderModules(next.map((m, i) => ({ ...m, displayOrder: i + 1 })));
  };

  const moveModuleDown = (idx) => {
    if (idx >= modules.length - 1) return;
    const next = [...modules];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    handleReorderModules(next.map((m, i) => ({ ...m, displayOrder: i + 1 })));
  };

  const handleDragModule = (fromId, toId) => {
    if (fromId === toId) return;
    const fromIdx = modules.findIndex((m) => m.id === fromId);
    const toIdx = modules.findIndex((m) => m.id === toId);
    if (fromIdx < 0 || toIdx < 0) return;
    const next = [...modules];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    handleReorderModules(next.map((m, i) => ({ ...m, displayOrder: i + 1 })));
  };

  // ── Question handlers ──

  const handleAddQuestion = async (form) => {
    try {
      await addKitQuestion(kit.id, form);
      setShowAddForm(false);
      setSelectedModuleId(null);
      loadKit();
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateQuestion = async (questionId, form) => {
    try {
      await updateKitQuestion(kit.id, questionId, form);
      setEditingQuestion(null);
      loadKit();
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteQuestion = (question) => {
    setDeleteModal({
      type: "question",
      title: "Delete Question",
      entityName: question?.questionText || question?.title || "Question",
      entityType: "question",
      metaFields: [
        { label: "Question ID", value: `${question?.id || ""}` },
        { label: "Type", value: question?.type || "" },
      ],
      onConfirm: async () => {
        try {
          await deleteKitQuestion(kit.id, question.id);
          loadKit();
          setDeleteModal(null);
          toast.success(`Question was deleted successfully.`);
        } catch (err) {
          throw new Error(mapDeleteError("question", err));
        }
      },
    });
  };

  const moveQuestionUp = (moduleId, qIdx) => {
    const modQuestions = getModuleQuestions(moduleId);
    if (qIdx <= 0) return;
    const next = [...modQuestions];
    [next[qIdx - 1], next[qIdx]] = [next[qIdx], next[qIdx - 1]];
    updateQuestionOrder(next);
  };

  const moveQuestionDown = (moduleId, qIdx) => {
    const modQuestions = getModuleQuestions(moduleId);
    if (qIdx >= modQuestions.length - 1) return;
    const next = [...modQuestions];
    [next[qIdx], next[qIdx + 1]] = [next[qIdx + 1], next[qIdx]];
    updateQuestionOrder(next);
  };

  const handleDragQuestion = (moduleId, fromId, toId) => {
    const modQuestions = getModuleQuestions(moduleId);
    const fromIdx = modQuestions.findIndex((q) => q.id === fromId);
    const toIdx = modQuestions.findIndex((q) => q.id === toId);
    if (fromIdx < 0 || toIdx < 0) return;
    const next = [...modQuestions];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    updateQuestionOrder(next);
  };

  const updateQuestionOrder = async (newOrder) => {
    try {
      await reorderKitQuestions(kit.id, newOrder.map((q) => q.id));
      loadKit();
    } catch (err) {
      console.error("Failed to reorder questions:", err);
      loadKit();
    }
  };

  // ── Helpers ──

  const allQuestions = kitData?.questions || [];
  const unassignedQuestions = allQuestions.filter((q) => !q.moduleId);

  const getModuleQuestions = (moduleId) => {
    const mod = modules.find((m) => m.id === moduleId);
    return mod?.questions || [];
  };

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const totalQuestions = allQuestions.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-[#0B2545]">{kit.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {modules.length} module{modules.length !== 1 ? "s" : ""} · {totalQuestions} question{totalQuestions !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A86B]" />
            </div>
          ) : (
            <>
              {/* Action Buttons */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => {
                    setShowModuleForm(!showModuleForm);
                    setEditingModule(null);
                    setShowAddForm(false);
                    setEditingQuestion(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-[#0B2545] hover:bg-[#0a1e38] text-white shadow-md transition-all duration-150 active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Add Module
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(!showAddForm);
                    setEditingQuestion(null);
                    setShowModuleForm(false);
                    setEditingModule(null);
                    setSelectedModuleId(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-[#00A86B] hover:bg-[#008f5a] text-white shadow-md transition-all duration-150 active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Add Question
                </button>
              </div>

              {/* Module Form */}
              {showModuleForm && (
                <ModuleForm
                  initial={editingModule}
                  isEdit={!!editingModule}
                  onSave={
                    editingModule
                      ? (form) => handleUpdateModule(editingModule.id, form)
                      : handleAddModule
                  }
                  onCancel={() => {
                    setShowModuleForm(false);
                    setEditingModule(null);
                  }}
                />
              )}

              {/* Add/Edit Question Form */}
              {(showAddForm || editingQuestion) && (
                <QuestionForm
                  initial={editingQuestion}
                  isEdit={!!editingQuestion}
                  modules={modules}
                  selectedModuleId={selectedModuleId}
                  onSave={
                    editingQuestion
                      ? (form) => handleUpdateQuestion(editingQuestion.id, form)
                      : handleAddQuestion
                  }
                  onCancel={() => {
                    setShowAddForm(false);
                    setEditingQuestion(null);
                    setSelectedModuleId(null);
                  }}
                />
              )}

              {/* Modules List */}
              {modules.length === 0 && unassignedQuestions.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <FolderOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No modules or questions yet.</p>
                  <p className="text-xs mt-1">Add a module first, then add questions inside it.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Modules with drag-and-drop */}
                  {modules.map((mod, modIdx) => (
                    <div key={mod.id} className="border border-slate-200 rounded-xl overflow-hidden">
                      {/* Module Header */}
                      <ReorderableItem
                        dragId={mod.id}
                        canUp={modIdx > 0}
                        canDown={modIdx < modules.length - 1}
                        onMoveUp={() => moveModuleUp(modIdx)}
                        onMoveDown={() => moveModuleDown(modIdx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(fromId) => handleDragModule(fromId, mod.id)}
                      >
                        <div
                          className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
                          onClick={() => toggleModule(mod.id)}
                        >
                          {expandedModules[mod.id] ? (
                            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />
                          <span className="text-sm font-bold text-[#0B2545] flex-1 truncate">
                            {mod.name}
                          </span>
                          <span className="text-xs font-mono text-slate-400 shrink-0">
                            {(mod.questions || []).length} question{(mod.questions || []).length !== 1 ? "s" : ""}
                          </span>
                          <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                setEditingModule(mod);
                                setShowModuleForm(true);
                                setShowAddForm(false);
                                setEditingQuestion(null);
                              }}
                              title="Edit Module"
                              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 hover:opacity-80"
                              style={{ color: "#0B2545", background: "#0B254515" }}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteModule(mod)}
                              title="Delete Module"
                              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 hover:opacity-80"
                              style={{ color: "#ef4444", background: "#ef444415" }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setShowAddForm(true);
                                setSelectedModuleId(mod.id);
                                setEditingQuestion(null);
                                setShowModuleForm(false);
                              }}
                              title="Add Question to Module"
                              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 hover:opacity-80"
                              style={{ color: "#00A86B", background: "#00A86B15" }}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </ReorderableItem>

                      {/* Module Questions */}
                      {expandedModules[mod.id] && (
                        <div className="p-3 space-y-2">
                          {(mod.questions || []).length === 0 ? (
                            <div className="text-center py-6 text-slate-400 text-xs">
                              No questions in this module. Click + to add one.
                            </div>
                          ) : (
                            (mod.questions || []).map((q, qIdx) => (
                              <ReorderableItem
                                key={q.id}
                                dragId={q.id}
                                canUp={qIdx > 0}
                                canDown={qIdx < (mod.questions || []).length - 1}
                                onMoveUp={() => moveQuestionUp(mod.id, qIdx)}
                                onMoveDown={() => moveQuestionDown(mod.id, qIdx)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(fromId) => handleDragQuestion(mod.id, fromId, q.id)}
                              >
                                <QuestionItem
                                  q={q}
                                  idx={qIdx}
                                  showAnswers={showAnswers}
                                  setShowAnswers={setShowAnswers}
                                  onEdit={() => {
                                    setEditingQuestion(q);
                                    setShowAddForm(false);
                                    setShowModuleForm(false);
                                  }}
                                  onDelete={() => handleDeleteQuestion(q)}
                                />
                              </ReorderableItem>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Unassigned Questions */}
                  {unassignedQuestions.length > 0 && (
                    <div className="border border-dashed border-slate-300 rounded-xl overflow-hidden">
                      <div className="flex items-center gap-2 p-3 bg-slate-50">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-500">Unassigned Questions</span>
                        <span className="text-xs font-mono text-slate-400">
                          {unassignedQuestions.length}
                        </span>
                      </div>
                      <div className="p-3 space-y-2">
                        {unassignedQuestions.map((q, qIdx) => (
                          <QuestionItem
                            key={q.id}
                            q={q}
                            idx={qIdx}
                            showAnswers={showAnswers}
                            setShowAnswers={setShowAnswers}
                            onEdit={() => {
                              setEditingQuestion(q);
                              setShowAddForm(false);
                              setShowModuleForm(false);
                            }}
                            onDelete={() => handleDeleteQuestion(q)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-5 border-t border-slate-100 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
          >
            Close
          </button>
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
          onConfirm={deleteModal.onConfirm}
        />
      )}
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
      ? "Unable to delete this module because it is currently in use. Please remove or reassign related content before deleting."
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

// ─── Question Item ──────────────────────────────────────────────────

function QuestionItem({ q, idx, showAnswers, setShowAnswers, onEdit, onDelete }) {
  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {q.questionType === "CODE" ? (
            <Code className="w-4 h-4 text-blue-500 shrink-0" />
          ) : (
            <FileText className="w-4 h-4 text-green-500 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#0B2545] truncate">
              Q{idx + 1}. {q.question}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  q.questionType === "CODE"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-green-50 text-green-600"
                }`}
              >
                {q.questionType}
              </span>
              {q.codeLanguage && (
                <span className="text-[10px] font-mono text-slate-400">
                  {q.codeLanguage}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() =>
              setShowAnswers((prev) => ({
                ...prev,
                [q.id]: !prev[q.id],
              }))
            }
            title={showAnswers[q.id] ? "Hide answer" : "Show answer"}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 hover:opacity-80"
            style={{
              color: showAnswers[q.id] ? "#00A86B" : "#94a3b8",
              background: showAnswers[q.id] ? "#00A86B15" : "#f1f5f9",
            }}
          >
            {showAnswers[q.id] ? (
              <Eye className="w-3.5 h-3.5" />
            ) : (
              <EyeOff className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={onEdit}
            title="Edit"
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 hover:opacity-80"
            style={{ color: "#0B2545", background: "#0B254515" }}
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            title="Delete"
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 hover:opacity-80"
            style={{ color: "#ef4444", background: "#ef444415" }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded: code snippet + answer */}
      {(q.codeSnippet || showAnswers[q.id]) && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-3">
          {q.codeSnippet && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">
                Code Snippet:
              </p>
              <pre className="text-xs font-mono bg-[#0B2545] text-green-400 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap">
                {q.codeSnippet}
              </pre>
            </div>
          )}
          {showAnswers[q.id] && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">
                Answer:
              </p>
              <div className="bg-white rounded-xl p-3 border border-slate-100">
                <RenderAnswer content={q.answer} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
