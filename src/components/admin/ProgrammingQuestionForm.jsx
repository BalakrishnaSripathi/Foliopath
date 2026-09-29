import { useState } from "react";
import { Plus, Save, X } from "lucide-react";
import { SUPPORTED_PROGRAMMING_LANGUAGES } from "../../api/programmingQuestionService";
import { DIFFICULTY_LEVELS, newTestCase } from "./programmingQuestionFormMeta";
import RichTextEditor from "../RichTextEditor";

let seq = 1000;

function TestCaseEditor({ testCase, index, onChange, onRemove }) {
  const monoCls =
    "w-full px-3 py-2 text-sm font-mono bg-[#0B2545] text-green-400 rounded-lg border border-slate-700 focus:outline-none resize-y";

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500">Test Case {index + 1}</span>
        {onRemove && (
          <button type="button" onClick={onRemove} className="p-1 text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 tracking-wide">
            Input
          </label>
          <textarea
            value={testCase.input || ""}
            onChange={(e) => onChange({ ...testCase, input: e.target.value })}
            rows={3}
            className={monoCls}
            placeholder="Program input fed to stdin"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 tracking-wide">
            Expected Output
          </label>
          <textarea
            value={testCase.expectedOutput || ""}
            onChange={(e) => onChange({ ...testCase, expectedOutput: e.target.value })}
            rows={3}
            className={monoCls}
            placeholder="Exact expected program output"
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 cursor-pointer">
        <input
          type="checkbox"
          checked={testCase.isPublic !== false}
          onChange={(e) => onChange({ ...testCase, isPublic: e.target.checked })}
          className="w-3.5 h-3.5 accent-[#00A86B]"
        />
        Public test case (visible to students)
      </label>
    </div>
  );
}

export default function ProgrammingQuestionForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(() => ({
    ...initial,
    testCases: (initial.testCases || []).map((tc) => ({
      ...tc,
      _key: tc._key || `tc-${++seq}`,
    })),
  }));

  const inputCls =
    "w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:border-[#00A86B] focus:outline-none";
  const labelCls =
    "block text-xs font-semibold text-slate-500 uppercase mb-1 tracking-wide";

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const setTestCase = (index, patch) =>
    setForm((prev) => ({
      ...prev,
      testCases: prev.testCases.map((tc, i) => (i === index ? { ...tc, ...patch } : tc)),
    }));

  const addTestCase = () =>
    setForm((prev) => ({
      ...prev,
      testCases: [
        ...prev.testCases,
        { ...newTestCase(), displayOrder: prev.testCases.length + 1 },
      ],
    }));

  const removeTestCase = (index) =>
    setForm((prev) => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== index),
    }));

  const toggleLanguage = (lang) =>
    setForm((prev) => {
      const has = prev.allowedLanguages.includes(lang);
      return {
        ...prev,
        allowedLanguages: has
          ? prev.allowedLanguages.filter((l) => l !== lang)
          : [...prev.allowedLanguages, lang],
      };
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      displayOrder: Number(form.displayOrder) || 1,
      testCases: form.testCases.map(({ _key, ...tc }, i) => ({
        ...tc,
        displayOrder: i + 1,
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-100 p-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className={labelCls}>Question Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={set("title")}
            className={inputCls}
            placeholder="e.g. Two Sum"
          />
        </div>
        <div>
          <label className={labelCls}>Difficulty *</label>
          <select value={form.difficulty} onChange={set("difficulty")} className={inputCls}>
            {DIFFICULTY_LEVELS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Problem Statement *</label>
        <RichTextEditor
          value={form.problemStatement}
          onChange={(html) => setForm((prev) => ({ ...prev, problemStatement: html }))}
          placeholder="Describe the problem, with formatted text if needed"
          minHeight="140px"
        />
      </div>

      <div>
        <label className={labelCls}>Allowed Programming Languages</label>
        <div className="flex flex-wrap gap-2">
          {SUPPORTED_PROGRAMMING_LANGUAGES.map((lang) => {
            const active = form.allowedLanguages.includes(lang);
            return (
              <button
                key={lang}
                type="button"
                onClick={() => toggleLanguage(lang)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                  active
                    ? "bg-[#00A86B] text-white border-[#00A86B]"
                    : "bg-white text-slate-500 border-slate-200 hover:border-[#00A86B] hover:text-[#00A86B]"
                }`}
              >
                {lang}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Input Format</label>
          <textarea
            value={form.inputFormat}
            onChange={set("inputFormat")}
            rows={2}
            className={`${inputCls} resize-y`}
            placeholder="Describe the input format"
          />
        </div>
        <div>
          <label className={labelCls}>Output Format</label>
          <textarea
            value={form.outputFormat}
            onChange={set("outputFormat")}
            rows={2}
            className={`${inputCls} resize-y`}
            placeholder="Describe the output format"
          />
        </div>
        <div>
          <label className={labelCls}>Constraints</label>
          <textarea
            value={form.constraints}
            onChange={set("constraints")}
            rows={2}
            className={`${inputCls} resize-y`}
            placeholder="e.g. 1 <= nums.length <= 10^4"
          />
        </div>
        <div>
          <label className={labelCls}>Display Order</label>
          <input
            type="number"
            value={form.displayOrder}
            onChange={set("displayOrder")}
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Sample Input</label>
          <textarea
            value={form.sampleInput}
            onChange={set("sampleInput")}
            rows={3}
            className={`${inputCls} resize-y font-mono`}
            placeholder="Sample input shown to students"
          />
        </div>
        <div>
          <label className={labelCls}>Sample Output</label>
          <textarea
            value={form.sampleOutput}
            onChange={set("sampleOutput")}
            rows={3}
            className={`${inputCls} resize-y font-mono`}
            placeholder="Expected output for the sample input"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelCls}>Test Cases</label>
          <button
            type="button"
            onClick={addTestCase}
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add Test Case
          </button>
        </div>
        {form.testCases.length === 0 ? (
          <p className="text-xs text-slate-400">
            No test cases yet. Add at least one to grade submissions.
          </p>
        ) : (
          <div className="space-y-3">
            {form.testCases.map((tc, i) => (
              <TestCaseEditor
                key={tc._key}
                testCase={tc}
                index={i}
                onChange={(patch) => setTestCase(i, patch)}
                onRemove={() => removeTestCase(i)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <button
          type="submit"
          disabled={saving || !form.title.trim() || !form.problemStatement.trim()}
          className="flex items-center gap-1.5 bg-[#00A86B] hover:bg-[#008f5a] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? "Saving..." : "Save Question"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 p-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
