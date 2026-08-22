import api from "./axios";

// ==================== COURSES ====================

export const getAllCourses = () => {
  return api.get("/api/courses");
};

export const getPublishedCourses = () => {
  return api.get("/api/courses/published");
};

export const getCourseById = (courseId) => {
  return api.get(`/api/courses/${courseId}`);
};

export const getCourseBySlug = (slug) => {
  return api.get(`/api/courses/slug/${slug}`);
};

export const createCourse = (data) => {
  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const courseCode = "CRS-" + Date.now().toString(36).toUpperCase();
  return api.post("/api/courses", {
    courseCode,
    title: data.title,
    slug,
    shortDescription: data.shortDescription || "",
    description: data.description || "",
    thumbnailUrl: data.thumbnailUrl || "",
    level: data.level || "BEGINNER",
    language: data.language || "English",
    price: data.price || 0,
  });
};

export const updateCourse = (courseId, data) => {
  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return api.put(`/api/courses/${courseId}`, {
    courseCode: data.courseCode,
    title: data.title,
    slug,
    shortDescription: data.shortDescription || "",
    description: data.description || "",
    thumbnailUrl: data.thumbnailUrl || "",
    level: data.level || "BEGINNER",
    language: data.language || "English",
    price: data.price || 0,
  });
};

export const deleteCourse = (courseId) => {
  return api.delete(`/api/courses/${courseId}`);
};

export const publishCourse = (courseId) => {
  return api.post(`/api/courses/${courseId}/publish`);
};

export const unpublishCourse = (courseId) => {
  return api.post(`/api/courses/${courseId}/unpublish`);
};

export const archiveCourse = (courseId) => {
  return api.post(`/api/courses/${courseId}/archive`);
};

// ==================== MODULES ====================

export const getModules = (courseId) => {
  return api.get(`/api/courses/${courseId}/modules`);
};

export const addModule = (courseId, data) => {
  const moduleCode = "MOD-" + Date.now().toString(36).toUpperCase();
  return api.post(`/api/courses/${courseId}/modules`, {
    moduleCode,
    title: data.title,
    description: data.description || "",
    displayOrder: data.displayOrder || 1,
  });
};

export const updateModule = (courseId, moduleId, data) => {
  return api.put(`/api/courses/${courseId}/modules/${moduleId}`, {
    moduleCode: data.moduleCode,
    title: data.title,
    description: data.description || "",
    displayOrder: data.displayOrder || 1,
  });
};

export const deleteModule = (courseId, moduleId) => {
  return api.delete(`/api/courses/${courseId}/modules/${moduleId}`);
};

export const getModuleById = (courseId, moduleId) => {
  return api.get(`/api/courses/${courseId}/modules/${moduleId}`);
};

export const reorderModules = (courseId, modules) => {
  return api.patch(`/api/courses/${courseId}/modules/reorder`, {
    entries: modules.map((m, i) => ({ id: m.id, displayOrder: i + 1 })),
  });
};

// ==================== LESSONS ====================

export const getLessons = (moduleId) => {
  return api.get(`/api/modules/${moduleId}/lessons`);
};

export const getLesson = (moduleId, lessonId) => {
  return api.get(`/api/modules/${moduleId}/lessons/${lessonId}`);
};

export const addLesson = (moduleId, data) => {
  const lessonCode =
    data.lessonCode || "LES-" + Date.now().toString(36).toUpperCase();
  return api.post(`/api/modules/${moduleId}/lessons`, {
    lessonCode,
    title: data.title,
    description: data.description || "",
    lessonType: data.lessonType || "TEXT_ONLY",
    contentType: data.contentType || "TEXT",
    content: data.content || "",
    codeContent: data.codeContent || "",
    codeLanguage: data.codeLanguage || "",
    documentUrl: data.documentUrl || "",
    displayOrder: Number(data.displayOrder) || 1,
    estimatedMinutes: Number(data.estimatedMinutes) || 10,
    items: (data.items || []).map((it, i) => ({
      title: it.title,
      description: it.description || "",
      content: it.content || "",
      codeContent: it.codeContent || "",
      codeLanguage: it.codeLanguage || "",
      displayOrder: Number(it.displayOrder) || i + 1,
    })),
  });
};

export const updateLesson = (moduleId, lessonId, data) => {
  return api.put(`/api/modules/${moduleId}/lessons/${lessonId}`, {
    lessonCode: data.lessonCode,
    title: data.title,
    description: data.description || "",
    lessonType: data.lessonType || "TEXT_ONLY",
    contentType: data.contentType || "TEXT",
    content: data.content || "",
    codeContent: data.codeContent || "",
    codeLanguage: data.codeLanguage || "",
    documentUrl: data.documentUrl || "",
    displayOrder: Number(data.displayOrder) || 1,
    estimatedMinutes: Number(data.estimatedMinutes) || 10,
    items: (data.items || []).map((it, i) => ({
      title: it.title,
      description: it.description || "",
      content: it.content || "",
      codeContent: it.codeContent || "",
      codeLanguage: it.codeLanguage || "",
      displayOrder: Number(it.displayOrder) || i + 1,
    })),
  });
};

export const deleteLesson = (moduleId, lessonId) => {
  return api.delete(`/api/modules/${moduleId}/lessons/${lessonId}`);
};

export const reorderLessons = (moduleId, lessons) => {
  return api.patch(`/api/modules/${moduleId}/lessons/reorder`, {
    entries: lessons.map((l, i) => ({ id: l.id, displayOrder: i + 1 })),
  });
};

// ==================== LESSON ITEMS ====================

export const addLessonItem = (moduleId, lessonId, data, index = 0) => {
  return api.post(`/api/modules/${moduleId}/lessons/${lessonId}/items`, {
    title: data.title,
    description: data.description || "",
    content: data.content || "",
    codeContent: data.codeContent || "",
    codeLanguage: data.codeLanguage || "",
    displayOrder: Number(data.displayOrder) || index + 1,
  });
};

export const updateLessonItem = (moduleId, lessonId, itemId, data) => {
  return api.put(`/api/modules/${moduleId}/lessons/${lessonId}/items/${itemId}`, {
    title: data.title,
    description: data.description || "",
    content: data.content || "",
    codeContent: data.codeContent || "",
    codeLanguage: data.codeLanguage || "",
    displayOrder: Number(data.displayOrder) || 1,
  });
};

export const deleteLessonItem = (moduleId, lessonId, itemId) => {
  return api.delete(
    `/api/modules/${moduleId}/lessons/${lessonId}/items/${itemId}`
  );
};

export const reorderLessonItems = (moduleId, lessonId, items) => {
  return api.patch(`/api/modules/${moduleId}/lessons/${lessonId}/items/reorder`, {
    entries: items.map((it, i) => ({ id: it.id, displayOrder: i + 1 })),
  });
};

// ==================== DASHBOARD ====================

