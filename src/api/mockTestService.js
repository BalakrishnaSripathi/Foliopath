import api from "./axios";

// ==================== MOCK TESTS ====================
// Super-admin / staff authoring + student test-taking.
// Backend endpoints live in Foliopath360-LMS (port 8081).

export const OPTION_LABELS = ["A", "B", "C", "D"];

const genCode = (prefix) =>
  prefix +
  "-" +
  Date.now().toString(36).toUpperCase() +
  Math.random().toString(36).slice(2, 5).toUpperCase();

const buildPayload = (data) => ({
  title: data.title,
  description: data.description || "",
  durationMinutes: Number(data.durationMinutes) || 15,
  passPercentage: Number(data.passPercentage) || 50,
  displayOrder: Number(data.displayOrder) || 1,
  questions: (data.questions || []).map(normalizeQuestion),
});

function normalizeQuestion(q, i) {
  return {
    questionCode: q.questionCode || genCode("QST"),
    questionType: q.questionType === "CODE" ? "CODE" : "TEXT",
    questionText: q.questionText || "",
    codeContent: q.codeContent || "",
    codeLanguage: q.codeLanguage || "",
    options: (q.options || []).slice(0, 4).map((opt, j) => ({
      label: opt?.label || OPTION_LABELS[j],
      text: opt?.text || "",
      displayOrder: j + 1,
    })),
    correctOption: q.correctOption || "A",
    displayOrder: Number(q.displayOrder) || i + 1,
  };
}

export const getMockTests = (moduleId) => {
  return api.get(`/api/modules/${moduleId}/mock-tests`);
};

export const getMockTest = (mockTestId) => {
  return api.get(`/api/mock-tests/${mockTestId}`);
};

export const createMockTest = (moduleId, data) => {
  const payload = {
    testCode: data.testCode || genCode("MTS"),
    ...buildPayload(data),
  };
  return api.post(`/api/modules/${moduleId}/mock-tests`, payload);
};

export const updateMockTest = (mockTestId, data) => {
  return api.put(`/api/mock-tests/${mockTestId}`, buildPayload(data));
};

export const deleteMockTest = (mockTestId) => {
  return api.delete(`/api/mock-tests/${mockTestId}`);
};

export const submitMockTestAttempt = (mockTestId, answers) => {
  return api.post(`/api/mock-tests/${mockTestId}/attempts`, { answers });
};
