import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  Globe,
  BookOpen,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  ClipboardList,
  Lock,
  CheckCircle2,
  ShoppingCart,
  ExternalLink,
  Target,
  Award,
  BadgeCheck,
  Sparkles,
  Users,
  GraduationCap,
  Rocket,
  Briefcase,
  ChevronsUpDown,
  ChevronsDownUp,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getCourseById,
  getModules,
  getLessons,
  getCourseModules,
  getPublishedCourses,
} from "../../api/courseService";
import { getMockTests } from "../../api/mockTestService";
import CourseCard from "../../components/CourseCard";
import { enrichCourse } from "../../lib/staticCatalog";
import {
  enrollInCourse,
  getEnrollment,
} from "../../api/enrollmentService";
import { addToCart } from "../../api/cartService";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/layout/Header";

const levelLabels = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

const PREVIEW_MODULE_COUNT = 3;

const DEFAULT_LEARN = [
  "Hands-on, project-based learning",
  "Real-world industry case studies",
  "Practical skills you can apply immediately",
  "Career-ready interview preparation",
  "Guidance from expert mentors",
  "Verified certificate of completion",
];

const PREREQUISITES = {
  BEGINNER: [
    "No prior experience required",
    "Basic computer literacy",
    "A computer with internet access",
    "Motivation and willingness to learn",
  ],
  INTERMEDIATE: [
    "Basic knowledge of the subject area",
    "Familiarity with core fundamentals",
    "A computer with internet access",
    "Consistent practice time",
  ],
  ADVANCED: [
    "Solid foundation in core concepts",
    "Prior hands-on experience",
    "Comfortable with advanced tools",
    "Ability to work on independent projects",
  ],
};

const WHAT_YOU_GET = [
  "Lifetime access to all content",
  "Certificate of completion",
  "Mock tests and practice exercises",
  "Downloadable resources & notes",
  "Expert Q&A support",
  "Regular content updates",
];

const WHY_CHOOSE = [
  "Learn from industry experts and real-world mentors",
  "Project-based curriculum with live case studies",
  "Recognized certifications trusted by employers",
  "Dedicated career guidance and placement support",
  "Flexible, self-paced learning on any device",
  "Lifetime access with regular content updates",
];

const WHO_SHOULD_TAKE = [
  {
    icon: GraduationCap,
    title: "Beginners & Students",
    desc: "Just starting out and want a structured, guided path to mastery.",
  },
  {
    icon: Briefcase,
    title: "Working Professionals",
    desc: "Looking to upskill, stay relevant and grow in your career.",
  },
  {
    icon: Users,
    title: "Career Switchers",
    desc: "Moving into a new field and need hands-on, job-ready skills.",
  },
  {
    icon: Rocket,
    title: "Job Seekers",
    desc: "Preparing for interviews and want a standout portfolio.",
  },
];

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const isStudent = role === "STUDENT";
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [courseLinks, setCourseLinks] = useState([]);
  const [courseLinkContent, setCourseLinkContent] = useState({});
  const [lessonsByModule, setLessonsByModule] = useState({});
  const [mockTestsByModule, setMockTestsByModule] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState(() => new Set());
  const [enrollment, setEnrollment] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [relatedCourses, setRelatedCourses] = useState([]);

  useEffect(() => {
    let active = true;
    getPublishedCourses()
      .then(({ data }) => {
        if (!active) return;
        const courses = Array.isArray(data) ? data : [];
        setRelatedCourses(
          courses
            .filter((c) => c.id != courseId)
            .slice(0, 3)
            .map(enrichCourse)
        );
      })
      .catch((err) => console.error("Failed to load related items:", err));
    return () => {
      active = false;
    };
  }, [courseId]);

  // Paid courses must go through cart -> checkout -> Razorpay payment.
  // Direct enroll only works for free courses (EnrollmentController).
  const isPaid = Number(course?.price || 0) > 0;

  // Enrollment unlocks the full course content; without it only the
  // first few modules are shown as a free preview.
  const isEnrolled = !!enrollment;
  const unlockedModules = isEnrolled
    ? modules.length
    : Math.min(PREVIEW_MODULE_COUNT, modules.length);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [courseRes, modulesRes] = await Promise.all([
        getCourseById(courseId),
        getModules(courseId),
      ]);
      setCourse(courseRes.data);
      const mods = modulesRes.data;
      setModules(mods);

      let courseLinkList = [];
      try {
        const cmRes = await getCourseModules(courseId);
        courseLinkList = cmRes.data || [];
        setCourseLinks(courseLinkList);
      } catch (cmErr) {
        console.error("Failed to load course modules:", cmErr);
        setCourseLinks([]);
      }

      if (isAuthenticated && isStudent) {
        try {
          const { data } = await getEnrollment(courseId);
          setEnrollment(data);
        } catch {
          setEnrollment(null);
        }
      }

      const results = await Promise.all(
        mods.map((m) =>
          Promise.all([
            getLessons(m.id)
              .then(({ data }) => (Array.isArray(data) ? data : []))
              .catch(() => []),
            getMockTests(m.id)
              .then(({ data }) => (Array.isArray(data) ? data : []))
              .catch(() => []),
          ]).then(([lessons, tests]) => [m.id, { lessons, mockTests: tests }])
        )
      );
      setLessonsByModule(
        Object.fromEntries(results.map(([id, v]) => [id, v.lessons]))
      );
      setMockTestsByModule(
        Object.fromEntries(results.map(([id, v]) => [id, v.mockTests]))
      );
    } catch (err) {
      console.error("Failed to load course:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCourseLinkContent = async (courseLink) => {
    if (courseLinkContent[courseLink.id]) return;
    const linkedCourseId = courseLink.courseId;
    try {
      const { data } = await getModules(linkedCourseId);
      const linkedMods = data || [];
      const mapped = await Promise.all(
        linkedMods.map((m) =>
          Promise.all([
            getLessons(m.id)
              .then(({ data }) => (Array.isArray(data) ? data : []))
              .catch(() => []),
            getMockTests(m.id)
              .then(({ data }) => (Array.isArray(data) ? data : []))
              .catch(() => []),
          ]).then(([lessons, tests]) => [m.id, { lessons, mockTests: tests }])
        )
      );
      const lessonsByModule = Object.fromEntries(
        mapped.map(([id, v]) => [id, v.lessons])
      );
      const mockTestsByModule = Object.fromEntries(
        mapped.map(([id, v]) => [id, v.mockTests])
      );
      setCourseLinkContent((prev) => ({
        ...prev,
        [courseLink.id]: {
          modules: linkedMods,
          lessonsByModule,
          mockTestsByModule,
          loaded: true,
        },
      }));
    } catch (err) {
      console.error("Failed to load linked course content:", err);
      setCourseLinkContent((prev) => ({
        ...prev,
        [courseLink.id]: { modules: [], lessonsByModule: {}, mockTestsByModule: {}, loaded: true, error: true },
      }));
    }
  };

  const requireLogin = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return true;
    }
    return false;
  };

  const handleEnroll = async () => {
    if (requireLogin()) return;
    if (!isStudent) return;
    if (isEnrolled) {
      navigate("/StudentDashboard");
      return;
    }
    // Paid courses are unlocked after payment, not by direct enroll
    if (isPaid) {
      handleAddToCart();
      return;
    }
    setEnrolling(true);
    try {
      await enrollInCourse(courseId);
      const { data } = await getEnrollment(courseId);
      setEnrollment(data);
      toast.success("Enrolled successfully! Full course content unlocked.", {
        iconTheme: { primary: "#00A86B", secondary: "#fff" },
      });
    } catch (err) {
      console.error("Failed to enroll:", err);
      toast.error(
        err.response?.data?.message || "Failed to enroll in this course"
      );
    } finally {
      setEnrolling(false);
    }
  };

  const handleAddToCart = async () => {
    if (requireLogin()) return;
    if (!isStudent || isEnrolled) return;
    setAddingToCart(true);
    try {
      await addToCart(courseId);
      window.dispatchEvent(new Event("cart:updated"));
      toast.success("Added to cart!", {
        iconTheme: { primary: "#00A86B", secondary: "#fff" },
      });
      // Show the cart items to the student right away
      window.dispatchEvent(new Event("cart:open"));
    } catch (err) {
      console.error("Failed to add to cart:", err);
      toast.error(
        err.response?.data?.message || "Failed to add this course to cart"
      );
    } finally {
      setAddingToCart(false);
    }
  };

  const handleViewLesson = (moduleId, lessonId) => {
    if (!isEnrolled) {
      promptEnroll();
      return;
    }
    navigate(`/lessons/${moduleId}/${lessonId}`);
  };

  const handleViewMockTest = (mockTestId) => {
    if (!isEnrolled) {
      promptEnroll();
      return;
    }
    navigate(`/mock-tests/${mockTestId}`);
  };

  const promptEnroll = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    toast.error(
      isPaid
        ? "Add this course to your cart and complete checkout to unlock it"
        : "Enroll in this course to unlock its content"
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A86B]" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Course not found</p>
      </div>
    );
  }

  const totalLessons = Object.values(lessonsByModule).reduce(
    (acc, lessons) => acc + lessons.length,
    0
  );

  const sortedModules = [...modules].sort(
    (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
  );

  const sortedCourseLinks = [...courseLinks].sort(
    (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
  );

  const toggleModule = (id) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    const ids = new Set();
    sortedModules.forEach((m, index) => {
      if (index < unlockedModules) ids.add(m.id);
    });
    sortedCourseLinks.forEach((cm) => ids.add(`cm:${cm.id}`));
    setExpandedModules(ids);
    sortedCourseLinks.forEach((cm) => {
      if (!courseLinkContent[cm.id]?.loaded) loadCourseLinkContent(cm);
    });
  };

  const collapseAll = () => setExpandedModules(new Set());

  const curriculumCount = sortedModules.length + sortedCourseLinks.length;
  const expandableIds = [
    ...sortedModules.slice(0, unlockedModules).map((m) => m.id),
    ...sortedCourseLinks.map((cm) => `cm:${cm.id}`),
  ];
  const allExpanded =
    curriculumCount > 0 &&
    expandableIds.every((id) => expandedModules.has(id));

  const learnItems = (() => {
    const fromModules = sortedModules
      .map((m) => m.title)
      .filter(Boolean);
    const seen = new Set();
    return [...fromModules, ...DEFAULT_LEARN]
      .filter((item) => {
        if (seen.has(item)) return false;
        seen.add(item);
        return true;
      })
      .slice(0, 6);
  })();
  const prerequisites = PREREQUISITES[course.level] || PREREQUISITES.BEGINNER;

  const enrollButtonLabel = !isAuthenticated
    ? "Enroll Now"
    : !isStudent
    ? "Students Only"
    : isEnrolled
    ? "Start Learning"
    : isPaid
    ? addingToCart
      ? "Adding..."
      : "Add to Cart"
    : enrolling
    ? "Enrolling..."
    : "Enroll Now";

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      {/* Hero */}
      <div className="bg-[#0B2545] text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2">
              <span className="text-xs font-bold text-[#00A86B] tracking-wider uppercase">
                {levelLabels[course.level] || "Course"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold mt-2 mb-4">
                {course.title}
              </h1>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                {course.shortDescription || course.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {modules.length + sortedCourseLinks.length} modules &middot; {totalLessons} lessons
                </span>
                {course.level && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {levelLabels[course.level]}
                  </span>
                )}
                {course.language && (
                  <span className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    {course.language}
                  </span>
                )}
              </div>
            </div>

            {/* Enroll Card */}
            <div className="bg-white rounded-2xl p-6 text-[#0B2545] shadow-xl self-start">
              {course.thumbnailUrl && (
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="w-full h-40 object-cover rounded-xl mb-4"
                />
              )}
              <div className="text-3xl font-black mb-1">
                ₹{course.price || 0}
              </div>
              {(course.price || 0) > 0 && (
                <p className="text-xs text-slate-400 mb-4">
                  One-time payment &middot; lifetime access
                </p>
              )}

              <button
                onClick={handleEnroll}
                disabled={(isAuthenticated && !isStudent) || enrolling || addingToCart}
                className="w-full py-3 bg-[#00A86B] hover:bg-[#008f5a] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {enrollButtonLabel}
              </button>

              {!isAuthenticated && (
                <p className="text-xs text-slate-400 mt-2 text-center">
                  You'll be asked to log in as a student
                </p>
              )}
              {isEnrolled && (
                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-[#00A86B]">
                  <CheckCircle2 className="w-4 h-4" />
                  You are enrolled in this course
                </p>
              )}

              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  {modules.length + sortedCourseLinks.length} modules &middot; {totalLessons} lessons
                </div>
                {course.language && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-400" />
                    {course.language}
                  </div>
                )}
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
                ? "border-[#00A86B] text-[#00A86B]"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("curriculum")}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors -mb-px ${
              activeTab === "curriculum"
                ? "border-[#00A86B] text-[#00A86B]"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Curriculum
          </button>
        </div>

        {activeTab === "overview" ? (
          <div className="mt-10 space-y-10">
            {/* About This Course */}
            <section>
              <h2 className="text-xl font-bold text-[#0B2545] mb-4">
                About This Course
              </h2>
              <div className="bg-white rounded-2xl border border-slate-100 p-6 text-sm text-slate-600 leading-relaxed">
                {course.description || "No description available."}
              </div>
            </section>

            {/* What You Will Learn */}
            <section>
              <h2 className="text-xl font-bold text-[#0B2545] mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#00A86B]" />
                What You Will Learn
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {learnItems.map((item) => (
                  <div
                    key={item}
                    className="bg-white rounded-xl border border-slate-100 p-4 flex items-start gap-3 hover:border-[#00A86B]/40 transition-colors"
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#00A86B] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Course Prerequisites */}
            <section>
              <h2 className="text-xl font-bold text-[#0B2545] mb-4 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#00A86B]" />
                Course Prerequisites
              </h2>
              <div className="bg-white rounded-2xl border border-slate-100 p-6 grid sm:grid-cols-2 gap-3">
                {prerequisites.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 text-sm text-slate-600"
                  >
                    <ChevronRight className="w-4 h-4 text-[#00A86B] flex-shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>
            </section>

            {/* Who Should Take This Course */}
            <section>
              <h2 className="text-xl font-bold text-[#0B2545] mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#00A86B]" />
                Who Should Take This Course?
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {WHO_SHOULD_TAKE.map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-[#00A86B]/40 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="w-10 h-10 bg-teal-50 text-[#00A86B] rounded-xl flex items-center justify-center mb-3">
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
                <Sparkles className="w-5 h-5 text-[#00A86B]" />
                Why Choose Foliopath360?
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {WHY_CHOOSE.map((item) => (
                  <div
                    key={item}
                    className="bg-gradient-to-br from-[#0B2545]/[0.03] to-transparent rounded-xl border border-slate-100 p-4 flex items-start gap-3"
                  >
                    <BadgeCheck className="w-5 h-5 text-[#00A86B] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* What You Get */}
            <section>
              <h2 className="text-xl font-bold text-[#0B2545] mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#00A86B]" />
                What You Get
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {WHAT_YOU_GET.map((item) => (
                  <div
                    key={item}
                    className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl border border-[#00A86B]/15 p-4 flex items-start gap-3"
                  >
                    <BadgeCheck className="w-5 h-5 text-[#00A86B] flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-slate-700">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Related Courses */}
            <section>
              <h2 className="text-xl font-bold text-[#0B2545] mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#00A86B]" />
                Related Courses
              </h2>
              {relatedCourses.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedCourses.map((relCourse) => (
                    <CourseCard key={relCourse.id} course={relCourse} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                  No related courses yet
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="mt-10 space-y-3">

            {/* Curriculum */}
            <section>
              <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#0B2545]">
                    Curriculum
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {isEnrolled ? (
                      "All modules unlocked — start learning!"
                    ) : (
                      <>
                        Free preview:{" "}
                        <span className="font-semibold text-[#00A86B]">
                          first {PREVIEW_MODULE_COUNT} modules
                        </span>{" "}
                        — enroll to unlock all content
                      </>
                    )}
                  </p>
                </div>
                {curriculumCount > 0 && (
                  <button
                    onClick={allExpanded ? collapseAll : expandAll}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#008f5a] border border-[#00A86B]/30 bg-[#00A86B]/5 hover:bg-[#00A86B]/10 px-3 py-1.5 rounded-lg transition-colors"
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
              <div className="space-y-3">
                {sortedModules.map((mod, index) => {
                  const lessons = lessonsByModule[mod.id] || [];
                  const locked = index >= unlockedModules;
                  const isExpanded = expandedModules.has(mod.id);
                  return (
                    <div
                      key={mod.id}
                      className={`bg-white rounded-2xl border overflow-hidden ${
                        locked ? "border-slate-100 opacity-80" : "border-slate-100"
                      }`}
                    >
                      <button
                        onClick={() => {
                          if (locked) {
                            promptEnroll();
                            return;
                          }
                          toggleModule(mod.id);
                        }}
                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {locked ? (
                            <Lock className="w-5 h-5 text-slate-300 flex-shrink-0" />
                          ) : isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                          )}
                          <span
                            className={`font-semibold truncate ${
                              locked ? "text-slate-400" : "text-[#0B2545]"
                            }`}
                          >
                            Module {mod.displayOrder}: {mod.title}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 flex-shrink-0 ml-3">
                          {locked
                            ? "Locked"
                            : `${lessons.length} lessons${
                                (mockTestsByModule[mod.id] || []).length > 0
                                  ? ` · ${
                                      (mockTestsByModule[mod.id] || []).length
                                    } mock test${
                                      (mockTestsByModule[mod.id] || []).length >
                                      1
                                        ? "s"
                                        : ""
                                    }`
                                  : ""
                              }`}
                        </span>
                      </button>

                      {isExpanded && !locked && (
                        <div className="border-t border-slate-100">
                          {lessons.length === 0 && (
                            <p className="text-sm text-slate-400 text-center py-4">
                              No lessons in this module yet
                            </p>
                          )}
                          {lessons
                            .sort(
                              (a, b) =>
                                (a.displayOrder || 0) - (b.displayOrder || 0)
                            )
                            .map((lesson) => (
                              <button
                                key={lesson.id}
                                onClick={() =>
                                  handleViewLesson(mod.id, lesson.id)
                                }
                                className="w-full flex items-center gap-3 px-6 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
                              >
                                {isEnrolled ? (
                                  <PlayCircle className="w-4 h-4 text-[#00A86B] flex-shrink-0" />
                                ) : (
                                  <PlayCircle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                                )}
                                <span className="text-sm text-slate-600">
                                  {lesson.title}
                                </span>
                                {lesson.estimatedMinutes && (
                                  <span className="text-xs text-slate-400 ml-auto">
                                    {lesson.estimatedMinutes} min
                                  </span>
                                )}
                              </button>
                            ))}

                          {(mockTestsByModule[mod.id] || []).length > 0 && (
                            <>
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-6 pt-4 pb-1">
                                Mock Tests
                              </p>
                              {mockTestsByModule[mod.id]
                                .sort(
                                  (a, b) =>
                                    (a.displayOrder || 0) -
                                    (b.displayOrder || 0)
                                )
                                .map((test) => (
                                  <button
                                    key={test.id}
                                    onClick={() => handleViewMockTest(test.id)}
                                    className="w-full flex items-center gap-3 px-6 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
                                  >
                                    <ClipboardList className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    <span className="text-sm text-slate-600">
                                      {test.title}
                                    </span>
                                    <span className="text-xs text-slate-400 ml-auto">
                                      {(test.questions || []).length} questions
                                      &middot; {test.durationMinutes} min
                                    </span>
                                  </button>
                                ))}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {sortedCourseLinks.map((cm) => {
                  const isExpanded = expandedModules.has(`cm:${cm.id}`);
                  const content = courseLinkContent[cm.id];
                  const linkedMods = content?.modules || [];
                  const linkLessonsCount = linkedMods.reduce(
                    (acc, m) => acc + (content?.lessonsByModule?.[m.id]?.length || 0),
                    0
                  );
                  return (
                    <div
                      key={cm.id}
                      className="bg-white rounded-2xl border border-[#00A86B]/30 overflow-hidden"
                    >
                      <button
                        onClick={() => {
                          toggleModule(`cm:${cm.id}`);
                          if (!expandedModules.has(`cm:${cm.id}`) && !content?.loaded)
                            loadCourseLinkContent(cm);
                        }}
                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-[#00A86B] flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-[#00A86B] flex-shrink-0" />
                          )}
                          <BookOpen className="w-5 h-5 text-[#00A86B] flex-shrink-0" />
                          <div className="min-w-0">
                            <span className="font-semibold truncate block text-[#0B2545]">
                              {cm.displayOrder}. {cm.title}
                            </span>
                            <span className="text-xs font-semibold text-[#008f5a]">
                              Type: Existing Course
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/courses/${cm.courseId}`);
                            }}
                            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Open course
                          </button>
                          <span className="text-xs text-slate-400">
                            {content?.loaded
                              ? `${linkedMods.length} module${
                                  linkedMods.length === 1 ? "" : "s"
                                } · ${linkLessonsCount} lessons`
                              : "click to load"}
                          </span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-[#00A86B]/20">
                          {!content?.loaded && (
                            <div className="flex items-center justify-center py-6">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00A86B]" />
                            </div>
                          )}
                          {content?.loaded && linkedMods.length === 0 && (
                            <p className="text-sm text-slate-400 text-center py-4">
                              This course has no modules yet.
                            </p>
                          )}
                          {content?.loaded &&
                            linkedMods
                              .slice()
                              .sort(
                                (a, b) =>
                                  (a.displayOrder || 0) - (b.displayOrder || 0)
                              )
                              .map((mod) => {
                                const cLessons =
                                  content.lessonsByModule[mod.id] || [];
                                const cTests =
                                  content.mockTestsByModule[mod.id] || [];
                                return (
                                  <div
                                    key={mod.id}
                                    className="px-6 py-3 border-b border-slate-100 last:border-0"
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-xs px-1.5 py-0.5 bg-[#00A86B]/10 text-[#008f5a] rounded flex-shrink-0 font-semibold">
                                        Module {mod.displayOrder}: {mod.title}
                                      </span>
                                      <span className="text-xs text-slate-400">
                                        {cLessons.length} lessons
                                        {cTests.length > 0
                                          ? ` · ${cTests.length} mock test${
                                              cTests.length === 1 ? "" : "s"
                                            }`
                                          : ""}
                                      </span>
                                    </div>
                                    {cLessons.map((lesson) => (
                                      <button
                                        key={lesson.id}
                                        onClick={() =>
                                          handleViewLesson(mod.id, lesson.id)
                                        }
                                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors text-left"
                                      >
                                        <PlayCircle className="w-4 h-4 text-[#00A86B] flex-shrink-0" />
                                        <span className="text-sm text-slate-600">
                                          {lesson.title}
                                        </span>
                                        {lesson.estimatedMinutes && (
                                          <span className="text-xs text-slate-400 ml-auto">
                                            {lesson.estimatedMinutes} min
                                          </span>
                                        )}
                                      </button>
                                    ))}
                                    {cTests.length > 0 && (
                                      <div className="pt-2">
                                        {cTests.map((test) => (
                                          <button
                                            key={test.id}
                                            onClick={() =>
                                              handleViewMockTest(test.id)
                                            }
                                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors text-left"
                                          >
                                            <ClipboardList className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                            <span className="text-sm text-slate-600">
                                              {test.title}
                                            </span>
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {modules.length === 0 && courseLinks.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center text-sm text-slate-400">
                  Course curriculum coming soon
                </div>
              )}

              {/* Enroll CTA under curriculum */}
              {modules.length > unlockedModules && (
                <div className="mt-4 bg-gradient-to-r from-[#0B2545] to-[#13315c] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-white">
                    <p className="font-bold">
                      {modules.length - unlockedModules} more module
                      {modules.length - unlockedModules > 1 ? "s" : ""} waiting
                    </p>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {isPaid
                        ? "Add to cart and complete checkout to unlock the full course"
                        : "Enroll now to unlock the full course content, lessons and mock tests"}
                    </p>
                  </div>
                  <button
                    onClick={handleEnroll}
                    disabled={
                      enrolling ||
                      addingToCart ||
                      (isAuthenticated && !isStudent)
                    }
                    className="flex-shrink-0 px-6 py-2.5 bg-[#00A86B] hover:bg-[#008f5a] text-white text-sm font-bold rounded-xl shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isPaid && <ShoppingCart className="w-4 h-4" />}
                    {enrolling || addingToCart
                      ? "Please wait..."
                      : isPaid
                      ? "Add to Cart"
                      : "Enroll Now"}
                  </button>
                </div>
              )}
            </section>
        </div>
        )}
      </div>
    </div>
  );
}
