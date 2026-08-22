import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  Globe,
  BookOpen,
  ChevronDown,
  ChevronRight,
  PlayCircle,
} from "lucide-react";
import {
  getCourseById,
  getModules,
  getLessons,
} from "../../api/courseService";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/layout/Header";

const levelLabels = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessonsByModule, setLessonsByModule] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState(null);

  useEffect(() => {
    loadData();
  }, [courseId]);

  const loadData = async () => {
    try {
      const [courseRes, modulesRes] = await Promise.all([
        getCourseById(courseId),
        getModules(courseId),
      ]);
      setCourse(courseRes.data);
      const mods = modulesRes.data;
      setModules(mods);

      const results = await Promise.all(
        mods.map((m) =>
          getLessons(m.id)
            .then(({ data }) => [m.id, Array.isArray(data) ? data : []])
            .catch(() => [m.id, []])
        )
      );
      setLessonsByModule(Object.fromEntries(results));
    } catch (err) {
      console.error("Failed to load course:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewLesson = (moduleId, lessonId) => {
    navigate(`/lessons/${moduleId}/${lessonId}`);
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
              <div className="text-3xl font-black mb-4">
                ₹{course.price || 0}
              </div>

              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate("/login");
                  } else if (role === "STUDENT") {
                    navigate("/my-courses");
                  }
                }}
                className="w-full py-3 bg-[#00A86B] hover:bg-[#008f5a] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isAuthenticated ? "Go to Dashboard" : "Enroll Now"}
              </button>

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
              <h2 className="text-xl font-bold text-[#0B2545] mb-4">
                Curriculum
              </h2>
              <div className="space-y-3">
                {modules
                  .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                  .map((mod) => {
                    const lessons = lessonsByModule[mod.id] || [];
                    return (
                      <div
                        key={mod.id}
                        className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
                      >
                        <button
                          onClick={() =>
                            setExpandedModule(
                              expandedModule === mod.id ? null : mod.id
                            )
                          }
                          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {expandedModule === mod.id ? (
                              <ChevronDown className="w-5 h-5 text-slate-400" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-slate-400" />
                            )}
                            <span className="font-semibold text-[#0B2545]">
                              Module {mod.displayOrder}: {mod.title}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">
                            {lessons.length} lessons
                          </span>
                        </button>

                        {expandedModule === mod.id && (
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
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
