// ==================== MOCK TESTS (DUMMY / FRONTEND ONLY) ====================
// Temporary in-memory + localStorage implementation so the UI is fully usable
// before the backend exists. Every operation console.logs the payload and the
// REST path it will eventually hit — when the backend is ready, replace each
// function body with the corresponding api.get/post/put/delete call.

const STORAGE_KEY = "foliopath_mock_tests_v1";

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const genCode = (prefix) =>
  prefix + "-" + Date.now().toString(36).toUpperCase() +
  Math.random().toString(36).slice(2, 5).toUpperCase();

const readStore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("[mockTestService] Failed to read store:", err);
    return [];
  }
};

const writeStore = (tests) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
  } catch (err) {
    console.warn("[mockTestService] Failed to write store:", err);
  }
};

export const getMockTests = async (moduleId) => {
  console.log(`GET /api/modules/${moduleId}/mock-tests`);
  await delay();
  const tests = readStore()
    .filter((t) => String(t.moduleId) === String(moduleId))
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  return { data: tests };
};

export const getMockTest = async (mockTestId) => {
  console.log(`GET /api/mock-tests/${mockTestId}`);
  await delay();
  const test = readStore().find((t) => String(t.id) === String(mockTestId));
  if (!test) {
    throw new Error("Mock test not found");
  }
  return { data: test };
};

export const createMockTest = async (moduleId, data) => {
  const payload = {
    moduleId,
    testCode: data.testCode || "MTS-" + Date.now().toString(36).toUpperCase(),
    title: data.title,
    description: data.description || "",
    durationMinutes: Number(data.durationMinutes) || 15,
    passPercentage: Number(data.passPercentage) || 50,
    displayOrder: Number(data.displayOrder) || 1,
    questions: (data.questions || []).map(normalizeQuestion),
  };
  console.log(`POST /api/modules/${moduleId}/mock-tests`, payload);
  await delay();
  const store = readStore();
  const created = { ...payload, id: genCode("mts") };
  store.push(created);
  writeStore(store);
  return { data: created };
};

export const updateMockTest = async (mockTestId, data) => {
  const payload = {
    title: data.title,
    description: data.description || "",
    durationMinutes: Number(data.durationMinutes) || 15,
    passPercentage: Number(data.passPercentage) || 50,
    displayOrder: Number(data.displayOrder) || 1,
    questions: (data.questions || []).map(normalizeQuestion),
  };
  console.log(`PUT /api/mock-tests/${mockTestId}`, payload);
  await delay();
  const store = readStore();
  const index = store.findIndex((t) => String(t.id) === String(mockTestId));
  if (index === -1) {
    throw new Error("Mock test not found");
  }
  store[index] = { ...store[index], ...payload };
  writeStore(store);
  return { data: store[index] };
};

export const deleteMockTest = async (mockTestId) => {
  console.log(`DELETE /api/mock-tests/${mockTestId}`);
  await delay();
  const store = readStore().filter((t) => String(t.id) !== String(mockTestId));
  writeStore(store);
  return { data: true };
};

export const submitMockTestAttempt = async (mockTestId, answers) => {
  console.log(`POST /api/mock-tests/${mockTestId}/attempts`, answers);
  await delay();
  const test = readStore().find((t) => String(t.id) === String(mockTestId));
  if (!test) {
    throw new Error("Mock test not found");
  }
  let correct = 0;
  test.questions.forEach((q) => {
    if (answers[q.id] && answers[q.id] === q.correctOption) correct += 1;
  });
  const total = test.questions.length || 1;
  const percentage = Math.round((correct / total) * 100);
  return {
    data: {
      attemptId: genCode("att"),
      score: correct,
      total: test.questions.length,
      percentage,
      passed: percentage >= (test.passPercentage || 50),
    },
  };
};

function normalizeQuestion(q, i) {
  return {
    questionCode: q.questionCode ||
      "QST-" + Date.now().toString(36).toUpperCase() + "-" + (i + 1),
    questionType: q.questionType === "CODE" ? "CODE" : "TEXT",
    questionText: q.questionText || "",
    codeContent: q.codeContent || "",
    codeLanguage: q.codeLanguage || "",
    options: (q.options || []).slice(0, 4).map((opt, j) => ({
      label: OPTION_LABELS[j],
      text: opt?.text || "",
    })),
    correctOption: q.correctOption || "A",
    displayOrder: Number(q.displayOrder) || i + 1,
  };
}

export const OPTION_LABELS = ["A", "B", "C", "D"];
