import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Play, Copy, RotateCcw, Terminal, AlertCircle, Code2, CheckCircle2 } from "lucide-react";
import CodeEditor from "./CodeEditor";
import { executeCode, normalizeExecutionLanguage } from "../api/codeExecutionService";

const MONACO_LANGUAGE = {
  JAVA: "java",
  PYTHON: "python",
  JAVASCRIPT: "javascript",
};

function mapRunError(err) {
  const msg = err?.response?.data?.message || err?.message || "";
  if (/unauthorized|401/i.test(msg)) {
    return "Your session has expired. Please log in again.";
  }
  if (/unsupported language/i.test(msg)) {
    return "This programming language is not supported for execution yet.";
  }
  return msg || "Failed to run the code. Please try again.";
}

export default function CodePlayground({
  title,
  description,
  language,
  starterCode,
  height = 300,
}) {
  const normalized = normalizeExecutionLanguage(language);
  const monacoLang = MONACO_LANGUAGE[normalized] || "plaintext";

  const [code, setCode] = useState(() => starterCode || "");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [executionTime, setExecutionTime] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setCode(starterCode || "");
  }, [starterCode]);

  const handleRun = async () => {
    setOutput("");
    setError("");
    setExecutionTime(null);
    if (!["JAVA", "PYTHON", "JAVASCRIPT"].includes(normalized)) {
      setError(
        '"' + (language || "Unknown") + '" is not supported for execution. Supported: JAVA, PYTHON, JAVASCRIPT.'
      );
      return;
    }
    setIsRunning(true);
    try {
      const { data } = await executeCode(normalized, code, input);
      setOutput(data.output || "");
      if (data.error) setError(data.error);
      setExecutionTime(data.executionTime);
    } catch (err) {
      setError(mapRunError(err));
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied to clipboard.");
    } catch {
      toast.error("Unable to copy. Please copy manually.");
    }
  };

  const handleClear = () => {
    setCode(starterCode || "");
  };

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2 min-w-0">
          <Code2 className="w-4 h-4 text-[#00A86B] shrink-0" />
          <div className="min-w-0">
            {title && (
              <p className="text-sm font-bold text-[#0B2545] truncate">{title}</p>
            )}
            <p className="text-xs text-slate-400 truncate">
              {normalized || "Code"} playground
            </p>
          </div>
        </div>
        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-[#0B2545] text-white rounded-md shrink-0">
          {normalized || "Code"}
        </span>
      </div>

      {description && (
        <p className="px-4 pt-3 text-sm text-slate-500">{description}</p>
      )}

      {/* Editor */}
      <div className="border-t border-slate-200">
        <CodeEditor
          value={code}
          onChange={(value) => setCode(value || "")}
          language={monacoLang}
          height={height}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-[#00A86B] hover:bg-[#008f5a] text-white shadow-md transition-all duration-150 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Running...
              </span>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                Run Code
              </>
            )}
          </button>
          <button
            onClick={handleClear}
            title="Reset to the admin starter code"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800 transition-all duration-150"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>
          <button
            onClick={handleCopy}
            title="Copy current editor code"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800 transition-all duration-150"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy
          </button>
        </div>
        {executionTime !== null && output !== "" && !error && (
          <span className="text-[10px] font-mono text-slate-400">
            {executionTime} ms
          </span>
        )}
      </div>

      {/* Optional stdin */}
      <div className="px-4 py-3 border-t border-slate-100">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
          Input (optional)
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={2}
          placeholder="Values passed to the program's stdin..."
          className="w-full px-3 py-2 text-sm font-mono bg-slate-50 rounded-xl border border-slate-200 focus:border-[#00A86B] focus:bg-white focus:outline-none transition-all duration-200 resize-none"
        />
      </div>

      {/* Output */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Output
          </label>
          {executionTime !== null && (
            <span className="text-[10px] font-mono text-slate-400">
              took {executionTime} ms
            </span>
          )}
        </div>
        <div
          className={`rounded-xl border font-mono text-xs leading-relaxed min-h-[72px] max-h-64 overflow-auto whitespace-pre-wrap p-3 ${
            error
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-[#0B2545] border-slate-800 text-green-400"
          }`}
        >
          {isRunning ? (
            <div className="flex items-center gap-2 text-slate-400">
              <span className="w-3 h-3 border-2 border-slate-300/40 border-t-slate-300 rounded-full animate-spin" />
              Executing your code...
            </div>
          ) : error ? (
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : output !== "" ? (
            <div className="flex items-start gap-2">
              <Terminal className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{output}</span>
            </div>
          ) : (
            <span className="text-slate-500">
              Press &quot;Run Code&quot; to see the output here.
            </span>
          )}
        </div>
        {!error && output !== "" && (
          <p className="flex items-center gap-1 text-[10px] text-green-600 mt-1">
            <CheckCircle2 className="w-3 h-3" />
            Executed successfully
          </p>
        )}
      </div>
    </div>
  );
}