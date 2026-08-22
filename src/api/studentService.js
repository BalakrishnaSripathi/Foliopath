import api from "./axios";

// ==================== STUDENT DASHBOARD ====================

export const getStudentDashboard = () => {
  return api.get("/api/student/dashboard");
};

// ==================== STUDENT PROFILE ====================

export const getStudentProfile = () => {
  return api.get("/api/student/profile");
};

export const updateStudentProfile = (data) => {
  return api.put("/api/student/profile", {
    dateOfBirth: data.dateOfBirth || null,
    gender: data.gender || null,
    qualification: data.qualification || "",
    occupation: data.occupation || "",
    bio: data.bio || "",
    address: data.address || "",
    city: data.city || "",
    state: data.state || "",
    country: data.country || "",
  });
};
