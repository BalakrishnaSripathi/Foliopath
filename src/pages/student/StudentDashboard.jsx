import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Home,
  BookOpen,
  BookOpenCheck,
  Briefcase,
  BarChart3,
  Award,
  CreditCard,
  Bell,
  Settings,
  Play,
  Calendar,
  Clock,
  Star,
  CheckCircle,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Trophy,
  TrendingUp,
  Target,
  ArrowLeft,
  Globe,
  ClipboardList,
  Search,
  Code,
  FileText,
  NotebookPen,
  ChevronDown,
  ChevronRight,
  Lock,
  X,
  Download,
  BadgeCheck,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { getMyEnrollments, getEnrollment, enrollInCourse } from "../../api/enrollmentService";
import {
  getPublishedCourses,
  getCourseById,
  getModules,
  getLessons,
  getLesson,
  getCourseModules,
} from "../../api/courseService";
import { addToCart, addKitToCart } from "../../api/cartService";
import { checkoutCart } from "../../api/orderService";
import { payOrder } from "../../api/paymentService";
import {
  getMockTests,
  getMockTest,
  submitMockTestAttempt,
  getMyMockTestAttempt,
} from "../../api/mockTestService";
import { getProgrammingQuestions } from "../../api/programmingQuestionService";
import {
  getMyEnrolledKits,
  getPublishedKits,
  getKitById,
  enrollInKit,
} from "../../api/interviewKitService";
import RenderAnswer from "../../components/admin/RenderAnswer";
import StudentProfile from "./StudentProfile";
import { useAuth } from "../../context/AuthContext";
import CodePlayground from "../../components/CodePlayground";
import ProgrammingQuestionView from "./ProgrammingQuestionView";
import { isExecutableLanguage } from "../../api/codeExecutionService";
import { enrichCourse } from "../../lib/staticCatalog";

const PQ_DIFFICULTY_COLORS = {
  EASY: { bg: "bg-green-100", text: "text-green-700" },
  MEDIUM: { bg: "bg-amber-100", text: "text-amber-700" },
  HARD: { bg: "bg-red-100", text: "text-red-700" },
};

const LEVEL_COLORS = {
  BEGINNER: { bg: "bg-green-100", text: "text-green-700" },
  INTERMEDIATE: { bg: "bg-amber-100", text: "text-amber-700" },
  ADVANCED: { bg: "bg-red-100", text: "text-red-700" },
};

const STATUS_COLORS = {
  ENROLLED: "bg-blue-50 text-blue-600",
  IN_PROGRESS: "bg-amber-50 text-amber-600",
  COMPLETED: "bg-green-50 text-green-600",
};

const COURSE_GRADIENTS = [
  { bg: "from-[#0B2545] to-[#13315c]", accent: "#00A86B" },
  { bg: "from-[#134e4a] to-[#0f766e]", accent: "#34d399" },
  { bg: "from-[#1e1b4b] to-[#312e81]", accent: "#818cf8" },
  { bg: "from-[#450a0a] to-[#7f1d1d]", accent: "#f87171" },
  { bg: "from-[#422006] to-[#78350f]", accent: "#fbbf24" },
  { bg: "from-[#1c1917] to-[#292524]", accent: "#38bdf8" },
];

const levelLabels = { BEGINNER: "Beginner", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced" };

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

const looksLikeHtml = (str) => /<\/?[a-z][\s\S]*>/i.test(str || "");

function RichContent({ content, className = "" }) {
  if (!content) return null;
  if (looksLikeHtml(content)) {
    return <div className={`rich-text-content ${className}`} dangerouslySetInnerHTML={{ __html: content }} />;
  }
  return <div className={`whitespace-pre-wrap ${className}`}>{content}</div>;
}

function renderContentBlock(block, index) {
  if (block.type === "heading") return <h2 key={index} className="text-xl font-bold text-[#0B2545] mt-6 mb-3">{block.body}</h2>;
  if (block.type === "text") return <div key={index} className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-4">{block.body}</div>;
  if (block.type === "code") {
    return (
      <div key={index} className="mb-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-[#0a1628] rounded-t-xl border border-slate-700 border-b-0">
          <Code className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">{block.language || "code"}</span>
        </div>
        <pre className="bg-[#0a1628] text-slate-200 rounded-b-xl border border-slate-700 border-t-0 p-4 overflow-x-auto text-sm leading-relaxed">
          <code>{block.body}</code>
        </pre>
      </div>
    );
  }
  return null;
}

/* ─────────────────────────────────────────────────────────────
   INLINE LESSON VIEW
   ───────────────────────────────────────────────────────────── */
function InlineLessonView({ moduleId, lessonId, onBack }) {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLesson();
  }, [moduleId, lessonId]);

  const loadLesson = async () => {
    setLoading(true);
    try {
      const { data } = await getLesson(moduleId, lessonId);
      setLesson(data);
    } catch (err) {
      console.error("Failed to load lesson:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A86B]" /></div>;
  if (!lesson) return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
      <p>Lesson not found</p>
      <button onClick={onBack} className="mt-3 text-[#00A86B] text-sm hover:underline">Go Back</button>
    </div>
  );

  const contentBlocks = [];
  if (lesson.content) {
    try {
      const parsed = JSON.parse(lesson.content);
      if (Array.isArray(parsed)) {
        contentBlocks.push(...parsed);
      }
    } catch {
      contentBlocks.push({ type: "rich", body: lesson.content });
    }
  }
  if (lesson.codeContent) {
    if (isExecutableLanguage(lesson.codeLanguage)) {
      contentBlocks.push({ type: "playground", body: lesson.codeContent, language: lesson.codeLanguage });
    } else {
      contentBlocks.push({ type: "code", body: lesson.codeContent, language: lesson.codeLanguage });
    }
  }

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#00A86B] mb-4 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h1 className="text-xl font-bold text-[#0B2545] mb-4">{lesson.title}</h1>
        {lesson.description && <p className="text-sm text-slate-500 mb-4">{lesson.description}</p>}
        {lesson.documentUrl && (
          <a href={lesson.documentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-[#00A86B] text-white text-sm font-semibold rounded-xl hover:bg-[#008f5a] transition-colors mb-4">
            Open Document
          </a>
        )}
        {contentBlocks.length > 0 ? (
          contentBlocks.map((block, i) => {
            if (block.type === "playground") return <div key={i} className="mb-4"><CodePlayground language={block.language} starterCode={block.body} /></div>;
            if (block.type === "rich") return <RichContent key={i} content={block.body} className="text-sm text-slate-700 leading-relaxed mb-4" />;
            return renderContentBlock(block, i);
          })
        ) : (
          <p className="text-sm text-slate-400 italic">No content available for this lesson.</p>
        )}
        {lesson.items?.length > 0 && (
          <div className="mt-6">
            <h2 className="text-base font-bold text-[#0B2545] uppercase tracking-wide mb-4">Lesson Sections</h2>
            {[...lesson.items].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((item, idx) => (
              <div key={item.id || idx} className="border border-slate-200 rounded-2xl p-5 mb-5 bg-slate-50/50">
                <h3 className="text-lg font-bold text-[#0B2545] mb-1">{idx + 1}. {item.title}</h3>
                {item.description && <p className="text-sm text-slate-500 mb-3">{item.description}</p>}
                {item.content && <RichContent content={item.content} className="text-sm text-slate-700 leading-relaxed mb-3" />}
                {item.codeContent && isExecutableLanguage(item.codeLanguage) ? (
                  <CodePlayground language={item.codeLanguage} starterCode={item.codeContent} height={260} />
                ) : item.codeContent ? (
                  <div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#0a1628] rounded-t-xl border border-slate-700 border-b-0">
                      <Code className="w-3.5 h-3.5 text-[#00A86B]" />
                      <span className="text-xs font-mono text-slate-400">{item.codeLanguage || "code"}</span>
                    </div>
                    <pre className="bg-[#0a1628] text-slate-200 rounded-b-xl border border-slate-700 border-t-0 p-4 overflow-x-auto text-sm leading-relaxed">
                      <code>{item.codeContent}</code>
                    </pre>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   INLINE MOCK TEST VIEW
   ───────────────────────────────────────────────────────────── */
function InlineMockTestView({ mockTestId, onBack }) {
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadTest(); }, [mockTestId]);

  const loadTest = async () => {
    try {
      let existingResult = null;
      try {
        const { data } = await getMyMockTestAttempt(mockTestId);
        existingResult = data;
      } catch { existingResult = null; }
      if (existingResult) { onBack("result", mockTestId, existingResult); return; }
      const { data } = await getMockTest(mockTestId);
      setTest(data);
    } catch (err) {
      console.error("Failed to load mock test:", err);
      toast.error("Failed to load mock test");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (questionId, optionLabel) => setAnswers((p) => ({ ...p, [questionId]: optionLabel }));

  const handleSubmit = async () => {
    if (!test?.questions?.length) return;
    const unanswered = test.questions.filter((q) => !answers[q.id]).length;
    if (unanswered > 0) { toast.error(`Please answer all questions (${unanswered} remaining)`); return; }
    setSubmitting(true);
    try {
      const { data } = await submitMockTestAttempt(mockTestId, answers);
      onBack("result", mockTestId, data);
    } catch (err) {
      console.error("Failed to submit:", err);
      toast.error(err.response?.data?.message || "Failed to submit test");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A86B]" /></div>;
  if (!test) return <div className="text-center py-20 text-slate-500">Mock test not found</div>;

  return (
    <div>
      <button onClick={() => onBack("course")} className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#00A86B] mb-4 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
        <h1 className="text-xl font-bold text-[#0B2545] mb-2">{test.title}</h1>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1"><ClipboardList size={14} />{test.questions?.length || 0} questions</span>
          <span className="flex items-center gap-1"><Clock size={14} />{test.durationMinutes} min</span>
        </div>
      </div>
      <div className="space-y-4">
        {test.questions?.map((q, qIdx) => (
          <div key={q.id || qIdx} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-sm font-semibold text-[#0B2545] mb-3">Q{qIdx + 1}. {q.questionText}</p>
            {q.codeContent && (
              <pre className="mb-3 text-xs font-mono bg-[#0B2545] text-green-400 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap">{q.codeContent}</pre>
            )}
            <div className="space-y-2">
              {(q.options || []).map((opt) => {
                const selected = answers[q.id] === opt.label;
                return (
                  <button key={opt.label} onClick={() => handleSelect(q.id, opt.label)} className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${selected ? "border-[#00A86B] bg-[#00A86B]/5 text-[#0B2545] font-medium" : "border-slate-200 hover:border-slate-300 text-slate-600"}`}>
                    <span className="font-bold mr-2">{opt.label}.</span>{opt.text}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <button onClick={handleSubmit} disabled={submitting} className="px-8 py-3 bg-[#00A86B] hover:bg-[#008f5a] text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-60">
          {submitting ? "Submitting..." : "Submit Test"}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   INLINE MOCK TEST RESULT
   ───────────────────────────────────────────────────────────── */
function InlineMockTestResult({ mockTestId, result: initialResult, onBack }) {
  const [result, setResult] = useState(initialResult);
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(!initialResult);

  useEffect(() => { loadResult(); }, [mockTestId]);

  const loadResult = async () => {
    setLoading(true);
    try {
      let attempt = result;
      if (!attempt) {
        try {
          const { data } = await getMyMockTestAttempt(mockTestId);
          attempt = data;
        } catch { attempt = null; }
      }
      if (!attempt) { onBack("test", mockTestId); return; }
      setResult(attempt);
      try { const { data } = await getMockTest(mockTestId); setTest(data); } catch { setTest(null); }
    } catch (err) {
      console.error("Failed to load result:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A86B]" /></div>;
  if (!result) return <p className="text-center py-20 text-slate-500">No result found</p>;

  const percentage = result.percentage ?? 0;
  const passed = !!result.passed;
  const wrongAnswers = (result.total || 0) - (result.score || 0);
  const reviewQuestions = result.questions?.length ? result.questions : test?.questions;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <button onClick={() => onBack("my-courses")} className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#00A86B] transition-colors">
        <ArrowLeft size={16} /> Back to My Courses
      </button>
      <div className={`rounded-2xl p-8 text-center ${passed ? "bg-gradient-to-br from-[#00A86B] to-[#065f46]" : "bg-gradient-to-br from-[#0B2545] to-[#13315c]"}`}>
        <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${passed ? "bg-white/20" : "bg-white/10"}`}>
          {passed ? <Trophy size={40} className="text-white" /> : <Target size={40} className="text-white/80" />}
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">{result.testTitle || test?.title || "Mock Test"}</h1>
        <p className={`text-sm ${passed ? "text-emerald-100" : "text-slate-300"}`}>Test Result</p>
        <div className="mt-6 inline-flex items-baseline gap-1">
          <span className="text-5xl font-black text-white">{percentage}%</span>
          <span className={`text-sm font-medium ${passed ? "text-emerald-200" : "text-slate-400"}`}>score</span>
        </div>
        <p className={`mt-2 text-sm font-semibold ${passed ? "text-emerald-100" : "text-slate-400"}`}>
          {passed ? "Congratulations! You passed!" : "Keep practicing — you'll get there!"}
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-2"><ClipboardList size={18} className="text-indigo-500" /></div>
          <p className="text-2xl font-bold text-slate-800">{result.total}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total Questions</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-2"><CheckCircle2 size={18} className="text-green-500" /></div>
          <p className="text-2xl font-bold text-green-600">{result.score}</p>
          <p className="text-xs text-slate-500 mt-0.5">Correct</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-2"><XCircle size={18} className="text-red-500" /></div>
          <p className="text-2xl font-bold text-red-600">{wrongAnswers}</p>
          <p className="text-xs text-slate-500 mt-0.5">Wrong</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${passed ? "bg-green-50" : "bg-amber-50"}`}><TrendingUp size={18} className={passed ? "text-green-500" : "text-amber-500"} /></div>
          <p className={`text-2xl font-bold ${passed ? "text-green-600" : "text-amber-600"}`}>{result.passPercentage ?? test?.passPercentage ?? 50}%</p>
          <p className="text-xs text-slate-500 mt-0.5">Pass Mark</p>
        </div>
      </div>
      {reviewQuestions && (
        <div className="space-y-4">
          <h2 className="font-bold text-[#0B2545] text-lg">Questions</h2>
          {reviewQuestions.map((q, i) => {
            const selected = q.selectedAnswer || null;
            const correct = q.correctAnswer || null;
            const notAnswered = !selected;
            return (
              <div key={q.questionId || q.id || i} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-[#0B2545]">Q{i + 1}. {q.questionText}</p>
                    {notAnswered ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 shrink-0">Not Answered</span>
                    ) : correct && selected === correct ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-50 text-green-600 shrink-0">Correct</span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-600 shrink-0">Wrong</span>
                    )}
                  </div>
                  {q.codeContent && (
                    <pre className="mt-3 text-xs font-mono bg-[#0B2545] text-green-400 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap">{q.codeContent}</pre>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  {(q.options || []).map((opt) => {
                    const isCorrect = correct && opt.label === correct;
                    const isSelected = !!selected && opt.label === selected;
                    const isWrongPick = isSelected && !isCorrect;
                    const rowCls = isCorrect
                      ? "border-green-300 bg-green-50"
                      : isWrongPick
                        ? "border-red-300 bg-red-50"
                        : "border-slate-200 bg-white";
                    const textCls = isCorrect
                      ? "text-green-800"
                      : isWrongPick
                        ? "text-red-700"
                        : "text-slate-500";
                    return (
                      <div key={opt.label} className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${rowCls} ${textCls}`}>
                        {isCorrect ? (
                          <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                        ) : isWrongPick ? (
                          <XCircle size={16} className="text-red-500 shrink-0" />
                        ) : null}
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isCorrect ? "bg-green-500 text-white" : isWrongPick ? "bg-red-500 text-white" : "bg-slate-100 text-slate-400"}`}>{opt.label}</span>
                        <span className="flex-1 font-medium">{opt.text}</span>
                        {isCorrect && <span className="ml-auto text-[11px] font-bold text-green-600 shrink-0">Correct answer</span>}
                        {isWrongPick && <span className="ml-auto text-[11px] font-bold text-red-600 shrink-0">Your answer</span>}
                      </div>
                    );
                  })}
                  {notAnswered && (
                    <p className="text-xs text-slate-400 italic px-1 pt-1">You did not answer this question. The correct answer is marked in green above.</p>
                  )}
                </div>
                {q.solution && q.solution.trim() && (
                  <div className="px-4 py-3 bg-green-50/60 border-t border-green-100">
                    <div className="flex items-center gap-2 mb-1.5">
                      <BookOpen size={14} className="text-green-600" />
                      <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Solution</span>
                    </div>
                    <RichContent content={q.solution} className="text-sm text-green-900 leading-relaxed" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <div className="flex justify-center pt-2 pb-4">
        <button onClick={() => onBack("my-courses")} className="px-8 py-3 bg-[#00A86B] hover:bg-[#008f5a] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all">Back to My Courses</button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CERTIFICATE ART & HELPERS
   ───────────────────────────────────────────────────────────── */
function CertificateArt({ course, studentName, large = false }) {
  const grad = COURSE_GRADIENTS[(Number(course.courseId) || 0) % COURSE_GRADIENTS.length];
  const issueDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const issuedId = `FP-CERT-${String(course.courseId || 0).padStart(4, "0")}-${new Date().getFullYear()}`;

  return (
    <div className={`relative w-full ${large ? "aspect-[8/5]" : "aspect-[4/3]"} rounded-xl overflow-hidden bg-[#fbf8f1]`}>
      <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${grad.bg}`} />
      <div className="absolute inset-2 border border-[#0B2545]/25 rounded-[10px] pointer-events-none" />
      <div className="absolute inset-3 border border-[#0B2545]/10 rounded-[8px] pointer-events-none" />
      <div className="relative h-full flex flex-col items-center justify-center text-center px-6 py-4">
        <div className={`rounded-full flex items-center justify-center bg-gradient-to-br ${grad.bg} ${large ? "w-12 h-12" : "w-9 h-9"}`}>
          <Award className={`text-white ${large ? "w-6 h-6" : "w-4 h-4"}`} />
        </div>
        <p className="mt-2 text-[9px] tracking-[0.35em] font-bold text-slate-500 uppercase">Foliopath 360</p>
        <h3 className={`font-serif font-bold text-[#0B2545] leading-tight ${large ? "text-2xl mt-1" : "text-sm mt-0.5"}`}>Certificate of Completion</h3>
        <p className={`text-slate-500 ${large ? "text-[11px] mt-2" : "text-[9px] mt-1.5"}`}>This certifies that</p>
        <p className={`font-bold text-[#0B2545] italic ${large ? "text-2xl mt-1" : "text-sm mt-0.5"}`}>{studentName}</p>
        <p className={`text-slate-500 ${large ? "text-[11px] mt-1.5" : "text-[9px] mt-1"}`}>has successfully completed the course</p>
        <p className={`font-bold text-[#00A86B] leading-tight ${large ? "text-xl mt-1 px-6" : "text-xs mt-0.5 px-4"}`}>{course.title}</p>
        <div className="flex items-center gap-1 mt-2 text-slate-400">
          <Calendar size={9} />
          <span className={`${large ? "text-[11px]" : "text-[9px]"}`}>{issueDate}</span>
        </div>
        <div className="hidden lg:flex items-center justify-between w-full mt-2 px-6">
          <div className="text-center">
            <p className="text-[9px] font-serif italic text-slate-600">Alex Morgan</p>
            <div className="border-t border-slate-300 w-16 pt-0.5 text-[8px] uppercase text-slate-400">Instructor</div>
          </div>
          <div className={`rounded-full bg-gradient-to-br ${grad.bg} flex items-center justify-center ${large ? "w-10 h-10" : "w-8 h-8"}`}>
            <BadgeCheck className={`text-white ${large ? "w-5 h-5" : "w-4 h-4"}`} />
          </div>
          <div className="text-center">
            <p className="text-[9px] font-serif italic text-slate-600">Foliopath 360</p>
            <div className="border-t border-slate-300 w-16 pt-0.5 text-[8px] uppercase text-slate-400">Director</div>
          </div>
        </div>
        <p className={`hidden lg:block ${large ? "text-[9px]" : "text-[8px]"} text-slate-400 font-mono`}>{issuedId}</p>
      </div>
      <p className="absolute bottom-2 inset-x-0 text-center text-[8px] font-mono text-slate-400">{issuedId}</p>
    </div>
  );
}

const CERT_BAND_HEX = [
  "linear-gradient(90deg, #0B2545, #13315c)",
  "linear-gradient(90deg, #134e4a, #0f766e)",
  "linear-gradient(90deg, #1e1b4b, #312e81)",
  "linear-gradient(90deg, #450a0a, #7f1d1d)",
  "linear-gradient(90deg, #422006, #78350f)",
  "linear-gradient(90deg, #1c1917, #292524)",
];

function buildCertificateHtml({ studentName, course, issueDate, issuedId }) {
  const band = CERT_BAND_HEX[(Number(course.courseId) || 0) % CERT_BAND_HEX.length];
  const accent = COURSE_GRADIENTS[(Number(course.courseId) || 0) % COURSE_GRADIENTS.length].accent;
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Certificate of Completion</title>
<style>
  body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f1f5f9; font-family: 'Georgia', serif; }
  .cert { width: 880px; aspect-ratio: 8 / 5; background: #fbf8f1; position: relative; border: 1px solid #e2e8f0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 48px 72px; }
  .frame { position: absolute; inset: 16px; border: 1px solid #0B2545; opacity: .25; }
  .frame2 { position: absolute; inset: 22px; border: 1px solid #0B2545; opacity: .1; }
  .band { position: absolute; top: 0; left: 0; right: 0; height: 7px; background: ${band}; }
  .brand { letter-spacing: .35em; font-size: 12px; color: #64748b; text-transform: uppercase; margin-top: 8px; }
  h1 { font-size: 34px; color: #0B2545; margin: 6px 0 0; }
  .label { color: #64748b; font-size: 13px; margin-top: 14px; }
  .name { font-size: 30px; color: #0B2545; font-style: italic; margin: 6px 0 0; font-weight: 700; }
  .course { font-size: 22px; color: #00A86B; font-weight: 700; margin: 8px 0 0; }
  .date { font-size: 11px; color: #94a3b8; margin-top: 12px; }
  .sig { display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 28px; padding: 0 24px; font-family: 'Arial', sans-serif; }
  .sig div { text-align: center; font-size: 10px; color: #94a3b8; text-transform: uppercase; }
  .sig .name2 { text-transform: none; font-style: italic; color: #475569; font-size: 12px; margin-bottom: 2px; }
  .sig .line { border-top: 1px solid #cbd5e1; width: 80px; padding-top: 6px; font-size: 9px; }
  .seal { width: 52px; height: 52px; border-radius: 9999px; background: linear-gradient(135deg, #0B2545, #13315c); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 26px; }
  .id { position: absolute; bottom: 12px; left: 0; right: 0; text-align: center; font-size: 9px; font-family: 'Courier New', monospace; color: #94a3b8; }
</style>
</head>
<body>
  <div class="cert">
    <div class="band"></div>
    <div class="frame"></div>
    <div class="frame2"></div>
    <div class="seal" style="background: linear-gradient(135deg, ${accent}, #13315c);">&#127942;</div>
    <p class="brand">Foliopath 360</p>
    <h1>Certificate of Completion</h1>
    <p class="label">This certifies that</p>
    <p class="name">${studentName}</p>
    <p class="label">has successfully completed the course</p>
    <p class="course">${course.title}</p>
    <p class="date">${issueDate}</p>
    <div class="sig">
      <div><div class="name2">Alex Morgan</div><div class="line">Instructor</div></div>
      <div class="seal">&#10004;</div>
      <div><div class="name2">Foliopath 360</div><div class="line">Director</div></div>
    </div>
    <p class="id">${issuedId}</p>
  </div>
</body>
</html>`;
}

/* ─────────────────────────────────────────────────────────────
   MAIN STUDENT DASHBOARD (content only — sidebar is in StudentShell)
   ───────────────────────────────────────────────────────────── */
export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId: routeCourseId, moduleId, lessonId, mockTestId, questionId: programmingQuestionId } = useParams();

  const [enrollments, setEnrollments] = useState([]);
  const [publishedCourses, setPublishedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [courseDetail, setCourseDetail] = useState(null);
  const [courseModules, setCourseModules] = useState([]);
  const [courseLinks, setCourseLinks] = useState([]);
  const [courseLinkContent, setCourseLinkContent] = useState({});
  const [lessonsByModule, setLessonsByModule] = useState({});
  const [mockTestsByModule, setMockTestsByModule] = useState({});
  const [programmingQuestions, setProgrammingQuestions] = useState([]);
  const [courseLoading, setCourseLoading] = useState(false);
  const [courseLoadFailed, setCourseLoadFailed] = useState(false);
  const [expandedModule, setExpandedModule] = useState(null);
  const [courseEnrollment, setCourseEnrollment] = useState(null);

  const [inlineLesson, setInlineLesson] = useState(null);
  const [inlineMockTest, setInlineMockTest] = useState(null);
  const [inlineMockResult, setInlineMockResult] = useState(null);
  const [viewingCertificate, setViewingCertificate] = useState(null);

  const [enrollingCourse, setEnrollingCourse] = useState(false);
  const [coursePaymentBusy, setCoursePaymentBusy] = useState(false);
  const [coursePaymentError, setCoursePaymentError] = useState(null);

  const [myCoursesFilter, setMyCoursesFilter] = useState("ALL");
  const [courseSearch, setCourseSearch] = useState("");

  const [enrolledKits, setEnrolledKits] = useState([]);
  const [publishedKits, setPublishedKits] = useState([]);
  const [selectedKit, setSelectedKit] = useState(null);
  const [kitDetail, setKitDetail] = useState(null);
  const [kitLoading, setKitLoading] = useState(false);
  const [kitSearch, setKitSearch] = useState("");
  const [enrolledKitIds, setEnrolledKitIds] = useState(new Set());
  const [expandedKitModule, setExpandedKitModule] = useState(null);
  const [kitListSearch, setKitListSearch] = useState("");
  const [kitPaymentBusy, setKitPaymentBusy] = useState(null);
  const [kitPaymentError, setKitPaymentError] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [enrollRes, coursesRes, enrolledKitsRes, publishedKitsRes] = await Promise.all([
        getMyEnrollments().catch(() => ({ data: [] })),
        getPublishedCourses().catch(() => ({ data: [] })),
        getMyEnrolledKits().catch(() => ({ data: [] })),
        getPublishedKits().catch(() => ({ data: [] })),
      ]);
      const list = Array.isArray(enrollRes.data) ? enrollRes.data : [];
      setEnrollments(list.filter((e) => e.enrollmentStatus !== "DROPPED"));
      setPublishedCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
      const kitsList = Array.isArray(enrolledKitsRes.data) ? enrolledKitsRes.data : [];
      setEnrolledKits(kitsList);
      setEnrolledKitIds(new Set(kitsList.map((k) => k.kitId)));
      setPublishedKits(Array.isArray(publishedKitsRes.data) ? publishedKitsRes.data : []);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCourseDetail = useCallback(async (courseId) => {
    setCourseLoading(true);
    setCourseLoadFailed(false);
    setCourseDetail(null);
    setCourseModules([]);
    setCourseLinks([]);
    setCourseLinkContent({});
    setLessonsByModule({});
    setMockTestsByModule({});
    setProgrammingQuestions([]);
    setExpandedModule(null);
    setCourseEnrollment(null);
    try {
      const [courseRes, modulesRes] = await Promise.all([getCourseById(courseId), getModules(courseId)]);
      setCourseDetail(courseRes.data);
      const mods = modulesRes.data;
      setCourseModules(mods);
      try { const cmRes = await getCourseModules(courseId); setCourseLinks(cmRes.data || []); } catch { setCourseLinks([]); }
      try { const { data: pqRes } = await getProgrammingQuestions(courseId); setProgrammingQuestions(Array.isArray(pqRes) ? pqRes : []); } catch { setProgrammingQuestions([]); }
      try { const { data } = await getEnrollment(courseId); setCourseEnrollment(data); } catch { setCourseEnrollment(null); }
      const results = await Promise.all(
        mods.map((m) =>
          Promise.all([
            getLessons(m.id).then(({ data }) => (Array.isArray(data) ? data : [])).catch(() => []),
            getMockTests(m.id).then(({ data }) => (Array.isArray(data) ? data : [])).catch(() => []),
          ]).then(([lessons, tests]) => [m.id, { lessons, mockTests: tests }])
        )
      );
      setLessonsByModule(Object.fromEntries(results.map(([id, v]) => [id, v.lessons])));
      setMockTestsByModule(Object.fromEntries(results.map(([id, v]) => [id, v.mockTests])));
    } catch (err) {
      console.error("Failed to load course:", err);
      setCourseLoadFailed(true);
      toast.error("Failed to load course");
    } finally {
      setCourseLoading(false);
    }
  }, []);

  useEffect(() => {
    if (routeCourseId) {
      loadCourseDetail(routeCourseId);
    } else {
      setCourseLoading(false);
      setCourseLoadFailed(false);
      setCourseDetail(null);
      setCourseModules([]);
      setCourseLinks([]);
      setCourseLinkContent({});
      setLessonsByModule({});
      setMockTestsByModule({});
      setProgrammingQuestions([]);
      setExpandedModule(null);
      setCourseEnrollment(null);
      setInlineLesson(null);
      setInlineMockTest(null);
      setInlineMockResult(null);
    }
  }, [routeCourseId, loadCourseDetail]);

  const openCourseDetail = useCallback((courseId) => {
    navigate(`/StudentDashboard/my-courses/${courseId}`);
  }, [navigate]);

  const loadCourseLinkContent = useCallback(async (courseLink) => {
    if (courseLinkContent[courseLink.id]) return;
    const linkedCourseId = courseLink.courseId;
    try {
      const { data } = await getModules(linkedCourseId);
      const linkedMods = data || [];
      const mapped = await Promise.all(
        linkedMods.map((m) =>
          Promise.all([
            getLessons(m.id).then(({ data }) => (Array.isArray(data) ? data : [])).catch(() => []),
            getMockTests(m.id).then(({ data }) => (Array.isArray(data) ? data : [])).catch(() => []),
          ]).then(([lessons, tests]) => [m.id, { lessons, mockTests: tests }])
        )
      );
      const lessonsByModule = Object.fromEntries(mapped.map(([id, v]) => [id, v.lessons]));
      const mockTestsByModule = Object.fromEntries(mapped.map(([id, v]) => [id, v.mockTests]));
      setCourseLinkContent((prev) => ({ ...prev, [courseLink.id]: { modules: linkedMods, lessonsByModule, mockTestsByModule, loaded: true } }));
    } catch (err) {
      console.error("Failed to load linked course content:", err);
      setCourseLinkContent((prev) => ({ ...prev, [courseLink.id]: { modules: [], lessonsByModule: {}, mockTestsByModule: {}, loaded: true, error: true } }));
    }
  }, [courseLinkContent]);

  const openKitDetail = useCallback(async (kitId) => {
    setSelectedKit(kitId);
    setKitLoading(true);
    setKitDetail(null);
    setExpandedKitModule(null);
    try {
      const { data } = await getKitById(kitId);
      setKitDetail(data);
    } catch (err) {
      console.error("Failed to load kit:", err);
      toast.error("Failed to load interview kit");
    } finally {
      setKitLoading(false);
    }
  }, []);

  const organizeQuestionsByModule = useCallback((kit) => {
    if (!kit) return [];
    const modules = (kit.modules || []).map((m) => ({
      id: m.id,
      name: m.name,
      questions: (m.questions || []).slice().sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)),
    }));
    const unassigned = (kit.questions || [])
      .filter((q) => !q.moduleId)
      .slice()
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    if (unassigned.length > 0) {
      modules.push({ id: "_unassigned", name: "General Questions", questions: unassigned });
    }
    return modules;
  }, []);

  const isCodeQuestion = useCallback((q) => {
    return (q?.questionType || "").toUpperCase() === "CODE" || !!q?.codeSnippet || !!q?.codeLanguage;
  }, []);

  const handleEnrollInKit = async (kitId) => {
    try {
      await enrollInKit(kitId);
      setEnrolledKitIds((prev) => new Set([...prev, kitId]));
      toast.success("Enrolled in kit successfully!");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to enroll in kit");
    }
  };

  /* Enroll flow for interview kits:
     - Free kits enroll instantly.
     - Paid kits go through cart -> order -> Razorpay checkout; on success
       the backend activates the kit enrollment (OrderController +
       PaymentController). */
  const handleEnrollOrBuyKit = async (kit) => {
    if (!kit || enrolledKitIds.has(kit.id)) return;
    const isPaid = Number(kit.price || 0) > 0;
    if (isPaid) {
      setKitPaymentBusy(kit.id);
      setKitPaymentError(null);
      let orderId = null;
      try {
        await addKitToCart(kit.id);
        window.dispatchEvent(new Event("cart:updated"));
        try {
          const { data: order } = await checkoutCart();
          orderId = order.id;
        } catch (err) {
          if (err.response?.status !== 409) throw err;
        }
        await payOrder({
          orderId,
          prefill: {
            name: [user?.firstName, user?.lastName].filter(Boolean).join(" "),
            email: user?.email,
          },
        });
        toast.success("Payment successful! Your kit is now unlocked.", {
          iconTheme: { primary: "#00A86B", secondary: "#fff" },
          duration: 4000,
        });
        window.dispatchEvent(new Event("cart:updated"));
        await loadData();
      } catch (err) {
        console.error("Kit purchase failed:", err);
        const message =
          err.response?.data?.message ||
          err.message ||
          "Payment failed. Please try again.";
        setKitPaymentError(message);
        toast.error(message);
        navigate("/cart");
      } finally {
        setKitPaymentBusy(null);
      }
    } else {
      handleEnrollInKit(kit.id);
    }
  };

  const firstName = user?.firstName || "Student";
  const inProgress = enrollments.filter((e) => e.enrollmentStatus === "IN_PROGRESS" || e.enrollmentStatus === "ENROLLED");
  const completed = enrollments.filter((e) => e.enrollmentStatus === "COMPLETED");
  const continueCourse = [...inProgress].sort((a, b) => (b.progressPercentage || 0) - (a.progressPercentage || 0))[0];
  const enrolledIds = new Set(enrollments.map((e) => e.courseId));
  const newCourses = publishedCourses.filter((c) => !enrolledIds.has(c.id)).slice(0, 3);

  const filteredMyCourses = enrollments.filter((e) => {
    if (myCoursesFilter === "IN_PROGRESS") return e.enrollmentStatus === "IN_PROGRESS" || e.enrollmentStatus === "ENROLLED";
    if (myCoursesFilter === "COMPLETED") return e.enrollmentStatus === "COMPLETED";
    return true;
  }).filter((e) => courseSearch ? e.title?.toLowerCase().includes(courseSearch.toLowerCase()) : true);

  const stats = [
    { label: "My Courses", value: String(enrollments.length), sub: "Enrolled Courses", color: "#eef2ff", iconBg: "#4f46e5", Icon: BookOpen },
    { label: "In Progress", value: String(inProgress.length), sub: "Courses", color: "#f0fdf4", iconBg: "#16a34a", Icon: PlayCircle },
    { label: "Completed", value: String(completed.length), sub: "Courses", color: "#faf5ff", iconBg: "#9333ea", Icon: CheckCircle },
    { label: "Avg. Progress", value: `${enrollments.length ? Math.round(enrollments.reduce((s, e) => s + (e.progressPercentage || 0), 0) / enrollments.length) : 0}%`, sub: "Overall", color: "#fffbeb", iconBg: "#d97706", Icon: TrendingUp },
    { label: "Learning Time", value: `${enrollments.length * 4}h`, sub: "Estimated Hours", color: "#fff1f2", iconBg: "#e11d48", Icon: Clock },
  ];

  const weeklyData = [40, 65, 80, 55, 90, 70, 45];
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  const handleInlineNav = (type, id, resultData) => {
    if (type === "my-courses") {
      setInlineLesson(null);
      setInlineMockTest(null);
      setInlineMockResult(null);
      navigate("/StudentDashboard/my-courses");
    } else if (type === "course") {
      setInlineLesson(null);
      setInlineMockTest(null);
      setInlineMockResult(null);
    } else if (type === "lesson") {
      setInlineLesson({ moduleId: id.moduleId, lessonId: id.lessonId });
      setInlineMockTest(null);
      setInlineMockResult(null);
    } else if (type === "test") {
      setInlineLesson(null);
      setInlineMockTest(id);
      setInlineMockResult(null);
    } else if (type === "result") {
      setInlineLesson(null);
      setInlineMockTest(null);
      setInlineMockResult({ mockTestId: id, result: resultData });
    }
  };

  const promptEnroll = () => {
    if (!courseDetail) return;
    toast.error(
      Number(courseDetail.price || 0) > 0
        ? "Add this course to your cart and complete checkout to unlock it"
        : "Enroll in this course to unlock its content"
    );
  };

  const handleViewLessonFromCurriculum = (moduleId, lessonId) => {
    if (!isEnrolled) {
      promptEnroll();
      return;
    }
    handleInlineNav("lesson", { moduleId, lessonId });
  };

  const handleViewMockTestFromCurriculum = (testId) => {
    if (!isEnrolled) {
      promptEnroll();
      return;
    }
    handleInlineNav("test", testId);
  };

  const handleViewProgrammingQuestion = (questionId) => {
    if (!isEnrolled) {
      promptEnroll();
      return;
    }
    navigate(`/StudentDashboard/my-courses/${routeCourseId}/programming/${questionId}`);
  };

  const handleProgrammingSubmissionComplete = (questionId, status) => {
    setProgrammingQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, studentStatus: status } : q))
    );
  };

  /* Enroll flow for courses opened from My Courses:
     - Free courses enroll instantly.
     - Paid courses go through cart -> order -> Razorpay checkout; on
       success the backend activates the enrollment (OrderController +
       PaymentController). */
  const handleEnrollOrBuy = async () => {
    if (!courseDetail || isEnrolled) return;
    const isPaid = Number(courseDetail.price || 0) > 0;
    if (isPaid) {
      setCoursePaymentBusy(true);
      setCoursePaymentError(null);
      let orderId = null;
      try {
        await addToCart(courseDetail.id);
        window.dispatchEvent(new Event("cart:updated"));
        try {
          const { data: order } = await checkoutCart();
          orderId = order.id;
        } catch (err) {
          if (err.response?.status !== 409) throw err;
        }
        const result = await payOrder({
          orderId,
          prefill: {
            name: [user?.firstName, user?.lastName].filter(Boolean).join(" "),
            email: user?.email,
          },
        });
        const count = result.enrolledCourseIds?.length || 0;
        toast.success(
          `Payment successful!${count > 0 ? ` ${count} course${count > 1 ? "s" : ""} unlocked.` : ""}`,
          { iconTheme: { primary: "#00A86B", secondary: "#fff" }, duration: 4000 }
        );
        window.dispatchEvent(new Event("cart:updated"));
        await loadCourseDetail(courseDetail.id);
        await loadData();
      } catch (err) {
        console.error("Enroll/Payment failed:", err);
        setCoursePaymentError(
          err.response?.data?.message || err.message || "Payment failed. Please try again."
        );
        toast.error(
          err.response?.data?.message ||
            err.message ||
            "Payment failed. Please try again."
        );
        navigate("/cart");
      } finally {
        setCoursePaymentBusy(false);
      }
    } else {
      setEnrollingCourse(true);
      try {
        await enrollInCourse(courseDetail.id);
        toast.success("Enrolled successfully! Full course content unlocked.", {
          iconTheme: { primary: "#00A86B", secondary: "#fff" },
        });
        await loadCourseDetail(courseDetail.id);
        await loadData();
      } catch (err) {
        console.error("Failed to enroll:", err);
        toast.error(
          err.response?.data?.message || "Failed to enroll in this course"
        );
      } finally {
        setEnrollingCourse(false);
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A86B]" /></div>;
  }

  const isEnrolled = !!courseEnrollment;
  const path = location.pathname;
  const isMyCourses = path.includes("/my-courses");
  const isInterviewKits = path.includes("/interview-kits");
  const isSettings = path.includes("/settings");
  const isCertificates = path.includes("/certificates");

  
  /* ── Route-based: settings / profile ──────────────────────────── */
  if (isSettings) {
    return <StudentProfile embedded />;
  }

  /* ── Route-based: interview kit detail ──────────────────────── */
  if (selectedKit) {
    return (
      <div className="p-6 space-y-6">
        <button onClick={() => { setSelectedKit(null); setKitDetail(null); setExpandedKitModule(null); }} className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#00A86B] transition-colors">
          <ArrowLeft size={16} /> Back to Interview Kits
        </button>
        {kitLoading ? (
          <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A86B]" /></div>
        ) : kitDetail ? (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#422006] to-[#78350f] rounded-2xl p-6 text-white">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <span className="text-xs font-bold text-amber-300 tracking-wider uppercase">{kitDetail.level}</span>
                  <h1 className="text-2xl font-bold mt-2 mb-3">{kitDetail.name}</h1>
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">{kitDetail.description || "No description available."}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                    <span className="flex items-center gap-1"><ClipboardList className="w-4 h-4" />{kitDetail.questionCount || kitDetail.questions?.length || 0} questions</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{kitDetail.level}</span>
                  </div>
                  <div className="mt-4">
                    {enrolledKitIds.has(kitDetail.id) ? (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white/15 text-amber-100 border border-amber-300/40">
                        <CheckCircle2 className="w-4 h-4" /> Enrolled — questions unlocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white/10 text-slate-200 border border-white/20">
                        <Lock className="w-4 h-4" /> Enroll to unlock questions & answers
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {(() => {
              const kitModules = organizeQuestionsByModule(kitDetail);
              const totalQuestions = kitModules.reduce((acc, m) => acc + m.questions.length, 0);
              const isEnrolled = enrolledKitIds.has(kitDetail.id);
              return (
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-[#0B2545]">Modules</h2>
                    <span className="text-xs text-slate-400">{kitModules.length} module{kitModules.length !== 1 ? "s" : ""} · {totalQuestions} questions</span>
                  </div>

                  {!isEnrolled && (
                    <div className="mb-6 p-5 bg-amber-50/70 border border-amber-200 rounded-2xl">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0"><Lock className="w-4 h-4 text-amber-600" /></div>
                        <div className="flex-1">
                          <h3 className="text-sm font-bold text-amber-800">Enroll to view the questions</h3>
                          <p className="text-xs text-amber-700 mt-1 leading-relaxed">The modules are listed below, but their questions and answers are locked until you enroll in this interview kit.</p>
                          {kitDetail.price > 0 ? (
                            <button
                              onClick={() => handleEnrollOrBuyKit(kitDetail)}
                              disabled={kitPaymentBusy === kitDetail.id}
                              className="mt-3 px-5 py-2.5 bg-[#00A86B] hover:bg-[#008f5a] text-white text-xs font-bold rounded-xl shadow-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {kitPaymentBusy === kitDetail.id ? "Processing..." : "Enroll Now"}
                            </button>
                          ) : (
                            <button onClick={() => handleEnrollInKit(kitDetail.id)} className="mt-3 px-5 py-2.5 bg-[#00A86B] hover:bg-[#008f5a] text-white text-xs font-bold rounded-xl shadow-md transition-colors">Enroll Free</button>
                          )}
                          {kitPaymentError && (
                            <p className="mt-2 text-xs font-semibold text-red-600">{kitPaymentError}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {kitModules.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-6">No modules in this kit yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {kitModules.map((mod, modIdx) => {
                        const isExpanded = expandedKitModule === mod.id;
                        return (
                          <div key={mod.id || modIdx} className="border border-slate-100 rounded-xl overflow-hidden">
                            <button
                              onClick={() => setExpandedKitModule(isExpanded ? null : mod.id)}
                              disabled={!isEnrolled}
                              className={`w-full flex items-center justify-between p-4 text-left transition-colors ${isEnrolled ? "hover:bg-slate-50 cursor-pointer" : "cursor-not-allowed"}`}
                            >
                              <div className="flex items-center gap-3">
                                {isEnrolled ? (
                                  isExpanded ? <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" /> : <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                                ) : (
                                  <Lock className="w-4 h-4 text-slate-300 shrink-0" />
                                )}
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-[#0B2545] text-sm">Module {modIdx + 1}: {mod.name}</span>
                                  <span className="text-xs text-slate-400">{mod.questions.length} question{mod.questions.length !== 1 ? "s" : ""}</span>
                                </div>
                              </div>
                              {!isEnrolled && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 shrink-0">Locked</span>}
                            </button>
                            {isExpanded && isEnrolled && (
                              <div className="border-t border-slate-100 bg-slate-50/50">
                                {mod.questions.length === 0 ? (
                                  <p className="text-sm text-slate-400 text-center py-4">No questions in this module.</p>
                                ) : (
                                  <div className="divide-y divide-slate-100">
                                    {mod.questions.map((q, qIdx) => (
                                      <div key={q.id || qIdx} className="p-4">
                                        <div className="flex items-start gap-3">
                                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isCodeQuestion(q) ? "bg-blue-50" : "bg-green-50"}`}>
                                            {isCodeQuestion(q) ? <Code className="w-4 h-4 text-blue-500" /> : <FileText className="w-4 h-4 text-green-500" />}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-[#0B2545]">Q{qIdx + 1}. {q.question}</p>
                                            {q.codeSnippet && isCodeQuestion(q) && (
                                              <div className="mt-2">
                                                <pre className="text-xs font-mono bg-[#0B2545] text-green-400 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap">{q.codeSnippet}</pre>
                                              </div>
                                            )}
                                            <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-100">
                                              <p className="text-xs font-semibold text-green-700 mb-1">Answer:</p>
                                              <RenderAnswer content={q.answer} />
                                            </div>
                                            {isCodeQuestion(q) && (
                                              <div className="mt-4 rounded-2xl border border-blue-200 overflow-hidden">
                                                <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50 border-b border-blue-100">
                                                  <div className="flex items-center gap-2">
                                                    <Code className="w-4 h-4 text-blue-600" />
                                                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                                                      {q.codeLanguage || "Code"} Compiler
                                                    </span>
                                                  </div>
                                                  <span className="text-[10px] font-mono text-blue-500">Edit & Run your solution</span>
                                                </div>
                                                <CodePlayground language={q.codeLanguage} starterCode={q.codeSnippet || ""} height={260} />
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-10">Kit not found</p>
        )}
      </div>
    );
  }

  /* ── Route-based: lesson view ──────────────────────────────── */
  if (moduleId && lessonId) {
    return (
      <div className="p-6">
        <InlineLessonView moduleId={moduleId} lessonId={lessonId} onBack={() => navigate(-1)} />
      </div>
    );
  }

  /* ── Route-based: mock test result ─────────────────────────── */
  const isMockTestResult = /\/mock-tests\/.+\/result$/.test(path);
  if (isMockTestResult && mockTestId) {
    return (
      <div className="p-6">
        <InlineMockTestResult mockTestId={mockTestId} result={null} onBack={(type, id, data) => handleInlineNav(type, id, data)} />
      </div>
    );
  }

  /* ── Route-based: mock test ────────────────────────────────── */
  const isMockTestView = /\/mock-tests\/[^/]+$/.test(path) && !isMockTestResult;
  if (isMockTestView && mockTestId) {
    return (
      <div className="p-6">
        <InlineMockTestView mockTestId={mockTestId} onBack={(type, id, data) => handleInlineNav(type, id, data)} />
      </div>
    );
  }

  /* ── Route-based: programming question ─────────────────────── */
  if (programmingQuestionId) {
    return (
      <div className="p-6">
        <ProgrammingQuestionView
          questionId={programmingQuestionId}
          onBack={() => navigate(-1)}
          onSubmissionComplete={handleProgrammingSubmissionComplete}
        />
      </div>
    );
  }

  /* ── State-based: inline lesson/mock test (from course detail) ── */
  if (inlineLesson) {
    return (
      <div className="p-6">
        <InlineLessonView moduleId={inlineLesson.moduleId} lessonId={inlineLesson.lessonId} onBack={() => handleInlineNav("course")} />
      </div>
    );
  }
  if (inlineMockTest && !inlineMockResult) {
    return (
      <div className="p-6">
        <InlineMockTestView mockTestId={inlineMockTest} onBack={(type, id, data) => handleInlineNav(type, id, data)} />
      </div>
    );
  }
  if (inlineMockResult) {
    return (
      <div className="p-6">
        <InlineMockTestResult mockTestId={inlineMockResult.mockTestId} result={inlineMockResult.result} onBack={(type, id, data) => handleInlineNav(type, id, data)} />
      </div>
    );
  }

  /* ── Course Detail (URL-driven via /StudentDashboard/my-courses/:courseId) ─── */
  if (routeCourseId) {
    return (
      <div className="p-6 space-y-6">
        <button onClick={() => navigate("/StudentDashboard/my-courses")} className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#00A86B] transition-colors">
          <ArrowLeft size={16} /> Back to {isMyCourses ? "My Courses" : "Dashboard"}
        </button>
        {courseLoading || (!courseDetail && !courseLoadFailed) ? (
          <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A86B]" /></div>
        ) : courseDetail ? (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#0B2545] to-[#13315c] rounded-2xl p-6 text-white">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <span className="text-xs font-bold text-[#00A86B] tracking-wider uppercase">{levelLabels[courseDetail.level] || "Course"}</span>
                  <h1 className="text-2xl font-bold mt-2 mb-3">{courseDetail.title}</h1>
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">{courseDetail.shortDescription || courseDetail.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                    <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{courseModules.length + courseLinks.length} modules</span>
                    {courseDetail.level && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{levelLabels[courseDetail.level]}</span>}
                    {courseDetail.language && <span className="flex items-center gap-1"><Globe className="w-4 h-4" />{courseDetail.language}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {courseDetail.thumbnailUrl && <img src={courseDetail.thumbnailUrl} alt={courseDetail.title} className="w-full lg:w-48 h-32 object-cover rounded-xl" />}
                  {!isEnrolled && (
                    <div className="bg-white rounded-2xl p-5 text-[#0B2545] shadow-xl lg:w-64 shrink-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-black">₹{courseDetail.price || 0}</span>
                        {(courseDetail.price || 0) > 0 && (
                          <span className="text-sm text-slate-400 line-through">₹{courseDetail.originalPrice || Math.round((courseDetail.price || 0) * 2)}</span>
                        )}
                      </div>
                      {(courseDetail.price || 0) > 0 && (
                        <p className="text-xs text-slate-400 mb-4">One-time payment &middot; lifetime access</p>
                      )}
                      <button
                        onClick={handleEnrollOrBuy}
                        disabled={enrollingCourse || coursePaymentBusy}
                        className="w-full py-3 bg-[#00A86B] hover:bg-[#008f5a] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {coursePaymentBusy
                          ? "Adding..."
                          : enrollingCourse
                          ? "Enrolling..."
                          : (courseDetail.price || 0) > 0
                          ? "Enroll Now"
                          : "Enroll Free"}
                      </button>
                      {coursePaymentError && <p className="text-[11px] text-red-500 mt-2 text-center">{coursePaymentError}</p>}
                      <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#00A86B]">
                        <Lock className="w-3 h-3" /> Enroll to unlock lessons & mock tests
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="text-lg font-bold text-[#0B2545] mb-4">Curriculum</h2>
              {isEnrolled ? (
                <p className="text-xs text-[#00A86B] font-semibold mb-4">All modules unlocked — start learning!</p>
              ) : (
                <p className="text-xs text-slate-500 font-semibold mb-4">
                  All content is locked — <span className="text-[#00A86B]">enroll to unlock lessons & mock tests</span>
                </p>
              )}
              <div className="space-y-3">
                {[...courseModules].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((mod) => {
                  const lessons = lessonsByModule[mod.id] || [];
                  const tests = mockTestsByModule[mod.id] || [];
                  const isExpanded = expandedModule === mod.id;
                  const locked = !isEnrolled;
                  return (
                    <div key={mod.id} className="border border-slate-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedModule(isExpanded ? null : mod.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {locked ? (
                            <Lock className="w-4 h-4 text-slate-300 flex-shrink-0" />
                          ) : isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                          )}
                          <span className={`font-semibold text-sm truncate ${locked ? "text-slate-400" : "text-[#0B2545]"}`}>Module {mod.displayOrder}: {mod.title}</span>
                        </div>
                        <span className="text-xs text-slate-400 flex-shrink-0 ml-3">
                          {locked
                            ? `${lessons.length} lessons${tests.length > 0 ? ` · ${tests.length} test${tests.length > 1 ? "s" : ""}` : ""} · Locked`
                            : `${lessons.length} lessons${tests.length > 0 ? ` · ${tests.length} test${tests.length > 1 ? "s" : ""}` : ""}`}
                        </span>
                      </button>
                      {isExpanded && (
                        <div className="border-t border-slate-100 bg-slate-50/50">
                          {lessons.length > 0 && (
                            <>
                              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide px-6 pt-3 pb-1 flex items-center gap-1.5">
                                {/* <BookOpenCheck className="w-3.5 h-3.5 text-[#00A86B]" /> Lessons */}
                                Lessons
                              </p>
                              {[...lessons].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((lesson) => (
                                <button key={lesson.id} onClick={() => handleViewLessonFromCurriculum(mod.id, lesson.id)} className={`w-full flex items-center gap-3 px-6 py-3 transition-colors text-left border-b border-slate-100 last:border-0 ${locked ? "hover:bg-slate-100 cursor-not-allowed" : "hover:bg-slate-100"}`}>
                                  {locked ? (
                                    <Lock className="w-4 h-4 text-slate-300 flex-shrink-0" />
                                  ) : (
                                    <BookOpenCheck className="w-4 h-4 text-[#00A86B] flex-shrink-0" />
                                  )}
                                  <span className={`text-sm ${locked ? "text-slate-400" : "text-slate-600"}`}>{lesson.title}</span>
                                  {lesson.estimatedMinutes && <span className="text-xs text-slate-400 ml-auto">{lesson.estimatedMinutes} min</span>}
                                </button>
                              ))}
                            </>
                          )}
                          {tests.length > 0 && (
                            <>
                              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide px-6 pt-3 pb-1 flex items-center gap-1.5">
                                {/* <NotebookPen className="w-3.5 h-3.5 text-blue-600" /> Mock Tests */}
                                Mock Tests
                              </p>
                              {[...tests].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((test) => (
                                <button key={test.id} onClick={() => handleViewMockTestFromCurriculum(test.id)} className={`w-full flex items-center gap-3 px-6 py-3 transition-colors text-left border-b border-slate-100 last:border-0 ${locked ? "hover:bg-slate-100 cursor-not-allowed" : "hover:bg-slate-100"}`}>
                                  {locked ? (
                                    <Lock className="w-4 h-4 text-slate-300 flex-shrink-0" />
                                  ) : (
                                    <NotebookPen className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                  )}
                                  <span className={`text-sm ${locked ? "text-slate-400" : "text-slate-600"}`}>{test.title}</span>
                                  <span className="text-xs text-slate-400 ml-auto">{(test.questions || []).length} questions</span>
                                </button>
                              ))}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {[...courseLinks].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((cm) => {
                  const isExpanded = expandedModule === `cm:${cm.id}`;
                  const content = courseLinkContent[cm.id];
                  const linkedMods = content?.modules || [];
                  const linkLessonsCount = linkedMods.reduce((acc, m) => acc + (content?.lessonsByModule?.[m.id]?.length || 0), 0);
                  return (
                    <div key={cm.id} className="rounded-xl overflow-hidden border border-[#00A86B]/30">
                      <button onClick={() => { if (!isExpanded) { setExpandedModule(`cm:${cm.id}`); if (!content?.loaded) loadCourseLinkContent(cm); } else { setExpandedModule(null); } }} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left">
                        <div className="flex items-center gap-3 min-w-0">
                          {!isEnrolled ? <Lock className="w-4 h-4 text-slate-300 flex-shrink-0" /> : isExpanded ? <ChevronDown className="w-5 h-5 text-[#00A86B] flex-shrink-0" /> : <ChevronRight className="w-5 h-5 text-[#00A86B] flex-shrink-0" />}
                          <BookOpen className="w-5 h-5 text-[#00A86B] flex-shrink-0" />
                          <div className="min-w-0">
                            <span className={`font-semibold text-sm truncate block ${!isEnrolled ? "text-slate-400" : "text-[#0B2545]"}`}>{cm.displayOrder}. {cm.title}</span>
                            <span className="text-xs font-semibold text-[#008f5a]">Type: Existing Course</span>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400 flex-shrink-0">{content?.loaded ? `${linkedMods.length} module${linkedMods.length === 1 ? "" : "s"} · ${linkLessonsCount} lessons` : ""}</span>
                      </button>
                      {isExpanded && (
                        <div className="border-t border-[#00A86B]/20">
                          {!content?.loaded && <div className="flex items-center justify-center py-6"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00A86B]" /></div>}
                          {content?.loaded && linkedMods.length === 0 && <p className="text-sm text-slate-400 text-center py-4">This course has no modules yet.</p>}
                          {content?.loaded && [...linkedMods].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((mod) => {
                            const cLessons = content.lessonsByModule[mod.id] || [];
                            const cTests = content.mockTestsByModule[mod.id] || [];
                            return (
                              <div key={mod.id} className="px-6 py-3 border-b border-slate-100 last:border-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs px-1.5 py-0.5 bg-[#00A86B]/10 text-[#008f5a] rounded flex-shrink-0 font-semibold">Module {mod.displayOrder}: {mod.title}</span>
                                  <span className="text-xs text-slate-400">{cLessons.length} lessons{cTests.length > 0 ? ` · ${cTests.length} mock test${cTests.length === 1 ? "" : "s"}` : ""}</span>
                                  {!isEnrolled && <span className="text-xs text-slate-400 flex-shrink-0">· Locked</span>}
                                </div>
                                {cLessons.length > 0 && (
                                  <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mt-3 mb-1 flex items-center gap-1.5">
                                    {/* <BookOpenCheck className="w-3.5 h-3.5 text-[#00A86B]" /> Lessons */}
                                    Lessons
                                  </p>
                                )}
                                {cLessons.map((lesson) => (
                                  <button key={lesson.id} onClick={() => handleViewLessonFromCurriculum(mod.id, lesson.id)} className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors text-left ${!isEnrolled ? "cursor-not-allowed" : ""}`}>
                                    {!isEnrolled ? (
                                      <Lock className="w-4 h-4 text-slate-300 flex-shrink-0" />
                                    ) : (
                                      <BookOpenCheck className="w-4 h-4 text-[#00A86B] flex-shrink-0" />
                                    )}
                                    <span className={`text-sm ${!isEnrolled ? "text-slate-400" : "text-slate-600"}`}>{lesson.title}</span>
                                    {lesson.estimatedMinutes && <span className="text-xs text-slate-400 ml-auto">{lesson.estimatedMinutes} min</span>}
                                  </button>
                                ))}
                                {cTests.length > 0 && (
                                  <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mt-3 mb-1 flex items-center gap-1.5">
                                    {/* <NotebookPen className="w-3.5 h-3.5 text-blue-600" /> Mock Tests */}
                                     Mock Tests
                                  </p>
                                )}
                                {cTests.length > 0 && cTests.map((test) => (
                                  <button key={test.id} onClick={() => handleViewMockTestFromCurriculum(test.id)} className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors text-left ${!isEnrolled ? "cursor-not-allowed" : ""}`}>
                                    {!isEnrolled ? (
                                      <Lock className="w-4 h-4 text-slate-300 flex-shrink-0" />
                                    ) : (
                                      <NotebookPen className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    )}
                                    <span className={`text-sm ${!isEnrolled ? "text-slate-400" : "text-slate-600"}`}>{test.title}</span>
                                  </button>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
                {courseModules.length === 0 && courseLinks.length === 0 && <p className="text-sm text-slate-400 text-center py-6">Curriculum coming soon</p>}
              </div>

              {programmingQuestions.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    Programming Questions
                  </p>
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
                    {[...programmingQuestions].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((pq) => {
                      const pqDiff = PQ_DIFFICULTY_COLORS[pq.difficulty] || PQ_DIFFICULTY_COLORS.MEDIUM;
                      const pqStatus = pq.studentStatus || "NOT_ATTEMPTED";
                      return (
                        <button key={pq.id} onClick={() => handleViewProgrammingQuestion(pq.id)} className={`w-full flex items-center gap-3 px-6 py-3 transition-colors text-left border-b border-slate-100 last:border-0 ${!isEnrolled ? "hover:bg-slate-100 cursor-not-allowed" : "hover:bg-slate-100"}`}>
                          {!isEnrolled ? (
                            <Lock className="w-4 h-4 text-slate-300 flex-shrink-0" />
                          ) : pqStatus === "ACCEPTED" ? (
                            <span title="Accepted" className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-600 flex-shrink-0" />
                          ) : pqStatus === "ATTEMPTED" ? (
                            <span title="Attempted" className="w-4 h-4 rounded-full bg-amber-700 border-2 border-amber-800 flex-shrink-0" />
                          ) : (
                            <span title="Not attempted" className="w-4 h-4 rounded-full border-2 border-slate-300 flex-shrink-0" />
                          )}
                          <span className={`text-sm flex-1 truncate ${!isEnrolled ? "text-slate-400" : "text-slate-600"}`}>{pq.title}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${pqDiff.bg} ${pqDiff.text}`}>{pq.difficulty}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Enroll CTA under curriculum for non-enrolled courses */}
              {!isEnrolled && (
                <div className="mt-4 bg-gradient-to-r from-[#0B2545] to-[#13315c] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-white">
                    <p className="font-bold">{courseModules.length} module{courseModules.length !== 1 ? "s" : ""} · all lessons & mock tests locked</p>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {(courseDetail.price || 0) > 0
                        ? "Enroll now to unlock the full course content — checkout securely via Razorpay"
                        : "Enroll now to unlock the full course content, lessons and mock tests"}
                    </p>
                  </div>
                  <button
                    onClick={handleEnrollOrBuy}
                    disabled={enrollingCourse || coursePaymentBusy}
                    className="flex-shrink-0 px-6 py-2.5 bg-[#00A86B] hover:bg-[#008f5a] text-white text-sm font-bold rounded-xl shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {coursePaymentBusy
                      ? "Adding to Cart..."
                      : enrollingCourse
                      ? "Enrolling..."
                      : (courseDetail.price || 0) > 0
                      ? "Enroll Now - Proceed to Pay"
                      : "Enroll Free"}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-slate-500 text-center py-10">Course not found</p>
        )}
      </div>
    );
  }

  /* ── DASHBOARD VIEW ───────────────────────────────────────── */
  if (!isMyCourses && !isInterviewKits && !isCertificates) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{getGreeting()}, {firstName}!</h1>
          <p className="text-sm text-slate-500 mt-0.5">Welcome back! Continue your learning journey.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {stats.map(({ label, value, sub, color, iconBg, Icon }) => (
            <div key={label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3"><div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color }}><Icon size={18} color={iconBg} /></div></div>
              <p className="text-2xl font-bold text-slate-800">{value}</p>
              <p className="text-xs font-medium text-slate-600 mt-0.5">{label}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
        {continueCourse && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">Continue Learning</h2>
              <button onClick={() => navigate("/StudentDashboard/my-courses")} className="text-[#00A86B] text-xs font-medium hover:underline">View All</button>
            </div>
            <div className="flex gap-5">
              <div className="w-44 h-28 rounded-xl shrink-0 overflow-hidden">
                {continueCourse.thumbnailUrl ? <img src={continueCourse.thumbnailUrl} alt={continueCourse.title} className="w-full h-full object-cover" /> : <div className={`w-full h-full bg-gradient-to-br ${COURSE_GRADIENTS[0].bg} flex items-center justify-center`}><span className="text-2xl font-black" style={{ color: COURSE_GRADIENTS[0].accent }}>{(continueCourse.title || "C").charAt(0)}</span></div>}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-800 text-sm">{continueCourse.title}</h3>
                <p className="text-xs text-[#00A86B] font-medium mt-0.5">{continueCourse.enrollmentStatus === "IN_PROGRESS" ? "In Progress" : "Enrolled"}</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden"><div className="bg-[#00A86B] h-2 rounded-full transition-all" style={{ width: `${continueCourse.progressPercentage || 0}%` }} /></div>
                  <span className="text-xs font-medium text-slate-600 shrink-0">{continueCourse.progressPercentage || 0}%</span>
                </div>
                <button onClick={() => openCourseDetail(continueCourse.courseId)} className="mt-3 inline-flex items-center gap-2 bg-[#00A86B] hover:bg-[#008f5a] text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors"><Play size={12} /> Continue Learning</button>
              </div>
            </div>
          </div>
        )}
        {enrollments.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">My Courses</h2>
              <button onClick={() => navigate("/StudentDashboard/my-courses")} className="text-[#00A86B] text-xs font-medium hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrollments.slice(0, 3).map((course, i) => {
                const grad = COURSE_GRADIENTS[i % COURSE_GRADIENTS.length];
                const levelStyle = LEVEL_COLORS[course.level] || LEVEL_COLORS.BEGINNER;
                return (
                  <div key={course.courseId} className="rounded-xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => openCourseDetail(course.courseId)}>
                    <div className="h-24 flex items-center justify-center relative overflow-hidden">
                      {course.thumbnailUrl ? <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" /> : <div className={`w-full h-full bg-gradient-to-br ${grad.bg} flex items-center justify-center`}><span className="text-2xl font-black" style={{ color: grad.accent }}>{(course.title || "C").charAt(0)}</span></div>}
                      <span className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[course.enrollmentStatus] || "bg-slate-100 text-slate-500"}`}>{course.enrollmentStatus?.replace("_", " ")}</span>
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2">{course.title}</p>
                      {course.level && <span className={`inline-block mt-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded ${levelStyle.bg} ${levelStyle.text}`}>{course.level}</span>}
                      <div className="mt-2 flex items-center gap-2"><div className="flex-1 bg-slate-100 rounded-full h-1.5"><div className="h-1.5 rounded-full bg-[#00A86B]" style={{ width: `${course.progressPercentage || 0}%` }} /></div><span className="text-[10px] text-slate-500">{course.progressPercentage || 0}%</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {newCourses.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4"><h2 className="font-semibold text-slate-800">Recently Added</h2></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {newCourses.map((course, i) => {
                const grad = COURSE_GRADIENTS[(i + 3) % COURSE_GRADIENTS.length];
                return (
                  <div key={course.id} className="rounded-xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => openCourseDetail(course.id)}>
                    <div className="h-24 flex items-center justify-center relative overflow-hidden">
                      {course.thumbnailUrl ? <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" /> : <div className={`w-full h-full bg-gradient-to-br ${grad.bg} flex items-center justify-center`}><span className="text-2xl font-black" style={{ color: grad.accent }}>{(course.title || "N").charAt(0)}</span></div>}
                      <span className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#00A86B] text-white">NEW</span>
                    </div>
                    <div className="p-3"><p className="text-xs font-semibold text-slate-800 leading-snug">{course.title}</p><p className="text-[10px] text-slate-400 mt-0.5">{course.language || "English"}</p></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {enrollments.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-[#0B2545] mb-2">Start your learning journey</h2>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">Browse the course catalog and enroll in a course to get started.</p>
            <button onClick={() => navigate("/courses")} className="inline-flex items-center gap-2 bg-[#00A86B] hover:bg-[#008f5a] text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">Explore Courses</button>
          </div>
        )}
        {/* <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2" />
          <div className="space-y-6 hidden xl:block">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-6">
              <div>
                <h2 className="font-semibold text-slate-800 text-sm mb-3">Upcoming Deadlines</h2>
                <div className="space-y-3">
                  {inProgress.slice(0, 3).map((course, i) => (
                    <div key={course.courseId} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => openCourseDetail(course.courseId)}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${i === 0 ? "bg-rose-100" : "bg-[#00A86B]/10"}`}><Calendar size={14} color={i === 0 ? "#e11d48" : "#00A86B"} /></div>
                      <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-slate-800">{course.title}</p><p className="text-[10px] text-slate-400 mt-0.5">{course.progressPercentage || 0}% completed</p></div>
                    </div>
                  ))}
                  {inProgress.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No upcoming deadlines</p>}
                </div>
              </div>
              <div>
                <h2 className="font-semibold text-slate-800 text-sm mb-3">Weekly Progress</h2>
                <div className="flex items-end gap-1.5 h-20">
                  {weeklyData.map((h, i) => (<div key={i} className="flex-1 flex flex-col items-center gap-1"><div className="w-full rounded-t-lg" style={{ height: `${h}%`, background: i === 4 ? "#00A86B" : "#d1fae5" }} /><span className="text-[9px] text-slate-400">{dayLabels[i]}</span></div>))}
                </div>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    );
  }

  /* ── INTERVIEW KITS VIEW ─────────────────────────────────── */
  if (isInterviewKits) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Interview Kits</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {enrolledKits.length} enrolled kit{enrolledKits.length !== 1 ? "s" : ""} · {publishedKits.length} available
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search kits..."
              value={kitListSearch}
              onChange={(e) => setKitListSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A86B]/20 focus:border-[#00A86B] w-48"
            />
          </div>
        </div>

        {/* Enrolled Kits */}
        {enrolledKits.length > 0 && (
          <div>
            <h2 className="font-semibold text-slate-800 mb-3">My Interview Kits</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledKits.map((kit) => (
                <div
                  key={kit.kitId}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => openKitDetail(kit.kitId)}
                >
                  <div className="h-24 flex items-center justify-center bg-gradient-to-br from-[#422006] to-[#78350f] relative">
                    <Briefcase className="w-8 h-8 text-amber-300" />
                    <span className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                      ENROLLED
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold text-slate-800 leading-snug">{kit.name}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">{kit.level}</span>
                      <span className="text-[10px] text-slate-400">{kit.price > 0 ? `₹${kit.price}` : "Free"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Kits */}
        <div>
          <h2 className="font-semibold text-slate-800 mb-3">Available Interview Kits</h2>
          {(() => {
            const filteredAvailable = publishedKits.filter((k) => !enrolledKitIds.has(k.id) && (kitListSearch ? k.name?.toLowerCase().includes(kitListSearch.toLowerCase()) : true));
            return publishedKits.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-[#0B2545] mb-2">No kits available</h2>
              <p className="text-sm text-slate-500">Interview kits will appear here once published.</p>
            </div>
          ) : filteredAvailable.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-[#0B2545] mb-2">No kits match "{kitListSearch}"</h2>
              <p className="text-sm text-slate-500">Try a different search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAvailable.map((kit) => (
                <div
                  key={kit.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-24 flex items-center justify-center bg-gradient-to-br from-[#422006] to-[#78350f]">
                    <Briefcase className="w-8 h-8 text-amber-300" />
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-bold text-slate-800 leading-snug">{kit.name}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{kit.description || "No description"}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">{kit.level}</span>
                      <span className="text-[10px] text-slate-400">{kit.questionCount || 0} questions</span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                      <span className="text-xs font-bold text-[#00A86B]">{kit.price > 0 ? `₹${kit.price}` : "Free"}</span>
                      {kit.price > 0 ? (
                        <button
                          onClick={() => handleEnrollOrBuyKit(kit)}
                          disabled={kitPaymentBusy === kit.id}
                          className="px-3 py-1.5 bg-[#00A86B] hover:bg-[#008f5a] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {kitPaymentBusy === kit.id ? "Processing..." : "Enroll Now"}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEnrollInKit(kit.id)}
                          className="px-3 py-1.5 bg-[#00A86B] hover:bg-[#008f5a] text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                          Enroll Free
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {publishedKits.every((k) => enrolledKitIds.has(k.id)) && enrolledKits.length > 0 && (
                <div className="col-span-full text-center py-6 text-sm text-slate-400">
                  You're enrolled in all available kits!
                </div>
              )}
            </div>
          );
          })()}
        </div>
      </div>
    );
  }

  /* ── CERTIFICATES VIEW ────────────────────────────────────── */
  if (isCertificates) {
    const studentName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Student";
    const unlockedCount = enrollments.filter((e) => e.enrollmentStatus === "COMPLETED").length;

    const handleDownloadCertificate = (course) => {
      const issueDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      const issuedId = `FP-CERT-${String(course.courseId || 0).padStart(4, "0")}-${new Date().getFullYear()}`;
      const win = window.open("", "_blank");
      if (!win) {
        toast.error("Please allow pop-ups to download your certificate");
        return;
      }
      win.document.write(buildCertificateHtml({ studentName, course, issueDate, issuedId }));
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 300);
    };

    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Certificates</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {unlockedCount} of {enrollments.length} certificate{enrollments.length === 1 ? "" : "s"} unlocked — complete a course to unlock its certificate
          </p>
        </div>

        {enrollments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-[#0B2545] mb-2">No certificates yet</h2>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">Enroll in a course and complete it to earn a verified certificate of completion.</p>
            <button onClick={() => navigate("/courses")} className="inline-flex items-center gap-2 bg-[#00A86B] hover:bg-[#008f5a] text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">Explore Courses</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrollments.map((course) => {
              const unlocked = course.enrollmentStatus === "COMPLETED";
              const progress = course.progressPercentage || 0;
              return (
                <div key={course.courseId} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                  <div className="relative">
                    {unlocked ? (
                      <CertificateArt course={course} studentName={studentName} />
                    ) : (
                      <div className="relative">
                        <div className="opacity-60 grayscale pointer-events-none select-none">
                          <CertificateArt course={course} studentName={studentName} />
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900/40 rounded-xl">
                          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                            <Lock className="w-5 h-5 text-slate-700" />
                          </div>
                          <p className="text-xs font-bold text-white drop-shadow">Certificate Locked</p>
                          <div className="flex items-center gap-2 bg-white/90 rounded-full px-3 py-1">
                            <div className="w-20 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div className="h-1.5 rounded-full bg-[#00A86B]" style={{ width: `${progress}%` }} />
                            </div>
                            <span className="text-[10px] font-semibold text-slate-700">{progress}%</span>
                          </div>
                          <p className="text-[10px] text-white/90 max-w-[200px] text-center">Complete 100% of this course to unlock your certificate</p>
                        </div>
                      </div>
                    )}
                    <span className={`absolute top-2.5 right-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow ${unlocked ? "bg-white/95 text-[#00A86B]" : "bg-slate-800/80 text-white"}`}>
                      {unlocked ? <BadgeCheck className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {unlocked ? "Unlocked" : "Locked"}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="text-sm font-bold text-slate-800 leading-snug line-clamp-2">{course.title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${unlocked ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                        {course.enrollmentStatus?.replace("_", " ") || "ENROLLED"}
                      </span>
                      <span className="text-[10px] text-slate-400">{progress}%</span>
                    </div>
                    <div className="mt-3">
                      {unlocked ? (
                        <div className="flex gap-2">
                          <button onClick={() => setViewingCertificate(course)} className="flex-1 px-3 py-2 bg-[#00A86B] hover:bg-[#008f5a] text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center justify-center gap-1.5">
                            <Award className="w-3.5 h-3.5" /> View Certificate
                          </button>
                          <button onClick={() => handleDownloadCertificate(course)} title="Download PDF" className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition-colors inline-flex items-center justify-center">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => openCourseDetail(course.courseId)} className="w-full px-3 py-2 border border-slate-200 hover:border-[#00A86B] hover:text-[#00A86B] text-slate-600 text-xs font-bold rounded-xl transition-colors inline-flex items-center justify-center gap-1.5">
                          <Play className="w-3.5 h-3.5" /> Complete Course to Unlock
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {viewingCertificate && (() => {
          const course = viewingCertificate;
          const issuedId = `FP-CERT-${String(course.courseId || 0).padStart(4, "0")}-${new Date().getFullYear()}`;
          return (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setViewingCertificate(null)}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <div>
                    <h2 className="font-bold text-[#0B2545]">Certificate of Completion</h2>
                    <p className="text-xs text-slate-500">{course.title}</p>
                  </div>
                  <button onClick={() => setViewingCertificate(null)} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-5">
                  <CertificateArt course={course} studentName={studentName} large />
                </div>
                <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400 font-mono">{issuedId}</p>
                  <div className="flex gap-2">
                    <button onClick={() => setViewingCertificate(null)} className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition-colors">Close</button>
                    <button onClick={() => handleDownloadCertificate(course)} className="px-4 py-2 bg-[#00A86B] hover:bg-[#008f5a] text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    );
  }

  /* ── MY COURSES VIEW ──────────────────────────────────────── */
  const availableCourses = publishedCourses.filter((c) => !enrolledIds.has(c.id));
  const filteredAvailable = availableCourses.filter((c) =>
    courseSearch ? c.title?.toLowerCase().includes(courseSearch.toLowerCase()) : true
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Courses</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {enrollments.length} enrolled course{enrollments.length !== 1 ? "s" : ""} · {availableCourses.length} available
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search courses..." value={courseSearch} onChange={(e) => setCourseSearch(e.target.value)} className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A86B]/20 focus:border-[#00A86B] w-48" />
        </div>
      </div>

      {/* Enrolled Courses */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <h2 className="font-semibold text-slate-800">
            My Courses
            <span className="ml-2 text-[11px] font-semibold text-[#00A86B] bg-[#00A86B]/10 px-2 py-0.5 rounded-full">{enrollments.length}</span>
          </h2>
          <div className="flex gap-2">
            {["ALL", "IN_PROGRESS", "COMPLETED"].map((f) => (
              <button key={f} onClick={() => setMyCoursesFilter(f)} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${myCoursesFilter === f ? "bg-[#00A86B] text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                {f === "ALL" ? "All" : f === "IN_PROGRESS" ? "In Progress" : "Completed"}
              </button>
            ))}
          </div>
        </div>
        {filteredMyCourses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-[#0B2545] mb-2">{enrollments.length === 0 ? "No courses yet" : "No courses match your filter"}</h2>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">{enrollments.length === 0 ? "Explore the available courses below and start learning today." : "Try a different filter or search term."}</p>
            {enrollments.length === 0 && <button onClick={() => navigate("/courses")} className="inline-flex items-center gap-2 bg-[#00A86B] hover:bg-[#008f5a] text-white font-semibold px-6 py-3 rounded-xl transition-all">Browse Courses</button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMyCourses.map((course, i) => {
              const grad = COURSE_GRADIENTS[i % COURSE_GRADIENTS.length];
              const levelStyle = LEVEL_COLORS[course.level] || LEVEL_COLORS.BEGINNER;
              return (
                <div key={course.courseId} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => openCourseDetail(course.courseId)}>
                  <div className="h-36 flex items-center justify-center relative overflow-hidden">
                    {course.thumbnailUrl ? <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" /> : <div className={`w-full h-full bg-gradient-to-br ${grad.bg} flex items-center justify-center`}><span className="text-3xl font-black" style={{ color: grad.accent }}>{(course.title || "C").charAt(0)}</span></div>}
                    <span className={`absolute top-3 right-3 text-[10px] font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[course.enrollmentStatus] || "bg-slate-100 text-slate-500"}`}>{course.enrollmentStatus?.replace("_", " ")}</span>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-bold text-slate-800 leading-snug line-clamp-2">{course.title}</p>
                    <div className="flex items-center gap-2 mt-2">{course.level && <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${levelStyle.bg} ${levelStyle.text}`}>{course.level}</span>}</div>
                    <div className="mt-3 flex items-center gap-2"><div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden"><div className="h-2 rounded-full bg-[#00A86B]" style={{ width: `${course.progressPercentage || 0}%` }} /></div><span className="text-xs font-medium text-slate-500 shrink-0">{course.progressPercentage || 0}%</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available Courses */}
      <div>
        <h2 className="font-semibold text-slate-800 mb-3">
          Available Courses
          <span className="ml-2 text-[11px] font-semibold text-[#00A86B] bg-[#00A86B]/10 px-2 py-0.5 rounded-full">{filteredAvailable.length}</span>
        </h2>
        {publishedCourses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-[#0B2545] mb-2">No available courses yet</h2>
            <p className="text-sm text-slate-500">New courses will appear here once published.</p>
          </div>
        ) : filteredAvailable.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-[#0B2545] mb-2">No courses match "{courseSearch}"</h2>
            <p className="text-sm text-slate-500">Try a different search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAvailable.map((course, i) => {
              const enriched = enrichCourse(course, i);
              const grad = COURSE_GRADIENTS[(i + 1) % COURSE_GRADIENTS.length];
              const levelStyle = LEVEL_COLORS[course.level] || LEVEL_COLORS.BEGINNER;
              return (
                <div key={course.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-36 flex items-center justify-center relative overflow-hidden cursor-pointer" onClick={() => openCourseDetail(course.id)}>
                    {course.thumbnailUrl ? <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" /> : <div className={`w-full h-full bg-gradient-to-br ${grad.bg} flex items-center justify-center`}><span className="text-3xl font-black" style={{ color: grad.accent }}>{(course.title || "N").charAt(0)}</span></div>}
                    <span className="absolute top-3 right-3 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Not Enrolled
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-bold text-slate-800 leading-snug line-clamp-2">{course.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {course.level && <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${levelStyle.bg} ${levelStyle.text}`}>{course.level}</span>}
                      <span className="text-[10px] text-slate-400">{course.language || "English"}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-black text-[#0B2545]">₹{enriched.price}</span>
                        {enriched.originalPrice > (enriched.price || 0) && (
                          <span className="text-[10px] text-slate-400 line-through">₹{enriched.originalPrice}</span>
                        )}
                      </div>
                      <button
                        onClick={() => openCourseDetail(course.id)}
                        className="px-3 py-1.5 bg-[#00A86B] hover:bg-[#008f5a] text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        View Course
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
