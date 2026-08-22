import api from "./axios";

// ==================== ENROLLMENT ====================

export const enrollInCourse = (courseId) => {
  return api.post(`/api/student/enrollments/${courseId}`);
};

export const getMyEnrollments = () => {
  return api.get("/api/student/enrollments");
};

export const getEnrollment = (courseId) => {
  return api.get(`/api/student/enrollments/${courseId}`);
};

export const dropEnrollment = (courseId) => {
  return api.delete(`/api/student/enrollments/${courseId}`);
};

// ==================== LESSON PROGRESS ====================

export const markLessonCompleted = (lessonId) => {
  return api.post(`/api/student/progress/lessons/${lessonId}/complete`);
};

export const markLessonIncomplete = (lessonId) => {
  return api.delete(`/api/student/progress/lessons/${lessonId}/complete`);
};

export const getCourseProgress = (courseId) => {
  return api.get(`/api/student/progress/courses/${courseId}`);
};
