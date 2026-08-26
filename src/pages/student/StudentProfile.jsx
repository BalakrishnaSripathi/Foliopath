import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Save, X, BadgeCheck, Mail, Phone, AtSign } from "lucide-react";
import {
  getStudentProfile,
  updateStudentProfile,
} from "../../api/studentService";
import Header from "../../components/layout/Header";

const GENDERS = ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"];

const emptyProfile = {
  dateOfBirth: "",
  gender: "",
  qualification: "",
  occupation: "",
  bio: "",
  address: "",
  city: "",
  state: "",
  country: "",
};

export default function StudentProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data } = await getStudentProfile();
      setProfile(data);
      setForm({
        dateOfBirth: data.dateOfBirth || "",
        gender: data.gender || "",
        qualification: data.qualification || "",
        occupation: data.occupation || "",
        bio: data.bio || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        country: data.country || "",
      });
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const { data } = await updateStudentProfile(form);
      setProfile(data);
      setForm({
        dateOfBirth: data.dateOfBirth || "",
        gender: data.gender || "",
        qualification: data.qualification || "",
        occupation: data.occupation || "",
        bio: data.bio || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        country: data.country || "",
      });
      setEditing(false);
      setMessage("Profile updated successfully");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A86B]" />
      </div>
    );
  }

  const inputCls =
    "w-full px-3 py-2 text-sm bg-white rounded-xl border border-slate-200 focus:border-[#00A86B] focus:outline-none transition-all duration-200";
  const viewCls =
    "text-sm text-slate-700 py-1.5";
  const labelCls =
    "block text-xs font-semibold text-slate-500 uppercase mb-1 tracking-wide";

  const fields = [
    { name: "dateOfBirth", label: "Date of Birth", type: "date" },
    { name: "gender", label: "Gender", type: "select", options: GENDERS },
    { name: "qualification", label: "Qualification", type: "text" },
    { name: "occupation", label: "Occupation", type: "text" },
    { name: "address", label: "Address", type: "text" },
    { name: "city", label: "City", type: "text" },
    { name: "state", label: "State", type: "text" },
    { name: "country", label: "Country", type: "text" },
  ];

  const readOnlyInfo = [
    {
      icon: AtSign,
      label: "Username",
      value: profile?.username,
    },
    {
      icon: Mail,
      label: "Email",
      value: profile?.email,
    },
    {
      icon: Phone,
      label: "Mobile Number",
      value: profile?.mobileNumber,
    },
    {
      icon: BadgeCheck,
      label: "Student Code",
      value: profile?.studentCode,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0B2545]">My Profile</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your personal information
            </p>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="bg-[#00A86B] hover:bg-[#008f5a] text-white font-semibold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-sm"
            >
              Edit Profile
            </button>
          ) : (
            <button
              onClick={() => {
                setEditing(false);
                setError("");
                loadProfile();
              }}
              className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700 px-4 py-2.5 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>

        {message && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Read-only account info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
          <h2 className="text-base font-bold text-[#0B2545] mb-4">
            Account Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {readOnlyInfo.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-slate-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p
                    className="text-sm font-semibold text-[#0B2545] truncate"
                    title={item.value || "-"}
                  >
                    {item.value || "-"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editable details */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-[#0B2545] mb-4">
            Personal Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className={labelCls}>{field.label}</label>
                {editing ? (
                  field.type === "select" ? (
                    <select
                      value={form[field.name]}
                      onChange={set(field.name)}
                      className={inputCls}
                    >
                      <option value="">Select...</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={form[field.name]}
                      onChange={set(field.name)}
                      className={inputCls}
                    />
                  )
                ) : (
                  <p className={viewCls}>
                    {profile?.[field.name] || "-"}
                  </p>
                )}
              </div>
            ))}

            <div className="sm:col-span-2">
              <label className={labelCls}>Bio</label>
              {editing ? (
                <textarea
                  value={form.bio}
                  onChange={set("bio")}
                  rows={3}
                  className={`${inputCls} resize-none`}
                  placeholder="Tell us about yourself"
                />
              ) : (
                <p className={viewCls}>{profile?.bio || "-"}</p>
              )}
            </div>
          </div>

          {editing && (
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-[#00A86B] hover:bg-[#008f5a] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all duration-200 disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => navigate("/StudentDashboard")}
                className="text-sm font-semibold text-slate-500 hover:text-slate-700 px-3 py-2.5"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
