import { useState, useEffect } from "react";
import { Contact, Mail, Phone, RefreshCw, MapPin, Briefcase } from "lucide-react";
import { contactUsApi } from "../../api/contactUsController";

const POSITION_LABELS = {
  STUDENT: "Student",
  DEVELOPER: "Developer",
  WORKING_PROFESSIONAL: "Working Professional",
  FREELANCER: "Freelancer",
  DEVOPS_ENGINEER: "DevOps Engineer",
  TEST_ENGINEER: "Test Engineer",
  QA_ENGINEER: "QA Engineer",
  OTHER: "Other",
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ContactUsTable() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadContacts = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await contactUsApi.getAllContactUs();
      setContacts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load contact requests:", err);
      setError(
        err.response?.data?.message || "Failed to load contact requests"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-[#0B2545]">Contact Requests</h2>
          <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold">
            {contacts.length}
          </span>
          <Contact className="w-5 h-5 text-slate-400 ml-1" />
        </div>
        <button
          onClick={loadContacts}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#00A86B] hover:text-[#008f5a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {loading && contacts.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A86B] mx-auto" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-12">
          <Contact className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No contact requests yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-3 px-4 font-semibold text-slate-600">
                  Name
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 hidden sm:table-cell">
                  Mobile
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 hidden md:table-cell">
                  Position
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 hidden lg:table-cell">
                  Location
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 hidden sm:table-cell">
                  Submitted On
                </th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="font-semibold text-[#0B2545] block">
                      {contact.fullName}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {contact.email}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 hidden sm:table-cell">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {contact.mobileNumber}
                    </span>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
                      <Briefcase className="w-3 h-3" />
                      {POSITION_LABELS[contact.currentPosition] ||
                        contact.currentPosition}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 hidden lg:table-cell">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {contact.location || "-"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-xs hidden sm:table-cell whitespace-nowrap">
                    {formatDate(contact.createdDt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
