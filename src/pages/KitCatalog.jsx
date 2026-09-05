import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, FileQuestion, Users, BadgePercent } from "lucide-react";
import { getPublishedKits } from "../api/interviewKitService";
import Header from "../components/layout/Header";
import { useAuth } from "../context/AuthContext";

const STATIC_PRICE = 499;
const STATIC_MRP = 999;
const STATIC_ENROLLMENTS = [1247, 983, 687, 1562, 1108, 742];
const STATIC_BADGES = ["Popular", "Bestseller", "New"];

const levelColors = {
  BEGINNER: "bg-green-100 text-green-700",
  INTERMEDIATE: "bg-amber-100 text-amber-700",
  ADVANCED: "bg-red-100 text-red-700",
};

const badgeColors = {
  NEW: "bg-[#00A86B] text-white",
  BESTSELLER: "bg-amber-500 text-white",
  POPULAR: "bg-blue-600 text-white",
};

const money = (v) =>
  Number.isFinite(Number(v))
    ? `₹${Math.round(Number(v)).toLocaleString("en-IN")}`
    : "";

function CatalogTabs({ active }) {
  const tabs = [
    { key: "courses", label: "Courses", href: "/courses" },
    { key: "kits", label: "Interview Kits", href: "/interview-kits" },
  ];
  return (
    <div className="mt-8 flex justify-center gap-2 sm:gap-3">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          to={tab.href}
          className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
            active === tab.key
              ? "bg-[#00A86B] text-white shadow-md shadow-[#00A86B]/25"
              : "bg-white text-slate-600 border border-slate-200 hover:border-[#00A86B] hover:text-[#00A86B]"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

export default function KitCatalog() {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const [kits, setKits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getPublishedKits()
      .then(({ data }) => {
        if (active) {
          const list = Array.isArray(data) ? data : [];
          setKits(
            list.map((kit, idx) => ({
              ...kit,
              price: STATIC_PRICE,
              originalPrice: STATIC_MRP,
              enrollmentCount:
                kit.enrollmentCount ||
                STATIC_ENROLLMENTS[idx % STATIC_ENROLLMENTS.length],
              badge: STATIC_BADGES[idx % STATIC_BADGES.length],
            }))
          );
        }
      })
      .catch((err) => console.error("Failed to load interview kits:", err))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const handleEnroll = () => {
    if (isAuthenticated && role === "STUDENT") {
      navigate("/StudentDashboard/interview-kits");
    } else {
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A86B]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#0B2545]">
            Interview Kits
          </h1>
          <p className="text-slate-500 mt-2">
            Curated question banks and practice sets to crack every interview
            round
          </p>
        </div>

        <CatalogTabs active="kits" />

        {kits.length === 0 ? (
          <div className="text-center py-16 mt-8">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              No interview kits available yet — check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-10">
            {kits.map((kit) => {
              const sell = Number(kit.price || 0);
              const mrp = Number(kit.originalPrice);
              const hasDiscount = mrp > sell;
              const discountPct = hasDiscount
                ? Math.round(((mrp - sell) / mrp) * 100)
                : 0;
              return (
                <div
                  key={kit.id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 flex flex-col"
                >
                  <div className="relative overflow-hidden h-48 flex items-center justify-center bg-gradient-to-br from-[#422006] to-[#78350f]">
                    <Link
                      to={`/interview-kits/${kit.id}`}
                      className="absolute inset-0 z-0"
                      aria-label={kit.name}
                    />
                    {kit.thumbnailUrl ? (
                      <img
                        src={kit.thumbnailUrl}
                        alt={kit.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <Briefcase className="w-12 h-12 text-amber-300" />
                    )}
                    {kit.badge && (
                      <span
                        className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                          badgeColors[kit.badge?.toUpperCase()] ||
                          "bg-[#0B2545] text-white"
                        }`}
                      >
                        {kit.badge}
                      </span>
                    )}
                    {hasDiscount && (
                      <span className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-md bg-red-500 text-white shadow-sm">
                        {discountPct}% OFF
                      </span>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        {typeof kit.questionCount === "number" && (
                          <>
                            <FileQuestion className="w-3.5 h-3.5" />
                            {kit.questionCount} questions
                          </>
                        )}
                        {kit.level && (
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                              levelColors[kit.level] ||
                              "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {kit.level}
                          </span>
                        )}
                      </span>
                      {kit.enrollmentCount > 0 && (
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Users className="w-3.5 h-3.5" />
                          <span>{kit.enrollmentCount}</span>
                        </div>
                      )}
                    </div>

                    <Link
                      to={`/interview-kits/${kit.id}`}
                      className="mt-3 block text-lg font-bold text-[#0B2545] line-clamp-2 group-hover:text-[#B45309] transition-colors duration-200"
                    >
                      {kit.name}
                    </Link>

                    {kit.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {kit.description}
                      </p>
                    )}

                    <div className="pt-4 mt-auto border-t border-slate-100 flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-xl font-black text-[#0B2545]">
                            {sell > 0 ? money(sell) : "Free"}
                          </span>
                          {hasDiscount && (
                            <span className="text-sm text-slate-400 line-through">
                              {money(mrp)}
                            </span>
                          )}
                        </div>
                        {hasDiscount && (
                          <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-bold text-[#00A86B]">
                            <BadgePercent className="w-3.5 h-3.5" />
                            Save {money(mrp - sell)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={handleEnroll}
                        className="flex-shrink-0 px-4 py-2 bg-amber-50 text-[#B45309] hover:bg-[#B45309] hover:text-white rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-md active:scale-[0.97]"
                      >
                        {isAuthenticated && role === "STUDENT"
                          ? "Open Now"
                          : "Enroll Now"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            to="/courses"
            className="text-sm font-bold text-[#00A86B] hover:text-[#008f5a]"
          >
            Browse our courses instead
          </Link>
        </div>
      </div>
    </div>
  );
}