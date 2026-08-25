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
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getCourseById,
  getModules,
  getLessons,
} from "../../api/courseService";
import { getMockTests } from "../../api/mockTestService";
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

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const isStudent = role === "STUDENT";
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessonsByModule, setLessonsByModule] = useState({});
  const [mockTestsByModule, setMockTestsByModule] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

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
      navigate("/my-courses");
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
                  {modules.length} modules &middot; {totalLessons} lessons
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
                  {modules.length} modules &middot; {totalLessons} lessons
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
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {/* Overview */}
            <section>
              <h2 className="text-xl font-bold text-[#0B2545] mb-4">
                About This Course
              </h2>
              <div className="bg-white rounded-2xl border border-slate-100 p-6 text-sm text-slate-600 leading-relaxed">
                {course.description || "No description available."}
              </div>
            </section>

            {/* Curriculum */}
            <section>
              <h2 className="text-xl font-bold text-[#0B2545] mb-1">
                Curriculum
              </h2>
              <p className="text-xs text-slate-500 mb-4">
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
              <div className="space-y-3">
                {sortedModules.map((mod, index) => {
                  const lessons = lessonsByModule[mod.id] || [];
                  const locked = index >= unlockedModules;
                  const isExpanded = expandedModule === mod.id;
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
                          setExpandedModule(isExpanded ? null : mod.id);
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
              </div>
              {modules.length === 0 && (
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
        </div>
      </div>
    </div>
  );
}
