import { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Code2,
  Play,
  Send,
  AlertCircle,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  XCircle,
  Timer,
  DatabaseZap,
  Eye,
  EyeOff,
  RotateCcw,
  Maximize2,
  Minimize2,
  FileText,
  TableProperties,
  History,
  Clock,
} from "lucide-react";
import {
  getProgrammingQuestion,
  runProgrammingQuestion,
  submitProgrammingQuestion,
  getProgrammingQuestionSubmissions,
  LANGUAGE_LABELS,
} from "../../api/programmingQuestionService";
import CodeEditor from "../../components/CodeEditor";

const MONACO_LANGUAGE = { JAVA: "java", PYTHON: "python", JAVASCRIPT: "javascript" };

const DIFFICULTY_COLORS = {
  EASY: { bg: "bg-green-100", text: "text-green-700" },
  MEDIUM: { bg: "bg-amber-100", text: "text-amber-700" },
  HARD: { bg: "bg-red-100", text: "text-red-700" },
};

const STARTER_CODE = {
  JAVA:
    "public class Main {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}",
  PYTHON: "# Write your solution here\n",
  JAVASCRIPT: "// Write your solution here\n",
};

const VERDICT_META = {
  ACCEPTED: { label: "Accepted", text: "text-green-700", bg: "bg-green-50", icon: CheckCircle2 },
  WRONG_ANSWER: { label: "Wrong Answer", text: "text-red-600", bg: "bg-red-50", icon: XCircle },
  COMPILATION_ERROR: { label: "Compilation Error", text: "text-amber-700", bg: "bg-amber-50", icon: AlertTriangle },
  RUNTIME_ERROR: { label: "Runtime Error", text: "text-red-600", bg: "bg-red-50", icon: XCircle },
  TIME_LIMIT_EXCEEDED: { label: "Time Limit Exceeded", text: "text-orange-700", bg: "bg-orange-50", icon: Timer },
  MEMORY_LIMIT_EXCEEDED: { label: "Memory Limit Exceeded", text: "text-purple-700", bg: "bg-purple-50", icon: DatabaseZap },
};

const normalizeRunOutput = (v) =>
  v == null ? "" : String(v).replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();

const outputsMatch = (a, b) => normalizeRunOutput(a) === normalizeRunOutput(b);

const looksLikeHtml = (str) => /<\/?[a-z][\s\S]*>/i.test(str || "");

function RichContent({ content, className = "" }) {
  if (!content) return null;
  if (looksLikeHtml(content)) {
    return (
      <div
        className={`rich-text-content ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
  return <div className={`whitespace-pre-wrap ${className}`}>{content}</div>;
}

function SectionLabel({ children }) {
  return (
    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
      {children}
    </p>
  );
}

function SampleBlock({ label, value }) {
  if (!value) return null;
  return (
    <div className="mb-4">
      <SectionLabel>{label}</SectionLabel>
      <pre className="text-xs font-mono bg-[#0B2545] text-green-400 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap">
        {value}
      </pre>
    </div>
  );
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const then = new Date(dateStr);
  const diffMs = Date.now() - then.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return then.toLocaleDateString();
}

function formatDateTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function useIsDesktop(query = "(min-width: 1280px)") {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

export function VerdictBadge({ status, showLabel = true }) {
  const meta = VERDICT_META[status] || VERDICT_META.WRONG_ANSWER;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${meta.bg} ${meta.text}`}>
      <Icon className="w-3 h-3" />
      {showLabel ? meta.label : ""}
    </span>
  );
}

function DetailBlock({ label, value, error, loading }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <div className="rounded-lg bg-slate-100 border border-slate-200 px-3.5 py-2.5">
        {loading ? (
          <span className="flex items-center gap-2 text-xs text-slate-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Running&hellip;
          </span>
        ) : error ? (
          <pre className="text-xs font-mono whitespace-pre-wrap text-red-600">{error}</pre>
        ) : value == null || String(value).trim() === "" ? (
          <span className="text-xs text-slate-400">(empty)</span>
        ) : (
          <pre className="text-xs font-mono whitespace-pre-wrap text-slate-800 leading-relaxed">{value}</pre>
        )}
      </div>
    </div>
  );
}

function TestResultPanel({
  result,
  isRun,
  testCases,
  runOutput,
  runError,
  fetchOutput,
  customInput,
  onCustomInputChange,
  sampleInput,
  fluid,
}) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [outputCache, setOutputCache] = useState({});
  const [loadingCaseKey, setLoadingCaseKey] = useState(null);
  const [detailTab, setDetailTab] = useState("result");

  const caseRows = useMemo(() => {
    if (!result) return [];
    const tcs = testCases || [];
    return (result.caseResults || []).map((cr) => {
      const tc = tcs[cr.caseNumber - 1];
      const publicDetail = !!tc && tc.isPublic !== false;
      return {
        ...cr,
        input: cr.input != null ? cr.input : publicDetail ? tc.input : undefined,
        expectedOutput:
          cr.expectedOutput != null ? cr.expectedOutput : publicDetail ? tc.expectedOutput : undefined,
        publicDetail,
      };
    });
  }, [result, testCases]);

  const selectCase = async (idx) => {
    const row = caseRows[idx];
    if (!row) return;
    setSelectedIdx(idx);
    if (!row.publicDetail || isRun || row.output != null) return;
    const key = row.caseNumber;
    if (outputCache[key] || loadingCaseKey === key) return;
    if (row.passed) {
      setOutputCache((prev) =>
        prev[key] ? prev : { ...prev, [key]: { output: row.expectedOutput, error: null, success: true } }
      );
      return;
    }
    setLoadingCaseKey(key);
    try {
      const data = await fetchOutput(row.input);
      setOutputCache((prev) => ({ ...prev, [key]: data }));
    } catch {
      setOutputCache((prev) => ({
        ...prev,
        [key]: { output: "", error: "Failed to fetch output", success: false },
      }));
    } finally {
      setLoadingCaseKey((k) => (k === key ? null : k));
    }
  };

  useEffect(() => {
    setSelectedIdx(0);
    setOutputCache({});
    setLoadingCaseKey(null);
    if (!result || caseRows.length === 0) return;
    const failedIdx = caseRows.findIndex((r) => !r.passed);
    const targetIdx = failedIdx >= 0 ? failedIdx : 0;
    setSelectedIdx(targetIdx);
    selectCase(targetIdx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, caseRows.length]);

  const meta = VERDICT_META[result?.verdict] || VERDICT_META.WRONG_ANSWER;
  const VerdictIcon = meta.icon;
  const showResult = !!result;
  const selectedRow = caseRows[selectedIdx] || null;
  const selectedCache =
    selectedRow && selectedRow.output != null
      ? { output: selectedRow.output, error: selectedRow.error, success: !!selectedRow.success }
      : selectedRow
        ? outputCache[selectedRow.caseNumber]
        : undefined;
  const selectedLoading = loadingCaseKey === (selectedRow?.caseNumber ?? -1);

  return (
    <div
      className={`border rounded-2xl overflow-hidden ${
        runError ? "border-red-200" : "border-slate-200"
      } ${fluid ? "h-full flex flex-col" : ""}`}
    >
      {/* LeetCode-style tab header */}
      <div className="flex items-stretch border-b border-slate-200 bg-slate-50/80 px-3 shrink-0">
        <button
          type="button"
          onClick={() => setDetailTab("testcase")}
          className={`px-3 py-2 text-xs font-bold transition-colors border-b-2 ${
            detailTab === "testcase"
              ? "text-[#0B2545] border-[#00A86B]"
              : "text-slate-500 border-transparent hover:text-slate-700"
          }`}
        >
          Testcase
        </button>
        <button
          type="button"
          onClick={() => setDetailTab("result")}
          className={`px-3 py-2 text-xs font-bold transition-colors border-b-2 ${
            detailTab === "result"
              ? "text-[#0B2545] border-[#00A86B]"
              : "text-slate-500 border-transparent hover:text-slate-700"
          }`}
        >
          <span className="mr-1 font-mono">{">_"}</span> Test Result
        </button>
      </div>

      {/* Body */}
      <div className={fluid ? "flex-1 min-h-0 overflow-y-auto" : "max-h-60 overflow-y-auto"}>
        {detailTab === "testcase" ? (
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Custom Input</p>
              {sampleInput && (
                <button
                  type="button"
                  onClick={() => onCustomInputChange(sampleInput)}
                  className="text-[11px] font-semibold text-blue-600 hover:underline shrink-0"
                >
                  Use sample input
                </button>
              )}
            </div>
            <textarea
              value={customInput}
              onChange={(e) => onCustomInputChange(e.target.value)}
              rows={fluid ? 6 : 4}
              placeholder="Enter input for the program (empty input uses sample input)"
              className="w-full px-3 py-2.5 text-xs font-mono bg-slate-50 focus:bg-white focus:outline-none border border-slate-200 rounded-lg resize-y min-h-[96px]"
            />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Run Code tests your solution against the public test cases. Custom input is only used when a
              question has no public test cases.
            </p>
          </div>
        ) : showResult ? (
          <div className="p-3 space-y-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className={`flex items-center gap-1.5 text-sm font-bold ${meta.text}`}>
                <VerdictIcon className="w-4 h-4" />
                {meta.label}
              </span>
              <span className="text-xs text-slate-400">Runtime: {result.totalExecutionTimeMs} ms</span>
              {result.memoryKb != null && (
                <span className="text-xs text-slate-400">Memory: {formatMemory(result.memoryKb)}</span>
              )}
              {result.failedTestCases != null && (
                <span className="text-xs text-slate-500">
                  {result.passedTestCases}/{result.totalTestCases} passed
                </span>
              )}
            </div>

            {caseRows.length > 0 ? (
              <>
                <div className="flex flex-wrap items-center gap-1.5">
                  {caseRows.map((row, i) => {
                    const active = i === selectedIdx;
                    return (
                      <button
                        type="button"
                        key={row.caseNumber}
                        onClick={() => selectCase(i)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          active ? "bg-slate-200/80 text-slate-700" : "hover:bg-slate-100 text-slate-600"
                        }`}
                      >
                        {row.passed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-red-500" />
                        )}
                        Case {row.caseNumber}
                        {row.hidden && <span className="text-[10px] font-semibold text-slate-400">Hidden</span>}
                      </button>
                    );
                  })}
                </div>

                {selectedRow &&
                  (selectedRow.publicDetail ? (
                    <div className="space-y-3 pt-1">
                      <DetailBlock label="Input" value={selectedRow.input} />
                      <DetailBlock
                        label="Output"
                        value={selectedCache?.output}
                        error={
                          selectedCache && selectedCache.success === false ? selectedCache.error || "" : undefined
                        }
                        loading={selectedLoading}
                      />
                      <DetailBlock label="Expected" value={selectedRow.expectedOutput} />
                    </div>
                  ) : (
                    <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 flex items-start gap-2 text-xs text-slate-500">
                      <EyeOff className="w-4 h-4 shrink-0 text-slate-400" />
                      <span>
                        <span className="font-semibold text-slate-600">Case {selectedRow.caseNumber}</span> is a
                        hidden test case used for grading.{" "}
                        <span className={selectedRow.passed ? "text-green-700" : "text-red-600"}>
                          {selectedRow.passed ? "It passed." : "It failed."}
                        </span>
                        {!!selectedRow.message && <span className="block mt-1">{selectedRow.message}</span>}
                      </span>
                    </div>
                  ))}
              </>
            ) : (
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> No test cases available for this question.
              </p>
            )}
          </div>
        ) : runError ? (
          <pre className="text-xs font-mono p-4 bg-red-50 text-red-600 whitespace-pre-wrap">{runError}</pre>
        ) : runOutput ? (
          <div>
            <pre
              className={`text-xs font-mono p-4 whitespace-pre-wrap ${
                runOutput.success ? "bg-[#0B2545] text-green-400" : "bg-red-50 text-red-600"
              }`}
            >
              {runOutput.success ? (runOutput.output || "(no output)") : (runOutput.error || "Execution failed")}
            </pre>
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400">
              Execution time: {runOutput.executionTime} ms
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 p-4 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5" /> Press Run Code to test your solution against the sample/public test cases.
          </p>
        )}
      </div>
    </div>
  );
}

export default function ProgrammingQuestionView({ questionId, onBack, onSubmissionComplete }) {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("JAVA");
  const [code, setCode] = useState(STARTER_CODE.JAVA);
  const [customInput, setCustomInput] = useState("");
  const [runOutput, setRunOutput] = useState(null);
  const [runError, setRunError] = useState("");
  const [runResult, setRunResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [expandedSubmissionId, setExpandedSubmissionId] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const [editorFullscreen, setEditorFullscreen] = useState(false);
  const isDesktop = useIsDesktop("(min-width: 1280px)");
  const workspaceRef = useRef(null);
  const rightColRef = useRef(null);

  const LEFT_MIN = 280;
  const CODE_MIN = 400;
  const EDITOR_MIN = 200;
  const RESULT_MIN = 180;

  const [descWidth, setDescWidth] = useState(null);
  const [editorHeight, setEditorHeight] = useState(null);
  const [contSize, setContSize] = useState({ w: 0, h: 0 });

  const workspaceReady = !!question && !loading && isDesktop && !editorFullscreen;

  useLayoutEffect(() => {
    const el = workspaceRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setContSize({ w: Math.round(rect.width), h: Math.round(rect.height) });
    setDescWidth((prev) => prev ?? Math.round(rect.width * 0.34));
    setEditorHeight((prev) => prev ?? Math.round(rect.height * 0.62));
  }, [workspaceReady]);

  useEffect(() => {
    const el = workspaceRef.current;
    if (!el) return;
    const update = () => setContSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [workspaceReady]);

  const effLeft = Math.min(
    Math.max(descWidth ?? Math.round(contSize.w * 0.34), LEFT_MIN),
    Math.max(LEFT_MIN, contSize.w - CODE_MIN)
  );
  const effEditor = Math.min(
    Math.max(editorHeight ?? Math.round(contSize.h * 0.62), EDITOR_MIN),
    Math.max(EDITOR_MIN, contSize.h - RESULT_MIN)
  );

  const startColResize = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = effLeft;
    const onMove = (ev) => {
      const next = startW + (ev.clientX - startX);
      setDescWidth(Math.min(Math.max(next, LEFT_MIN), Math.max(LEFT_MIN, contSize.w - CODE_MIN)));
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const startRowResize = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startH = effEditor;
    const onMove = (ev) => {
      const next = startH + (ev.clientY - startY);
      setEditorHeight(Math.min(Math.max(next, EDITOR_MIN), Math.max(EDITOR_MIN, contSize.h - RESULT_MIN)));
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  };

  const resetLeftSize = () => setDescWidth(null);
  const resetRightSize = () => setEditorHeight(null);

  useEffect(() => {
    loadQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  const loadQuestion = async () => {
    setLoading(true);
    try {
      const { data } = await getProgrammingQuestion(questionId);
      setQuestion(data);
      const langs = Array.isArray(data.allowedLanguages) && data.allowedLanguages.length > 0
        ? data.allowedLanguages
        : ["JAVA"];
      const first = langs[0] || "JAVA";
      setLanguage(first);
      setCode(STARTER_CODE[first] || STARTER_CODE.JAVA);
      setCustomInput(data.sampleInput || "");
      setRunOutput(null);
      setRunError("");
      setSubmitResult(null);
      setRunResult(null);
      setActiveTab("description");
      loadSubmissions();
    } catch (err) {
      console.error("Failed to load programming question:", err);
      toast.error(err.response?.data?.message || "Failed to load question");
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const { data } = await getProgrammingQuestionSubmissions(questionId);
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load submissions:", err);
      setSubmissions([]);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(STARTER_CODE[lang] || STARTER_CODE.JAVA);
    setRunOutput(null);
    setRunError("");
    setSubmitResult(null);
    setRunResult(null);
  };

  const handleResetCode = () => {
    setCode(STARTER_CODE[language] || STARTER_CODE.JAVA);
    setRunOutput(null);
    setRunError("");
    setSubmitResult(null);
    setRunResult(null);
  };

  const fetchCodeRun = async (input) => {
    const { data } = await runProgrammingQuestion(questionId, language, code, input);
    return data;
  };

  const handleRun = async () => {
    setIsRunning(true);
    setRunError("");
    setRunOutput(null);
    setSubmitResult(null);
    setRunResult(null);
    try {
      const publics = (question.testCases || []).filter((tc) => tc.isPublic !== false);
      if (publics.length === 0) {
        const { data } = await runProgrammingQuestion(questionId, language, code, customInput);
        setRunOutput(data);
        return;
      }
      const executions = await Promise.all(
        publics.map(async (tc, i) => {
          try {
            const { data } = await runProgrammingQuestion(questionId, language, code, tc.input || "");
            const passed = data.success && outputsMatch(data.output, tc.expectedOutput);
            return {
              caseNumber: i + 1,
              passed,
              hidden: false,
              executionTimeMs: data.executionTime,
              message: data.success ? (passed ? "Passed" : "Wrong answer") : data.error || "Execution failed",
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              output: data.output,
              error: data.success ? null : data.error || null,
              success: data.success,
            };
          } catch (err) {
            const msg = err.response?.data?.message || err.message || "Execution failed";
            return {
              caseNumber: i + 1,
              passed: false,
              hidden: false,
              executionTimeMs: 0,
              message: msg,
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              output: "",
              error: msg,
              success: false,
            };
          }
        })
      );
      const passedCount = executions.filter((e) => e.passed).length;
      const totalExecutionTimeMs = executions.reduce((s, e) => s + (e.executionTimeMs || 0), 0);
      setRunResult({
        verdict: passedCount === executions.length ? "ACCEPTED" : "WRONG_ANSWER",
        accepted: passedCount === executions.length,
        passedTestCases: passedCount,
        totalTestCases: executions.length,
        failedTestCases: executions.length - passedCount,
        totalExecutionTimeMs,
        caseResults: executions,
      });
    } catch (err) {
      setRunError(err.response?.data?.message || err.message || "Failed to run code");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setRunResult(null);
    try {
      const { data } = await submitProgrammingQuestion(questionId, language, code);
      setSubmitResult(data);
      loadSubmissions();
      if (typeof onSubmissionComplete === "function") {
        onSubmissionComplete(questionId, data.accepted ? "ACCEPTED" : "ATTEMPTED");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit solution");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A86B]" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <p>Question not found</p>
        <button onClick={onBack} className="mt-3 text-[#00A86B] text-sm hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  const diffColor = DIFFICULTY_COLORS[question.difficulty] || DIFFICULTY_COLORS.MEDIUM;
  const publicCases = (question.testCases || []).filter((tc) => tc.isPublic !== false);
  const totalCases = question.testCases?.length || 0;
  const monacoLang = MONACO_LANGUAGE[language] || "plaintext";

  const renderEditorBody = () => (
    <>
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-slate-100 bg-slate-50 shrink-0">
        <span className="flex items-center gap-1.5 text-sm font-bold text-[#0B2545]">
          <Code2 className="w-4 h-4 text-[#00A86B]" />
          <span className="hidden sm:inline">Code</span>
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 hidden lg:inline">Language</span>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="text-sm px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-[#0B2545] font-semibold focus:border-[#00A86B] focus:outline-none"
          >
            {question.allowedLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {LANGUAGE_LABELS[lang] || lang}
              </option>
            ))}
          </select>
          <button
            onClick={handleResetCode}
            title="Reset Code"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#00A86B] px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            onClick={() => setEditorFullscreen((f) => !f)}
            title={editorFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#00A86B] px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {editorFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run Code
          </button>
          <button
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#00A86B] hover:bg-[#008f5a] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit Code
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <CodeEditor value={code} onChange={(v) => setCode(v || "")} language={monacoLang} height="100%" />
      </div>
    </>
  );

  const leftPanelJSX = (
    <div className="flex flex-col min-h-0 h-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-1 px-2 pt-2 border-b border-slate-100 overflow-x-auto shrink-0">
        {[
          { id: "description", label: "Description", icon: FileText },
          { id: "submissions", label: "Submissions", icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
                active
                  ? "text-[#00A86B] border-[#00A86B]"
                  : "text-slate-400 border-transparent hover:text-slate-600"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.id === "submissions" && submissions.length > 0 && (
                <span className="ml-0.5 text-[10px] bg-slate-100 text-slate-500 rounded-full px-1.5 py-0.5">
                  {submissions.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-5">
        {activeTab === "description" && (
          <>
            <div className="flex items-start justify-between gap-3 mb-3">
              <h1 className="text-lg font-bold text-[#0B2545] leading-snug">{question.title}</h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${diffColor.bg} ${diffColor.text}`}>
                {question.difficulty}
              </span>
            </div>

            {question.problemStatement && (
              <RichContent content={question.problemStatement} className="text-sm text-slate-700 leading-relaxed mb-4" />
            )}

            {question.inputFormat && (
              <div className="mb-4">
                <SectionLabel>Input Format</SectionLabel>
                <RichContent content={question.inputFormat} className="text-sm text-slate-700 leading-relaxed" />
              </div>
            )}

            {question.outputFormat && (
              <div className="mb-4">
                <SectionLabel>Output Format</SectionLabel>
                <RichContent content={question.outputFormat} className="text-sm text-slate-700 leading-relaxed" />
              </div>
            )}

            {question.constraints && (
              <div className="mb-4">
                <SectionLabel>Constraints</SectionLabel>
                <RichContent content={question.constraints} className="text-sm text-slate-700 leading-relaxed" />
              </div>
            )}

            <SampleBlock label="Sample Input" value={question.sampleInput} />
            <SampleBlock label="Sample Output" value={question.sampleOutput} />

            {publicCases.length > 0 && (
              <div>
                <SectionLabel>Test Cases</SectionLabel>
                <div className="border border-slate-200 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <TableProperties className="w-3 h-3 text-[#00A86B]" />
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      Public Test Cases
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {publicCases.map((tc, i) => (
                      <div key={tc.id || i} className="border border-slate-100 rounded-lg p-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Case {i + 1}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Input</p>
                        <pre className="text-[11px] font-mono bg-[#0B2545] text-green-400 rounded-md p-1.5 overflow-x-auto whitespace-pre-wrap mb-1.5">{tc.input || ""}</pre>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Expected Output</p>
                        <pre className="text-[11px] font-mono bg-slate-50 border border-slate-200 rounded-md p-1.5 overflow-x-auto whitespace-pre-wrap">{tc.expectedOutput || ""}</pre>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {totalCases > publicCases.length && (
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5" /> {totalCases - publicCases.length} hidden test case
                {(totalCases - publicCases.length) > 1 ? "s" : ""} used for grading
              </p>
            )}
          </>
        )}

        {activeTab === "submissions" && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-[#00A86B]" />
              <h3 className="text-sm font-bold text-[#0B2545]">Submissions</h3>
            </div>

            {loadingSubmissions ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-[#00A86B]" />
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-slate-400 flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" /> No submissions yet
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Submit your solution to see your history here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {submissions.map((sub) => {
                  const meta = VERDICT_META[sub.status] || VERDICT_META.WRONG_ANSWER;
                  const Icon = meta.icon;
                  const expanded = expandedSubmissionId === sub.id;
                  const monacoLang = MONACO_LANGUAGE[sub.language] || "plaintext";
                  return (
                    <div key={sub.id} className="border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedSubmissionId(expanded ? null : sub.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                      >
                        <span className={`flex items-center gap-1.5 text-xs font-bold ${meta.text}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {meta.label}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">
                          {sub.accepted
                            ? `${sub.passedTestCases}/${sub.totalTestCases} test cases passed`
                            : `${sub.passedTestCases}/${sub.totalTestCases} passed`}
                        </span>
                        <span className="ml-auto flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="hidden sm:inline">{LANGUAGE_LABELS[sub.language] || sub.language}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeAgo(sub.submittedAt)}
                          </span>
                          <span className={`text-slate-300 ${expanded ? "rotate-180" : ""} transition-transform`}>▾</span>
                        </span>
                      </button>

                      {expanded && (
                        <div className="border-t border-slate-100">
                          <div className="flex flex-wrap gap-x-4 gap-y-1 px-4 py-2.5 bg-slate-50 text-[11px] text-slate-500">
                            <span>Status: <span className={`font-bold ${meta.text}`}>{meta.label}</span></span>
                            <span>Passed: <b>{sub.passedTestCases}</b> / {sub.totalTestCases}</span>
                            <span>Runtime: <b>{sub.executionTimeMs} ms</b></span>
                            {sub.memoryKb != null && (
                              <span>Memory: <b>{formatMemory(sub.memoryKb)}</b></span>
                            )}
                            <span>Submitted: {formatDateTime(sub.submittedAt)}</span>
                            <span>Language: {LANGUAGE_LABELS[sub.language] || sub.language}</span>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-4 pt-3 pb-1">
                              Submitted Code
                            </p>
                            <div className="px-3 pb-3">
                              <CodeEditor
                                value={sub.code || ""}
                                onChange={() => {}}
                                language={monacoLang}
                                readOnly
                                height={220}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh_-_104px)] min-h-0">
      <div className="flex items-center gap-3 mb-3 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#00A86B] transition-colors shrink-0"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <h2 className="text-sm font-bold text-[#0B2545] truncate">{question.title}</h2>
      </div>

      {editorFullscreen ? (
        <div className="fixed inset-0 z-50 bg-white p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between shrink-0">
            <h2 className="text-sm font-bold text-[#0B2545]">{question.title}</h2>
            <button
              onClick={() => setEditorFullscreen(false)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#00A86B] px-3 py-1.5 rounded-lg hover:bg-slate-100"
            >
              <Minimize2 className="w-3.5 h-3.5" /> Exit Fullscreen
            </button>
          </div>
          <div className="flex-1 min-h-0 flex flex-col gap-3">
            <div className="flex-1 min-h-0 flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {renderEditorBody()}
            </div>
            <div className="h-80 shrink-0 min-h-0">
              <TestResultPanel
                result={submitResult || runResult}
                isRun={!!runResult && !submitResult}
                testCases={question.testCases || []}
                runOutput={runOutput}
                runError={runError}
                fetchOutput={fetchCodeRun}
                customInput={customInput}
                onCustomInputChange={setCustomInput}
                sampleInput={question.sampleInput}
              />
            </div>
          </div>
        </div>
      ) : isDesktop ? (
        <div ref={workspaceRef} className="flex flex-1 min-h-0 overflow-hidden">
          <div className="shrink-0 flex flex-col min-h-0" style={{ width: `${effLeft}px`, minWidth: LEFT_MIN }}>
            {leftPanelJSX}
          </div>

          <div
            className="group flex items-center justify-center w-4 shrink-0 cursor-col-resize"
            onMouseDown={startColResize}
            onDoubleClick={resetLeftSize}
            title="Drag to resize · Double-click to reset"
          >
            <div className="h-full w-[2px] bg-slate-200 group-hover:bg-[#00A86B] rounded-full transition-colors" />
          </div>

          <div ref={rightColRef} className="flex flex-col flex-1 min-w-[400px] min-h-0">
            <div
              className="shrink-0 flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
              style={{ height: `${effEditor}px`, minHeight: EDITOR_MIN }}
            >
              {renderEditorBody()}
            </div>

            <div
              className="group flex items-center justify-center h-4 shrink-0 cursor-row-resize"
              onMouseDown={startRowResize}
              onDoubleClick={resetRightSize}
              title="Drag to resize · Double-click to reset"
            >
              <div className="w-full h-[2px] bg-slate-200 group-hover:bg-[#00A86B] rounded-full transition-colors" />
            </div>

            <div className="flex-1 min-h-0">
              <TestResultPanel
                result={submitResult || runResult}
                isRun={!!runResult && !submitResult}
                testCases={question.testCases || []}
                runOutput={runOutput}
                runError={runError}
                fetchOutput={fetchCodeRun}
                customInput={customInput}
                onCustomInputChange={setCustomInput}
                sampleInput={question.sampleInput}
                fluid
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="max-h-[70vh] flex flex-col min-h-0">{leftPanelJSX}</div>
          <div className="h-[52vh] min-h-[320px] flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {renderEditorBody()}
          </div>
          <TestResultPanel
            result={submitResult || runResult}
            isRun={!!runResult && !submitResult}
            testCases={question.testCases || []}
            runOutput={runOutput}
            runError={runError}
            fetchOutput={fetchCodeRun}
            customInput={customInput}
            onCustomInputChange={setCustomInput}
            sampleInput={question.sampleInput}
          />
        </div>
      )}
    </div>
  );
}

function formatMemory(kb) {
  if (kb == null) return null;
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
}