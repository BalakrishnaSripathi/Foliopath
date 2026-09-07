import api from "./axios";

/**
 * Maps the language value stored by the admin (e.g. "java", "python",
 * "javascript") to the canonical execution language consumed by the backend.
 */
export const normalizeExecutionLanguage = (lang) => {
  const value = (lang || "").trim().toUpperCase();
  if (value === "JS" || value === "NODE") return "JAVASCRIPT";
  if (value === "JAVA") return "JAVA";
  if (value === "PYTHON" || value === "PY") return "PYTHON";
  return value;
};

export const isExecutableLanguage = (lang) => {
  return ["JAVA", "PYTHON", "JAVASCRIPT"].includes(
    normalizeExecutionLanguage(lang)
  );
};

// ==================== CODE EXECUTION ====================

/**
 * Sends the student's CURRENT editor code to the backend for execution.
 * This endpoint never touches the admin's starter code.
 */
export const executeCode = (language, code, input = "") => {
  return api.post("/api/code/execute", {
    language: normalizeExecutionLanguage(language),
    code,
    input: input || "",
  });
};