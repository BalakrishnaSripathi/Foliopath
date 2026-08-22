import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  BadgeCheck,
  UserCircle,
  Search,
} from "lucide-react";
import { getStudentDashboard } from "../../api/studentService";
import Header from "../../components/layout/Header";

export default function StudentDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data } = await getStudentDashboard();
      setDashboard(data);
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

        {/* Getting started */}
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
      </div>
    </div>
  );
}
