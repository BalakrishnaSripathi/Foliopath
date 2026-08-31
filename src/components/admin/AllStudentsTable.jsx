import { useState, useEffect } from "react";
import { GraduationCap, Mail, Search, Eye, KeyRound, Power, BookOpen, Briefcase } from "lucide-react";
import {
  getAllStudentsReport,
  updateStudentStatus,
} from "../../api/superAdminService";
import StudentDetailsModal from "./StudentDetailsModal";
import EnrollStudentModal from "./EnrollStudentModal";
import EnrollKitModal from "./EnrollKitModal";

export default function AllStudentsTable({ isSuperAdmin, onResetPassword }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [detailsStudent, setDetailsStudent] = useState(null);
  const [enrollStudent, setEnrollStudent] = useState(null);
  const [enrollKitStudent, setEnrollKitStudent] = useState(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getAllStudentsReport();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load students:", err);
      setError(
        err.response?.data?.message || "Failed to load students"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (student) => {
    try {
      const { data } = await updateStudentStatus(
        student.userId,
        !student.enabled
      );
      setStudents((prev) =>
        prev.map((s) => (s.userId === student.userId ? data : s))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update student status");
    }
  };

  const filteredStudents = students.filter((s) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q) ||
      (s.username || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-lg font-bold text-[#0B2545]">
          All Students
          <span className="ml-2 text-sm font-medium text-slate-400">
            ({students.length})
          </span>
        </h2>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            className="pl-9 pr-4 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:border-[#00A86B] focus:bg-white focus:outline-none transition-all duration-200 w-full sm:w-64"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A86B]" />
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-12">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">
            {search
              ? "No students match your search"
              : "No students registered yet"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-3 px-4 font-semibold text-slate-600">
                  Student
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 hidden md:table-cell">
                  Username
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 hidden lg:table-cell">
                  Mobile
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 hidden lg:table-cell">
                  Registered
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr
                  key={student.userId}
                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="font-semibold text-[#0B2545] block">
                      {student.firstName} {student.lastName || ""}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {student.email}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 hidden md:table-cell">
                    {student.username || "-"}
                  </td>
                  <td className="py-3 px-4 text-slate-500 hidden lg:table-cell">
                    {student.mobileNumber || "-"}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        student.enabled
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      {student.enabled ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-xs hidden lg:table-cell">
                    {student.registeredAt
                      ? new Date(student.registeredAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1.5 flex-wrap">
                      <button
                        onClick={() => setDetailsStudent(student)}
                        title="View details, enrolled courses & performance"
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 hover:opacity-80 active:scale-95"
                        style={{ color: "#00A86B", background: "#00A86B15", border: "1px solid #00A86B30" }}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {isSuperAdmin && (
                        <>
                          <button
                            onClick={() => onResetPassword?.(student)}
                            title="Reset password"
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 hover:opacity-80 active:scale-95"
                            style={{ color: "#f59e0b", background: "#f59e0b15", border: "1px solid #f59e0b30" }}
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(student)}
                            title={student.enabled ? "Disable" : "Enable"}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 hover:opacity-80 active:scale-95"
                            style={{ color: student.enabled ? "#f59e0b" : "#00A86B", background: student.enabled ? "#f59e0b15" : "#00A86B15", border: student.enabled ? "1px solid #f59e0b30" : "1px solid #00A86B30" }}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEnrollStudent(student)}
                            title="Enroll in course"
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 hover:opacity-80 active:scale-95"
                            style={{ color: "#3b82f6", background: "#3b82f615", border: "1px solid #3b82f630" }}
                          >
                            <BookOpen className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEnrollKitStudent(student)}
                            title="Enroll in interview kit"
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 hover:opacity-80 active:scale-95"
                            style={{ color: "#f59e0b", background: "#f59e0b15", border: "1px solid #f59e0b30" }}
                          >
                            <Briefcase className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detailsStudent && (
        <StudentDetailsModal
          student={detailsStudent}
          onClose={() => setDetailsStudent(null)}
        />
      )}

      {enrollStudent && (
        <EnrollStudentModal
          student={enrollStudent}
          onClose={() => setEnrollStudent(null)}
          onSuccess={loadStudents}
          isSuperAdmin={isSuperAdmin}
        />
      )}

      {enrollKitStudent && (
        <EnrollKitModal
          student={enrollKitStudent}
          onClose={() => setEnrollKitStudent(null)}
          onSuccess={loadStudents}
        />
      )}
    </div>
  );
}
