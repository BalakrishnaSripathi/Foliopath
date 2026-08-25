import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, RefreshCw, ShieldCheck } from "lucide-react";
import Logo from "../components/common/Logo";
import { login, getCaptcha } from "../api/authService";
import { useAuth } from "../context/AuthContext";

const roleDashboard = {
  SUPER_ADMIN: "/super-admin/dashboard",
  STAFF: "/staff/dashboard",
  STUDENT: "/my-courses",
};

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    captchaCode: "",
  });
  const [captcha, setCaptcha] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginUser, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  // Set by the axios interceptor when the token expired or was invalid
  // and the user was logged out automatically.
  const [sessionMessage] = useState(() => {
    try {
      if (sessionStorage.getItem("auth.sessionExpired")) {
        sessionStorage.removeItem("auth.sessionExpired");
        return "Your session has expired or is invalid. Please log in again.";
      }
    } catch {
      /* storage unavailable */
    }
    return "";
  });

  const loadCaptcha = useCallback(async () => {
    try {
      const { data } = await getCaptcha();
      setCaptcha(data);
      setForm((prev) => ({ ...prev, captchaCode: "" }));
    } catch (err) {
      console.error("Failed to load captcha:", err);
    }
  }, []);

  useEffect(() => {
    loadCaptcha();
  }, [loadCaptcha]);

  useEffect(() => {
    if (isAuthenticated && role && roleDashboard[role]) {
      navigate(roleDashboard[role], { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = "Email or username is required";
    if (!form.password) newErrors.password = "Password is required";
    if (!form.captchaCode.trim()) newErrors.captchaCode = "Captcha is required";
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
      const { data } = await login({
        usernameOrEmail: form.email,
        password: form.password,
        captchaId: captcha?.captchaId,
        captchaCode: form.captchaCode,
      });
      loginUser(data);
      const userRole = data.user?.roles?.[0];
      navigate(roleDashboard[userRole] || "/my-courses");
    } catch (err) {
      const msg =
        err.response?.data?.message || "Invalid credentials. Please try again.";
      setServerError(msg);
      loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      {/* Changed max-w-md to max-w-sm to reduce form width */}
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo/>
          </div>
          {/* <h1 className="text-2xl font-bold text-[#0B2545]">
            Welcome back
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Log in to continue your learning journey
          </p> */}
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5">
          {sessionMessage && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-600">
              {sessionMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600">
              {successMessage}
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
                Email or Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com or username"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 rounded-xl border ${
                    errors.email
                      ? "border-red-400 focus:border-red-500"
                      : "border-slate-200 focus:border-[#00A86B]"
                  } focus:bg-white focus:outline-none transition-all duration-200`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 rounded-xl border ${
                    errors.password
                      ? "border-red-400 focus:border-red-500"
                      : "border-slate-200 focus:border-[#00A86B]"
                  } focus:bg-white focus:outline-none transition-all duration-200`}
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
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Captcha
              </label>
              <div className="flex items-center gap-2">
                <div className="h-11 px-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {captcha?.image ? (
                    <img
                      src={captcha.image}
                      alt="Captcha"
                      className="h-9 rounded-lg cursor-pointer"
                      onClick={loadCaptcha}
                      title="Click to refresh"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">Loading...</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={loadCaptcha}
                  className="p-2 text-slate-400 hover:text-[#00A86B] hover:bg-slate-50 rounded-xl transition-colors duration-200 flex-shrink-0"
                  title="Refresh captcha"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <div className="relative flex-1 min-w-0">
                  <ShieldCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="captchaCode"
                    value={form.captchaCode}
                    onChange={handleChange}
                    placeholder="Captcha"
                    className={`w-full pl-9 pr-2 py-2.5 text-sm bg-slate-50 rounded-xl border ${
                      errors.captchaCode
                        ? "border-red-400 focus:border-red-500"
                        : "border-slate-200 focus:border-[#00A86B]"
                    } focus:bg-white focus:outline-none transition-all duration-200`}
                  />
                </div>
              </div>
              {errors.captchaCode && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.captchaCode}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#00A86B] hover:bg-[#008f5a] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-[#00A86B] hover:underline transition-colors duration-200"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}