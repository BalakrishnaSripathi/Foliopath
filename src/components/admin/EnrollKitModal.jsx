import { useState, useEffect } from "react";
import { X, Briefcase, CheckCircle2 } from "lucide-react";
import {
  getPublishedKits,
} from "../../api/interviewKitService";
import {
  adminEnrollStudentInKit,
  getStudentKitEnrollments,
} from "../../api/superAdminService";

export default function EnrollKitModal({ student, onClose, onSuccess }) {
  const [kits, setKits] = useState([]);
  const [enrolledKitIds, setEnrolledKitIds] = useState(new Set());
  const [loadingKits, setLoadingKits] = useState(true);
  const [submitting, setSubmitting] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoadingKits(true);
    try {
      const [kitsRes, enrollmentsRes] = await Promise.all([
        getPublishedKits(),
        getStudentKitEnrollments(student.userId),
      ]);
      setKits(Array.isArray(kitsRes.data) ? kitsRes.data : []);
      const ids = new Set(
        (Array.isArray(enrollmentsRes.data) ? enrollmentsRes.data : [])
          .filter((e) => e.enrollmentStatus !== "DROPPED")
          .map((e) => e.kitId)
      );
      setEnrolledKitIds(ids);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError(err.response?.data?.message || "Failed to load kits");
    } finally {
      setLoadingKits(false);
    }
  };

  const handleEnroll = async (kitId) => {
    setSubmitting(kitId);
    setError("");
    try {
      await adminEnrollStudentInKit(student.userId, kitId);
      setEnrolledKitIds((prev) => new Set([...prev, kitId]));
      onSuccess?.();
    } catch (err) {
      console.error("Enrollment failed:", err);
      setError(err.response?.data?.message || "Failed to enroll student");
    } finally {
      setSubmitting(null);
    }
  };

  if (!student) return null;

  const name = `${student.firstName || ""} ${student.lastName || ""}`.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-[#0B2545]">
              Enroll in Interview Kit
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {name} ({student.email})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          {loadingKits ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A86B]" />
            </div>
          ) : kits.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              No published interview kits available
            </p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {kits.map((kit) => {
                const isEnrolled = enrolledKitIds.has(kit.id);
                const isLoading = submitting === kit.id;
                return (
                  <div
                    key={kit.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isEnrolled
                        ? "bg-green-50 border-green-200"
                        : "bg-white border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-5 h-5 text-amber-500" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[#0B2545] truncate">
                          {kit.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {kit.level} {kit.price > 0 ? `· ₹${kit.price}` : "· Free"}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-3">
                      {isEnrolled ? (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 px-3 py-1.5 rounded-lg bg-green-100">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Enrolled
                        </span>
                      ) : (
                        <button
                          onClick={() => handleEnroll(kit.id)}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg bg-[#00A86B] hover:bg-[#008f5a] transition-colors disabled:opacity-50"
                        >
                          <Briefcase className="w-3.5 h-3.5" />
                          {isLoading ? "Enrolling..." : "Enroll"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end p-5 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
