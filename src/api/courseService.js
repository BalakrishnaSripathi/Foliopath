import api from "./axios";

// ==================== COURSES ====================

export const getAllCourses = () => {
  return api.get("/api/courses");
};

export const searchCourses = (keyword) => {
  return api.get("/api/courses/search", { params: { keyword } });
};

export const getCourseById = (courseId) => {
  return api.get(`/api/courses/${courseId}`);
};

export const getAdminCourses = () => {
  return api.get("/api/courses/admin/all");
};

export const createCourse = (data) => {
  return api.post("/api/courses", data);
};

export const updateCourse = (courseId, data) => {
  return api.put(`/api/courses/${courseId}`, data);
};

export const deleteCourse = (courseId) => {
  return api.delete(`/api/courses/${courseId}`);
};

// ==================== MODULES ====================

export const getModules = (courseId) => {
  return api.get(`/api/courses/${courseId}/modules`);
};

export const addModule = (courseId, data) => {
  return api.post(`/api/courses/${courseId}/modules`, data);
};

export const updateModule = (moduleId, data) => {
  return api.put(`/api/courses/modules/${moduleId}`, data);
};

export const deleteModule = (moduleId) => {
  return api.delete(`/api/courses/modules/${moduleId}`);
};

// ==================== LESSONS ====================

export const getLesson = (lessonId) => {
  return api.get(`/api/courses/lessons/${lessonId}`);
};

export const addLesson = (moduleId, data) => {
  return api.post(`/api/courses/modules/${moduleId}/lessons`, data);
};

export const updateLesson = (lessonId, data) => {
  return api.put(`/api/courses/lessons/${lessonId}`, data);
};

export const deleteLesson = (lessonId) => {
  return api.delete(`/api/courses/lessons/${lessonId}`);
};

// ==================== ENROLLMENTS ====================

export const enrollCourse = (courseId) => {
  return api.post(`/api/courses/${courseId}/enroll`);
};

export const checkEnrolled = (courseId) => {
  return api.get(`/api/courses/${courseId}/enrolled`);
};

export const getMyEnrollments = () => {
  return api.get("/api/courses/my-enrollments");
};

export const getCourseEnrollments = (courseId) => {
  return api.get(`/api/courses/${courseId}/enrollments`);
};

// ==================== REVIEWS ====================

export const getCourseReviews = (courseId) => {
  return api.get(`/api/courses/${courseId}/reviews`);
};

export const addReview = (courseId, data) => {
  return api.post(`/api/courses/${courseId}/reviews`, data);
};

// ==================== DASHBOARD ====================

export const getDashboardStats = () => {
  return api.get("/api/courses/admin/dashboard");
};
