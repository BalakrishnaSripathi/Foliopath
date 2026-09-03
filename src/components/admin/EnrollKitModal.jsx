import { useState, useEffect } from "react";
import {
  X,
  Briefcase,
  CheckCircle2,
  IndianRupee,
  BadgePercent,
  UserMinus,
  Undo2,
} from "lucide-react";
import {
  getPublishedKits,
} from "../../api/interviewKitService";
import {
  adminEnrollStudentInKit,
  adminUnenrollStudentInKit,
  getStudentKitEnrollments,
  getStudentKitPayments,
} from "../../api/superAdminService";

const PAYMENT_METHODS = [
  { value: "UPI", label: "UPI" },
  { value: "CARD", label: "Card" },
  { value: "NET_BANKING", label: "Net Banking" },
  { value: "CASH", label: "Cash" },
];

function formatMoney(v) {
  const n = Number(v) || 0;
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default function EnrollKitModal({ student, onClose, onSuccess }) {
  const [kits, setKits] = useState([]);
  const [enrolledKitIds, setEnrolledKitIds] = useState(new Set());
  const [payments, setPayments] = useState(new Map());
  const [loadingKits, setLoadingKits] = useState(true);
  const [submitting, setSubmitting] = useState(null);
  const [error, setError] = useState("");
  const [payFor, setPayFor] = useState(null);
  const [discountPct, setDiscountPct] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [remarks, setRemarks] = useState("");
  const [unenrollFor, setUnenrollFor] = useState(null);
  const [refundAmount, setRefundAmount] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoadingKits(true);
    try {
      const [kitsRes, enrollmentsRes, paymentsRes] = await Promise.all([
        getPublishedKits(),
        getStudentKitEnrollments(student.userId),
        getStudentKitPayments(student.userId),
      ]);
      setKits(Array.isArray(kitsRes.data) ? kitsRes.data : []);
      const ids = new Set(
        (Array.isArray(enrollmentsRes.data) ? enrollmentsRes.data : [])
          .filter((e) => e.enrollmentStatus !== "DROPPED")
          .map((e) => e.kitId)
      );
      setEnrolledKitIds(ids);
      const map = new Map();
      (Array.isArray(paymentsRes.data) ? paymentsRes.data : []).forEach((p) => {
        map.set(p.kitId, p);
      });
      setPayments(map);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError(err.response?.data?.message || "Failed to load kits");
    } finally {
      setLoadingKits(false);
    }
  };

  const handleEnroll = async (kit) => {
    const kitId = kit.id;
    setSubmitting(kitId);
    setError("");
    try {
      const price = Number(kit.price) || 0;
      const isFree = price <= 0;
      const opts = {};
      if (!isFree && payFor === kitId) {
        const pct = Math.min(Math.max(Number(discountPct) || 0, 0), 100);
        const discountAmount = (price * pct) / 100;
        opts.discountPercentage = pct;
        opts.discountAmount = Math.round(discountAmount * 100) / 100;
        opts.amountPaid = Math.round((price - discountAmount) * 100) / 100;
        opts.paymentMethod = paymentMethod;
        opts.remarks = remarks;
      }
      await adminEnrollStudentInKit(student.userId, kitId, opts);
      setEnrolledKitIds((prev) => new Set([...prev, kitId]));
      setPayFor(null);
      setDiscountPct("");
      setPaymentMethod("UPI");
      setRemarks("");
      onSuccess?.();
    } catch (err) {
      console.error("Enrollment failed:", err);
      setError(err.response?.data?.message || "Failed to enroll student");
    } finally {
      setSubmitting(null);
    }
  };

  const startPay = (kit) => {
    setPayFor(kit.id);
    setDiscountPct("");
    setPaymentMethod("UPI");
    setRemarks("");
    setError("");
  };

  const startUnenroll = (kit) => {
    setUnenrollFor(kit.id);
    const paid = payments.get(kit.id);
    setRefundAmount(paid ? String(paid.amountPaid ?? "") : "");
    setError("");
  };

  const handleUnenroll = async (kit) => {
    const kitId = kit.id;
    const paid = payments.get(kitId);
    const paidAmt = Number(paid?.amountPaid) || 0;
    const refund = Number(refundAmount);

    if (refund < 0 || Number.isNaN(refund) || (Number.isFinite(paidAmt) && refund > paidAmt)) {
      setError(
        `Refund amount must be between 0 and the amount paid at enrollment (₹${formatMoney(paidAmt)}).`
      );
      return;
    }

    setSubmitting(kitId);
    setError("");
    try {
      await adminUnenrollStudentInKit(student.userId, kitId, refund);
      setEnrolledKitIds((prev) => {
        const next = new Set(prev);
        next.delete(kitId);
        return next;
      });
      setPayments((prev) => {
        const next = new Map(prev);
        next.delete(kitId);
        return next;
      });
      setUnenrollFor(null);
      setRefundAmount("");
      onSuccess?.();
    } catch (err) {
      console.error("Unenroll failed:", err);
      setError(err.response?.data?.message || "Failed to unenroll student");
    } finally {
      setSubmitting(null);
    }
  };

  if (!student) return null;

  const name = `${student.firstName || ""} ${student.lastName || ""}`.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
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

        <div className="p-5 overflow-y-auto">
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
            <div className="space-y-3">
              {kits.map((kit) => {
                const isEnrolled = enrolledKitIds.has(kit.id);
                const isLoading = submitting === kit.id;
                const isPaid = Number(kit.price) > 0;
                const showPay = payFor === kit.id;
                const pct = Math.min(Math.max(Number(discountPct) || 0, 0), 100);
                const price = Number(kit.price) || 0;
                const discountAmount = (price * pct) / 100;
                const amountPaid = price - discountAmount;

                return (
                  <div
                    key={kit.id}
                    className={`rounded-xl border transition-all ${
                      isEnrolled
                        ? "bg-green-50 border-green-200"
                        : "bg-white border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[#0B2545] truncate">
                            {kit.name}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-1">
                            <IndianRupee className="w-3 h-3" />
                            {isPaid ? formatMoney(price) : "Free"}
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-3">
                        {isEnrolled ? (
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 px-3 py-1.5 rounded-lg bg-green-100">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Enrolled
                          </span>
                        ) : isPaid && !showPay ? (
                          <button
                            onClick={() => startPay(kit)}
                            disabled={isLoading}
                            className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg bg-[#00A86B] hover:bg-[#008f5a] transition-colors disabled:opacity-50 ml-2"
                          >
                            <Briefcase className="w-3.5 h-3.5" />
                            {isLoading ? "Enrolling..." : "Enroll"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEnroll(kit)}
                            disabled={isLoading}
                            className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg bg-[#00A86B] hover:bg-[#008f5a] transition-colors disabled:opacity-50 ml-2"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {isLoading ? "Enrolling..." : "Confirm Enroll"}
                          </button>
                        )}
                        {isEnrolled && (
                          <button
                            onClick={() => startUnenroll(kit)}
                            disabled={isLoading}
                            title="Unenroll"
                            className="flex items-center gap-1.5 text-xs font-semibold text-red-600 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50 ml-2"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                            Unenroll
                          </button>
                        )}
                      </div>
                    </div>

                    {isEnrolled && unenrollFor === kit.id && (
                      <div className="px-3 pb-3 pt-0 border-t border-slate-100 mt-0">
                        <div className="pt-3 space-y-3">
                          <div className="rounded-xl border border-red-200 bg-red-50 p-3 space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">Amount paid at enrollment</span>
                              <span className="font-bold text-[#0B2545]">
                                ₹{formatMoney(payments.get(kit.id)?.amountPaid)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">Kit fee</span>
                              <span className="font-semibold text-[#0B2545]">
                                ₹{formatMoney(payments.get(kit.id)?.kitFee ?? kit.price)}
                              </span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 tracking-wide">
                              Refund Amount (₹)
                            </label>
                            <div className="relative">
                              <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                type="number"
                                min={0}
                                max={Number(payments.get(kit.id)?.amountPaid) || undefined}
                                step="0.01"
                                value={refundAmount}
                                onChange={(e) => setRefundAmount(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:border-red-500 focus:outline-none"
                              />
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              Must not exceed the amount paid at enrollment.
                            </p>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <button
                              onClick={() => {
                                setUnenrollFor(null);
                                setRefundAmount("");
                              }}
                              className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 px-3 py-2"
                            >
                              <Undo2 className="w-4 h-4" />
                              Cancel
                            </button>
                            <button
                              onClick={() => handleUnenroll(kit)}
                              disabled={isLoading}
                              className="flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                              {isLoading ? "Unenrolling..." : "Confirm Unenroll"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {isPaid && showPay && !isEnrolled && (
                      <div className="px-3 pb-3 pt-0 border-t border-slate-100 mt-0">
                        <div className="pt-3 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Discount % */}
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 tracking-wide">
                                Discount %
                              </label>
                              <div className="relative">
                                <BadgePercent className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={discountPct}
                                  onChange={(e) => setDiscountPct(e.target.value)}
                                  placeholder="0"
                                  className="w-full pl-9 pr-3 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:border-[#00A86B] focus:outline-none"
                                />
                              </div>
                            </div>
                            {/* Method */}
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 tracking-wide">
                                Method of Payment
                              </label>
                              <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:border-[#00A86B] focus:outline-none"
                              >
                                {PAYMENT_METHODS.map((m) => (
                                  <option key={m.value} value={m.value}>
                                    {m.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Live calculation summary */}
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Kit Fee</span>
                              <span className="font-semibold text-[#0B2545]">
                                ₹{formatMoney(price)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Discount</span>
                              <span className="font-semibold text-[#00A86B]">
                                {pct > 0 ? `- ₹${formatMoney(discountAmount)} (${pct}%)` : "—"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                              <span className="font-semibold text-[#0B2545]">
                                Amount Paid
                              </span>
                              <span className="text-lg font-extrabold text-[#00A86B]">
                                ₹{formatMoney(amountPaid)}
                              </span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 tracking-wide">
                              Remarks (optional)
                            </label>
                            <input
                              type="text"
                              value={remarks}
                              onChange={(e) => setRemarks(e.target.value)}
                              placeholder="e.g. collected via UPI reference"
                              className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:border-[#00A86B] focus:outline-none"
                            />
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <button
                              onClick={() => setPayFor(null)}
                              className="text-sm font-semibold text-slate-500 hover:text-slate-700 px-3 py-2"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleEnroll(kit)}
                              disabled={isLoading}
                              className="flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-2 rounded-xl bg-[#00A86B] hover:bg-[#008f5a] transition-colors disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {isLoading ? "Enrolling..." : `Enroll (₹${formatMoney(amountPaid)})`}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
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
