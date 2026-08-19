import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  Users,
  Clock,
  Globe,
  BookOpen,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  CheckCircle,
} from "lucide-react";
import {
  getCourseById,
  getModules,
  getCourseReviews,
  enrollCourse,
  checkEnrolled,
} from "../../api/courseService";
import { useAuth } from "../../context/AuthContext";

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedModule, setExpandedModule] = useState(null);

  useEffect(() => {
    loadData();
  }, [courseId]);

  const loadData = async () => {
    try {
      const [courseRes, modulesRes, reviewsRes] = await Promise.all([
        getCourseById(courseId),
        getModules(courseId),
        getCourseReviews(courseId),
      ]);
      setCourse(courseRes.data);
      setModules(modulesRes.data);
      setReviews(reviewsRes.data);

      if (isAuthenticated && role === "STUDENT") {
        try {
          const { data } = await checkEnrolled(courseId);
          setEnrolled(data);
        } catch {
          setEnrolled(false);
        }
      }
    } catch (err) {
      console.error("Failed to load course:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setEnrolling(true);
    try {
      await enrollCourse(courseId);
      setEnrolled(true);
      setCourse((prev) => ({
        ...prev,
        totalStudents: (prev.totalStudents || 0) + 1,
      }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to enroll");
    } finally {
      setEnrolling(false);
    }
  };

  const handleViewLesson = (lessonId) => {
    if (!enrolled) {
      handleEnroll();
      return;
    }
    navigate(`/lessons/${lessonId}`);
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

  const totalLessons = modules.reduce(
    (acc, m) => acc + (m.lessons?.length || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-[#0B2545] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <span className="text-xs font-bold text-[#00A86B] tracking-wider uppercase">
                {course.category || "Course"}
              </span>
              <h1 className="text-3xl font-bold mt-2 mb-4">{course.title}</h1>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                {course.rating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    {course.rating?.toFixed(1)} rating
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {course.totalStudents} students
                </span>
                {course.level && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.level}
                  </span>
                )}
                {course.language && (
                  <span className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    {course.language}
                  </span>
                )}
              </div>

              {course.instructorName && (
                <p className="text-sm text-slate-400 mt-4">
                  Created by{" "}
                  <span className="text-white font-semibold">
                    {course.instructorName}
                  </span>
                </p>
              )}
            </div>

            {/* Enroll Card */}
            <div className="bg-white rounded-2xl p-6 text-[#0B2545] shadow-xl self-start">
              {course.imageUrl && (
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-full h-40 object-cover rounded-xl mb-4"
                />
              )}
              <div className="text-3xl font-black mb-4">₹{course.price}</div>

              {enrolled ? (
                <div className="w-full py-3 bg-green-50 text-green-600 font-bold rounded-xl text-center text-sm">
                  ✓ Enrolled
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full py-3 bg-[#00A86B] hover:bg-[#008f5a] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60"
                >
                  {enrolling ? "Enrolling..." : "Enroll Now"}
                </button>
              )}

              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  {modules.length} modules &middot; {totalLessons} lessons
                </div>
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
                {modules.map((mod) => (
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
                          Module {mod.orderIndex}: {mod.title}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {mod.lessons?.length || 0} lessons
                      </span>
                    </button>

                    {expandedModule === mod.id && (
                      <div className="border-t border-slate-100">
                        {(mod.lessons || []).map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => handleViewLesson(lesson.id)}
                            className="w-full flex items-center gap-3 px-6 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
                          >
                            {enrolled ? (
                              <PlayCircle className="w-4 h-4 text-[#00A86B] flex-shrink-0" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                            )}
                            <span className="text-sm text-slate-600">
                              {lesson.title}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews */}
            <section>
              <h2 className="text-xl font-bold text-[#0B2545] mb-4">
                Reviews ({reviews.length})
              </h2>
              {reviews.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center text-sm text-slate-400">
                  No reviews yet
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white rounded-2xl border border-slate-100 p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-[#0B2545]">
                          {review.studentName}
                        </span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
