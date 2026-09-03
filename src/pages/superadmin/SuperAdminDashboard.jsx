import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Users,
  BookOpen,
  Mail,
  BarChart3,
  CreditCard,
  X,
  Plus,
  Pencil,
  Send,
  RotateCcw,
  Power,
  Trash2,
  FolderOpen,
  Eye,
  EyeOff,
  RefreshCw,
  Briefcase,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  getSuperAdminDashboard,
  getAllStaff,
  createStaff,
  updateStaff,
  updateStaffStatus,
  resendStaffSetupLink,
  deleteStaff,
  resetStaffPassword,
  resetStudentPasswordByAdmin,
} from "../../api/superAdminService";
import {
  getAllCourses,
  publishCourse,
  unpublishCourse,
  deleteCourse,
} from "../../api/courseService";
import { useAuth } from "../../context/AuthContext";
import AllStudentsTable from "../../components/admin/AllStudentsTable";
import ContactUsTable from "../../components/contact/ContactUsTable";
import CourseFormModal from "../../components/admin/CourseFormModal";
import KitFormModal from "../../components/admin/KitFormModal";
import KitQuestionsModal from "../../components/admin/KitQuestionsModal";
import {
  getAllKits,
  publishKit,
  unpublishKit,
  deleteKit,
} from "../../api/interviewKitService";

// ─── Chart Data ───────────────────────────────────────────────────────────────

const INTERVIEW_KITS = [
  { id: 1, title: "Java Full Stack Interview Kit", topics: 42, level: "Intermediate", downloads: 128, color: "#f59e0b", tag: "Popular" },
  { id: 2, title: "Python Data Science Kit", topics: 35, level: "Advanced", downloads: 94, color: "#00A86B", tag: "New" },
  { id: 3, title: "System Design Fundamentals", topics: 28, level: "Advanced", downloads: 76, color: "#0B2545", tag: "" },
  { id: 4, title: "DSA Crash Course Kit", topics: 60, level: "Beginner", downloads: 212, color: "#f472b6", tag: "Hot" },
  { id: 5, title: "DevOps & CI/CD Kit", topics: 22, level: "Intermediate", downloads: 55, color: "#60a5fa", tag: "" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Avatar({ name, size = 36 }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const hue = name.charCodeAt(0) * 13 + name.charCodeAt(name.length - 1) * 7;
  const palettes = [
    ["#0B2545", "#e8edf5"],
    ["#00A86B", "#e6f7f1"],
    ["#f59e0b", "#fef3c7"],
    ["#f472b6", "#fce7f3"],
    ["#60a5fa", "#dbeafe"],
    ["#818cf8", "#ede9fe"],
  ];
  const [fg, bg] = palettes[hue % palettes.length];
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold select-none flex-shrink-0"
      style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    Active: { text: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
    PUBLISHED: { text: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
    Success: { text: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
    Pending: { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
    Failed: { text: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
    Refunded: { text: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
    Disabled: { text: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
  };
  const s = map[status] || { text: "text-slate-500", bg: "bg-slate-100", border: "border-slate-200" };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.text} ${s.bg} ${s.border}`}>
      {status}
    </span>
  );
}

function ActionBtn({ label, color = "#00A86B", onClick, to }) {
  const cls =
    "text-xs px-2.5 py-1 rounded-lg font-semibold transition-all duration-150 hover:opacity-80 active:scale-95 inline-flex items-center gap-1";
  const style = { color, background: color + "15", border: `1px solid ${color}30` };
  if (to) {
    return (
      <Link to={to} className={cls} style={style}>
        {label}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={cls} style={style}>
      {label}
    </button>
  );
}

function IconActionBtn({ icon: Icon, color = "#00A86B", onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 hover:opacity-80 active:scale-95"
      style={{ color, background: color + "15", border: `1px solid ${color}30` }}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

function SectionHeader({ title, count, action, onAction }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-[#0B2545]">{title}</h2>
        {count !== undefined && (
          <span className="px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-slate-100 text-slate-500">
            {count}
          </span>
        )}
      </div>
      {action && (
        <button
          onClick={onAction}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-[#00A86B] hover:bg-[#008f5a] text-white shadow-md transition-all duration-150 active:scale-95"
        >
          <Plus className="w-4 h-4" /> {action}
        </button>
      )}
    </div>
  );
}

function TableWrapper({ children }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-100">
      {children}
    </th>
  );
}

function Td({ children, mono }) {
  return (
    <td className={`px-4 py-3.5 border-b border-slate-50 text-slate-600 ${mono ? "font-mono text-xs" : ""}`}>
      {children}
    </td>
  );
}

// ─── Chart Tooltips ───────────────────────────────────────────────────────────

const TooltipRevenue = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs font-mono bg-white border border-slate-200 shadow-lg">
      <div className="text-slate-500">{label}</div>
      <div className="text-[#00A86B] font-bold">₹{payload[0].value}</div>
    </div>
  );
};

const TooltipBar = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs font-mono bg-white border border-slate-200 shadow-lg">
      <div className="text-slate-500 mb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

// ─── Overview Section ─────────────────────────────────────────────────────────

function OverviewSection({ stats, courses, kits }) {
  const totalRevenue = stats?.totalRevenue || 0;
  const revenueLine = (stats?.monthlyRevenue || []).map((r) => ({
    month: r.month,
    revenue: Number(r.revenue) || 0,
  }));
  const courseData = stats?.monthlyCourseEnrollments || stats?.monthlyEnrollments || [];
  const kitData = stats?.monthlyKitEnrollments || [];
  const totalCourseEnrollments = courseData.reduce((s, r) => s + r.count, 0);
  const totalKitEnrollments = kitData.reduce((s, r) => s + r.count, 0);

  const allMonths = [...new Set([
    ...courseData.map((r) => r.month),
    ...kitData.map((r) => r.month),
  ])];
  const courseMap = new Map(courseData.map((r) => [r.month, r.count]));
  const kitMap = new Map(kitData.map((r) => [r.month, r.count]));
  const mergedData = allMonths.map((month) => ({
    month,
    Courses: courseMap.get(month) || 0,
    Kits: kitMap.get(month) || 0,
  }));

  const publishedCourses = courses.filter((c) => c.status === "PUBLISHED").length;
  const draftCourses = courses.filter((c) => c.status !== "PUBLISHED").length;
  const publishedKits = kits.filter((k) => k.status === "PUBLISHED").length;
  const draftKits = kits.filter((k) => k.status !== "PUBLISHED").length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#0B2545] mb-1">Super Admin Dashboard</h1>
        <p className="text-sm text-slate-500">Platform overview, staff and course management</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="rounded-2xl p-4 flex flex-col gap-2 transition-transform duration-200 hover:-translate-y-0.5 bg-white border border-slate-100 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Users</span>
          <span className="text-4xl font-extrabold text-[#0B2545]">{stats?.totalUsers || 0}</span>
        </div>

        {/* Total Students */}
        <div className="rounded-2xl p-4 flex flex-col gap-2 transition-transform duration-200 hover:-translate-y-0.5 bg-white border border-slate-100 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Students</span>
          <span className="text-4xl font-extrabold text-[#00A86B]">{stats?.totalStudents || 0}</span>
        </div>

        {/* Total Staff */}
        <div className="rounded-2xl p-4 flex flex-col gap-2 transition-transform duration-200 hover:-translate-y-0.5 bg-white border border-slate-100 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Staff</span>
          <span className="text-4xl font-extrabold text-[#f59e0b]">{stats?.totalStaff || 0}</span>
        </div>

        {/* Super Admins */}
        <div className="rounded-2xl p-4 flex flex-col gap-2 transition-transform duration-200 hover:-translate-y-0.5 bg-white border border-slate-100 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Super Admins</span>
          <span className="text-4xl font-extrabold text-[#f472b6]">{stats?.totalSuperAdmins || 0}</span>
        </div>

        {/* Total Courses with Published/Draft */}
        <div className="rounded-2xl p-4 flex flex-col gap-2 transition-transform duration-200 hover:-translate-y-0.5 bg-white border border-slate-100 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Courses</span>
          <span className="text-4xl font-extrabold text-[#0B2545]">{courses.length}</span>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              {publishedCourses} Published
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
              {draftCourses} Draft
            </span>
          </div>
        </div>

        {/* Total Interview Kits with Published/Draft */}
        <div className="rounded-2xl p-4 flex flex-col gap-2 transition-transform duration-200 hover:-translate-y-0.5 bg-white border border-slate-100 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Interview Kits</span>
          <span className="text-4xl font-extrabold text-[#f59e0b]">{kits.length}</span>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              {publishedKits} Published
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
              {draftKits} Draft
            </span>
          </div>
        </div>

        {/* Free Courses */}
        <div className="rounded-2xl p-4 flex flex-col gap-2 transition-transform duration-200 hover:-translate-y-0.5 bg-white border border-slate-100 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Free Courses</span>
          <span className="text-4xl font-extrabold text-[#818cf8]">{courses.filter((c) => !c.price || c.price === 0).length}</span>
        </div>

        {/* Free Kits */}
        <div className="rounded-2xl p-4 flex flex-col gap-2 transition-transform duration-200 hover:-translate-y-0.5 bg-white border border-slate-100 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Free Kits</span>
          <span className="text-4xl font-extrabold text-[#818cf8]">{kits.filter((k) => !k.price || k.price === 0).length}</span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue area chart */}
        <div className="rounded-2xl p-5 bg-white border border-slate-100 shadow-sm">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">Total Revenue</div>
              <div className="text-3xl font-extrabold text-[#00A86B]">₹{totalRevenue.toLocaleString()}</div>
              <div className="text-xs text-green-600 mt-0.5">+28% vs last period</div>
            </div>
            <span className="text-xs font-mono px-2 py-1 rounded-lg bg-green-50 text-[#00A86B]">Live Revenue</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={revenueLine} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00A86B" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00A86B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TooltipRevenue />} cursor={{ stroke: "#00A86B33", strokeWidth: 1 }} />
              <Area type="monotone" dataKey="revenue" stroke="#00A86B" strokeWidth={2.5} fill="url(#revGrad)"
                dot={{ fill: "#00A86B", r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: "#00A86B" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Enrollments bar chart */}
        <div className="rounded-2xl p-5 bg-white border border-slate-100 shadow-sm">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">Course Enrollments</div>
              <div className="text-3xl font-extrabold text-[#0B2545]">{totalCourseEnrollments}</div>
              <div className="text-xs text-slate-400 mt-0.5">Across all courses</div>
            </div>
            <div className="flex flex-col items-end gap-1 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#0B2545]">
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#0B2545]" /> Courses
              </span>
              <span className="flex items-center gap-1.5 text-[#f59e0b]">
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#f59e0b]" /> Kits
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={mergedData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TooltipBar />} cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="Courses" fill="#0B2545" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Kits" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: "👥", label: "Avg. per Course", value: `${courses.length ? (totalCourseEnrollments / courses.length).toFixed(1) : 0} students`, color: "#0B2545" },
          { icon: "📦", label: "Kit Enrollments", value: `${totalKitEnrollments}`, color: "#f59e0b" },
          { icon: "💰", label: "Avg. Revenue / Mo", value: `₹${Math.round(totalRevenue / (revenueLine.length || 1)).toLocaleString("en-IN")}`, color: "#00A86B" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-4 flex items-center gap-4 bg-white border border-slate-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-50">
              <span className="text-lg">{s.icon}</span>
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400">{s.label}</div>
              <div className="text-xl font-extrabold text-[#0B2545]">{s.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Staff Section ────────────────────────────────────────────────────────────

function StaffSection({ staff, onAdd, onEdit, onToggle, onResend, onDelete, onResetPassword }) {
  return (
    <div>
      <SectionHeader title="Staff Members" count={staff.length} action="Add Staff" onAction={onAdd} />
      {staff.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 mb-4">No staff members yet</p>
          <button onClick={onAdd} className="inline-flex items-center gap-2 text-[#00A86B] font-semibold hover:underline">
            <Plus className="w-4 h-4" /> Add your first staff member
          </button>
        </div>
      ) : (
        <TableWrapper>
          <thead>
            <tr>
              <Th>Staff</Th>
              <Th>Designation</Th>
              <Th>Department</Th>
              <Th>Staff Code</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.userId} className="hover:bg-slate-50 transition-colors">
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar name={`${s.firstName} ${s.lastName || ""}`} />
                    <div>
                      <div className="font-semibold text-[#0B2545] text-sm">
                        {s.firstName} {s.lastName || ""}
                      </div>
                      <div className="text-xs text-slate-400">{s.email}</div>
                    </div>
                  </div>
                </Td>
                <Td>{s.designation || "-"}</Td>
                <Td>{s.department || "-"}</Td>
                <Td mono>{s.staffCode || "-"}</Td>
                <Td>
                  <StatusBadge status={s.enabled ? "Active" : "Disabled"} />
                </Td>
                <Td>
                  <div className="flex gap-1.5 flex-wrap">
                    <button onClick={() => onEdit(s)} title="Edit" className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 hover:opacity-80 active:scale-95" style={{ color: "#0B2545", background: "#0B254515", border: "1px solid #0B254530" }}>
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => onResend(s)} title="Send Setup Link" className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 hover:opacity-80 active:scale-95" style={{ color: "#00A86B", background: "#00A86B15", border: "1px solid #00A86B30" }}>
                      <Send className="w-4 h-4" />
                    </button>
                    <button onClick={() => onResetPassword(s)} title="Reset Password" className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 hover:opacity-80 active:scale-95" style={{ color: "#f59e0b", background: "#f59e0b15", border: "1px solid #f59e0b30" }}>
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button onClick={() => onToggle(s)} title={s.enabled ? "Disable" : "Enable"} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 hover:opacity-80 active:scale-95" style={{ color: s.enabled ? "#f59e0b" : "#00A86B", background: s.enabled ? "#f59e0b15" : "#00A86B15", border: s.enabled ? "1px solid #f59e0b30" : "1px solid #00A86B30" }}>
                      <Power className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(s)} title="Delete" className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 hover:opacity-80 active:scale-95" style={{ color: "#ef4444", background: "#ef444415", border: "1px solid #ef444430" }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrapper>
      )}
    </div>
  );
}

// ─── Students Section ─────────────────────────────────────────────────────────

function StudentsSection({ isSuperAdmin, onResetPassword }) {
  return (
    <div>
      <div className="mb-2">
        <h1 className="text-2xl font-extrabold text-[#0B2545] mb-1">All Students</h1>
        <p className="text-sm text-slate-500">Manage registered students</p>
      </div>
      <div className="mt-6">
        <AllStudentsTable isSuperAdmin={isSuperAdmin} onResetPassword={onResetPassword} />
      </div>
    </div>
  );
}

// ─── Courses Section ──────────────────────────────────────────────────────────

function CoursesSection({ courses, onPublish, onUnpublish, onDelete, onAdd, onEdit }) {
  return (
    <div>
      <SectionHeader title="All Courses" count={courses.length} action="Add Course" onAction={onAdd} />
      {courses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 mb-4">No courses yet</p>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 text-[#00A86B] font-semibold hover:underline"
          >
            <Plus className="w-4 h-4" /> Create your first course
          </button>
        </div>
      ) : (
        <TableWrapper>
          <thead>
            <tr>
              <Th>Course</Th>
              <Th>Level</Th>
              <Th>Price</Th>
              <Th>Language</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <Td>
                  <div className="flex items-center gap-3">
                    {c.thumbnailUrl ? (
                      <img src={c.thumbnailUrl} alt={c.title} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-[#0B2545] text-sm">{c.title}</div>
                      <div className="text-xs text-slate-400 font-mono">{c.courseCode}</div>
                    </div>
                  </div>
                </Td>
                <Td>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {c.level || "—"}
                  </span>
                </Td>
                <Td mono>
                  <span className="font-bold text-[#00A86B]">₹{c.price || 0}</span>
                </Td>
                <Td>{c.language || "—"}</Td>
                <Td>
                  <StatusBadge status={c.status || "DRAFT"} />
                </Td>
                <Td>
                  <div className="flex gap-1.5 flex-wrap">
                    <button onClick={() => onEdit(c.id)} title="Edit" className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 hover:opacity-80 active:scale-95" style={{ color: "#0B2545", background: "#0B254515", border: "1px solid #0B254530" }}>
                      <Pencil className="w-4 h-4" />
                    </button>
                    <Link to={`/admin/dashboard/courses/${c.id}/content`} title="Content" className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 hover:opacity-80 active:scale-95" style={{ color: "#60a5fa", background: "#60a5fa15", border: "1px solid #60a5fa30" }}>
                      <FolderOpen className="w-4 h-4" />
                    </Link>
                    {c.status !== "PUBLISHED" ? (
                      <button onClick={() => onPublish(c.id)} title="Publish" className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 hover:opacity-80 active:scale-95" style={{ color: "#00A86B", background: "#00A86B15", border: "1px solid #00A86B30" }}>
                        <Eye className="w-4 h-4" />
                      </button>
                    ) : (
                      <button onClick={() => onUnpublish(c.id)} title="Unpublish" className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 hover:opacity-80 active:scale-95" style={{ color: "#f59e0b", background: "#f59e0b15", border: "1px solid #f59e0b30" }}>
                        <EyeOff className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => onDelete(c.id)} title="Delete" className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 hover:opacity-80 active:scale-95" style={{ color: "#ef4444", background: "#ef444415", border: "1px solid #ef444430" }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrapper>
      )}
    </div>
  );
}

// ─── Contacts Section ─────────────────────────────────────────────────────────

function ContactsSection() {
  const [refreshed, setRefreshed] = useState(false);

  const handleRefresh = () => {
    setRefreshed(true);
    setTimeout(() => setRefreshed(false), 1500);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-[#0B2545]">Contact Requests</h2>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150 hover:opacity-90 border border-slate-200 bg-white"
          style={{ color: refreshed ? "#00A86B" : "#0B2545" }}
        >
          <RefreshCw className={`w-4 h-4 ${refreshed ? "animate-spin" : ""}`} /> {refreshed ? "Refreshed!" : "Refresh"}
        </button>
      </div>
      <ContactUsTable />
    </div>
  );
}

// ─── Enrollments Section ──────────────────────────────────────────────────────

function EnrollmentsSection({ stats }) {
  const courseData = stats?.monthlyCourseEnrollments || stats?.monthlyEnrollments || [];
  const kitData = stats?.monthlyKitEnrollments || [];
  const totalCourse = courseData.reduce((s, r) => s + r.count, 0);
  const totalKit = kitData.reduce((s, r) => s + r.count, 0);
  const totalCombined = totalCourse + totalKit;
  const thisMonthCourse = courseData.length > 0 ? courseData[courseData.length - 1].count : 0;
  const thisMonthKit = kitData.length > 0 ? kitData[kitData.length - 1].count : 0;
  const thisMonthCombined = thisMonthCourse + thisMonthKit;

  const statCards = [
    { label: "Total Enrollments in Course", value: totalCourse, color: "#0B2545" },
    { label: "Total Enrollments in Interview Kit", value: totalKit, color: "#f59e0b" },
    { label: "Total Enrollments (Kits+Courses)", value: totalCombined, color: "#00A86B" },
    { label: "Total This Month (Kits+Courses)", value: thisMonthCombined, color: "#f472b6" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[#0B2545] mb-1">Enrollments</h1>
        <p className="text-sm text-slate-500">Monthly student enrollment across courses and interview kits</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-2xl p-4 flex flex-col gap-2 bg-white border border-slate-100 shadow-sm">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">{s.label}</span>
            <span className="text-4xl font-extrabold" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Monthly Course Enrollments Graph */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="rounded-2xl p-5 bg-white border border-slate-100 shadow-sm h-full">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-[#0B2545]">Monthly Course Enrollments</h3>
          <span className="flex items-center gap-1.5 text-xs font-mono text-[#0B2545]">
            <span className="w-2.5 h-2.5 rounded-sm inline-block bg-[#0B2545]" /> Courses
          </span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={courseData.map((r) => ({ month: r.month, Courses: r.count }))} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<TooltipBar />} cursor={{ fill: "#f8fafc" }} />
            <Bar dataKey="Courses" fill="#0B2545" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Kit Enrollments Graph */}
      <div className="rounded-2xl p-5 bg-white border border-slate-100 shadow-sm h-full">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-[#0B2545]">Monthly Kit Enrollments</h3>
          <span className="flex items-center gap-1.5 text-xs font-mono text-[#f59e0b]">
            <span className="w-2.5 h-2.5 rounded-sm inline-block bg-[#f59e0b]" /> Kits
          </span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={kitData.map((r) => ({ month: r.month, Kits: r.count }))} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<TooltipBar />} cursor={{ fill: "#f8fafc" }} />
            <Bar dataKey="Kits" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── Payments Section ─────────────────────────────────────────────────────────

function PaymentsSection({ stats }) {
  const transactions = stats?.transactions || [];
  const kitTransactions = stats?.kitTransactions || [];
  const allTransactions = [...transactions.map((t) => ({ ...t, type: t.type || "Course" })), ...kitTransactions.map((t) => ({ ...t, type: "Interview Kit" }))];
  allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  const totalCollected = (Number(stats?.totalRevenue) || 0) + (Number(stats?.kitRevenue) || 0);
  const successCount = allTransactions.filter((t) => t.status === "SUCCESS").length;
  const refundCount = allTransactions.filter((t) => t.status === "REFUNDED").length;
  const pendingCount = allTransactions.filter(
    (t) => t.status !== "SUCCESS" && t.status !== "REFUNDED"
  ).length;
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[#0B2545] mb-1">Payments</h1>
        <p className="text-sm text-slate-500">All transaction history and revenue tracking</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Collected", value: `₹${totalCollected.toLocaleString("en-IN")}`, color: "#00A86B" },
          { label: "Successful", value: String(successCount), color: "#0B2545" },
          { label: "Pending", value: String(pendingCount), color: "#f59e0b" },
          { label: "Unenrolled", value: String(refundCount), color: "#ef4444" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-4 flex flex-col gap-2 bg-white border border-slate-100 shadow-sm">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">{s.label}</span>
            <span className="text-3xl font-extrabold" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>
      <SectionHeader title="Transactions" count={allTransactions.length} />
      <TableWrapper>
        <thead>
          <tr>
            <Th>Txn ID</Th>
            <Th>Student</Th>
            <Th>Type</Th>
            <Th>Item</Th>
            <Th>Amount</Th>
            <Th>Method</Th>
            <Th>Date</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {allTransactions.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-400">
                No transactions yet
              </td>
            </tr>
          ) : (
            allTransactions.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                <Td mono>{t.txnId}</Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <Avatar name={t.studentName} size={28} />
                    <span className="text-sm text-[#0B2545] font-semibold">{t.studentName}</span>
                  </div>
                </Td>
                <Td>
                  <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                    t.type === "Interview Kit"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-blue-50 text-blue-600"
                  }`}>
                    {t.type === "Interview Kit" ? "Kit" : "Course"}
                  </span>
                </Td>
                <Td>{t.courseTitle || t.kitName || "-"}</Td>
                <Td mono>
                  {t.status === "REFUNDED" ? (
                    <span className="font-bold text-red-500">-₹{Math.abs(Number(t.amount)).toLocaleString("en-IN")}</span>
                  ) : (
                    <span className="font-bold text-[#00A86B]">₹{Number(t.amount).toLocaleString("en-IN")}</span>
                  )}
                </Td>
                <Td>
                  <span className="text-xs px-2 py-0.5 rounded font-mono bg-slate-100 text-slate-600">{t.method}</span>
                </Td>
                <Td mono>{t.date ? new Date(t.date).toLocaleDateString("en-IN") : ""}</Td>
                <Td>
                  <StatusBadge status={t.status === "SUCCESS" ? "Success" : "Refunded"} />
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </TableWrapper>
    </div>
  );
}

// ─── Reports Section ──────────────────────────────────────────────────────────

function ReportsSection({ stats, courses, kits }) {
  const totalRevenue = (Number(stats?.totalRevenue) || 0) + (Number(stats?.kitRevenue) || 0);
  const revenueLine = (stats?.monthlyRevenue || []).map((r) => ({
    month: r.month,
    revenue: Number(r.revenue) || 0,
  }));
  const avg = revenueLine.length
    ? Math.round(totalRevenue / revenueLine.length)
    : Math.round(totalRevenue);

  const totalTransactions = (stats?.transactions?.length || 0) + (stats?.kitTransactions?.length || 0);
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[#0B2545] mb-1">Reports</h1>
        <p className="text-sm text-slate-500">Platform performance and analytics summary</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Revenue", value: `₹${Number(totalRevenue).toLocaleString("en-IN")}`, change: "", up: true, icon: "💰" },
          { label: "Active Students", value: String(stats?.activeStudents || 0), change: "", up: true, icon: "🎓" },
          { label: "Published Courses", value: String(stats?.publishedCourses || courses?.filter((c) => c.status === "PUBLISHED").length || 0), change: "", up: true, icon: "📘" },
          { label: "Published Kits", value: String(stats?.publishedKits || kits?.filter((k) => k.status === "PUBLISHED").length || 0), change: "", up: true, icon: "💼" },
          { label: "Total Transactions", value: String(totalTransactions), change: "", up: true, icon: "💳" },
          { label: "Kit Revenue", value: `₹${Number(stats?.kitRevenue || 0).toLocaleString("en-IN")}`, change: "", up: true, icon: "📦" },
        ].map((r) => (
          <div key={r.label} className="rounded-2xl p-5 flex flex-col gap-3 bg-white border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xl">{r.icon}</span>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#0B2545]">{r.value}</div>
              <div className="text-xs font-mono text-slate-400 mt-0.5">{r.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-5 bg-white border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-[#0B2545]">Revenue Trend</h3>
          <span className="text-xs font-mono text-slate-400">Avg. ₹{avg.toLocaleString("en-IN")} / mo</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={revenueLine} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="repGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0B2545" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#0B2545" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<TooltipRevenue />} cursor={{ stroke: "#0B254533" }} />
            <Area type="monotone" dataKey="revenue" stroke="#0B2545" strokeWidth={2.5} fill="url(#repGrad)"
              dot={{ fill: "#0B2545", r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: "#00A86B" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Interview Kits Section ───────────────────────────────────────────────────

function InterviewKitsSection({ kits, onAdd, onEdit, onPublish, onUnpublish, onDelete, onManageQuestions }) {
  return (
    <div>
      <SectionHeader title="Interview Kits" count={kits.length} action="Create Kit" onAction={onAdd} />
      {kits.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 mb-4">No interview kits yet</p>
          <button onClick={onAdd} className="inline-flex items-center gap-2 text-[#00A86B] font-semibold hover:underline">
            <Plus className="w-4 h-4" /> Create your first kit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {kits.map((kit) => (
            <div
              key={kit.id}
              className="rounded-2xl p-5 flex flex-col gap-4 transition-transform duration-200 hover:-translate-y-0.5 bg-white border border-slate-100 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-amber-500" />
                </div>
                <StatusBadge status={kit.status || "DRAFT"} />
              </div>
              <div>
                <div className="font-bold text-[#0B2545] text-sm leading-snug">{kit.name}</div>
                <div className="text-xs font-mono text-slate-400 mt-1">
                  {kit.questionCount || 0} questions · {kit.level}
                </div>
                {kit.enrollmentCount > 0 && (
                  <div className="text-xs text-slate-400 mt-0.5">
                    {kit.enrollmentCount} enrollment{kit.enrollmentCount !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                <span className="text-xs font-mono text-slate-400">
                  {kit.price > 0 ? `₹${kit.price}` : "Free"}
                </span>
                <div className="flex gap-1.5">
                  <button onClick={() => onManageQuestions(kit)} title="Manage Questions" className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 hover:opacity-80 active:scale-95" style={{ color: "#60a5fa", background: "#60a5fa15", border: "1px solid #60a5fa30" }}>
                    <FolderOpen className="w-4 h-4" />
                  </button>
                  <button onClick={() => onEdit(kit)} title="Edit" className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 hover:opacity-80 active:scale-95" style={{ color: "#0B2545", background: "#0B254515", border: "1px solid #0B254530" }}>
                    <Pencil className="w-4 h-4" />
                  </button>
                  {kit.status !== "PUBLISHED" ? (
                    <button onClick={() => onPublish(kit.id)} title="Publish" className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 hover:opacity-80 active:scale-95" style={{ color: "#00A86B", background: "#00A86B15", border: "1px solid #00A86B30" }}>
                      <Eye className="w-4 h-4" />
                    </button>
                  ) : (
                    <button onClick={() => onUnpublish(kit.id)} title="Unpublish" className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 hover:opacity-80 active:scale-95" style={{ color: "#f59e0b", background: "#f59e0b15", border: "1px solid #f59e0b30" }}>
                      <EyeOff className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => onDelete(kit.id)} title="Delete" className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 hover:opacity-80 active:scale-95" style={{ color: "#ef4444", background: "#ef444415", border: "1px solid #ef444430" }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Notifications Section ────────────────────────────────────────────────────

function NotificationsSection({ contactCount }) {
  const [dismissed, setDismissed] = useState([]);

  const notifications = [
    { id: 1, type: "system", title: "Platform Health Check", body: "All systems operational.", time: "20 Aug, 08:00 am", icon: "✅", color: "#00A86B" },
    { id: 2, type: "info", title: "Welcome to Dashboard", body: "Your super admin dashboard is ready.", time: "18 Aug, 10:00 am", icon: "🎉", color: "#0B2545" },
  ].filter((n) => !dismissed.includes(n.id));

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0B2545] mb-1">Notifications</h1>
          <p className="text-sm text-slate-500">
            {contactCount > 0 ? `${contactCount} pending contact requests` : "No new notifications"}
          </p>
        </div>
        <button
          onClick={() => setDismissed(notifications.map((n) => n.id))}
          className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all hover:opacity-80 border border-slate-200 bg-white text-slate-500"
        >
          Dismiss all
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {notifications.length === 0 && (
          <div className="text-center py-16 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="text-4xl">🔔</div>
            <div className="text-[#0B2545] font-bold mt-3">All caught up!</div>
            <div className="text-sm text-slate-400 mt-1">No new notifications</div>
          </div>
        )}
        {notifications.map((n) => (
          <div key={n.id} className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
              style={{ background: n.color + "15" }}
            >
              {n.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-[#0B2545] text-sm">{n.title}</span>
                <span
                  className="text-xs font-mono px-1.5 py-0.5 rounded"
                  style={{ background: n.color + "15", color: n.color }}
                >
                  {n.type}
                </span>
              </div>
              <div className="text-sm text-slate-500 mt-0.5">{n.body}</div>
              <div className="text-xs font-mono text-slate-400 mt-1">{n.time}</div>
            </div>
            <button
              onClick={() => setDismissed((d) => [...d, n.id])}
              className="text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-all hover:opacity-80 bg-slate-50 text-slate-400 border border-slate-100"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────

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
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email";
    if (!form.firstName.trim()) next.firstName = "First name is required";
    if (form.mobileNumber && !/^\d{10}$/.test(form.mobileNumber)) next.mobileNumber = "Enter a valid 10-digit number";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const inputCls =
    "w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:border-[#00A86B] focus:bg-white focus:outline-none transition-all duration-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-lg font-bold text-[#0B2545]">{isEdit ? "Edit Staff" : "Add Staff"}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">First Name *</label>
              <input type="text" value={form.firstName} onChange={set("firstName")} className={`${inputCls} ${errors.firstName ? "border-red-400" : ""}`} placeholder="John" />
              {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Last Name</label>
              <input type="text" value={form.lastName} onChange={set("lastName")} className={inputCls} placeholder="Doe" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Email *</label>
            <input
              type="email" value={form.email} onChange={set("email")} disabled={isEdit}
              className={`${inputCls} ${errors.email ? "border-red-400" : ""} ${isEdit ? "opacity-60 cursor-not-allowed" : ""}`}
              placeholder="john@foliopath.com"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            {isEdit && <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Mobile Number</label>
              <input type="tel" value={form.mobileNumber} onChange={set("mobileNumber")} className={`${inputCls} ${errors.mobileNumber ? "border-red-400" : ""}`} placeholder="9876543210" />
              {errors.mobileNumber && <p className="text-xs text-red-500 mt-1">{errors.mobileNumber}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Designation</label>
              <input type="text" value={form.designation} onChange={set("designation")} className={inputCls} placeholder="Senior Trainer" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Department</label>
              <input type="text" value={form.department} onChange={set("department")} className={inputCls} placeholder="Engineering" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Qualification</label>
              <input type="text" value={form.qualification} onChange={set("qualification")} className={inputCls} placeholder="M.Tech Computer Science" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Specialization</label>
            <input type="text" value={form.specialization} onChange={set("specialization")} className={inputCls} placeholder="Full Stack Development" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100 sticky bottom-0 bg-white rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
          <button
            onClick={() => validate() && onSave(form)} disabled={saving}
            className="px-5 py-2 bg-[#00A86B] hover:bg-[#008f5a] text-white text-sm font-bold rounded-xl shadow-md transition-all duration-200 disabled:opacity-60"
          >
            {saving ? "Saving..." : isEdit ? "Update Staff" : "Create Staff"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordModal({ title, onSave, onClose }) {
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setError("");
    if (!form.newPassword) return setError("New password is required");
    if (form.newPassword.length < 8) return setError("Password must be at least 8 characters");
    if (form.newPassword !== form.confirmPassword) return setError("Passwords do not match");
    setSaving(true);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:border-[#00A86B] focus:bg-white focus:outline-none transition-all duration-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-[#0B2545]">{title}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">New Password *</label>
            <input
              type="password" value={form.newPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))}
              className={inputCls} placeholder="Minimum 8 characters"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Confirm Password *</label>
            <input
              type="password" value={form.confirmPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              className={inputCls} placeholder="Re-enter password"
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
          <button
            onClick={submit} disabled={saving}
            className="px-5 py-2 bg-[#00A86B] hover:bg-[#008f5a] text-white text-sm font-bold rounded-xl shadow-md transition-all duration-200 disabled:opacity-60"
          >
            {saving ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function CombinedDashboard() {
  const { role } = useAuth();
  const isSuperAdmin = role === "SUPER_ADMIN";
  const location = useLocation();

  const active = location.state?.active || "overview";

  const [stats, setStats] = useState(null);
  const [staff, setStaff] = useState([]);
  const [courses, setCourses] = useState([]);
  const [kits, setKits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [resetModal, setResetModal] = useState(null);
  const [courseFormModal, setCourseFormModal] = useState(null);
  const [kitFormModal, setKitFormModal] = useState(null);
  const [kitQuestionsModal, setKitQuestionsModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const errors = [];
    try {
      const { data } = await getAllCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load courses:", err);
      errors.push("Failed to load courses");
    }
    try {
      const { data } = await getAllKits();
      setKits(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load kits:", err);
      errors.push("Failed to load interview kits");
    }
    if (isSuperAdmin) {
      try {
        const { data } = await getSuperAdminDashboard();
        setStats(data);
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
        errors.push("Failed to load stats");
      }
      try {
        const { data } = await getAllStaff();
        setStaff(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load staff:", err);
        errors.push("Failed to load staff");
      }
    }
    if (errors.length > 0) {
      setActionError(`${errors.join(", ")}. Please make sure the backend server is running on port 8081 and you are logged in.`);
    } else {
      setActionError("");
    }
    setLoading(false);
  };

  // ── Staff handlers ──

  const handleSaveStaff = async (form) => {
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
      setActionError(err.response?.data?.message || "Failed to save staff member");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (member) => {
    try {
      const { data } = await updateStaffStatus(member.userId, !member.enabled);
      setStaff((prev) => prev.map((s) => (s.userId === member.userId ? data : s)));
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
    if (!confirm(`Delete staff member "${member.firstName}"? This cannot be undone.`)) return;
    try {
      await deleteStaff(member.userId);
      setStaff((prev) => prev.filter((s) => s.userId !== member.userId));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const handleResetPassword = async ({ newPassword, confirmPassword }) => {
    if (!resetModal) return;
    const { type, user } = resetModal;
    const request =
      type === "staff"
        ? resetStaffPassword(user.userId, { newPassword, confirmPassword })
        : resetStudentPasswordByAdmin(user.userId, { newPassword, confirmPassword });
    const { data } = await request;
    alert(data?.message || "Password reset successfully");
    setResetModal(null);
  };

  // ── Kit handlers ──

  const handlePublishKit = async (kitId) => {
    try {
      await publishKit(kitId);
      const { data } = await getAllKits();
      setKits(data);
    } catch (err) {
      console.error("Failed to publish kit:", err);
    }
  };

  const handleUnpublishKit = async (kitId) => {
    try {
      await unpublishKit(kitId);
      const { data } = await getAllKits();
      setKits(data);
    } catch (err) {
      console.error("Failed to unpublish kit:", err);
    }
  };

  const handleDeleteKit = async (kitId) => {
    if (!confirm("Are you sure you want to delete this interview kit?")) return;
    try {
      await deleteKit(kitId);
      setKits((prev) => prev.filter((k) => k.id !== kitId));
    } catch (err) {
      console.error("Failed to delete kit:", err);
    }
  };

  // ── Course handlers ──

  const handlePublish = async (courseId) => {
    try {
      await publishCourse(courseId);
      const { data } = await getAllCourses();
      setCourses(data);
    } catch (err) {
      console.error("Failed to publish:", err);
    }
  };

  const handleUnpublish = async (courseId) => {
    try {
      await unpublishCourse(courseId);
      const { data } = await getAllCourses();
      setCourses(data);
    } catch (err) {
      console.error("Failed to unpublish:", err);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await deleteCourse(courseId);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  // ── Render section ──

  const renderSection = () => {
    switch (active) {
      case "overview":
        return <OverviewSection stats={stats} courses={courses} kits={kits} />;
      case "staff":
        return (
          <StaffSection
            staff={staff}
            onAdd={() => setModal({ staff: null })}
            onEdit={(s) => setModal({ staff: s })}
            onToggle={handleToggleStatus}
            onResend={handleResendSetupLink}
            onDelete={handleDeleteStaff}
            onResetPassword={(s) => setResetModal({ type: "staff", user: s })}
          />
        );
      case "students":
        return (
          <StudentsSection
            isSuperAdmin={isSuperAdmin}
            onResetPassword={(s) => setResetModal({ type: "student", user: s })}
          />
        );
      case "courses":
        return (
          <CoursesSection
            courses={courses}
            onPublish={handlePublish}
            onUnpublish={handleUnpublish}
            onDelete={handleDeleteCourse}
            onAdd={() => setCourseFormModal({ courseId: null })}
            onEdit={(id) => setCourseFormModal({ courseId: id })}
          />
        );
      case "contacts":
        return <ContactsSection />;
      case "enrollments":
        return <EnrollmentsSection stats={stats} />;
      case "payments":
        return <PaymentsSection stats={stats} />;
      case "reports":
        return <ReportsSection stats={stats} courses={courses} kits={kits} />;
      case "interview":
        return (
          <InterviewKitsSection
            kits={kits}
            onAdd={() => setKitFormModal({ kit: null })}
            onEdit={(k) => setKitFormModal({ kit: k })}
            onPublish={handlePublishKit}
            onUnpublish={handleUnpublishKit}
            onDelete={handleDeleteKit}
            onManageQuestions={(k) => setKitQuestionsModal(k)}
          />
        );
      case "notifications":
        return <NotificationsSection contactCount={0} />;
      default:
        return <OverviewSection stats={stats} courses={courses} kits={kits} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A86B]" />
      </div>
    );
  }

  return (
    <>
      {actionError && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {actionError}
        </div>
      )}
      {renderSection()}

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
          onSave={handleSaveStaff}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}

      {resetModal && (
        <ResetPasswordModal
          title={`Reset Password — ${resetModal.user.firstName || ""} ${resetModal.user.lastName || ""}`.trim()}
          onSave={handleResetPassword}
          onClose={() => setResetModal(null)}
        />
      )}

      {courseFormModal && (
        <CourseFormModal
          courseId={courseFormModal.courseId}
          onClose={() => setCourseFormModal(null)}
          onSaved={() => loadData()}
        />
      )}

      {kitFormModal && (
        <KitFormModal
          kit={kitFormModal.kit}
          onClose={() => setKitFormModal(null)}
          onSaved={() => { setKitFormModal(null); loadData(); }}
        />
      )}

      {kitQuestionsModal && (
        <KitQuestionsModal
          kit={kitQuestionsModal}
          onClose={() => { setKitQuestionsModal(null); loadData(); }}
        />
      )}
    </>
  );
}
