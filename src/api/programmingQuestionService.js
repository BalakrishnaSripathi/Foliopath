import api from "./axios";

export const SUPPORTED_PROGRAMMING_LANGUAGES = ["JAVA", "PYTHON", "JAVASCRIPT"];

export const LANGUAGE_LABELS = {
  JAVA: "Java",
  PYTHON: "Python",
  JAVASCRIPT: "JavaScript",
};

const buildPayload = (data) => ({
  title: (data.title || "").trim(),
  problemStatement: data.problemStatement || "",
  difficulty: data.difficulty || "MEDIUM",
  allowedLanguages: Array.isArray(data.allowedLanguages) && data.allowedLanguages.length > 0
    ? data.allowedLanguages
    : SUPPORTED_PROGRAMMING_LANGUAGES,
  inputFormat: data.inputFormat || "",
  outputFormat: data.outputFormat || "",
  constraints: data.constraints || "",
  sampleInput: data.sampleInput || "",
  sampleOutput: data.sampleOutput || "",
  displayOrder: Number(data.displayOrder) || 1,
  testCases: (data.testCases || []).map((tc, i) => ({
    input: tc.input || "",
    expectedOutput: tc.expectedOutput || "",
    isPublic: tc.isPublic !== false,
    displayOrder: Number(tc.displayOrder) || i + 1,
  })),
});

export const getProgrammingQuestions = (courseId) =>
  api.get(`/api/programming-questions/course/${courseId}`);

export const getProgrammingQuestion = (questionId) =>
  api.get(`/api/programming-questions/${questionId}`);

export const createProgrammingQuestion = (courseId, data) =>
  api.post(`/api/programming-questions/course/${courseId}`, buildPayload(data));

export const updateProgrammingQuestion = (questionId, data) =>
  api.put(`/api/programming-questions/${questionId}`, buildPayload(data));

export const deleteProgrammingQuestion = (questionId) =>
  api.delete(`/api/programming-questions/${questionId}`);

export const runProgrammingQuestion = (questionId, language, code, input = "") =>
  api.post(`/api/programming-questions/${questionId}/run`, {
    language,
    code,
    input: input || "",
  });

export const submitProgrammingQuestion = (questionId, language, code) =>
  api.post(`/api/programming-questions/${questionId}/submit`, {
    language,
    code,
  });

export const getProgrammingQuestionSubmissions = (questionId) =>
  api.get(`/api/programming-questions/${questionId}/submissions`);