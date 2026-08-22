import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  GraduationCap,
  Shield,
  UserCog,
  Plus,
  Pencil,
  Trash2,
  X,
  Power,
  Mail,
  Send,
  BookOpen,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import {
  getSuperAdminDashboard,
  getAllStaff,
  createStaff,
  updateStaff,
  updateStaffStatus,
  resendStaffSetupLink,
  deleteStaff,
} from "../../api/superAdminService";
import {
  getAllCourses,
  publishCourse,
  deleteCourse,
} from "../../api/courseService";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/layout/Header";

const emptyForm = {
  email: "",
  firstName: "",
  lastName: "",
  mobileNumber: "",
  designation: "",
  department: "",
  qualification: "",
  specialization: "",
};

function StaffFormModal({ initial, isEdit, onSave, onClose, saving }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Enter a valid email";
    if (!form.firstName.trim()) next.firstName = "First name is required";
    if (form.mobileNumber && !/^\d{10}$/.test(form.mobileNumber))
      next.mobileNumber = "Enter a valid 10-digit number";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const inputCls =
    "w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:border-[#00A86B] focus:bg-white focus:outline-none transition-all duration-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-lg font-bold text-[#0B2545]">
            {isEdit ? "Edit Staff" : "Add Staff"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={form.firstName}
                onChange={set("firstName")}
                className={`${inputCls} ${errors.firstName ? "border-red-400" : ""}`}
                placeholder="John"
              />
              {errors.firstName && (
                <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={form.lastName}
                onChange={set("lastName")}
                className={inputCls}
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
              Email *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              disabled={isEdit}
              className={`${inputCls} ${errors.email ? "border-red-400" : ""} ${
                isEdit ? "opacity-60 cursor-not-allowed" : ""
              }`}
              placeholder="john@foliopath.com"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
            {isEdit && (
              <p className="text-xs text-slate-400 mt-1">
                Email cannot be changed
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                value={form.mobileNumber}
                onChange={set("mobileNumber")}
                className={`${inputCls} ${errors.mobileNumber ? "border-red-400" : ""}`}
                placeholder="9876543210"
              />
              {errors.mobileNumber && (
                <p className="text-xs text-red-500 mt-1">{errors.mobileNumber}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Designation
              </label>
              <input
                type="text"
                value={form.designation}
                onChange={set("designation")}
                className={inputCls}
                placeholder="Senior Trainer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Department
              </label>
              <input
                type="text"
                value={form.department}
                onChange={set("department")}
                className={inputCls}
                placeholder="Engineering"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Qualification
              </label>
              <input
                type="text"
                value={form.qualification}
                onChange={set("qualification")}
                className={inputCls}
                placeholder="M.Tech Computer Science"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
              Specialization
            </label>
            <input
              type="text"
              value={form.specialization}
              onChange={set("specialization")}
              className={inputCls}
              placeholder="Full Stack Development"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100 sticky bottom-0 bg-white rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => validate() && onSave(form)}
            disabled={saving}
            className="px-5 py-2 bg-[#00A86B] hover:bg-[#008f5a] text-white text-sm font-bold rounded-xl shadow-md transition-all duration-200 disabled:opacity-60"
          >
            {saving ? "Saving..." : isEdit ? "Update Staff" : "Create Staff"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CombinedDashboard() {
  const { role } = useAuth();
  const isSuperAdmin = role === "SUPER_ADMIN";

  const [stats, setStats] = useState(null);
  const [staff, setStaff] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { staff | null }
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const requests = [getAllCourses()];
      if (isSuperAdmin) {
        requests.push(getSuperAdminDashboard(), getAllStaff());
      }
      const results = await Promise.all(requests);
      setCourses(results[0].data);
      if (isSuperAdmin) {
        setStats(results[1].data);
        setStaff(results[2].data);
      }
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  // ==================== STAFF ACTIONS ====================

  const handleSave = async (form) => {
    setSaving(true);
    setActionError("");
    try {
      if (modal?.staff) {
        await updateStaff(modal.staff.userId, form);
      } else {
        await createStaff(form);
      }
      const { data } = await getAllStaff();
      setStaff(data);
      setModal(null);
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Failed to save staff member"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (member) => {
    try {
      const { data } = await updateStaffStatus(member.userId, !member.enabled);
      setStaff((prev) =>
        prev.map((s) => (s.userId === member.userId ? data : s))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleResendSetupLink = async (member) => {
    if (!confirm(`Resend the password setup link to ${member.email}?`)) return;
    try {
      const { data } = await resendStaffSetupLink(member.userId);
      alert(data?.message || "Setup link sent successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to resend setup link");
    }
  };

  const handleDeleteStaff = async (member) => {
    if (
      !confirm(
        `Delete staff member "${member.firstName}"? This cannot be undone.`
      )
    )
      return;
    try {
      await deleteStaff(member.userId);
      setStaff((prev) => prev.filter((s) => s.userId !== member.userId));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  // ==================== COURSE ACTIONS ====================

  const handlePublish = async (courseId) => {
    try {
      await publishCourse(courseId);
      const { data } = await getAllCourses();
      setCourses(data);
    } catch (err) {
      console.error("Failed to publish:", err);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await deleteCourse(courseId);
      setCourses(courses.filter((c) => c.id !== courseId));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A86B]" />
      </div>
    );
  }

  const userStatCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total Students",
      value: stats?.totalStudents || 0,
      icon: GraduationCap,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Total Staff",
      value: stats?.totalStaff || 0,
      icon: UserCog,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Super Admins",
      value: stats?.totalSuperAdmins || 0,
      icon: Shield,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  const courseStatCards = [
    {
      label: "Total Courses",
      value: courses.length,
      icon: BookOpen,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Published",
      value: courses.filter((c) => c.status === "PUBLISHED").length,
      icon: TrendingUp,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Drafts",
      value: courses.filter((c) => c.status !== "PUBLISHED").length,
      icon: BarChart3,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Free Courses",
      value: courses.filter((c) => !c.price || c.price === 0).length,
      icon: GraduationCap,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0B2545]">
              {isSuperAdmin ? "Super Admin Dashboard" : "Staff Dashboard"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {isSuperAdmin
                ? "Platform overview, staff and course management"
                : "Course management"}
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

        {actionError && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {actionError}
          </div>
        )}

        {/* User stats — super admin only */}
        {isSuperAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {userStatCards.map((card) => (
              <div
                key={card.label}
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
        )}

        {/* Course stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {courseStatCards.map((card) => (
            <div
              key={card.label}
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

        {/* Staff management — super admin only */}
        {isSuperAdmin && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#0B2545]">
                Staff Members
              </h2>
              <UserCog className="w-5 h-5 text-slate-400" />
            </div>

            {staff.length === 0 ? (
              <div className="text-center py-12">
                <UserCog className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-4">No staff members yet</p>
                <button
                  onClick={() => setModal({ staff: null })}
                  className="inline-flex items-center gap-2 text-[#00A86B] font-semibold hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  Add your first staff member
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-3 px-4 font-semibold text-slate-600">
                        Staff
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 hidden md:table-cell">
                        Designation
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 hidden lg:table-cell">
                        Department
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 hidden sm:table-cell">
                        Staff Code
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
                    {staff.map((member) => (
                      <tr
                        key={member.userId}
                        className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="font-semibold text-[#0B2545] block">
                            {member.firstName} {member.lastName || ""}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {member.email}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 hidden md:table-cell">
                          {member.designation || "-"}
                        </td>
                        <td className="py-3 px-4 text-slate-500 hidden lg:table-cell">
                          {member.department || "-"}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-xs hidden sm:table-cell">
                          {member.staffCode || "-"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              member.enabled
                                ? "bg-green-50 text-green-600"
                                : "bg-red-50 text-red-500"
                            }`}
                          >
                            {member.enabled ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setModal({ staff: member })}
                              className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleResendSetupLink(member)}
                              className="p-1.5 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Resend setup link"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(member)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                member.enabled
                                  ? "text-amber-500 hover:text-amber-700 hover:bg-amber-50"
                                  : "text-green-500 hover:text-green-700 hover:bg-green-50"
                              }`}
                              title={member.enabled ? "Disable" : "Enable"}
                            >
                              <Power className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStaff(member)}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Course management */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#0B2545]">All Courses</h2>
            <BookOpen className="w-5 h-5 text-slate-400" />
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
                    <th className="text-left py-3 px-4 font-semibold text-slate-600 hidden sm:table-cell">
                      Level
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">
                      Price
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600 hidden md:table-cell">
                      Language
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
                          {course.thumbnailUrl ? (
                            <img
                              src={course.thumbnailUrl}
                              alt={course.title}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-[#0B2545] block">
                              {course.title}
                            </span>
                            <span className="text-xs text-slate-400">
                              {course.courseCode}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 hidden sm:table-cell">
                        {course.level || "-"}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#0B2545]">
                        ₹{course.price || 0}
                      </td>
                      <td className="py-3 px-4 text-slate-500 hidden md:table-cell">
                        {course.language || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            course.status === "PUBLISHED"
                              ? "bg-green-50 text-green-600"
                              : course.status === "DRAFT"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {course.status || "DRAFT"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/admin/courses/${course.id}`}
                            className="text-[#00A86B] font-semibold hover:underline text-xs"
                          >
                            Edit
                          </Link>
                          <Link
                            to={`/admin/courses/${course.id}/content`}
                            className="text-blue-600 font-semibold hover:underline text-xs"
                          >
                            Content
                          </Link>
                          {course.status !== "PUBLISHED" && (
                            <button
                              onClick={() => handlePublish(course.id)}
                              className="text-xs text-emerald-600 hover:underline font-semibold"
                            >
                              Publish
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="text-xs text-red-500 hover:underline font-semibold"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <StaffFormModal
          initial={
            modal.staff
              ? {
                  email: modal.staff.email || "",
                  firstName: modal.staff.firstName || "",
                  lastName: modal.staff.lastName || "",
                  mobileNumber: modal.staff.mobileNumber || "",
                  designation: modal.staff.designation || "",
                  department: modal.staff.department || "",
                  qualification: modal.staff.qualification || "",
                  specialization: modal.staff.specialization || "",
                }
              : emptyForm
          }
          isEdit={!!modal.staff}
          onSave={handleSave}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}
    </div>
  );
}
