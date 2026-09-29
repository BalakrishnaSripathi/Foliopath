import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  BookOpen,
  Briefcase,
  Code2,
  Filter,
  Lock,
  Search,
  CheckCircle2,
  CircleDot,
  Circle,
  Sparkles,
} from "lucide-react";
import {
  getProgrammingQuestions,
  getProgrammingQuestionAccess,
  LANGUAGE_LABELS,
} from "../../api/programmingQuestionService";
import ProgrammingQuestionView from "./ProgrammingQuestionView";

const DIFFICULTY_COLORS = {
  EASY: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
  MEDIUM: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  HARD: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
};

const DIFFICULTY_FILTERS = ["ALL", "EASY", "MEDIUM", "HARD"];
const STATUS_FILTERS = ["ALL", "NOT_ATTEMPTED", "ATTEMPTED", "ACCEPTED"];

const STATUS_LABELS = {
  NOT_ATTEMPTED: "Not attempted",
  ATTEMPTED: "Attempted",
  ACCEPTED: "Solved",
};

const STATUS_FILTER_LABELS = {
  ALL: "All",
  NOT_ATTEMPTED: "Not attempted",
  ATTEMPTED: "Attempted",
  ACCEPTED: "Solved",
};

function StatusMark({ status }) {
  if (status === "ACCEPTED") {
    return <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />;
  }
  if (status === "ATTEMPTED") {
    return <CircleDot className="w-4 h-4 text-amber-600 flex-shrink-0" />;
  }
  return <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />;
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
        active
          ? "bg-[#00A86B] text-white border-[#00A86B]"
          : "bg-white text-slate-500 border-slate-200 hover:border-[#00A86B] hover:text-[#00A86B]"
      }`}
    >
      {children}
    </button>
  );
}

function LockedState({ message, courseCount, kitCount }) {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto mt-10 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#0B2545] to-[#13315c] px-8 py-10 text-center text-white">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold">Programming Questions are locked</h2>
          <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
            {message ||
              "Enroll in at least one course or interview kit to unlock the full coding question bank."}
          </p>
        </div>

        <div className="p-8 space-y-4">
          <p className="text-sm text-slate-600">
            A single enrollment is enough. Pick whichever suits you:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/StudentDashboard/my-courses")}
              className="group text-left p-5 rounded-2xl border border-slate-200 hover:border-[#00A86B] hover:shadow-md transition-all"
            >
              <BookOpen className="w-5 h-5 text-[#00A86B] mb-3" />
              <p className="font-semibold text-[#0B2545] text-sm">Browse Courses</p>
              <p className="text-xs text-slate-400 mt-1">
                {courseCount > 0 ? `${courseCount} active enrollment` : "Pick a course to join"}
              </p>
            </button>

            <button
              onClick={() => navigate("/StudentDashboard/interview-kits")}
              className="group text-left p-5 rounded-2xl border border-slate-200 hover:border-[#00A86B] hover:shadow-md transition-all"
            >
              <Briefcase className="w-5 h-5 text-[#00A86B] mb-3" />
              <p className="font-semibold text-[#0B2545] text-sm">Browse Interview Kits</p>
              <p className="text-xs text-slate-400 mt-1">
                {kitCount > 0 ? `${kitCount} active enrollment` : "Pick a kit to join"}
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentProgrammingQuestions() {
  const { questionId } = useParams();
  const navigate = useNavigate();

  const [access, setAccess] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const loadAccess = useCallback(async () => {
    const { data } = await getProgrammingQuestionAccess();
    return data;
  }, []);

  const loadQuestions = useCallback(async () => {
    const { data } = await getProgrammingQuestions();
    setQuestions(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const accessData = await loadAccess();
        if (cancelled) return;
        setAccess(accessData);
        if (accessData?.hasAccess) {
          await loadQuestions();
        }
      } catch (err) {
        if (cancelled) return;
        if (err.response?.status === 403) {
          setAccess({ hasAccess: false, message: err.response?.data?.message });
        } else {
          toast.error(err.response?.data?.message || "Failed to load programming questions");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadAccess, loadQuestions]);

  const handleSubmissionComplete = useCallback((submittedQuestionId, nextStatus) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === submittedQuestionId ? { ...q, studentStatus: nextStatus } : q))
    );
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return questions.filter((q) => {
      if (difficulty !== "ALL" && q.difficulty !== difficulty) return false;
      if (status !== "ALL" && (q.studentStatus || "NOT_ATTEMPTED") !== status) return false;
      if (term && !`${q.title || ""} ${q.questionCode || ""}`.toLowerCase().includes(term)) {
        return false;
      }
      return true;
    });
  }, [questions, search, difficulty, status]);

  const stats = useMemo(() => {
    const solved = questions.filter((q) => q.studentStatus === "ACCEPTED").length;
    return { total: questions.length, solved, remaining: questions.length - solved };
  }, [questions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A86B]" />
      </div>
    );
  }

  if (access && !access.hasAccess) {
    return (
      <LockedState
        message={access.message}
        courseCount={access.enrolledCourseCount || 0}
        kitCount={access.enrolledKitCount || 0}
      />
    );
  }

  if (questionId) {
    return (
      <div className="p-6">
        <ProgrammingQuestionView
          questionId={questionId}
          onBack={() => navigate("/StudentDashboard/programming-questions")}
          onSubmissionComplete={handleSubmissionComplete}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B2545] flex items-center gap-2">
          <Code2 className="w-6 h-6 text-[#00A86B]" />
          Programming Questions
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Practice coding problems from the Foliopath360 question bank.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total</p>
          <p className="text-2xl font-bold text-[#0B2545] mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Solved</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.solved}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Remaining</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{stats.remaining}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or question code"
            className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
            <Filter className="w-3.5 h-3.5" /> Difficulty
          </div>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTY_FILTERS.map((d) => (
              <FilterChip key={d} active={difficulty === d} onClick={() => setDifficulty(d)}>
                {d === "ALL" ? "All" : d[0] + d.slice(1).toLowerCase()}
              </FilterChip>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
            <Filter className="w-3.5 h-3.5" /> Status
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((s) => (
              <FilterChip key={s} active={status === s} onClick={() => setStatus(s)}>
                {STATUS_FILTER_LABELS[s]}
              </FilterChip>
            ))}
          </div>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-center py-16 px-6">
          <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#0B2545]">No programming questions yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Your admin has not published any problems to the bank so far.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-center py-16 px-6">
          <p className="text-sm font-semibold text-[#0B2545]">No questions match your filters</p>
          <button
            onClick={() => {
              setSearch("");
              setDifficulty("ALL");
              setStatus("ALL");
            }}
            className="mt-3 text-xs font-semibold text-[#00A86B] hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((q) => {
            const diff = DIFFICULTY_COLORS[q.difficulty] || DIFFICULTY_COLORS.MEDIUM;
            const currentStatus = q.studentStatus || "NOT_ATTEMPTED";
            return (
              <button
                key={q.id}
                onClick={() => navigate(`/StudentDashboard/programming-questions/${q.id}`)}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-left hover:border-[#00A86B] hover:shadow-md transition-all duration-200 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">
                    {q.questionCode}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${diff.bg} ${diff.text}`}
                  >
                    {q.difficulty}
                  </span>
                </div>

                <p className="text-sm font-semibold text-[#0B2545] leading-snug group-hover:text-[#00A86B] transition-colors">
                  {q.title}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {(q.allowedLanguages || []).map((lang) => (
                    <span
                      key={lang}
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500"
                    >
                      {LANGUAGE_LABELS[lang] || lang}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1 mt-auto border-t border-slate-100">
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                    <StatusMark status={currentStatus} />
                    {STATUS_LABELS[currentStatus]}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {(q.testCases || []).length} test case
                    {(q.testCases || []).length === 1 ? "" : "s"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
