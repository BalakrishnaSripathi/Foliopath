import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  CheckCircle2,
  Target,
  Award,
  BadgeCheck,
  Briefcase,
  Users,
  ShieldCheck,
  Code2,
  Sparkles,
  GraduationCap,
  Rocket,
  ChevronsUpDown,
  ChevronsDownUp,
} from "lucide-react";
import {
  getKitById,
  getKitModules,
  getKitQuestions,
  getPublishedKits,
} from "../api/interviewKitService";
import { useAuth } from "../context/AuthContext";
import Header from "../components/layout/Header";
import InterviewKitCard from "../components/InterviewKitCard";
import { enrichKit } from "../lib/staticCatalog";

const STATIC_PRICE = 499;
const STATIC_MRP = 999;
const STATIC_ENROLLED = 1247;
const STATIC_BADGE = "Popular";

const levelLabels = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

const DEFAULT_LEARN = [
  "Real interview questions with model answers",
  "Proven answer frameworks for every round",
  "Topic-wise practice across all difficulty levels",
  "Common pitfalls and how to avoid them",
  "Confidence-building mock interview techniques",
  "Up-to-date patterns used by top companies",
];

const PREREQUISITES = [
  "Basic understanding of the core technology",
  "Familiarity with fundamental concepts",
  "Willingness to practice regularly",
  "No prior interview experience needed",
];

const WHAT_YOU_GET = [
  "Real interview questions with model answers",
  "Questions categorized by topic & difficulty",
  "Practice with timed mock interviews",
  "Lifetime access with regular updates",
  "Interview readiness certificate",
];

const WHY_CHOOSE = [
  "Real interview questions used by top companies",
  "Model answers and proven response frameworks",
  "Topic-wise practice across every difficulty level",
  "Regular updates to match current interview trends",
  "Practice with timed mock interview simulations",
  "Learn from expert-reviewed interview strategies",
];

const WHO_SHOULD_TAKE = [
  {
    icon: GraduationCap,
    title: "Students & Freshers",
    desc: "Preparing for campus placements and their first job interviews.",
  },
  {
    icon: Users,
    title: "Working Professionals",
    desc: "Upskilling and getting ready for the next career move.",
  },
  {
    icon: Rocket,
    title: "Career Switchers",
    desc: "Moving into a new domain and need targeted interview practice.",
  },
  {
    icon: Briefcase,
    title: "Job Seekers",
    desc: "Wanting to ace screening, technical and HR rounds with confidence.",
  },
];

const money = (v) =>
  Number.isFinite(Number(v))
    ? `₹${Math.round(Number(v)).toLocaleString("en-IN")}`
    : "";

export default function KitDetail() {
  const { kitId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const [kit, setKit] = useState(null);
  const [modules, setModules] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [expandedModules, setExpandedModules] = useState(() => new Set());
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [relatedKits, setRelatedKits] = useState([]);

  useEffect(() => {
    let active = true;
    getPublishedKits()
      .then(({ data }) => {
        if (!active) return;
        const kits = Array.isArray(data) ? data : [];
        setRelatedKits(
          kits
            .filter((k) => k.id != kitId)
            .slice(0, 3)
            .map(enrichKit)
        );
      })
      .catch((err) => console.error("Failed to load related items:", err));
    return () => {
      active = false;
    };
  }, [kitId]);

  useEffect(() => {
    let active = true;
    Promise.all([
      getKitById(kitId),
      getKitModules(kitId).catch(() => ({ data: [] })),
      getKitQuestions(kitId).catch(() => ({ data: [] })),
    ])
      .then(([kitRes, modRes, qRes]) => {
        if (!active) return;
        setKit(kitRes.data);
        setModules(Array.isArray(modRes.data) ? modRes.data : []);
        setQuestions(Array.isArray(qRes.data) ? qRes.data : []);
      })
      .catch((err) => console.error("Failed to load kit:", err))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [kitId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A86B]" />
      </div>
    );
  }

  if (!kit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Kit not found</p>
      </div>
    );
  }

  const sortedModules = [...modules].sort(
    (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
  );

  const questionsByModule = questions.reduce((acc, q) => {
    const key = q.moduleId || "ungrouped";
    if (!acc[key]) acc[key] = [];
    acc[key].push(q);
    return acc;
  }, {});

  const ungroupedQuestions = questionsByModule["ungrouped"] || [];
  const totalQuestions = questions.length || kit.questionCount || 0;

  const learnItems = (() => {
    const fromModules = sortedModules.map((m) => m.name || m.title).filter(Boolean);
    const seen = new Set();
    return [...fromModules, ...DEFAULT_LEARN]
      .filter((item) => {
        if (seen.has(item)) return false;
        seen.add(item);
        return true;
      })
      .slice(0, 6);
  })();

  const toggleTopic = (id) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    const ids = new Set(sortedModules.map((m) => m.id));
    if (ungroupedQuestions.length > 0) ids.add("ungrouped");
    setExpandedModules(ids);
  };

  const collapseAll = () => setExpandedModules(new Set());

  const generalExpanded = expandedModules.has("ungrouped");
  const topicIds = sortedModules.map((m) => m.id);
  if (ungroupedQuestions.length > 0) topicIds.push("ungrouped");
  const allExpanded =
    topicIds.length > 0 && topicIds.every((id) => expandedModules.has(id));

  const handleEnroll = () => {
    if (isAuthenticated && role === "STUDENT") {
      navigate("/StudentDashboard/interview-kits");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#422006] to-[#78350f] text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-amber-400 text-amber-900">
                  {STATIC_BADGE}
                </span>
                <span className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                  {kit.level ? levelLabels[kit.level] || kit.level : "Interview Kit"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mt-2 mb-4">
                {kit.name}
              </h1>
              <p className="text-amber-100/80 text-sm leading-relaxed mb-6">
                {kit.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-amber-100/80">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {sortedModules.length} topics
                </span>
                <span className="flex items-center gap-1">
                  <ClipboardList className="w-4 h-4" />
                  {totalQuestions} questions
                </span>
                <Link
                  to="/interview-kits"
                  className="flex items-center gap-1 text-amber-200 hover:text-white transition-colors"
                >
                  <Briefcase className="w-4 h-4" />
                  All Interview Kits
                </Link>
              </div>
            </div>

            {/* Enroll Card */}
            <div className="bg-white rounded-2xl p-6 text-[#0B2545] shadow-xl self-start">
              {kit.thumbnailUrl ? (
                <img
                  src={kit.thumbnailUrl}
                  alt={kit.name}
                  className="w-full h-40 object-cover rounded-xl mb-4"
                />
              ) : (
                <div className="w-full h-40 rounded-xl mb-4 bg-gradient-to-br from-[#422006] to-[#78350f] flex items-center justify-center">
                  <Briefcase className="w-12 h-12 text-amber-300" />
                </div>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black">{money(STATIC_PRICE)}</span>
                <span className="text-sm text-slate-400 line-through">
                  {money(STATIC_MRP)}
                </span>
                <span className="text-xs font-bold text-[#00A86B]">
                  Save {money(STATIC_MRP - STATIC_PRICE)}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                One-time payment &middot; lifetime access
              </p>

              <button
                onClick={handleEnroll}
                className="w-full py-3 bg-[#00A86B] hover:bg-[#008f5a] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isAuthenticated && role === "STUDENT"
                  ? "Open in Dashboard"
                  : "Enroll Now"}
              </button>

              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-500" />
                  {STATIC_ENROLLED.toLocaleString("en-IN")} learners enrolled
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  Lifetime access
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors -mb-px ${
              activeTab === "overview"
                ? "border-[#B45309] text-[#B45309]"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("curriculum")}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors -mb-px ${
              activeTab === "curriculum"
                ? "border-[#B45309] text-[#B45309]"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Curriculum
          </button>
        </div>

        {activeTab === "overview" ? (
          <div className="mt-10 space-y-10">
            {/* About This Kit */}
            <section>
              <h2 className="text-xl font-bold text-[#0B2545] mb-4">
                About This Kit
              </h2>
              <div className="bg-white rounded-2xl border border-slate-100 p-6 text-sm text-slate-600 leading-relaxed">
                {kit.description ||
                  "Curated interview questions and model answers to help you crack your next interview."}
              </div>
            </section>

            {/* What You Will Learn */}
            <section>
              <h2 className="text-xl font-bold text-[#0B2545] mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#B45309]" />
                What You Will Learn
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {learnItems.map((item) => (
                  <div
                    key={item}
                    className="bg-white rounded-xl border border-slate-100 p-4 flex items-start gap-3 hover:border-[#B45309]/40 transition-colors"
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#00A86B] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Kit Prerequisites */}
            <section>
              <h2 className="text-xl font-bold text-[#0B2545] mb-4 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#B45309]" />
                Kit Prerequisites
              </h2>
              <div className="bg-white rounded-2xl border border-slate-100 p-6 grid sm:grid-cols-2 gap-3">
                {PREREQUISITES.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 text-sm text-slate-600"
                  >
                    <ChevronRight className="w-4 h-4 text-[#B45309] flex-shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>
            </section>

            {/* Who Should Take This Kit */}
            <section>
              <h2 className="text-xl font-bold text-[#0B2545] mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#B45309]" />
                Who Should Take This Kit?
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {WHO_SHOULD_TAKE.map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-[#B45309]/40 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="w-10 h-10 bg-amber-50 text-[#B45309] rounded-xl flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-[#0B2545] mb-1">{title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Why Choose Foliopath360? */}
            <section>
              <h2 className="text-xl font-bold text-[#0B2545] mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#B45309]" />
                Why Choose Foliopath360?
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {WHY_CHOOSE.map((item) => (
                  <div
                    key={item}
                    className="bg-gradient-to-br from-[#0B2545]/[0.03] to-transparent rounded-xl border border-slate-100 p-4 flex items-start gap-3"
                  >
                    <BadgeCheck className="w-5 h-5 text-[#B45309] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* What You Get */}
            <section>
              <h2 className="text-xl font-bold text-[#0B2545] mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#B45309]" />
                What You Get
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {WHAT_YOU_GET.map((item) => (
                  <div
                    key={item}
                    className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200/60 p-4 flex items-start gap-3"
                  >
                    <BadgeCheck className="w-5 h-5 text-[#B45309] flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-slate-700">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Related Interview Kits */}
            <section>
              <h2 className="text-xl font-bold text-[#0B2545] mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#B45309]" />
                Related Interview Kits
              </h2>
              {relatedKits.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedKits.map((relKit) => (
                    <InterviewKitCard key={relKit.id} kit={relKit} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                  No related kits yet
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="mt-10 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <p className="text-xs text-slate-500">
                {totalQuestions} questions across{" "}
                {sortedModules.length} topics
              </p>
              {topicIds.length > 0 && (
                <button
                  onClick={allExpanded ? collapseAll : expandAll}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#B45309] border border-amber-200 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {allExpanded ? (
                    <ChevronsDownUp className="w-4 h-4" />
                  ) : (
                    <ChevronsUpDown className="w-4 h-4" />
                  )}
                  {allExpanded ? "Collapse All" : "Expand All"}
                </button>
              )}
            </div>
            {sortedModules.length === 0 && questions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center text-sm text-slate-400">
                Kit curriculum coming soon
              </div>
            ) : (
              <>
                {sortedModules.map((mod, index) => {
                  const modQuestions = questionsByModule[mod.id] || [];
                  const isExpanded = expandedModules.has(mod.id);
                  return (
                    <div
                      key={mod.id}
                      className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleTopic(mod.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-[#B45309] flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                          )}
                          <span className="font-semibold truncate text-[#0B2545]">
                            Topic {index + 1}: {mod.name || mod.title}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 flex-shrink-0 ml-3">
                          {modQuestions.length > 0
                            ? `${modQuestions.length} question${
                                modQuestions.length === 1 ? "" : "s"
                              }`
                            : "0 questions"}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-slate-100">
                          {modQuestions.length === 0 && (
                            <p className="text-sm text-slate-400 text-center py-4">
                              No questions in this topic yet
                            </p>
                          )}
                          {modQuestions
                            .sort(
                              (a, b) =>
                                (a.displayOrder || 0) - (b.displayOrder || 0)
                            )
                            .map((q) => (
                              <div
                                key={q.id}
                                className="flex items-start gap-3 px-6 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                              >
                                <Code2 className="w-4 h-4 text-[#B45309] flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-sm text-slate-600">
                                    {q.question}
                                  </span>
                                  <div className="mt-1 text-[10px] text-slate-400">
                                    {q.questionType === "CODE" ? "Coding" : "Text"}{" "}
                                    question
                                    {q.codeLanguage
                                      ? ` · ${q.codeLanguage}`
                                      : ""}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {ungroupedQuestions.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <button
                      onClick={() => toggleTopic("ungrouped")}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {generalExpanded ? (
                          <ChevronDown className="w-5 h-5 text-[#B45309] flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        )}
                        <span className="font-semibold truncate text-[#0B2545]">
                          General Questions
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0 ml-3">
                        {ungroupedQuestions.length} questions
                      </span>
                    </button>
                    {generalExpanded && (
                      <div className="border-t border-slate-100">
                        {ungroupedQuestions
                          .sort(
                            (a, b) =>
                              (a.displayOrder || 0) - (b.displayOrder || 0)
                          )
                          .map((q) => (
                            <div
                              key={q.id}
                              className="flex items-start gap-3 px-6 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                            >
                              <Code2 className="w-4 h-4 text-[#B45309] flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="text-sm text-slate-600">
                                  {q.question}
                                </span>
                                <div className="mt-1 text-[10px] text-slate-400">
                                  {q.questionType === "CODE" ? "Coding" : "Text"}{" "}
                                  question
                                  {q.codeLanguage ? ` · ${q.codeLanguage}` : ""}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Enroll CTA under curriculum */}
            <div className="mt-4 bg-gradient-to-r from-[#422006] to-[#78350f] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-white">
                <p className="font-bold">Ready to crack your interview?</p>
                <p className="text-xs text-amber-100/70 mt-0.5">
                  Get instant access to all {totalQuestions} questions and
                  practice sets
                </p>
              </div>
              <button
                onClick={handleEnroll}
                className="flex-shrink-0 px-6 py-2.5 bg-[#00A86B] hover:bg-[#008f5a] text-white text-sm font-bold rounded-xl shadow-md transition-all duration-200 flex items-center gap-2"
              >
                {isAuthenticated && role === "STUDENT"
                  ? "Open in Dashboard"
                  : "Enroll Now"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}