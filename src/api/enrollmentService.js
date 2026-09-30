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

// ==================== SEQUENTIAL MODULE PROGRESS ====================
//
// Module status is decided by the backend from passed mock tests only:
//
//   Enrollment -> Module 1 OPEN -> pass Mock Test 1 -> Module 1 COMPLETED
//              -> Module 2 OPEN -> ... -> final test passed -> 100%.
//
// The client must render `status` as given; it must never derive OPEN /
// LOCKED / COMPLETED itself, and must never treat "opened a module" as
// progress.

/** Per-module statuses + overall progress for one course. */
export const getCourseModuleProgress = (courseId) => {
  return api.get(`/api/student/progress/courses/${courseId}/modules`);
};

/** Same payload, resolved from a module id. */
export const getModuleProgress = (moduleId) => {
  return api.get(`/api/student/progress/modules/${moduleId}`);
};

/** Progress for every course the student is enrolled in. */
export const getMyModuleProgress = () => {
  return api.get("/api/student/progress/modules");
};
