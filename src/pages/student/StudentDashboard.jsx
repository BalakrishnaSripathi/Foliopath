import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  BadgeCheck,
  UserCircle,
  Search,
  PlayCircle,
} from "lucide-react";
import { getStudentDashboard } from "../../api/studentService";
import { getMyEnrollments } from "../../api/enrollmentService";
import Header from "../../components/layout/Header";

const ENROLLMENT_BADGES = {
  ENROLLED: "bg-blue-50 text-blue-600",
  IN_PROGRESS: "bg-amber-50 text-amber-600",
  COMPLETED: "bg-green-50 text-green-600",
};

export default function StudentDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [{ data }, enrollRes] = await Promise.all([
        getStudentDashboard(),
        getMyEnrollments().catch(() => ({ data: [] })),
      ]);
      setDashboard(data);
      const list = Array.isArray(enrollRes.data) ? enrollRes.data : [];
      setEnrollments(list.filter((e) => e.enrollmentStatus !== "DROPPED"));
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A86B]" />
      </div>
    );
  }

  const studentInfo = dashboard?.studentInfo;
  const studentCode = dashboard?.studentCode;

  const cards = [
    {
      label: "Student Code",
      value: studentCode || "-",
      icon: BadgeCheck,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Full Name",
      value:
        [studentInfo?.firstName, studentInfo?.lastName]
          .filter(Boolean)
          .join(" ") || "-",
      icon: UserCircle,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-[#0B2545] mb-2">
          My Learning
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Welcome back{studentInfo?.firstName ? `, ${studentInfo.firstName}` : ""}! Continue your learning journey.
        </p>

        {/* Profile summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {cards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500">
                    {card.label}
                  </p>
                  <p
                    className="text-xl font-bold text-[#0B2545] mt-1 truncate"
                    title={String(card.value)}
                  >
                    {card.value}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${card.color}`}
                >
                  <card.icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <Link
            to="/courses"
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#00A86B]/10 flex items-center justify-center flex-shrink-0">
                <Search className="w-6 h-6 text-[#00A86B]" />
              </div>
              <div>
                <h3 className="font-bold text-[#0B2545] group-hover:text-[#00A86B] transition-colors">
                  Browse Courses
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Explore the full course catalog and enroll
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/my-profile"
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <UserCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-[#0B2545] group-hover:text-[#00A86B] transition-colors">
                  My Profile
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  View and update your personal details
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Enrolled courses */}
        {enrollments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-[#0B2545] mb-4">
              My Courses ({enrollments.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((course) => (
                <div
                  key={course.courseId}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 group"
                >
                  <Link to={`/courses/${course.courseId}`} className="block h-36 overflow-hidden">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#0B2545] to-[#13315c] flex items-center justify-center">
                        <span className="text-2xl font-black text-[#00A86B]">
                          {(course.title || "F").charAt(0)}
                        </span>
                      </div>
                    )}
                  </Link>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-sm text-[#0B2545] line-clamp-1">
                        {course.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${
                          ENROLLMENT_BADGES[course.enrollmentStatus] ||
                          "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {course.enrollmentStatus?.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#00A86B] rounded-full transition-all duration-300"
                          style={{ width: `${course.progressPercentage || 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-500 w-9 text-right">
                        {course.progressPercentage || 0}%
                      </span>
                    </div>
                    <Link
                      to={`/courses/${course.courseId}`}
                      className="flex items-center justify-center gap-1.5 w-full py-2 bg-emerald-50 text-[#00A86B] hover:bg-[#00A86B] hover:text-white rounded-lg text-sm font-semibold transition-all duration-200"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Continue Learning
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Getting started */}
        {enrollments.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-[#0B2545] mb-2">
            Start your learning journey
          </h2>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Head over to the course catalog, find a course that fits your goals,
            and enroll to get started.
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 bg-[#00A86B] hover:bg-[#008f5a] text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            Explore Courses
          </Link>
          </div>
        )}
      </div>
    </div>
  );
}
