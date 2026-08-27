import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Home,
  BookOpen,
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
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { getMyEnrollments, getEnrollment } from "../../api/enrollmentService";
import {
  getPublishedCourses,
  getCourseById,
  getModules,
  getLessons,
  getLesson,
} from "../../api/courseService";
import {
  getMockTests,
  getMockTest,
  submitMockTestAttempt,
  getMyMockTestAttempt,
} from "../../api/mockTestService";
import {
  getMyEnrolledKits,
  getPublishedKits,
  getKitById,
  enrollInKit,
} from "../../api/interviewKitService";
import RenderAnswer from "../../components/admin/RenderAnswer";
import StudentProfile from "./StudentProfile";
import { useAuth } from "../../context/AuthContext";

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
    contentBlocks.push({ type: "code", body: lesson.codeContent, language: lesson.codeLanguage });
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
                {item.codeContent && (
                  <div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#0a1628] rounded-t-xl border border-slate-700 border-b-0">
                      <Code className="w-3.5 h-3.5 text-[#00A86B]" />
                      <span className="text-xs font-mono text-slate-400">{item.codeLanguage || "code"}</span>
                    </div>
                    <pre className="bg-[#0a1628] text-slate-200 rounded-b-xl border border-slate-700 border-t-0 p-4 overflow-x-auto text-sm leading-relaxed">
                      <code>{item.codeContent}</code>
                    </pre>
                  </div>
                )}
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
      <button onClick={() => onBack("my-courses")} className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#00A86B] mb-4 transition-colors">
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

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <button onClick={() => onBack("my-courses")} className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#00A86B] transition-colors">
        <ArrowLeft size={16} /> Back to My Courses
      </button>
      <div className={`rounded-2xl p-8 text-center ${passed ? "bg-gradient-to-br from-[#00A86B] to-[#065f46]" : "bg-gradient-to-br from-[#0B2545] to-[#13315c]"}`}>
        <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${passed ? "bg-white/20" : "bg-white/10"}`}>
          {passed ? <Trophy size={40} className="text-white" /> : <Target size={40} className="text-white/80" />}
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">{test?.title || "Mock Test"}</h1>
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
      {test?.questions && (
        <div className="space-y-4">
          <h2 className="font-bold text-[#0B2545] text-lg">Questions</h2>
          {test.questions.map((q, i) => (
            <div key={q.id || i} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <p className="text-sm font-semibold text-[#0B2545]">Q{i + 1}. {q.questionText}</p>
              </div>
              <div className="p-4 space-y-2">
                {(q.options || []).map((opt) => (
                  <div key={opt.label} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-500">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-slate-100 text-slate-400">{opt.label}</span>
                    <span className="flex-1">{opt.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-center pt-2 pb-4">
        <button onClick={() => onBack("my-courses")} className="px-8 py-3 bg-[#00A86B] hover:bg-[#008f5a] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all">Back to My Courses</button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN STUDENT DASHBOARD (content only — sidebar is in StudentShell)
   ───────────────────────────────────────────────────────────── */
export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { moduleId, lessonId, mockTestId } = useParams();

  const [enrollments, setEnrollments] = useState([]);
  const [publishedCourses, setPublishedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [courseDetail, setCourseDetail] = useState(null);
  const [courseModules, setCourseModules] = useState([]);
  const [lessonsByModule, setLessonsByModule] = useState({});
  const [mockTestsByModule, setMockTestsByModule] = useState({});
  const [courseLoading, setCourseLoading] = useState(false);
  const [expandedModule, setExpandedModule] = useState(null);
  const [courseEnrollment, setCourseEnrollment] = useState(null);

  const [inlineLesson, setInlineLesson] = useState(null);
  const [inlineMockTest, setInlineMockTest] = useState(null);
  const [inlineMockResult, setInlineMockResult] = useState(null);

  const [myCoursesFilter, setMyCoursesFilter] = useState("ALL");
  const [courseSearch, setCourseSearch] = useState("");

  const [enrolledKits, setEnrolledKits] = useState([]);
  const [publishedKits, setPublishedKits] = useState([]);
  const [selectedKit, setSelectedKit] = useState(null);
  const [kitDetail, setKitDetail] = useState(null);
  const [kitLoading, setKitLoading] = useState(false);
  const [kitSearch, setKitSearch] = useState("");
  const [enrolledKitIds, setEnrolledKitIds] = useState(new Set());

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

  const openCourseDetail = useCallback(async (courseId) => {
    setSelectedCourseId(courseId);
    setCourseLoading(true);
    setCourseDetail(null);
    setCourseModules([]);
    setLessonsByModule({});
    setMockTestsByModule({});
    setExpandedModule(null);
    setCourseEnrollment(null);
    setInlineLesson(null);
    setInlineMockTest(null);
    setInlineMockResult(null);
    setSelectedKit(null);
    setKitDetail(null);
    try {
      const [courseRes, modulesRes] = await Promise.all([getCourseById(courseId), getModules(courseId)]);
      setCourseDetail(courseRes.data);
      const mods = modulesRes.data;
      setCourseModules(mods);
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
      toast.error("Failed to load course");
    } finally {
      setCourseLoading(false);
    }
  }, []);

  const openKitDetail = useCallback(async (kitId) => {
    setSelectedKit(kitId);
    setKitLoading(true);
    setKitDetail(null);
    setSelectedCourseId(null);
    setCourseDetail(null);
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
      setSelectedCourseId(null);
      navigate("/StudentDashboard/my-courses");
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

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A86B]" /></div>;
  }

  const isEnrolled = !!courseEnrollment;
  const path = location.pathname;
  const isMyCourses = path.includes("/my-courses");
  const isInterviewKits = path.includes("/interview-kits");
  const isSettings = path.includes("/settings");

  /* ── Route-based: settings / profile ──────────────────────────── */
  if (isSettings) {
    return <StudentProfile embedded />;
  }

  /* ── Route-based: interview kit detail ──────────────────────── */
  if (selectedKit) {
    return (
      <div className="p-6 space-y-6">
        <button onClick={() => { setSelectedKit(null); setKitDetail(null); }} className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#00A86B] transition-colors">
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
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="text-lg font-bold text-[#0B2545] mb-4">Questions</h2>
              {kitDetail.questions?.length > 0 ? (
                <div className="space-y-4">
                  {kitDetail.questions.map((q, idx) => (
                    <div key={q.id || idx} className="border border-slate-100 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${q.questionType === "CODE" ? "bg-blue-50" : "bg-green-50"}`}>
                          {q.questionType === "CODE" ? <Code className="w-4 h-4 text-blue-500" /> : <FileText className="w-4 h-4 text-green-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#0B2545]">Q{idx + 1}. {q.question}</p>
                          {q.codeSnippet && (
                            <pre className="mt-2 text-xs font-mono bg-[#0B2545] text-green-400 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap">{q.codeSnippet}</pre>
                          )}
                           {enrolledKitIds.has(kitDetail.id) && (
                            <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-100">
                              <p className="text-xs font-semibold text-green-700 mb-1">Answer:</p>
                              <RenderAnswer content={q.answer} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-6">No questions in this kit yet.</p>
              )}
            </div>
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

  /* ── State-based: inline lesson/mock test (from course detail) ── */
  if (inlineLesson) {
    return (
      <div className="p-6">
        <InlineLessonView moduleId={inlineLesson.moduleId} lessonId={inlineLesson.lessonId} onBack={() => handleInlineNav("my-courses")} />
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

  /* ── Course Detail (state-based from clicking course cards) ─── */
  if (selectedCourseId) {
    return (
      <div className="p-6 space-y-6">
        <button onClick={() => setSelectedCourseId(null)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#00A86B] transition-colors">
          <ArrowLeft size={16} /> Back to {isMyCourses ? "My Courses" : "Dashboard"}
        </button>
        {courseLoading ? (
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
                    <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{courseModules.length} modules</span>
                    {courseDetail.level && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{levelLabels[courseDetail.level]}</span>}
                    {courseDetail.language && <span className="flex items-center gap-1"><Globe className="w-4 h-4" />{courseDetail.language}</span>}
                  </div>
                </div>
                {courseDetail.thumbnailUrl && <img src={courseDetail.thumbnailUrl} alt={courseDetail.title} className="w-full lg:w-48 h-32 object-cover rounded-xl" />}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="text-lg font-bold text-[#0B2545] mb-4">Curriculum</h2>
              {isEnrolled && <p className="text-xs text-[#00A86B] font-semibold mb-4">All modules unlocked — start learning!</p>}
              <div className="space-y-3">
                {[...courseModules].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((mod) => {
                  const lessons = lessonsByModule[mod.id] || [];
                  const tests = mockTestsByModule[mod.id] || [];
                  const isExpanded = expandedModule === mod.id;
                  return (
                    <div key={mod.id} className="border border-slate-100 rounded-xl overflow-hidden">
                      <button onClick={() => setExpandedModule(isExpanded ? null : mod.id)} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left">
                        <div className="flex items-center gap-3">
                          {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                          <span className="font-semibold text-[#0B2545] text-sm">Module {mod.displayOrder}: {mod.title}</span>
                        </div>
                        <span className="text-xs text-slate-400">{lessons.length} lessons{tests.length > 0 ? ` · ${tests.length} test${tests.length > 1 ? "s" : ""}` : ""}</span>
                      </button>
                      {isExpanded && (
                        <div className="border-t border-slate-100 bg-slate-50/50">
                          {[...lessons].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((lesson) => (
                            <button key={lesson.id} onClick={() => handleInlineNav("lesson", { moduleId: mod.id, lessonId: lesson.id })} className="w-full flex items-center gap-3 px-6 py-3 hover:bg-slate-100 transition-colors text-left border-b border-slate-100 last:border-0">
                              <PlayCircle className="w-4 h-4 text-[#00A86B] flex-shrink-0" />
                              <span className="text-sm text-slate-600">{lesson.title}</span>
                              {lesson.estimatedMinutes && <span className="text-xs text-slate-400 ml-auto">{lesson.estimatedMinutes} min</span>}
                            </button>
                          ))}
                          {tests.length > 0 && (
                            <>
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-6 pt-3 pb-1">Mock Tests</p>
                                {[...tests].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((test) => (
                                <button key={test.id} onClick={() => handleInlineNav("test", test.id)} className="w-full flex items-center gap-3 px-6 py-3 hover:bg-slate-100 transition-colors text-left border-b border-slate-100 last:border-0">
                                  <ClipboardList className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                  <span className="text-sm text-slate-600">{test.title}</span>
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
                {courseModules.length === 0 && <p className="text-sm text-slate-400 text-center py-6">Curriculum coming soon</p>}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 text-center py-10">Course not found</p>
        )}
      </div>
    );
  }

  /* ── DASHBOARD VIEW ───────────────────────────────────────── */
  if (!isMyCourses && !isInterviewKits) {
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
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
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
        </div>
      </div>
    );
  }

  /* ── INTERVIEW KITS VIEW ─────────────────────────────────── */
  if (isInterviewKits) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Interview Kits</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {enrolledKits.length} enrolled kit{enrolledKits.length !== 1 ? "s" : ""} · {publishedKits.length} available
          </p>
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
          {publishedKits.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-[#0B2545] mb-2">No kits available</h2>
              <p className="text-sm text-slate-500">Interview kits will appear here once published.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {publishedKits.filter((k) => !enrolledKitIds.has(k.id)).map((kit) => (
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
                        <button className="px-3 py-1.5 bg-[#00A86B] hover:bg-[#008f5a] text-white text-xs font-semibold rounded-lg transition-colors">
                          Enroll Now
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
          )}
        </div>
      </div>
    );
  }

  /* ── MY COURSES VIEW ──────────────────────────────────────── */
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Courses</h1>
          <p className="text-sm text-slate-500 mt-0.5">{enrollments.length} enrolled course{enrollments.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search courses..." value={courseSearch} onChange={(e) => setCourseSearch(e.target.value)} className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A86B]/20 focus:border-[#00A86B] w-48" />
        </div>
      </div>
      <div className="flex gap-2">
        {["ALL", "IN_PROGRESS", "COMPLETED"].map((f) => (
          <button key={f} onClick={() => setMyCoursesFilter(f)} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${myCoursesFilter === f ? "bg-[#00A86B] text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            {f === "ALL" ? "All" : f === "IN_PROGRESS" ? "In Progress" : "Completed"}
          </button>
        ))}
      </div>
      {filteredMyCourses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-[#0B2545] mb-2">{enrollments.length === 0 ? "No courses yet" : "No courses match your filter"}</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">{enrollments.length === 0 ? "Enroll in a course to get started." : "Try a different filter or search term."}</p>
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
  );
}
