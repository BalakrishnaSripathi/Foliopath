import { useState, useEffect } from "react";
import { X, BookOpen, CheckCircle2 } from "lucide-react";
import { getPublishedCourses } from "../../api/courseService";
import { adminEnrollStudent, getStudentEnrollments } from "../../api/superAdminService";

export default function EnrollStudentModal({ student, onClose, onSuccess }) {
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [submitting, setSubmitting] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoadingCourses(true);
    try {
      const [coursesRes, enrollmentsRes] = await Promise.all([
        getPublishedCourses(),
        getStudentEnrollments(student.userId),
      ]);
      setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
      const ids = new Set(
        (Array.isArray(enrollmentsRes.data) ? enrollmentsRes.data : [])
          .filter((e) => e.enrollmentStatus !== "DROPPED")
          .map((e) => e.courseId)
      );
      setEnrolledCourseIds(ids);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError(err.response?.data?.message || "Failed to load courses");
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleEnroll = async (courseId) => {
    setSubmitting(courseId);
    setError("");
    try {
      await adminEnrollStudent(student.userId, courseId);
      setEnrolledCourseIds((prev) => new Set([...prev, courseId]));
      onSuccess?.();
    } catch (err) {
      console.error("Enrollment failed:", err);
      setError(err.response?.data?.message || "Failed to enroll student");
    } finally {
      setSubmitting(null);
    }
  };

  if (!student) return null;

  const name = `${student.firstName || ""} ${student.lastName || ""}`.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-[#0B2545]">
              Enroll Student
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {name} ({student.email})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          {loadingCourses ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A86B]" />
            </div>
          ) : courses.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              No published courses available
            </p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {courses.map((course) => {
                const isEnrolled = enrolledCourseIds.has(course.id);
                const isLoading = submitting === course.id;
                return (
                  <div
                    key={course.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isEnrolled
                        ? "bg-green-50 border-green-200"
                        : "bg-white border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[#0B2545] truncate">
                          {course.title}
                        </div>
                        <div className="text-xs text-slate-400">
                          {course.price > 0 ? `₹${course.price}` : "Free"}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-3">
                      {isEnrolled ? (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 px-3 py-1.5 rounded-lg bg-green-100">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Enrolled
                        </span>
                      ) : (
                        <button
                          onClick={() => handleEnroll(course.id)}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg bg-[#00A86B] hover:bg-[#008f5a] transition-colors disabled:opacity-50"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          {isLoading ? "Enrolling..." : "Enroll"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end p-5 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
