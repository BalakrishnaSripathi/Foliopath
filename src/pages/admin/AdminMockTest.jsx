import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Save,
  X,
  Pencil,
  ClipboardList,
} from "lucide-react";
import { getModuleById } from "../../api/courseService";
import {
  getMockTests,
  createMockTest,
  updateMockTest,
  deleteMockTest,
  OPTION_LABELS,
} from "../../api/mockTestService";
import Header from "../../components/layout/Header";
import DeleteConfirmModal from "../../components/ui/DeleteConfirmModal";

const CODE_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "csharp",
  "html",
  "css",
  "sql",
];

const QUESTION_TYPES = ["TEXT", "CODE"];

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

const emptyTest = (displayOrder) => ({
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

function mapDeleteError(err) {
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
    return "Unable to delete this mock test because it is currently in use. Please remove or reassign related content before deleting.";
  }
  if (rawMsg.includes("forbidden") || rawMsg.includes("unauthorized")) {
    return "You do not have permission to perform this action. Please contact your administrator.";
  }
  if (rawMsg.includes("not found") || rawMsg.includes("no longer exists")) {
    return "The requested item no longer exists. It may have already been deleted.";
  }
  return (msg || "Failed to delete this mock test. Please try again.").replace(/^Error:\s*/i, "");
}

export default function AdminMockTest() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const [moduleInfo, setModuleInfo] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedTestId, setExpandedTestId] = useState(null);
  const [formState, setFormState] = useState(null); // { testId | null, initial }
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, moduleId]);

  const loadData = async () => {
    try {
      const [modRes, testsRes] = await Promise.all([
        getModuleById(courseId, moduleId).catch(() => ({ data: null })),
        getMockTests(moduleId),
      ]);
      setModuleInfo(modRes.data);
      setTests(testsRes.data);
    } catch (err) {
      console.error("Failed to load mock tests:", err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setExpandedTestId(null);
    setFormState({
      testId: null,
      initial: emptyTest(tests.length + 1),
    });
  };

  const openEdit = (test) => {
    setExpandedTestId(null);
    setFormState({
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

  const handleSave = async (form) => {
    if (!formState) return;
    setSaving(true);
    try {
      if (formState.testId) {
        await updateMockTest(formState.testId, form);
      } else {
        await createMockTest(moduleId, form);
      }
      await loadData();
      setFormState(null);
    } catch (err) {
      console.error("Failed to save mock test:", err);
      alert(err.message || "Failed to save mock test");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (test) => {
    setDeleteModal({
      type: "mocktest",
      title: "Delete Mock Test",
      entityName: test.title,
      entityType: "mock test",
      metaFields: [
        { label: "Test ID", value: `${test.id || ""}` },
        { label: "Questions", value: (test.questions || []).length > 0 ? `${(test.questions || []).length}` : "" },
        { label: "Duration", value: test.durationMinutes ? `${test.durationMinutes} min` : "" },
        { label: "Pass %", value: test.passPercentage != null ? `${test.passPercentage}%` : "" },
      ],
      onConfirm: async () => {
        try {
          await deleteMockTest(test.id);
          await loadData();
          setDeleteModal(null);
          toast.success(`Mock test "${test.title}" was deleted successfully.`);
        } catch (err) {
          throw new Error(mapDeleteError(err));
        }
      },
    });
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
          onClick={() => navigate(`/admin/courses/${courseId}/content`)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#00A86B] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Course Content
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0B2545]">Mock Tests</h1>
            <p className="text-sm text-slate-500 mt-1">
              {moduleInfo?.title
                ? `Module ${moduleInfo.displayOrder}: ${moduleInfo.title}`
                : "Loading module..."}{" "}
              &middot; {tests.length} tests
            </p>
          </div>
          <button
            onClick={openCreate}
            disabled={!!formState}
            className="flex items-center gap-2 bg-[#00A86B] hover:bg-[#008f5a] text-white font-semibold px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Mock Test
          </button>
        </div>

        {formState && !formState.testId && (
          <div className="mb-6 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-3 bg-[#00A86B]/5 text-sm font-semibold text-[#0B2545]">
              New Mock Test
            </div>
            <MockTestForm
              initial={formState.initial}
              onSave={handleSave}
              onCancel={() => setFormState(null)}
              saving={saving}
            />
          </div>
        )}

        <div className="space-y-4">
          {tests
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
            .map((test) => {
              const isEditing = formState?.testId === test.id;

              return (
                <div
                  key={test.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                >
                  <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-100">
                    <button
                      onClick={() =>
                        setExpandedTestId(
                          expandedTestId === test.id ? null : test.id
                        )
                      }
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      {expandedTestId === test.id ? (
                        <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      )}
                      <ClipboardList className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="font-bold text-[#0B2545] truncate">
                        {test.title}
                      </span>
                    </button>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <button
                        onClick={() => openEdit(test)}
                        className="text-xs font-semibold text-blue-600 hover:underline px-2 flex items-center gap-1"
                      >
                        <Pencil className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(test)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {!isEditing && (
                    <div className="px-4 py-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{(test.questions || []).length} questions</span>
                      <span>&middot;</span>
                      <span>{test.durationMinutes} min</span>
                      <span>&middot;</span>
                      <span>Pass: {test.passPercentage}%</span>
                      {(test.questions || []).length > 0 &&
                        expandedTestId !== test.id && (
                          <>
                            <span>&middot;</span>
                            <button
                              onClick={() =>
                                setExpandedTestId(expandedTestId === test.id ? null : test.id)
                              }
                              className="text-[#00A86B] font-semibold hover:underline"
                            >
                              View questions
                            </button>
                          </>
                        )}
                    </div>
                  )}

                  {!isEditing && expandedTestId === test.id && (
                    <div className="border-t border-slate-100 p-4 space-y-3">
                      {test.description && (
                        <p className="text-sm text-slate-500">{test.description}</p>
                      )}
                      {(test.questions || [])
                        .sort(
                          (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
                        )
                        .map((q, idx) => (
                          <div
                            key={q.id || idx}
                            className="border border-slate-200 rounded-xl p-3 space-y-2"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400 font-mono flex-shrink-0">
                                Q{q.displayOrder || idx + 1}
                              </span>
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${
                                  q.questionType === "CODE"
                                    ? "bg-purple-50 text-purple-600"
                                    : "bg-blue-50 text-blue-600"
                                }`}
                              >
                                {q.questionType}
                              </span>
                              <span className="text-sm font-semibold text-[#0B2545] truncate">
                                {q.questionText}
                              </span>
                            </div>

                            {q.codeContent && (
                              <pre className="text-xs font-mono bg-[#0B2545] text-green-400 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
                                {q.codeContent}
                              </pre>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {(q.options || []).map((opt) => (
                                <div
                                  key={opt.label}
                                  className={`text-xs px-2 py-1.5 rounded-lg border ${
                                    opt.label === q.correctOption
                                      ? "bg-green-50 border-green-200 text-green-700 font-semibold"
                                      : "bg-white border-slate-200 text-slate-600"
                                  }`}
                                >
                                  <span className="font-bold mr-1">{opt.label}.</span>
                                  {opt.text}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}

                      {(test.questions || []).length === 0 && (
                        <p className="text-sm text-slate-400 text-center py-2">
                          No questions yet. Click &quot;Edit&quot; to add some.
                        </p>
                      )}
                    </div>
                  )}

                  {isEditing && (
                    <MockTestForm
                      initial={formState.initial}
                      onSave={handleSave}
                      onCancel={() => setFormState(null)}
                      saving={saving}
                    />
                  )}
                </div>
              );
            })}
        </div>

        {tests.length === 0 && !formState && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">
              No mock tests yet for this module.
            </p>
            <button
              onClick={openCreate}
              className="text-[#00A86B] font-semibold hover:underline"
            >
              Create your first mock test
            </button>
          </div>
        )}
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
          metaFields={deleteModal.metaFields}
          onConfirm={deleteModal.onConfirm}
        />
      )}
    </div>
  );
}
