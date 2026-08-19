import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  BarChart3,
} from "lucide-react";
import { getDashboardStats, getAdminCourses } from "../../api/courseService";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, coursesRes] = await Promise.all([
        getDashboardStats(),
        getAdminCourses(),
      ]);
      setStats(statsRes.data);
      setCourses(coursesRes.data);
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

  const statCards = [
    {
      label: "Total Courses",
      value: stats?.totalCourses || 0,
      icon: BookOpen,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total Students",
      value: stats?.totalStudents || 0,
      icon: Users,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Total Enrollments",
      value: stats?.totalEnrollments || 0,
      icon: TrendingUp,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Total Revenue",
      value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0B2545]">
              Admin Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your courses and track performance
            </p>
          </div>
          <Link
            to="/admin/courses/new"
            className="flex items-center gap-2 bg-[#00A86B] hover:bg-[#008f5a] text-white font-semibold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add Course
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, idx) => (
            <div
              key={card.label}
              data-aos="fade-up"
              data-aos-delay={idx * 100}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold text-[#0B2545] mt-1">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}
                >
                  <card.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Courses */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#0B2545]">
              Your Courses
            </h2>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No courses yet</p>
              <Link
                to="/admin/courses/new"
                className="inline-flex items-center gap-2 mt-4 text-[#00A86B] font-semibold hover:underline"
              >
                <Plus className="w-4 h-4" />
                Create your first course
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">
                      Course
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">
                      Category
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">
                      Price
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">
                      Students
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr
                      key={course.id}
                      className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {course.imageUrl && (
                            <img
                              src={course.imageUrl}
                              alt={course.title}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          )}
                          <span className="font-semibold text-[#0B2545]">
                            {course.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {course.category || "-"}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#0B2545]">
                        ₹{course.price}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {course.totalStudents}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            course.published
                              ? "bg-green-50 text-green-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {course.published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          to={`/admin/courses/${course.id}`}
                          className="text-[#00A86B] font-semibold hover:underline mr-3"
                        >
                          Edit
                        </Link>
                        <Link
                          to={`/admin/courses/${course.id}/content`}
                          className="text-blue-600 font-semibold hover:underline"
                        >
                          Content
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
