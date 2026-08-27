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
  });
};

export const deleteKitQuestion = (kitId, questionId) => {
  return api.delete(`/api/interview-kits/${kitId}/questions/${questionId}`);
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
