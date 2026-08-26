import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, Menu, X, LogOut, User, LayoutDashboard, BookOpen, ShoppingCart, ChevronDown } from "lucide-react";
import Logo from "../common/Logo";
import { useAuth } from "../../context/AuthContext";
import ContactUsMain from "../contact/ContactUsMain";
import CartDrawer from "../cart/CartDrawer";
import { getCart } from "../../api/cartService";

const contactLink = { label: "Contact", href: "#contact" };

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "About Us", href: "#about" },
  // { label: "Instructors", href: "#instructors" },
  contactLink,
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { isAuthenticated, role, logout, user } = useAuth();

  const refreshCartCount = useCallback(() => {
    if (!isAuthenticated || role !== "STUDENT") return;
    getCart()
      .then(({ data }) => setCartCount(data?.itemCount ?? data?.items?.length ?? 0))
      .catch(() => setCartCount(0));
  }, [isAuthenticated, role]);

  useEffect(() => {
    refreshCartCount();
    window.addEventListener("cart:updated", refreshCartCount);
    return () => window.removeEventListener("cart:updated", refreshCartCount);
  }, [refreshCartCount]);

  // Open the cart drawer when an item is added
  useEffect(() => {
    if (!isAuthenticated || role !== "STUDENT") return;
    const openDrawer = () => {
      setMobileMenuOpen(false);
      setCartOpen(true);
    };
    window.addEventListener("cart:open", openDrawer);
    return () => window.removeEventListener("cart:open", openDrawer);
  }, [isAuthenticated, role]);

  const openContact = () => {
    setMobileMenuOpen(false);
    setContactOpen(true);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    if (profileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [profileDropdownOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        <div data-aos="fade-right" data-aos-duration="500">
          <Logo />
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          {navLinks.map((link, idx) =>
            link.label === "Contact" ? (
              <button
                key={link.label}
                type="button"
                onClick={openContact}
                data-aos="fade-down"
                data-aos-duration="400"
                data-aos-delay={idx * 60}
                className="hover:text-[#0B2545] transition-colors duration-200"
              >
                {link.label}
              </button>
            ) : (
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
            )
          )}
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
                  <button
                    type="button"
                    onClick={() => setCartOpen(true)}
                    data-aos="fade-down"
                    data-aos-duration="400"
                    data-aos-delay="315"
                    className="relative flex items-center gap-2 text-sm font-semibold text-[#0B2545] hover:text-[#00A86B] px-3 py-2 transition-colors duration-200"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Cart
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[#00A86B] text-white text-[10px] font-bold">
                        {cartCount}
                      </span>
                    )}
                  </button>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      data-aos="fade-down"
                      data-aos-duration="400"
                      data-aos-delay="320"
                      className="flex items-center gap-1.5 text-sm font-semibold text-[#0B2545] hover:text-[#00A86B] px-3 py-2 transition-colors duration-200"
                    >
                      <User className="w-4 h-4" />
                      {user?.firstName || "Student"}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${profileDropdownOpen ? "rotate-180" : ""}`} />
                    </button>
                    {profileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                        <Link
                          to="/StudentDashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#00A86B] transition-colors duration-150"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <Link
                          to="/my-courses"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#00A86B] transition-colors duration-150"
                        >
                          <BookOpen className="w-4 h-4" />
                          My Courses
                        </Link>
                        <Link
                          to="/my-profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#00A86B] transition-colors duration-150"
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </Link>
                        <div className="my-1 border-t border-slate-100" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors duration-150"
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
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
          {navLinks.map((link) =>
            link.label === "Contact" ? (
              <button
                key={link.label}
                type="button"
                onClick={openContact}
                className="block text-left text-base font-medium transition-colors duration-200 text-slate-600"
              >
                {link.label}
              </button>
            ) : (
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
            )
          )}
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
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setCartOpen(true);
                      }}
                      className="flex items-center justify-center gap-2 font-semibold text-[#0B2545] py-2 border border-slate-200 rounded-lg transition-colors duration-200 hover:border-[#00A86B] hover:text-[#00A86B]"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Cart{cartCount > 0 ? ` (${cartCount})` : ""}
                    </button>
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

      {/* Contact Us dialog */}
      <ContactUsMain open={contactOpen} onOpenChange={setContactOpen} />

      {/* Cart drawer (students) */}
      {isAuthenticated && role === "STUDENT" && (
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      )}
    </header>
  );
}
