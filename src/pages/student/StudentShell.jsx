import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  BookOpen,
  Briefcase,
  BarChart3,
  Award,
  CreditCard,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { icon: Home, label: "Dashboard", path: "/StudentDashboard" },
  { icon: BookOpen, label: "My Courses", path: "/StudentDashboard/my-courses" },
  { icon: Briefcase, label: "Interview Kits", path: "/StudentDashboard/interview-kits" },
  { icon: BarChart3, label: "My Progress", path: "/StudentDashboard/progress" },
  { icon: Award, label: "Certificates", path: "/StudentDashboard/certificates" },
  { icon: CreditCard, label: "Payments", path: "/StudentDashboard/payments" },
  { icon: Bell, label: "Notifications", path: "/StudentDashboard/notifications", badge: 0 },
  { icon: Settings, label: "My Profile", path: "/StudentDashboard/settings" },
];

export default function StudentShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const firstName = user?.firstName || "Student";

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 lg:hidden bg-black/40" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full z-30 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto w-56 bg-[#0f172a] text-white shrink-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00A86B] flex items-center justify-center text-white font-bold text-sm">F</div>
            <div>
              <p className="font-bold text-sm leading-tight text-white">Foliopath 360</p>
              <p className="text-[10px] text-slate-400 leading-tight">Learning Management System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
          {NAV_ITEMS.map(({ icon: Icon, label, path, badge }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/StudentDashboard"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                  isActive ? "bg-[#00A86B] text-white font-medium" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={16} />
              <span>{label}</span>
              {badge > 0 && (
                <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{badge}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-white/5 hover:text-white transition-all">
            <HelpCircle size={16} /> Help & Support
          </button>
          <button onClick={() => { logout(); navigate("/login"); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-white/5 hover:text-rose-400 transition-all">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-700 transition-colors">
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <button className="relative w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
              <Bell size={17} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border border-white" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00A86B] to-[#0B2545] flex items-center justify-center text-white text-xs font-bold">
                {firstName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-700 hidden sm:block">{firstName}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
