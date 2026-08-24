import { useState, useEffect } from "react";
import {
  X,
  Mail,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  ClipboardList,
  Award,
  Lock,
} from "lucide-react";
import { getStudentPerformance } from "../../api/superAdminService";

const ENROLLMENT_BADGES = {
  ENROLLED: "bg-blue-50 text-blue-600",
  IN_PROGRESS: "bg-amber-50 text-amber-600",
  COMPLETED: "bg-green-50 text-green-600",
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function StudentDetailsModal({ student, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!student?.userId) return;
    loadPerformance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student?.userId]);

  const loadPerformance = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getStudentPerformance(student.userId);
      setData(data);
    } catch (err) {
      console.error("Failed to load student performance:", err);
      setError(
        err.response?.data?.message || "Failed to load student details"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!student) return null;

  const name = `${student.firstName || ""} ${student.lastName || ""}`.trim();
  const active = data ? data.enabled : student.enabled;
  const statusLabel = data?.status || student.status;

  const summaryCards = [
    {
      label: "Enrolled Courses",
      value: data?.totalEnrolledCourses ?? 0,
      icon: BookOpen,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Completed",
      value: data?.completedCourses ?? 0,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Avg Progress",
      value: `${data?.averageProgressPercentage ?? 0}%`,
      icon: TrendingUp,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Tests Passed",
      value: `${
        data?.mockTestsPassed ?? 0
      }/${data?.totalMockTestsTaken ?? 0}`,
      icon: Award,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-[#0B2545] truncate">
                {name}
              </h2>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  active
                    ? "bg-green-50 text-green-600"
                    : statusLabel === "INACTIVE"
                    ? "bg-red-50 text-red-500"
                    : "bg-amber-50 text-amber-600"
                }`}
              >
                {statusLabel || "UNKNOWN"}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
              <Mail className="w-3 h-3" />
              {student.email}
            </p>
            {data?.studentCode && (
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {data.studentCode}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A86B]" />
            </div>
          ) : error ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          ) : (
            <>
              {/* Performance summary */}
              <section>
                <h3 className="text-sm font-bold text-[#0B2545] uppercase tracking-wide mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#00A86B]" />
                  Performance Overview
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {summaryCards.map((card) => (
                    <div
                      key={card.label}
                      className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${card.color}`}
                      >
                        <card.icon className="w-5 h-5" />
                      </div>
                      <p className="text-lg font-bold text-[#0B2545] leading-none">
                        {card.value}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {card.label}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Enrolled courses */}
              <section>
                <h3 className="text-sm font-bold text-[#0B2545] uppercase tracking-wide mb-3 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#00A86B]" />
                  Enrolled Courses ({data.enrolledCourses?.length || 0})
                </h3>
                {(data.enrolledCourses?.length || 0) === 0 ? (
                  <p className="text-sm text-slate-400 bg-slate-50 rounded-xl p-4 text-center">
                    Not enrolled in any course yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {data.enrolledCourses.map((course) => (
                      <div
                        key={course.courseId}
                        className="border border-slate-100 rounded-xl p-3"
                      >
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <span className="text-sm font-semibold text-[#0B2545]">
                            {course.title}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              ENROLLMENT_BADGES[course.enrollmentStatus] ||
                              "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {course.enrollmentStatus?.replace("_", " ") ||
                              "-"}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#00A86B] rounded-full transition-all duration-300"
                              style={{
                                width: `${course.progressPercentage || 0}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-500 w-9 text-right">
                            {course.progressPercentage || 0}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Mock test scores */}
              <section>
                <h3 className="text-sm font-bold text-[#0B2545] uppercase tracking-wide mb-3 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-[#00A86B]" />
                  Mock Test Scores ({data.mockTestScores?.length || 0})
                </h3>
                {(data.mockTestScores?.length || 0) === 0 ? (
                  <p className="text-sm text-slate-400 bg-slate-50 rounded-xl p-4 text-center">
                    No mock tests attempted yet
                  </p>
                ) : (
                  <div className="overflow-x-auto border border-slate-100 rounded-xl">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                          <th className="text-left py-2.5 px-4 font-semibold text-slate-600">
                            Test
                          </th>
                          <th className="text-left py-2.5 px-4 font-semibold text-slate-600 hidden sm:table-cell">
                            Course
                          </th>
                          <th className="text-left py-2.5 px-4 font-semibold text-slate-600">
                            Score
                          </th>
                          <th className="text-left py-2.5 px-4 font-semibold text-slate-600">
                            Result
                          </th>
                          <th className="text-left py-2.5 px-4 font-semibold text-slate-600 hidden md:table-cell">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.mockTestScores.map((score) => (
                          <tr
                            key={score.attemptId}
                            className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors"
                          >
                            <td className="py-2.5 px-4">
                              <span className="font-medium text-[#0B2545] block">
                                {score.testTitle}
                              </span>
                              {score.moduleName && (
                                <span className="text-xs text-slate-400">
                                  {score.moduleName}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-4 text-slate-500 hidden sm:table-cell">
                              {score.courseTitle || "-"}
                            </td>
                            <td className="py-2.5 px-4 font-semibold text-[#0B2545] whitespace-nowrap">
                              {score.score}/{score.totalQuestions}
                              <span className="text-xs font-normal text-slate-400 ml-1">
                                ({score.percentage}%)
                              </span>
                            </td>
                            <td className="py-2.5 px-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                  score.passed
                                    ? "bg-green-50 text-green-600"
                                    : "bg-red-50 text-red-500"
                                }`}
                              >
                                {score.passed ? (
                                  <CheckCircle2 className="w-3 h-3" />
                                ) : (
                                  <Lock className="w-3 h-3" />
                                )}
                                {score.passed ? "Passed" : "Failed"}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-slate-500 text-xs hidden md:table-cell whitespace-nowrap">
                              {formatDate(score.submittedAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </div>

        <div className="flex items-center justify-end p-5 border-t border-slate-100 sticky bottom-0 bg-white rounded-b-2xl">
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
