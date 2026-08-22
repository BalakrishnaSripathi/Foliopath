import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Menu, X, LogOut, User, LayoutDashboard, BookOpen } from "lucide-react";
import Logo from "../common/Logo";
import { useAuth } from "../../context/AuthContext";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Courses", href: "/courses" },
  { label: "About Us", href: "#about" },
  { label: "Instructors", href: "#instructors" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, role, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        <div data-aos="fade-right" data-aos-duration="500">
          <Logo />
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          {navLinks.map((link, idx) => (
            <Link
              key={link.label}
              to={link.href.startsWith("/") ? link.href : link.href}
              data-aos="fade-down"
              data-aos-duration="400"
              data-aos-delay={idx * 60}
              className={`hover:text-[#0B2545] transition-colors duration-200 ${
                link.label === "Home"
                  ? "text-[#00A86B] font-semibold"
                  : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search & Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="relative" data-aos="fade-down" data-aos-duration="400" data-aos-delay="300">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Link to="/courses">
              <input
                type="text"
                placeholder="Search courses..."
                className="pl-9 pr-4 py-2 text-sm bg-slate-100 rounded-full border border-transparent focus:border-[#00A86B] focus:bg-white focus:outline-none transition-all duration-200 w-48 focus:w-64 cursor-pointer"
                readOnly
              />
            </Link>
          </div>

          {isAuthenticated ? (
            <>
              {role === "SUPER_ADMIN" && (
                <Link
                  to="/super-admin/dashboard"
                  data-aos="fade-down"
                  data-aos-duration="400"
                  data-aos-delay="320"
                  className="flex items-center gap-2 text-sm font-semibold text-[#0B2545] hover:text-[#00A86B] px-3 py-2 transition-colors duration-200"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              )}
              {role === "STAFF" && (
                <Link
                  to="/staff/dashboard"
                  data-aos="fade-down"
                  data-aos-duration="400"
                  data-aos-delay="320"
                  className="flex items-center gap-2 text-sm font-semibold text-[#0B2545] hover:text-[#00A86B] px-3 py-2 transition-colors duration-200"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              )}
              {role === "STUDENT" && (
                <>
                  <Link
                    to="/my-courses"
                    data-aos="fade-down"
                    data-aos-duration="400"
                    data-aos-delay="320"
                    className="flex items-center gap-2 text-sm font-semibold text-[#0B2545] hover:text-[#00A86B] px-3 py-2 transition-colors duration-200"
                  >
                    <BookOpen className="w-4 h-4" />
                    My Courses
                  </Link>
                  <Link
                    to="/my-profile"
                    data-aos="fade-down"
                    data-aos-duration="400"
                    data-aos-delay="330"
                    className="flex items-center gap-2 text-sm font-semibold text-[#0B2545] hover:text-[#00A86B] px-3 py-2 transition-colors duration-200"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                </>
              )}
              <div
                data-aos="fade-down"
                data-aos-duration="400"
                data-aos-delay="350"
                className="flex items-center gap-2 text-sm font-semibold text-[#0B2545]"
              >
                <User className="w-4 h-4" />
                <span className="capitalize">{role?.toLowerCase()}</span>
              </div>
              <button
                onClick={handleLogout}
                data-aos="fade-down"
                data-aos-duration="400"
                data-aos-delay="400"
                className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-red-500 px-4 py-2 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                data-aos="fade-down"
                data-aos-duration="400"
                data-aos-delay="350"
                className="text-sm font-semibold text-[#0B2545] hover:text-[#00A86B] px-4 py-2 transition-colors duration-200"
              >
                Log In
              </Link>
              <Link
                to="/register"
                data-aos="fade-down"
                data-aos-duration="400"
                data-aos-delay="400"
                className="text-sm font-semibold text-white bg-[#00A86B] hover:bg-[#008f5a] px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97]"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-slate-600 hover:text-[#0B2545] transition-colors duration-200"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href.startsWith("/") ? link.href : link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block text-base font-medium transition-colors duration-200 ${
                link.label === "Home" ? "text-[#00A86B]" : "text-slate-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                {(role === "SUPER_ADMIN" || role === "STAFF") && (
                  <Link
                    to={role === "SUPER_ADMIN" ? "/super-admin/dashboard" : "/staff/dashboard"}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 font-semibold text-[#0B2545] py-2 border border-slate-200 rounded-lg transition-colors duration-200 hover:border-[#00A86B] hover:text-[#00A86B]"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}
                {role === "STUDENT" && (
                  <>
                    <Link
                      to="/my-courses"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 font-semibold text-[#0B2545] py-2 border border-slate-200 rounded-lg transition-colors duration-200 hover:border-[#00A86B] hover:text-[#00A86B]"
                    >
                      <BookOpen className="w-4 h-4" />
                      My Courses
                    </Link>
                    <Link
                      to="/my-profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 font-semibold text-[#0B2545] py-2 border border-slate-200 rounded-lg transition-colors duration-200 hover:border-[#00A86B] hover:text-[#00A86B]"
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-center font-semibold text-red-500 py-2 border border-red-200 rounded-lg transition-colors duration-200 hover:bg-red-50"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center font-semibold text-[#0B2545] py-2 border border-slate-200 rounded-lg transition-colors duration-200 hover:border-[#00A86B] hover:text-[#00A86B]"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center font-semibold text-white bg-[#00A86B] py-2 rounded-lg transition-all duration-200 hover:bg-[#008f5a]"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
