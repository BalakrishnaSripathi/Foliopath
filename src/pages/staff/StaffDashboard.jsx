import { useState, useEffect } from "react";
import { BadgeCheck, Building2, Briefcase, GraduationCap } from "lucide-react";
import { getStaffDashboard } from "../../api/staffService";
import Header from "../../components/layout/Header";
import ContactUsTable from "../../components/contact/ContactUsTable";
import AllStudentsTable from "../../components/admin/AllStudentsTable";

export default function StaffDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data } = await getStaffDashboard();
      setDashboard(data);
    } catch (err) {
      console.error("Failed to load staff dashboard:", err);
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
      label: "Staff Code",
      value: dashboard?.staffCode || "-",
      icon: BadgeCheck,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Designation",
      value: dashboard?.designation || "-",
      icon: Briefcase,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Department",
      value: dashboard?.department || "-",
      icon: Building2,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Total Students",
      value: dashboard?.totalStudents ?? 0,
      icon: GraduationCap,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-[#0B2545] mb-2">
          Staff Dashboard
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Your profile summary and student overview
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">
                    {card.label}
                  </p>
                  <p
                    className={`mt-1 font-bold text-[#0B2545] truncate ${
                      card.label === "Total Students" ? "text-2xl" : "text-lg"
                    }`}
                    title={String(card.value)}
                  >
                    {card.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${card.color}`}
                >
                  <card.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* All students with status / enrolled courses / performance / mock test scores */}
        <div className="mt-8">
          <AllStudentsTable isSuperAdmin={false} />
        </div>

        {/* Contact Us submissions */}
        <ContactUsTable />
      </div>
    </div>
  );
}
