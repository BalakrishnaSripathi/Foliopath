import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Logo from "../components/common/Logo";
import { login } from "../api/authService";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Enter a valid email";
    if (!form.password) newErrors.password = "Password is required";
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
      const { data } = await login(form);
      loginUser(data.token, data.role);
      navigate("/");
    } catch (err) {
      const msg =
        err.response?.data?.message || "Invalid email or password.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div
          data-aos="fade-down"
          data-aos-delay="100"
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold text-[#0B2545]">
            Welcome back
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Log in to continue your learning journey
          </p>
        </div>

        <div
          data-aos="fade-up"
          data-aos-delay="200"
          className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8"
        >
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
            {/* Email */}
            <div data-aos="fade-right" data-aos-delay="250">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
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

            {/* Password */}
            <div data-aos="fade-right" data-aos-delay="300">
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

            <div data-aos="fade-up" data-aos-delay="350" className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-[#00A86B] focus:ring-[#00A86B]"
                />
                Remember me
              </label>
              <a
                href="#"
                className="text-sm font-semibold text-[#00A86B] hover:underline transition-colors duration-200"
              >
                Forgot password?
              </a>
            </div>

            <button
              data-aos="fade-up"
              data-aos-delay="400"
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
