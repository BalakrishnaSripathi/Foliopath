import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Code2,
  Play,
  Send,
  Terminal,
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

export default function ProgrammingQuestionView({ questionId, onBack, onSubmissionComplete }) {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("JAVA");
  const [code, setCode] = useState(STARTER_CODE.JAVA);
  const [customInput, setCustomInput] = useState("");
  const [runOutput, setRunOutput] = useState(null);
  const [runError, setRunError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [expandedSubmissionId, setExpandedSubmissionId] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const [editorFullscreen, setEditorFullscreen] = useState(false);

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
  };

  const handleResetCode = () => {
    setCode(STARTER_CODE[language] || STARTER_CODE.JAVA);
    setRunOutput(null);
    setRunError("");
    setSubmitResult(null);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setRunError("");
    setSubmitResult(null);
    try {
      const { data } = await runProgrammingQuestion(questionId, language, code, customInput);
      setRunOutput(data);
    } catch (err) {
      setRunOutput(null);
      setRunError(err.response?.data?.message || err.message || "Failed to run code");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
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

  const editorPanel = (
    <>
      <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${editorFullscreen ? "flex-1 flex flex-col" : ""}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-[#00A86B]" />
            <span className="text-sm font-bold text-[#0B2545]">Solution</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetCode}
              title="Reset Code"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#00A86B] px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button
              onClick={() => setEditorFullscreen((f) => !f)}
              title={editorFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#00A86B] px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {editorFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <span className="text-xs text-slate-400">Language</span>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="text-sm px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[#0B2545] font-semibold focus:border-[#00A86B] focus:outline-none"
            >
              {question.allowedLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {LANGUAGE_LABELS[lang] || lang}
                </option>
              ))}
            </select>
          </div>
        </div>

        <CodeEditor
          value={code}
          onChange={(v) => setCode(v || "")}
          language={monacoLang}
          height={editorFullscreen ? 420 : 360}
        />
      </div>

      <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${editorFullscreen ? "flex-1 flex flex-col" : ""}`}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50/60">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Custom Input</span>
          {question.sampleInput && (
            <button
              onClick={() => setCustomInput(question.sampleInput)}
              className="text-[11px] font-semibold text-blue-600 hover:underline"
            >
              Use sample input
            </button>
          )}
        </div>
        <textarea
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          rows={3}
          placeholder="Enter input for the program (empty input uses sample input)"
          className="w-full px-4 py-3 text-xs font-mono bg-slate-50 focus:bg-white focus:outline-none resize-y"
        />
        <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-100">
          <button
            onClick={handleRun}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1.5 px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run Code
          </button>
          <button
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1.5 px-5 py-2 bg-[#00A86B] hover:bg-[#008f5a] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit Code
          </button>
        </div>
      </div>

      {/* Console */}
      <div className={`border rounded-2xl overflow-hidden ${runError ? "border-red-200" : "border-slate-200"}`}>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0B2545] text-slate-200">
          <Terminal className="w-3.5 h-3.5 text-[#00A86B]" />
          <span className="text-xs font-bold uppercase tracking-wide">Console</span>
        </div>
        <div className="max-h-44 overflow-y-auto">
          {runError ? (
            <pre className="text-xs font-mono p-4 bg-red-50 text-red-600 whitespace-pre-wrap">{runError}</pre>
          ) : runOutput ? (
            <div>
              <pre className={`text-xs font-mono p-4 whitespace-pre-wrap ${runOutput.success ? "bg-[#0B2545] text-green-400" : "bg-red-50 text-red-600"}`}>
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

      {/* Submission result */}
      {submitResult && (
        <div className={`rounded-2xl border p-4 ${submitResult.accepted ? "border-green-200 bg-green-50/70" : "border-red-200 bg-red-50/70"}`}>
          <div className="flex items-center gap-2 mb-2">
            <VerdictBadge status={submitResult.verdict} />
          </div>
          <p className={`text-sm font-semibold mb-1 ${submitResult.accepted ? "text-green-800" : "text-red-700"}`}>
            {submitResult.passedTestCases} / {submitResult.totalTestCases} Test Case
            {submitResult.totalTestCases === 1 ? "" : "s"} Passed
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-3">
            <span>Runtime: {submitResult.totalExecutionTimeMs} ms</span>
            {submitResult.memoryKb != null && (
              <span>Memory: {formatMemory(submitResult.memoryKb)}</span>
            )}
          </div>
          {!submitResult.accepted && (
            <p className="text-xs text-red-600 mb-3">Check your solution and try again.</p>
          )}
          {submitResult.caseResults?.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {submitResult.caseResults.map((cr) => (
                <div
                  key={cr.caseNumber}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] ${
                    cr.passed
                      ? "bg-white border-green-200 text-green-700"
                      : "bg-white border-red-200 text-red-600"
                  }`}
                >
                  {cr.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  <span className="font-semibold">{cr.message === "Passed" ? `Case ${cr.caseNumber}` : cr.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#00A86B] mb-4 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {editorFullscreen ? (
        <div className="fixed inset-0 z-50 bg-white p-4 flex flex-col gap-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#0B2545]">{question.title}</h2>
            <button
              onClick={() => setEditorFullscreen(false)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#00A86B] px-3 py-1.5 rounded-lg hover:bg-slate-100"
            >
              <Minimize2 className="w-3.5 h-3.5" /> Exit Fullscreen
            </button>
          </div>
          {editorPanel}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* ── Left: Description | Submissions ───────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-fit max-h-[85vh]">
            <div className="flex items-center gap-1 px-2 pt-2 border-b border-slate-100 overflow-x-auto">
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

            <div className="flex-1 overflow-y-auto p-5">
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
                      <SectionLabel>Test Case</SectionLabel>
                      <div className="border border-slate-200 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <TableProperties className="w-3 h-3 text-[#00A86B]" />
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                            Public Test Cases
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {publicCases.map((tc, i) => (
                            <div key={tc.id || i} className="border border-slate-100 rounded-lg p-2">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Case {i + 1}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Input</p>
                              <pre className="text-xs font-mono bg-[#0B2545] text-green-400 rounded-lg p-2 overflow-x-auto whitespace-pre-wrap mb-1.5">{tc.input || ""}</pre>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Expected Output</p>
                              <pre className="text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg p-2 overflow-x-auto whitespace-pre-wrap">{tc.expectedOutput || ""}</pre>
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

          {/* ── Right: Editor panel ────────────────────────────────── */}
          <div className="flex flex-col gap-4 h-fit max-h-[85vh] overflow-y-auto pb-2 pr-0.5">
            {editorPanel}
          </div>
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