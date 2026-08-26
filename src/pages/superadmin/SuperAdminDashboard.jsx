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

// ─── Chart Data ───────────────────────────────────────────────────────────────

const REVENUE_LINE = [
  { month: "Mar", revenue: 120 },
  { month: "Apr", revenue: 340 },
  { month: "May", revenue: 210 },
  { month: "Jun", revenue: 480 },
  { month: "Jul", revenue: 390 },
  { month: "Aug", revenue: 640 },
];

const PAYMENTS_DATA = [
  { id: "PAY-001", student: "Balakrishna sripathi", course: "Java", amount: "₹399", date: "21 Aug 2026", method: "UPI", status: "Success" },
  { id: "PAY-002", student: "Priya Sharma", course: "Python", amount: "₹2", date: "20 Aug 2026", method: "Card", status: "Success" },
  { id: "PAY-003", student: "Ravi Kumar", course: "Java", amount: "₹399", date: "19 Aug 2026", method: "Net Banking", status: "Pending" },
  { id: "PAY-004", student: "Anita Reddy", course: "Python", amount: "₹2", date: "18 Aug 2026", method: "UPI", status: "Failed" },
];

const INTERVIEW_KITS = [
  { id: 1, title: "Java Full Stack Interview Kit", topics: 42, level: "Intermediate", downloads: 128, color: "#f59e0b", tag: "Popular" },
  { id: 2, title: "Python Data Science Kit", topics: 35, level: "Advanced", downloads: 94, color: "#00A86B", tag: "New" },
  { id: 3, title: "System Design Fundamentals", topics: 28, level: "Advanced", downloads: 76, color: "#0B2545", tag: "" },
  { id: 4, title: "DSA Crash Course Kit", topics: 60, level: "Beginner", downloads: 212, color: "#f472b6", tag: "Hot" },
  { id: 5, title: "DevOps & CI/CD Kit", topics: 22, level: "Intermediate", downloads: 55, color: "#60a5fa", tag: "" },
];

const REPORTS_DATA = [
  { label: "Total Revenue", value: "₹2,180", change: "+28%", up: true, icon: "💰" },
  { label: "Active Students", value: "1", change: "+0%", up: true, icon: "🎓" },
  { label: "Course Completion Rate", value: "68%", change: "+12%", up: true, icon: "📊" },
  { label: "Avg. Session Duration", value: "42 min", change: "-3%", up: false, icon: "⏱️" },
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

function OverviewSection({ stats, courses }) {
  const totalRevenue = REVENUE_LINE.reduce((s, r) => s + r.revenue, 0);
  const enrollmentsData = stats?.monthlyEnrollments || [];
  const totalEnrollments = enrollmentsData.reduce((s, r) => s + r.count, 0);

  const STAT_CARDS = [
    { label: "Total Users", value: stats?.totalUsers || 0, color: "#0B2545", bg: "bg-blue-50" },
    { label: "Total Students", value: stats?.totalStudents || 0, color: "#00A86B", bg: "bg-green-50" },
    { label: "Total Staff", value: stats?.totalStaff || 0, color: "#f59e0b", bg: "bg-amber-50" },
    { label: "Super Admins", value: stats?.totalSuperAdmins || 0, color: "#f472b6", bg: "bg-pink-50" },
    { label: "Total Courses", value: courses.length, color: "#0B2545", bg: "bg-slate-100" },
    { label: "Published", value: courses.filter((c) => c.status === "PUBLISHED").length, color: "#00A86B", bg: "bg-green-50" },
    { label: "Drafts", value: courses.filter((c) => c.status !== "PUBLISHED").length, color: "#94a3b8", bg: "bg-slate-50" },
    { label: "Free Courses", value: courses.filter((c) => !c.price || c.price === 0).length, color: "#818cf8", bg: "bg-indigo-50" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#0B2545] mb-1">Super Admin Dashboard</h1>
        <p className="text-sm text-slate-500">Platform overview, staff and course management</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-4 flex flex-col gap-2 transition-transform duration-200 hover:-translate-y-0.5 bg-white border border-slate-100 shadow-sm"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{s.label}</span>
            <span className="text-4xl font-extrabold" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
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
            <span className="text-xs font-mono px-2 py-1 rounded-lg bg-green-50 text-[#00A86B]">Mar – Aug 2026</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={REVENUE_LINE} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
              <div className="text-3xl font-extrabold text-[#0B2545]">{totalEnrollments}</div>
              <div className="text-xs text-slate-400 mt-0.5">Across all courses</div>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#0B2545]">
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#0B2545]" /> Enroll It All
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={enrollmentsData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TooltipBar />} cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="count" fill="#0B2545" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: "👥", label: "Avg. per Course", value: `${courses.length ? (totalEnrollments / courses.length).toFixed(1) : 0} students`, color: "#0B2545" },
          { icon: "💰", label: "Avg. Revenue / Mo", value: `₹${Math.round(totalRevenue / REVENUE_LINE.length)}`, color: "#00A86B" },
          { icon: "📈", label: "Peak Month", value: "Aug 2026", color: "#f59e0b" },
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
  const enrollmentsData = stats?.monthlyEnrollments || [];
  const total = enrollmentsData.reduce((s, r) => s + r.count, 0);
  const statCards = [
    { label: "Total Enrollments", value: total, color: "#0B2545" },
    { label: "This Month", value: enrollmentsData.length > 0 ? enrollmentsData[enrollmentsData.length - 1].count : 0, color: "#60a5fa" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[#0B2545] mb-1">Enrollments</h1>
        <p className="text-sm text-slate-500">Monthly student enrollment across all courses</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-2xl p-4 flex flex-col gap-2 bg-white border border-slate-100 shadow-sm">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">{s.label}</span>
            <span className="text-4xl font-extrabold" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-5 bg-white border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-[#0B2545]">Monthly Breakdown</h3>
          <div className="flex gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-[#0B2545]">
              <span className="w-2.5 h-2.5 rounded-sm inline-block bg-[#0B2545]" /> Enroll It All
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={enrollmentsData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<TooltipBar />} cursor={{ fill: "#f8fafc" }} />
            <Bar dataKey="count" fill="#0B2545" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Payments Section ─────────────────────────────────────────────────────────

function PaymentsSection() {
  const totalAmt = PAYMENTS_DATA.filter((p) => p.status === "Success").reduce((s, p) => s + parseInt(p.amount.replace("₹", "")), 0);
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[#0B2545] mb-1">Payments</h1>
        <p className="text-sm text-slate-500">All transaction history and revenue tracking</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Collected", value: `₹${totalAmt}`, color: "#00A86B" },
          { label: "Successful", value: String(PAYMENTS_DATA.filter((p) => p.status === "Success").length), color: "#0B2545" },
          { label: "Pending", value: String(PAYMENTS_DATA.filter((p) => p.status === "Pending").length), color: "#f59e0b" },
          { label: "Failed", value: String(PAYMENTS_DATA.filter((p) => p.status === "Failed").length), color: "#ef4444" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-4 flex flex-col gap-2 bg-white border border-slate-100 shadow-sm">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">{s.label}</span>
            <span className="text-3xl font-extrabold" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>
      <SectionHeader title="Transactions" count={PAYMENTS_DATA.length} />
      <TableWrapper>
        <thead>
          <tr>
            <Th>Txn ID</Th>
            <Th>Student</Th>
            <Th>Course</Th>
            <Th>Amount</Th>
            <Th>Method</Th>
            <Th>Date</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {PAYMENTS_DATA.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
              <Td mono>{p.id}</Td>
              <Td>
                <div className="flex items-center gap-2">
                  <Avatar name={p.student} size={28} />
                  <span className="text-sm text-[#0B2545] font-semibold">{p.student}</span>
                </div>
              </Td>
              <Td>{p.course}</Td>
              <Td mono>
                <span className="font-bold text-[#00A86B]">{p.amount}</span>
              </Td>
              <Td>
                <span className="text-xs px-2 py-0.5 rounded font-mono bg-slate-100 text-slate-600">{p.method}</span>
              </Td>
              <Td mono>{p.date}</Td>
              <Td>
                <StatusBadge status={p.status} />
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrapper>
    </div>
  );
}

// ─── Reports Section ──────────────────────────────────────────────────────────

function ReportsSection() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[#0B2545] mb-1">Reports</h1>
        <p className="text-sm text-slate-500">Platform performance and analytics summary</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {REPORTS_DATA.map((r) => (
          <div key={r.label} className="rounded-2xl p-5 flex flex-col gap-3 bg-white border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xl">{r.icon}</span>
              <span
                className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                  r.up ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                }`}
              >
                {r.change}
              </span>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#0B2545]">{r.value}</div>
              <div className="text-xs font-mono text-slate-400 mt-0.5">{r.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-5 bg-white border border-slate-100 shadow-sm">
        <h3 className="font-bold text-[#0B2545] mb-5">Revenue Trend (Mar – Aug 2026)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={REVENUE_LINE} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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

function InterviewKitsSection() {
  return (
    <div>
      <SectionHeader title="Interview Kits" count={INTERVIEW_KITS.length} action="Create Kit" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {INTERVIEW_KITS.map((kit) => (
          <div
            key={kit.id}
            className="rounded-2xl p-5 flex flex-col gap-4 transition-transform duration-200 hover:-translate-y-0.5 bg-white border border-slate-100 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-lg flex-shrink-0"
                style={{ background: kit.color + "15", color: kit.color }}
              >
                📋
              </div>
              {kit.tag && (
                <span
                  className="text-xs font-mono font-bold px-2 py-0.5 rounded-full"
                  style={{ background: kit.color + "15", color: kit.color }}
                >
                  {kit.tag}
                </span>
              )}
            </div>
            <div>
              <div className="font-bold text-[#0B2545] text-sm leading-snug">{kit.title}</div>
              <div className="text-xs font-mono text-slate-400 mt-1">
                {kit.topics} topics · {kit.level}
              </div>
            </div>
            <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
              <span className="text-xs font-mono text-slate-400">↓ {kit.downloads} downloads</span>
              <div className="flex gap-1.5">
                <ActionBtn label="Edit" color="#0B2545" />
                <ActionBtn label="View" color={kit.color} />
              </div>
            </div>
          </div>
        ))}
      </div>
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
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [resetModal, setResetModal] = useState(null);
  const [courseFormModal, setCourseFormModal] = useState(null);
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
        return <OverviewSection stats={stats} courses={courses} />;
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
        return <PaymentsSection />;
      case "reports":
        return <ReportsSection />;
      case "interview":
        return <InterviewKitsSection />;
      case "notifications":
        return <NotificationsSection contactCount={0} />;
      default:
        return <OverviewSection stats={stats} courses={courses} />;
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
    </>
  );
}
