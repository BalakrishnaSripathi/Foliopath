import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Code2,
  EyeOff,
  Filter,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {
  LANGUAGE_LABELS,
  createProgrammingQuestion,
  deleteProgrammingQuestion,
  getProgrammingQuestions,
  updateProgrammingQuestion,
} from "../../api/programmingQuestionService";
import ProgrammingQuestionForm from "../../components/admin/ProgrammingQuestionForm";
import {
  DIFFICULTY_STYLES,
  emptyProgrammingQuestion,
  toProgrammingQuestionForm,
} from "../../components/admin/programmingQuestionFormMeta";
import DeleteConfirmModal from "../../components/ui/DeleteConfirmModal";

const DIFFICULTY_FILTERS = ["ALL", "EASY", "MEDIUM", "HARD"];

export default function AdminProgrammingQuestions() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formState, setFormState] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("ALL");

  const loadQuestions = useCallback(async () => {
    const { data } = await getProgrammingQuestions();
    setQuestions(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await loadQuestions();
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load programming questions");
      } finally {
        setLoading(false);
      }
    })();
  }, [loadQuestions]);

  const sorted = useMemo(
    () =>
      [...questions].sort(
        (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
      ),
    [questions]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return sorted.filter((q) => {
      if (difficulty !== "ALL" && q.difficulty !== difficulty) return false;
      if (term && !`${q.title || ""} ${q.questionCode || ""}`.toLowerCase().includes(term)) {
        return false;
      }
      return true;
    });
  }, [sorted, search, difficulty]);

  const openAdd = () =>
    setFormState({ questionId: null, initial: emptyProgrammingQuestion(sorted.length + 1) });

  const openEdit = (q) =>
    setFormState({ questionId: q.id, initial: toProgrammingQuestionForm(q) });

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (formState.questionId) {
        await updateProgrammingQuestion(formState.questionId, form);
      } else {
        await createProgrammingQuestion(form);
      }
      setFormState(null);
      await loadQuestions();
      toast.success("Programming question saved successfully.");
    } catch (err) {
      console.error("Failed to save programming question:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to save programming question");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (q) => {
    await deleteProgrammingQuestion(q.id);
    await loadQuestions();
    setDeleteTarget(null);
    toast.success(`Programming question "${q?.title || ""}" was deleted successfully.`);
  };

  const move = async (q, dir) => {
    const index = sorted.findIndex((item) => item.id === q.id);
    const target = index + dir;
    if (target < 0 || target >= sorted.length) return;

    const next = [...sorted];
    [next[index], next[target]] = [next[target], next[index]];

    setSaving(true);
    try {
      await Promise.all(
        next.map((item, i) =>
          updateProgrammingQuestion(item.id, {
            ...toProgrammingQuestionForm(item),
            displayOrder: i + 1,
          })
        )
      );
      await loadQuestions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reorder questions");
    } finally {
      setSaving(false);
    }
  };

  const stats = useMemo(() => {
    const testCases = questions.reduce((sum, q) => sum + (q.testCases || []).length, 0);
    const hidden = questions.reduce(
      (sum, q) => sum + (q.testCases || []).filter((tc) => tc.isPublic === false).length,
      0
    );
    return { total: questions.length, testCases, hidden };
  }, [questions]);

  return (
    <div>
      <button
        onClick={() => navigate("/admin/dashboard", { state: { active: "overview" } })}
        className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#00A86B] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0B2545] flex items-center gap-2">
            <Code2 className="w-6 h-6 text-[#00A86B]" />
            Programming Questions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Standalone question bank — shared by every student enrolled in a course or interview kit.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#00A86B] hover:bg-[#008f5a] text-white font-semibold px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Questions</p>
          <p className="text-2xl font-bold text-[#0B2545] mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Test cases</p>
          <p className="text-2xl font-bold text-[#0B2545] mt-1">{stats.testCases}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Hidden</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{stats.hidden}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or question code"
            className="flex-1 min-w-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide flex-shrink-0">
          <Filter className="w-3.5 h-3.5" /> Difficulty
        </div>
        <div className="flex flex-wrap gap-2">
          {DIFFICULTY_FILTERS.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                difficulty === d
                  ? "bg-[#00A86B] text-white border-[#00A86B]"
                  : "bg-white text-slate-500 border-slate-200 hover:border-[#00A86B] hover:text-[#00A86B]"
              }`}
            >
              {d === "ALL" ? "All" : d[0] + d.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {formState && (
          <ProgrammingQuestionForm
            initial={formState.initial}
            onSave={handleSave}
            onCancel={() => setFormState(null)}
            saving={saving}
          />
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#00A86B]" />
          </div>
        ) : questions.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10">
            No programming questions yet. Click &quot;Add Question&quot; to create the first one.
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10">No questions match your filters.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((q) => {
              const dqCls = DIFFICULTY_STYLES[q.difficulty] || DIFFICULTY_STYLES.MEDIUM;
              const tests = q.testCases || [];
              const hiddenCount = tests.filter((tc) => tc.isPublic === false).length;
              return (
                <div key={q.id} className="flex items-center justify-between gap-4 p-4 hover:bg-slate-50">
                  <div className="flex items-center gap-3 min-w-0">
                    <Code2 className="w-4 h-4 text-[#00A86B] flex-shrink-0" />
                    <span className="text-xs text-slate-400 font-mono flex-shrink-0">
                      {q.questionCode}
                    </span>
                    <span className="text-sm font-semibold text-[#0B2545] truncate">{q.title}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${dqCls}`}
                    >
                      {q.difficulty}
                    </span>
                    <span className="text-xs text-slate-400 flex-shrink-0 hidden sm:inline">
                      {tests.length} test case{tests.length === 1 ? "" : "s"}
                    </span>
                    {hiddenCount > 0 && (
                      <span
                        title={`${hiddenCount} hidden test case(s)`}
                        className="text-slate-400 flex-shrink-0"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <span className="text-xs text-slate-400 hidden lg:inline flex-shrink-0">
                      {(q.allowedLanguages || [])
                        .map((l) => LANGUAGE_LABELS[l] || l)
                        .join(", ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => move(q, -1)}
                      disabled={saving}
                      title="Move up"
                      className="p-1.5 text-slate-400 hover:text-[#00A86B] disabled:opacity-40"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => move(q, 1)}
                      disabled={saving}
                      title="Move down"
                      className="p-1.5 text-slate-400 hover:text-[#00A86B] disabled:opacity-40"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openEdit(q)}
                      className="text-xs font-semibold text-blue-600 hover:underline px-2 flex items-center gap-1"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() =>
                        setDeleteTarget({
                          title: "Delete Programming Question",
                          entityName: q.title,
                          entityType: "programming question",
                          description:
                            "This programming question and all of its test cases will be permanently deleted. This action cannot be undone.",
                          payload: q,
                        })
                      }
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <DeleteConfirmModal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={deleteTarget?.title}
        entityName={deleteTarget?.entityName}
        entityType={deleteTarget?.entityType}
        description={deleteTarget?.description}
        metaFields={
          deleteTarget
            ? [
                { label: "Code", value: deleteTarget.payload?.questionCode },
                { label: "Difficulty", value: deleteTarget.payload?.difficulty },
                {
                  label: "Test cases",
                  value: String((deleteTarget.payload?.testCases || []).length),
                },
              ]
            : []
        }
        onConfirm={() => handleDelete(deleteTarget.payload)}
      />
    </div>
  );
}
