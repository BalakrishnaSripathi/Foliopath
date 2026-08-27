import { useState } from "react";
import { X } from "lucide-react";
import { createKit, updateKit } from "../../api/interviewKitService";

export default function KitFormModal({ kit, onClose, onSaved }) {
  const isEdit = !!kit;
  const [form, setForm] = useState({
    name: kit?.name || "",
    description: kit?.description || "",
    thumbnailUrl: kit?.thumbnailUrl || "",
    level: kit?.level || "BEGINNER",
    price: kit?.price || 0,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Kit name is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setError("");
    try {
      if (isEdit) {
        await updateKit(kit.id, form);
      } else {
        await createKit(form);
      }
      onSaved?.();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save kit");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:border-[#00A86B] focus:bg-white focus:outline-none transition-all duration-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-lg font-bold text-[#0B2545]">
            {isEdit ? "Edit Interview Kit" : "Create Interview Kit"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
              Kit Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={set("name")}
              className={`${inputCls} ${errors.name ? "border-red-400" : ""}`}
              placeholder="e.g. Java Full Stack Interview Kit"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={set("description")}
              className={`${inputCls} resize-none`}
              rows={3}
              placeholder="Brief description of the kit..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
              Thumbnail URL
            </label>
            <input
              type="url"
              value={form.thumbnailUrl}
              onChange={set("thumbnailUrl")}
              className={inputCls}
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Level *
              </label>
              <select
                value={form.level}
                onChange={set("level")}
                className={inputCls}
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Price (₹)
              </label>
              <input
                type="number"
                value={form.price}
                onChange={set("price")}
                className={inputCls}
                min={0}
                step={1}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100 sticky bottom-0 bg-white rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-[#00A86B] hover:bg-[#008f5a] text-white text-sm font-bold rounded-xl shadow-md transition-all duration-200 disabled:opacity-60"
          >
            {saving ? "Saving..." : isEdit ? "Update Kit" : "Create Kit"}
          </button>
        </div>
      </div>
    </div>
  );
}
