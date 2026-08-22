import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, RefreshCw } from "lucide-react";
import Logo from "../components/common/Logo";
import { verifyOtp, resendOtp } from "../api/authService";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [otp, setOtp] = useState("");
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate("/register", { replace: true });
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setServerError("Please enter the 6-digit OTP sent to your email");
      return;
    }

    setLoading(true);
    setServerError("");
    try {
      await verifyOtp(email, otp);
      navigate("/login", {
        state: { message: "Email verified! You can now log in." },
      });
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Invalid or expired OTP. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setServerError("");
    setSuccessMessage("");
    try {
      const { data } = await resendOtp(email);
      setSuccessMessage(data?.message || "A new OTP has been sent to your email");
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Failed to resend OTP. Try again."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold text-[#0B2545]">
            Verify your email
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            We sent a 6-digit code to{" "}
            <span className="font-semibold text-slate-700">{email}</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {serverError}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Enter OTP
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  className="w-full pl-10 pr-4 py-2.5 text-lg font-mono tracking-[0.5em] bg-slate-50 rounded-xl border border-slate-200 focus:border-[#00A86B] focus:bg-white focus:outline-none transition-all duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3 bg-[#00A86B] hover:bg-[#008f5a] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          <button
            onClick={handleResend}
            disabled={resending}
            className="mt-4 w-full flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#00A86B] py-2 transition-colors duration-200 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${resending ? "animate-spin" : ""}`} />
            {resending ? "Resending..." : "Didn't receive the code? Resend OTP"}
          </button>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already verified?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#00A86B] hover:underline transition-colors duration-200"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
