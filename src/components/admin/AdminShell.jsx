import { useState, useRef, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Mail,
  Bell,
  BarChart3,
  CreditCard,
  Briefcase,
  Menu,
  Power,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV_GROUPS = [
  {
    label: "Main",
    items: [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "enrollments", label: "Enrollments", icon: Users },
      { id: "payments", label: "Payments", icon: CreditCard },
      { id: "reports", label: "Reports", icon: BarChart3 },
    ],
  },
  {
    label: "Management",
    items: [
      { id: "staff", label: "Staff Members", icon: Users },
      { id: "students", label: "All Students", icon: GraduationCap },
      { id: "courses", label: "All Courses", icon: BookOpen },
      { id: "interview", label: "Interview Kits", icon: Briefcase },
    ],
  },
  {
    label: "Communication",
    items: [
      { id: "contacts", label: "Contact Requests", icon: Mail },
      { id: "notifications", label: "Notifications", icon: Bell },
    ],
  },
];

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

export default function AdminShell() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const onDashboard = location.pathname === "/admin/dashboard" || location.pathname === "/super-admin/dashboard";
  const active = location.state?.active || "overview";
  const activeLabel = NAV_GROUPS.flatMap((g) => g.items).find((i) => i.id === active)?.label ?? "Dashboard";

  useEffect(() => {
    function handler(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNav = (id) => {
    navigate("/admin/dashboard", { state: { active: id } });
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden bg-black/40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-30 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto w-60 bg-white border-r border-slate-100 shadow-sm ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-sm bg-[#00A86B] text-white">
            F
          </div>
          <div>
            <div className="text-sm font-extrabold text-[#0B2545]">Foliopath</div>
            <div className="text-xs text-slate-400">Super Admin</div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 flex flex-col gap-4 overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="text-xs font-semibold uppercase tracking-wider px-2 mb-1.5 text-slate-400">
                {group.label}
              </div>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const isActive = onDashboard && active === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-left w-full transition-all duration-150 ${
                        isActive
                          ? "bg-[#00A86B]/10 text-[#00A86B] border border-[#00A86B]/20"
                          : "text-slate-500 hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <item.icon className="w-[18px] h-[18px]" />
                      <span className="flex-1">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <Avatar name="Super Admin" size={32} />
            <div>
              <div className="text-xs font-bold text-[#0B2545]">Super Admin</div>
              <div className="text-xs text-slate-400">admin@foliopath.com</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="flex items-center justify-between px-5 py-3.5 sticky top-0 z-10 bg-white/80 border-b border-slate-100"
          style={{ backdropFilter: "blur(8px)" }}
        >
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-xl text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="text-base font-bold text-[#0B2545]">{activeLabel}</div>
              <div className="text-xs text-slate-400 hidden sm:block">
                {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <Avatar name="Super Admin" size={34} />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-12 w-48 rounded-2xl shadow-xl z-50 bg-white border border-slate-100 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="text-sm font-bold text-[#0B2545]">Super Admin</div>
                    <div className="text-xs text-slate-400">admin@foliopath.com</div>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => { setProfileOpen(false); }}
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                    >
                      <Users className="w-4 h-4 text-slate-400" />
                      Profile
                    </button>
                    <button
                      onClick={() => { setProfileOpen(false); logout(); }}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
                    >
                      <Power className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-7 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
