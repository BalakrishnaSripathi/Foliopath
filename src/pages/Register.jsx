import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, Eye, EyeOff, GraduationCap, Shield } from "lucide-react";
import Logo from "../components/common/Logo";
import { registerStudent } from "../api/authService";

const initialForm = {
  name: "",
  mobile: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "STUDENT",
};

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.mobile.trim()) newErrors.mobile = "Mobile number is required";
    else if (!/^\d{10}$/.test(form.mobile))
      newErrors.mobile = "Enter a valid 10-digit number";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Enter a valid email";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 8)
      newErrors.password = "Min 8 characters required";
    if (!form.confirmPassword)
      newErrors.confirmPassword = "Confirm your password";
    else if (form.password !== form.confirmPassword)
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
      const [firstName = "", ...rest] = form.name.trim().split(" ");
      await registerStudent({
        username: form.email.split("@")[0].replace(/[^a-z0-9_]/gi, "").toLowerCase() + Date.now().toString(36).slice(-4),
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        firstName,
        lastName: rest.join(" "),
        mobileNumber: form.mobile,
      });
      navigate("/verify-otp", {
        state: { email: form.email },
      });
    } catch (err) {
      const msg =
        err.response?.data?.message || "Registration failed. Please try again.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      placeholder: "John Doe",
      icon: User,
    },
    {
      name: "mobile",
      label: "Mobile Number",
      type: "tel",
      placeholder: "9876543210",
      icon: Phone,
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      placeholder: "you@example.com",
      icon: Mail,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold text-[#0B2545]">
            Create your account
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Join Foliopath 360 and start learning today
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {field.label}
                </label>
                <div className="relative">
                  <field.icon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={field.type}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 rounded-xl border ${
                      errors[field.name]
                        ? "border-red-400 focus:border-red-500"
                        : "border-slate-200 focus:border-[#00A86B]"
                    } focus:bg-white focus:outline-none transition-all duration-200`}
                  />
                </div>
                {errors[field.name] && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors[field.name]}
                  </p>
                )}
              </div>
            ))}
{/* 
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                I want to join as
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, role: "STUDENT" }))}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                    form.role === "STUDENT"
                      ? "border-[#00A86B] bg-[#00A86B]/5 text-[#00A86B]"
                      : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <GraduationCap className="w-5 h-5" />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, role: "ADMIN" }))}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                    form.role === "ADMIN"
                      ? "border-[#00A86B] bg-[#00A86B]/5 text-[#00A86B]"
                      : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  Admin
                </button>
              </div>
            </div> */}

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
                  placeholder="Min 8 characters"
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
                  className={`w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 rounded-xl border ${
                    errors.confirmPassword
                      ? "border-red-400 focus:border-red-500"
                      : "border-slate-200 focus:border-[#00A86B]"
                  } focus:bg-white focus:outline-none transition-all duration-200`}
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
              disabled={loading}
              className="w-full py-3 bg-[#00A86B] hover:bg-[#008f5a] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
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
