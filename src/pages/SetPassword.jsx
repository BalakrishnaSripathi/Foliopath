import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";
import Logo from "../components/common/Logo";
import { setStaffPassword } from "../api/authService";

export default function SetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const validate = () => {
    const newErrors = {};
    if (!token) newErrors.token = "Setup token is missing from the link";
    if (!form.newPassword) newErrors.newPassword = "Password is required";
    else if (form.newPassword.length < 8)
      newErrors.newPassword = "Min 8 characters required";
    if (!form.confirmPassword)
      newErrors.confirmPassword = "Confirm your password";
    else if (form.newPassword !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setServerError("");
    try {
      await setStaffPassword({
        token,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      navigate("/login", {
        state: {
          message: "Password set successfully! You can now log in.",
        },
      });
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          "Failed to set password. The link may have expired."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (name) =>
    `w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 rounded-xl border ${
      errors[name]
        ? "border-red-400 focus:border-red-500"
        : "border-slate-200 focus:border-[#00A86B]"
    } focus:bg-white focus:outline-none transition-all duration-200`;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold text-[#0B2545]">
            Set your password
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create a password to activate your staff account
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
          {!token && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              This link is missing its setup token. Please use the exact link
              from your email.
            </div>
          )}

          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  placeholder="Min 8 characters"
                  className={inputCls("newPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.newPassword}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className={inputCls("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-3 bg-[#00A86B] hover:bg-[#008f5a] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? "Setting Password..." : "Set Password"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#00A86B]" />
            Already set up?{" "}
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
