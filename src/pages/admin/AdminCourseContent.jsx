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
  ClipboardList,
} from "lucide-react";
import {
  getCourseById,
  getModules,
  addModule,
  updateModule,
  deleteModule,
  getLessons,
  addLesson,
  updateLesson,
  deleteLesson,
  reorderModules,
  reorderLessons,
} from "../../api/courseService";
import {
  getMockTests,
  createMockTest,
  updateMockTest,
  deleteMockTest,
  OPTION_LABELS,
} from "../../api/mockTestService";
import RichTextEditor from "../../components/RichTextEditor";
import useListMovable from "../../hooks/useListMovable";

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
const QUESTION_TYPES = ["TEXT", "CODE"];

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
  lessonType: "TEXT_AND_CODE",
  contentType: "TEXT_AND_CODE",
  content: "",
  codeContent: "",
  codeLanguage: "javascript",
  documentUrl: "",
  displayOrder,
  estimatedMinutes: 15,
  items: [],
});

const emptyQuestion = (displayOrder) => ({
  questionType: "TEXT",
  questionText: "",
  codeContent: "",
  codeLanguage: "javascript",
  options: [
    { label: "A", text: "" },
    { label: "B", text: "" },
    { label: "C", text: "" },
    { label: "D", text: "" },
  ],
  correctOption: "A",
  displayOrder,
});

const emptyTestForm = (displayOrder) => ({
  title: "",
  description: "",
  durationMinutes: 15,
  passPercentage: 50,
  displayOrder,
  questions: [],
});

function QuestionEditor({ question, index, onChange, onRemove }) {
  const set = (field) => (e) =>
    onChange({ ...question, [field]: e.target.value });

  const setOptionText = (optIndex, value) => {
    onChange({
      ...question,
      options: question.options.map((opt, i) =>
        i === optIndex ? { ...opt, text: value } : opt
      ),
    });
  };

  const inputCls =
    "w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:border-[#00A86B] focus:outline-none";
  const labelCls =
    "block text-xs font-semibold text-slate-500 uppercase mb-1 tracking-wide";

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500">
          Question {index + 1}
        </span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1 text-red-400 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>Question Type *</label>
          <select value={question.questionType} onChange={set("questionType")} className={inputCls}>
            {QUESTION_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        {question.questionType === "CODE" && (
          <div>
            <label className={labelCls}>Code Language</label>
            <select value={question.codeLanguage} onChange={set("codeLanguage")} className={inputCls}>
              {CODE_LANGUAGES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div>
        <label className={labelCls}>
          {question.questionType === "CODE"
            ? "Question / Instructions *"
            : "Question *"}
        </label>
        <textarea
          value={question.questionText}
          onChange={set("questionText")}
          rows={2}
          className={`${inputCls} resize-y`}
          placeholder={
            question.questionType === "CODE"
              ? "e.g. What does this code print?"
              : "Type the question here"
          }
        />
      </div>

      {question.questionType === "CODE" && (
        <div>
          <label className={labelCls}>Code Snippet</label>
          <textarea
            value={question.codeContent}
            onChange={set("codeContent")}
            rows={5}
            className="w-full px-3 py-2 text-sm font-mono bg-[#0B2545] text-green-400 rounded-lg border border-slate-700 focus:outline-none resize-y"
            placeholder="// Code shown to the student"
          />
        </div>
      )}

      <div>
        <label className={labelCls}>Options (exactly 4) &amp; Correct Answer *</label>
        <div className="space-y-2">
          {question.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onChange({ ...question, correctOption: OPTION_LABELS[i] })}
                className={`w-8 h-8 flex-shrink-0 rounded-lg text-xs font-bold transition-colors ${
                  question.correctOption === OPTION_LABELS[i]
                    ? "bg-[#00A86B] text-white"
                    : "bg-white border border-slate-200 text-slate-400 hover:border-[#00A86B] hover:text-[#00A86B]"
                }`}
                title="Mark as correct answer"
              >
                {OPTION_LABELS[i]}
              </button>
              <input
                type="text"
                value={opt.text}
                onChange={(e) => setOptionText(i, e.target.value)}
                className={`${inputCls} ${
                  question.correctOption === OPTION_LABELS[i]
                    ? "border-[#00A86B]"
                    : ""
                }`}
                placeholder={`Option ${OPTION_LABELS[i]}`}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Click a letter button to mark the correct answer (green).
        </p>
      </div>
    </div>
  );
}

function MockTestForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const addQuestion = () => {
    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, emptyQuestion(prev.questions.length + 1)],
    }));
  };

  const updateQuestion = (index, updated) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === index ? updated : q)),
    }));
  };

  const removeQuestion = (index) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions
        .filter((_, i) => i !== index)
        .map((q, i) => ({ ...q, displayOrder: i + 1 })),
    }));
  };

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
            placeholder="e.g. Module 1 Practice Test"
          />
        </div>
        <div>
          <label className={labelCls}>Description</label>
          <input
            type="text"
            value={form.description}
            onChange={set("description")}
            className={inputCls}
            placeholder="Short description"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Duration (min)</label>
          <input
            type="number"
            min={1}
            value={form.durationMinutes}
            onChange={set("durationMinutes")}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Pass %</label>
          <input
            type="number"
            min={0}
            max={100}
            value={form.passPercentage}
            onChange={set("passPercentage")}
            className={inputCls}
          />
        </div>
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
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Questions ({form.questions.length})
          </label>
          <button
            type="button"
            onClick={addQuestion}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:border-[#00A86B] hover:text-[#00A86B] transition-all duration-200"
          >
            <Plus className="w-3 h-3" />
            Add Question
          </button>
        </div>

        {form.questions.length === 0 && (
          <p className="text-xs text-slate-400">
            No questions yet. Click &quot;Add Question&quot; to add one.
          </p>
        )}

        {form.questions.map((q, idx) => (
          <QuestionEditor
            key={idx}
            question={q}
            index={idx}
            onChange={(updated) => updateQuestion(idx, updated)}
            onRemove={() => removeQuestion(idx)}
          />
        ))}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => onSave(form)}
          disabled={
            saving ||
            !form.title.trim() ||
            form.questions.length === 0 ||
            form.questions.some(
              (q) => !q.questionText.trim() || q.options.some((o) => !o.text.trim())
            )
          }
          className="flex items-center gap-2 bg-[#00A86B] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#008f5a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-3 h-3" />
          {saving ? "Saving..." : "Save Mock Test"}
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
  const [lessonsByModule, setLessonsByModule] = useState({});
  const [mockTestsByModule, setMockTestsByModule] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState(null);
  const [formState, setFormState] = useState(null);
  const [mockTestFormState, setMockTestFormState] = useState(null);
  const [saving, setSaving] = useState(false);
  const [mockTestSaving, setMockTestSaving] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [showAddModule, setShowAddModule] = useState(false);
  const [movingModuleId, setMovingModuleId] = useState(null);
  const [movingLessonKey, setMovingLessonKey] = useState(null);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState("");

  const modulesMovable = useListMovable([], {
    movingId: movingModuleId,
    setMovingId: setMovingModuleId,
  });

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
      modulesMovable.setItems(modulesRes.data);
    } catch (err) {
      console.error("Failed to load:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveModule = async (moduleId, dir) => {
    const moved = dir === -1 ? modulesMovable.moveUp(moduleId) : modulesMovable.moveDown(moduleId);
    if (!moved) return;
    setMovingModuleId(moduleId);
    try {
      await reorderModules(courseId, moved);
    } catch (err) {
      console.error("Failed to reorder modules:", err);
      const { data } = await getModules(courseId);
      modulesMovable.setItems(data);
    } finally {
      setMovingModuleId(null);
    }
  };

  const handleMoveLesson = async (moduleId, lessonId, dir) => {
    const current = (lessonsByModule[moduleId] || []).slice().sort(
      (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
    );
    const idx = current.findIndex((l) => l.id === lessonId);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= current.length) return;
    [current[idx], current[target]] = [current[target], current[idx]];
    const reindexed = current.map((l, i) => ({ ...l, displayOrder: i + 1 }));
    setLessonsByModule((prev) => ({ ...prev, [moduleId]: reindexed }));
    setMovingLessonKey(`${moduleId}:${lessonId}`);
    try {
      await reorderLessons(moduleId, reindexed);
    } catch (err) {
      console.error("Failed to reorder lessons:", err);
      await loadLessons(moduleId);
    } finally {
      setMovingLessonKey(null);
    }
  };

  const startEditModule = (mod) => {
    setEditingModuleId(mod.id);
    setEditingModuleTitle(mod.title || "");
  };

  const cancelEditModule = () => {
    setEditingModuleId(null);
    setEditingModuleTitle("");
  };

  const saveModuleTitle = async (mod) => {
    const title = editingModuleTitle.trim();
    if (!title || title === mod.title) {
      cancelEditModule();
      return;
    }
    try {
      await updateModule(courseId, mod.id, {
        moduleCode: mod.moduleCode,
        title,
        description: mod.description || "",
        displayOrder: mod.displayOrder,
      });
      modulesMovable.setItems(
        modulesMovable.list.map((m) =>
          m.id === mod.id ? { ...m, title } : m
        )
      );
    } catch (err) {
      console.error("Failed to rename module:", err);
    } finally {
      cancelEditModule();
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

  const loadMockTests = async (moduleId) => {
    try {
      const { data } = await getMockTests(moduleId);
      setMockTestsByModule((prev) => ({ ...prev, [moduleId]: data }));
    } catch (err) {
      console.error("Failed to load mock tests:", err);
      setMockTestsByModule((prev) => ({ ...prev, [moduleId]: [] }));
    }
  };

  const handleToggleModule = (moduleId) => {
    const next = expandedModule === moduleId ? null : moduleId;
    setExpandedModule(next);
    if (next) {
      if (!lessonsByModule[moduleId]) loadLessons(moduleId);
      if (!mockTestsByModule[moduleId]) loadMockTests(moduleId);
    }
  };

  const refreshLessons = async (moduleId) => {
    await loadLessons(moduleId);
  };

  const refreshMockTests = async (moduleId) => {
    await loadMockTests(moduleId);
  };

  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) return;
    try {
      await addModule(courseId, {
        title: newModuleTitle,
        displayOrder: modulesMovable.list.length + 1,
      });
      setNewModuleTitle("");
      setShowAddModule(false);
      const { data } = await getModules(courseId);
      modulesMovable.setItems(data);
      const created = [...data].sort(
        (a, b) => (b.displayOrder || 0) - (a.displayOrder || 0)
      )[0];
      if (created) {
        setExpandedModule(created.id);
        loadLessons(created.id);
        loadMockTests(created.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!confirm("Delete this module and all its lessons?")) return;
    try {
      await deleteModule(courseId, moduleId);
      modulesMovable.setItems(modulesMovable.list.filter((m) => m.id !== moduleId));
      setLessonsByModule((prev) => {
        const next = { ...prev };
        delete next[moduleId];
        return next;
      });
      setMockTestsByModule((prev) => {
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
    setMockTestFormState(null);
    setFormState({
      moduleId: mod.id,
      lessonId: null,
      initial: emptyForm(count + 1),
    });
  };

  const openEditLesson = (mod, lesson) => {
    setMockTestFormState(null);
    setFormState({
      moduleId: mod.id,
      lessonId: lesson.id,
      initial: {
        lessonCode: lesson.lessonCode || "",
        title: lesson.title || "",
        description: lesson.description || "",
        lessonType: lesson.lessonType || "TEXT_AND_CODE",
        contentType: lesson.contentType || "TEXT_AND_CODE",
        content: lesson.content || "",
        codeContent: lesson.codeContent || "",
        codeLanguage: lesson.codeLanguage || "javascript",
        documentUrl: lesson.documentUrl || "",
        displayOrder: lesson.displayOrder || 1,
        estimatedMinutes: lesson.estimatedMinutes || 15,
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

  const openAddMockTest = (mod) => {
    const count = (mockTestsByModule[mod.id] || []).length;
    setFormState(null);
    setMockTestFormState({
      moduleId: mod.id,
      testId: null,
      initial: emptyTestForm(count + 1),
    });
  };

  const openEditMockTest = (mod, test) => {
    setFormState(null);
    setMockTestFormState({
      moduleId: mod.id,
      testId: test.id,
      initial: {
        title: test.title || "",
        description: test.description || "",
        durationMinutes: test.durationMinutes || 15,
        passPercentage: test.passPercentage || 50,
        displayOrder: test.displayOrder || 1,
        questions: (test.questions || []).map((q, i) => ({
          questionType: q.questionType || "TEXT",
          questionText: q.questionText || "",
          codeContent: q.codeContent || "",
          codeLanguage: q.codeLanguage || "javascript",
          options: (q.options || []).slice(0, 4).map((opt, j) => ({
            label: OPTION_LABELS[j],
            text: opt?.text || "",
          })),
          correctOption: q.correctOption || "A",
          displayOrder: q.displayOrder || i + 1,
        })),
      },
    });
  };

  const handleSaveMockTest = async (form) => {
    if (!mockTestFormState) return;
    setMockTestSaving(true);
    try {
      const { moduleId, testId } = mockTestFormState;
      if (testId) {
        await updateMockTest(testId, form);
      } else {
        await createMockTest(moduleId, form);
      }
      await refreshMockTests(moduleId);
      setMockTestFormState(null);
    } catch (err) {
      console.error("Failed to save mock test:", err);
      alert(err?.response?.data?.message || err?.message || "Failed to save mock test");
    } finally {
      setMockTestSaving(false);
    }
  };

  const handleDeleteMockTest = async (testId, moduleId) => {
    if (!confirm("Delete this mock test?")) return;
    try {
      await deleteMockTest(testId);
      await refreshMockTests(moduleId);
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
    <div>
      <button
        onClick={() => navigate("/admin/dashboard", { state: { active: "courses" } })}
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
              {course?.title} &middot; {modulesMovable.list.length} modules
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
          {modulesMovable.list
            .map((mod) => {
              const lessons = lessonsByModule[mod.id];
              const mockTests = mockTestsByModule[mod.id];
              const totalCount =
                (lessons?.length || 0) + (mockTests?.length || 0);
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
                        {totalCount > 0
                          ? `(${lessons?.length || 0} lessons, ${mockTests?.length || 0} mock tests)`
                          : "click to load"}
                      </span>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openAddMockTest(mod)}
                        className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Mock Test
                      </button>
                      <span className="text-slate-300 text-xs">|</span>
                      <button
                        onClick={() => openAddLesson(mod)}
                        className="text-xs font-semibold text-[#00A86B] hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Lesson
                      </button>
                      <span className="text-slate-300 text-xs">|</span>
                      <button
                        onClick={() => startEditModule(mod)}
                        title="Rename module"
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveModule(mod.id, -1)}
                          disabled={!modulesMovable.canMoveUp(mod.id) || movingModuleId !== null}
                          title="Move module up"
                          className="p-1.5 text-slate-500 hover:text-[#00A86B] hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveModule(mod.id, 1)}
                          disabled={!modulesMovable.canMoveDown(mod.id) || movingModuleId !== null}
                          title="Move module down"
                          className="p-1.5 text-slate-500 hover:text-[#00A86B] hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleDeleteModule(mod.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {editingModuleId === mod.id && (
                    <div className="p-4 bg-white border-b border-slate-100 flex items-center gap-3">
                      <input
                        type="text"
                        value={editingModuleTitle}
                        onChange={(e) => setEditingModuleTitle(e.target.value)}
                        placeholder="Module title"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveModuleTitle(mod);
                          if (e.key === "Escape") cancelEditModule();
                        }}
                        className="flex-1 px-4 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:border-[#00A86B] focus:outline-none"
                      />
                      <button
                        onClick={() => saveModuleTitle(mod)}
                        disabled={!editingModuleTitle.trim()}
                        className="bg-[#00A86B] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#008f5a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditModule}
                        className="text-slate-400 hover:text-slate-600 p-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {expandedModule === mod.id && (
                    <div className="p-4 space-y-3">
                      {!lessons && (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00A86B]" />
                        </div>
                      )}

                      {lessons && lessons.length === 0 && (!mockTests || mockTests.length === 0) && !formState && !mockTestFormState && (
                        <p className="text-sm text-slate-400 text-center py-4">
                          No lessons or mock tests yet. Click &quot;+ Lesson&quot; or &quot;+ Mock Test&quot; to add content.
                        </p>
                      )}

                      {lessons &&
                        [...lessons]
                          .sort(
                            (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
                          )
                          .map((lesson, lessonIndex) => {
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
                                      onClick={() => handleMoveLesson(mod.id, lesson.id, -1)}
                                      disabled={lessonIndex === 0 || movingLessonKey !== null}
                                      title="Move lesson up"
                                      className="p-1 text-slate-400 hover:text-[#00A86B] disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                      <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleMoveLesson(mod.id, lesson.id, 1)}
                                      disabled={lessonIndex === (lessons?.length || 0) - 1 || movingLessonKey !== null}
                                      title="Move lesson down"
                                      className="p-1 text-slate-400 hover:text-[#00A86B] disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                      <ArrowDown className="w-3.5 h-3.5" />
                                    </button>
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

                      {mockTests && mockTests.length > 0 && (
                        <div className="border-t border-slate-100 pt-3 mt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <ClipboardList className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              Mock Tests ({mockTests.length})
                            </span>
                          </div>
                          {mockTests
                            .sort(
                              (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
                            )
                            .map((test) => {
                              const isEditing = mockTestFormState?.testId === test.id;

                              return (
                                <div
                                  key={test.id}
                                  className="border border-slate-200 rounded-xl overflow-hidden mb-2"
                                >
                                  <div className="flex items-center justify-between p-3 bg-slate-50">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <span className="text-xs text-slate-400 font-mono flex-shrink-0">
                                        MT{test.displayOrder}
                                      </span>
                                      <ClipboardList className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                      <span className="text-sm font-semibold text-[#0B2545] truncate">
                                        {test.title}
                                      </span>
                                      <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded flex-shrink-0">
                                        {(test.questions || []).length} questions
                                      </span>
                                      <span className="text-xs text-slate-400 hidden sm:inline flex-shrink-0">
                                        {test.durationMinutes} min
                                      </span>
                                      <span className="text-xs text-slate-400 hidden sm:inline flex-shrink-0">
                                        Pass: {test.passPercentage}%
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      <button
                                        onClick={() => openEditMockTest(mod, test)}
                                        className="text-xs font-semibold text-blue-600 hover:underline px-2 flex items-center gap-1"
                                      >
                                        <Pencil className="w-3 h-3" />
                                        Edit
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteMockTest(test.id, mod.id)
                                        }
                                        className="p-1 text-red-400 hover:text-red-600"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>

                                  {isEditing && (
                                    <MockTestForm
                                      initial={mockTestFormState.initial}
                                      onSave={handleSaveMockTest}
                                      onCancel={() => setMockTestFormState(null)}
                                      saving={mockTestSaving}
                                    />
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      )}

                      {mockTestFormState?.moduleId === mod.id &&
                        !mockTestFormState.testId && (
                          <div className="border border-blue-300 rounded-xl overflow-hidden">
                            <div className="p-3 bg-blue-50 text-sm font-semibold text-[#0B2545]">
                              New Mock Test &mdash; Module {mod.displayOrder}:{" "}
                              {mod.title}
                            </div>
                            <MockTestForm
                              initial={mockTestFormState.initial}
                              onSave={handleSaveMockTest}
                              onCancel={() => setMockTestFormState(null)}
                              saving={mockTestSaving}
                            />
                          </div>
                        )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {modulesMovable.list.length === 0 && !showAddModule && (
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
  );
}
