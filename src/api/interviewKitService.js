import api from "./axios";

// ==================== INTERVIEW KITS (ADMIN) ====================

export const getAllKits = () => {
  return api.get("/api/interview-kits");
};

export const getPublishedKits = () => {
  return api.get("/api/interview-kits/published");
};

export const getKitById = (kitId) => {
  return api.get(`/api/interview-kits/${kitId}`);
};

export const createKit = (data) => {
  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return api.post("/api/interview-kits", {
    name: data.name,
    slug,
    description: data.description || "",
    thumbnailUrl: data.thumbnailUrl || "",
    level: data.level || "BEGINNER",
    price: data.price || 0,
  });
};

export const updateKit = (kitId, data) => {
  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return api.put(`/api/interview-kits/${kitId}`, {
    name: data.name,
    slug,
    description: data.description || "",
    thumbnailUrl: data.thumbnailUrl || "",
    level: data.level || "BEGINNER",
    price: data.price || 0,
  });
};

export const deleteKit = (kitId) => {
  return api.delete(`/api/interview-kits/${kitId}`);
};

export const publishKit = (kitId) => {
  return api.post(`/api/interview-kits/${kitId}/publish`);
};

export const unpublishKit = (kitId) => {
  return api.post(`/api/interview-kits/${kitId}/unpublish`);
};

// ==================== QUESTIONS (ADMIN) ====================

export const getKitQuestions = (kitId) => {
  return api.get(`/api/interview-kits/${kitId}/questions`);
};

export const addKitQuestion = (kitId, data) => {
  return api.post(`/api/interview-kits/${kitId}/questions`, {
    questionType: data.questionType || "TEXT",
    codeLanguage: data.codeLanguage || "",
    question: data.question,
    codeSnippet: data.codeSnippet || "",
    answer: data.answer,
    displayOrder: Number(data.displayOrder) || 0,
    moduleId: data.moduleId || null,
  });
};

export const updateKitQuestion = (kitId, questionId, data) => {
  return api.put(`/api/interview-kits/${kitId}/questions/${questionId}`, {
    questionType: data.questionType || "TEXT",
    codeLanguage: data.codeLanguage || "",
    question: data.question,
    codeSnippet: data.codeSnippet || "",
    answer: data.answer,
    displayOrder: Number(data.displayOrder) || 0,
    moduleId: data.moduleId || null,
  });
};

export const deleteKitQuestion = (kitId, questionId) => {
  return api.delete(`/api/interview-kits/${kitId}/questions/${questionId}`);
};

// ==================== MODULES (ADMIN) ====================

export const getKitModules = (kitId) => {
  return api.get(`/api/interview-kits/${kitId}/modules`);
};

export const getAllExistingModules = () => {
  return api.get("/api/interview-kits/existing-modules");
};

export const addKitModule = (kitId, data) => {
  return api.post(`/api/interview-kits/${kitId}/modules`, {
    name: data.name,
    displayOrder: Number(data.displayOrder) || 0,
  });
};

export const attachKitModule = (kitId, moduleId) => {
  return api.post(`/api/interview-kits/${kitId}/modules/${moduleId}/attach`);
};

export const updateKitModule = (kitId, moduleId, data) => {
  return api.put(`/api/interview-kits/${kitId}/modules/${moduleId}`, {
    name: data.name,
    displayOrder: Number(data.displayOrder) || 0,
  });
};

export const deleteKitModule = (kitId, moduleId) => {
  return api.delete(`/api/interview-kits/${kitId}/modules/${moduleId}`);
};

export const reorderKitModules = (kitId, moduleIds) => {
  return api.put(`/api/interview-kits/${kitId}/modules/reorder`, moduleIds);
};

export const reorderKitQuestions = (kitId, questionIds) => {
  return api.put(`/api/interview-kits/${kitId}/questions/reorder`, questionIds);
};

// ==================== STUDENT KIT ENROLLMENT ====================

export const getMyEnrolledKits = () => {
  return api.get("/api/interview-kits/student/enrolled");
};

export const getMyKitEnrollment = (kitId) => {
  return api.get(`/api/interview-kits/student/enrollment/${kitId}`);
};

export const enrollInKit = (kitId) => {
  return api.post(`/api/interview-kits/student/enroll/${kitId}`);
};

export const dropKitEnrollment = (kitId) => {
  return api.delete(`/api/interview-kits/student/enroll/${kitId}`);
};
