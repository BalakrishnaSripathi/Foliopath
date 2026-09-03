import api from "./axios";

// ==================== SUPER ADMIN DASHBOARD ====================

export const getSuperAdminDashboard = () => {
  return api.get("/api/super-admin/dashboard");
};

// ==================== STAFF MANAGEMENT ====================

export const getAllStaff = () => {
  return api.get("/api/super-admin/staff");
};

export const getStaffById = (id) => {
  return api.get(`/api/super-admin/staff/${id}`);
};

export const createStaff = (data) => {
  return api.post("/api/super-admin/staff", {
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName || "",
    mobileNumber: data.mobileNumber || "",
    designation: data.designation || "",
    department: data.department || "",
    qualification: data.qualification || "",
    specialization: data.specialization || "",
  });
};

export const updateStaff = (id, data) => {
  return api.put(`/api/super-admin/staff/${id}`, {
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName || "",
    mobileNumber: data.mobileNumber || "",
    designation: data.designation || "",
    department: data.department || "",
    qualification: data.qualification || "",
    specialization: data.specialization || "",
  });
};

export const updateStaffStatus = (id, enabled) => {
  return api.patch(`/api/super-admin/staff/${id}/status`, { enabled });
};

export const resendStaffSetupLink = (id) => {
  return api.post(`/api/super-admin/staff/${id}/resend-setup-link`);
};

export const resetStaffPassword = (id, { newPassword, confirmPassword }) => {
  return api.patch(`/api/super-admin/staff/${id}/reset-password`, {
    newPassword,
    confirmPassword,
  });
};

export const deleteStaff = (id) => {
  return api.delete(`/api/super-admin/staff/${id}`);
};

// ==================== STUDENT MANAGEMENT ====================

export const getAllStudents = (search) => {
  return api.get("/api/super-admin/students", {
    params: search ? { search } : undefined,
  });
};

export const getStudentDetail = (id) => {
  return api.get(`/api/super-admin/students/${id}`);
};

export const getStudentProfileById = (id) => {
  return api.get(`/api/super-admin/students/${id}/profile`);
};

export const updateStudentStatus = (id, enabled) => {
  return api.patch(`/api/super-admin/students/${id}/status`, { enabled });
};

export const resetStudentPasswordByAdmin = (
  id,
  { newPassword, confirmPassword }
) => {
  return api.patch(`/api/super-admin/students/${id}/reset-password`, {
    newPassword,
    confirmPassword,
  });
};

// ==================== ENROLLMENT (SUPER_ADMIN) ====================

export const adminEnrollStudent = (studentId, courseId, options = {}) => {
  const payload = { studentId, courseId };
  if (options.amountPaid != null) payload.amountPaid = options.amountPaid;
  if (options.discountAmount != null) payload.discountAmount = options.discountAmount;
  if (options.discountPercentage != null) payload.discountPercentage = options.discountPercentage;
  if (options.paymentMethod) payload.paymentMethod = options.paymentMethod;
  if (options.remarks) payload.remarks = options.remarks;
  return api.post("/api/super-admin/enrollments", payload);
};

export const getStudentEnrollments = (studentId) => {
  return api.get(`/api/super-admin/students/${studentId}/enrollments`);
};

export const adminUnenrollStudent = (studentId, courseId, refundAmount) => {
  return api.post("/api/super-admin/enrollments/unenroll", {
    studentId,
    courseId,
    refundAmount,
  });
};

// Payment info (amount paid at enrollment, course fee, discount) per course
export const getStudentPayments = (studentId) => {
  return api.get(`/api/super-admin/students/${studentId}/payments`);
};

// ==================== KIT ENROLLMENT (SUPER_ADMIN) ====================

export const adminEnrollStudentInKit = (studentId, kitId, options = {}) => {
  const payload = { studentId, kitId };
  if (options.amountPaid != null) payload.amountPaid = options.amountPaid;
  if (options.discountAmount != null) payload.discountAmount = options.discountAmount;
  if (options.discountPercentage != null) payload.discountPercentage = options.discountPercentage;
  if (options.paymentMethod) payload.paymentMethod = options.paymentMethod;
  if (options.remarks) payload.remarks = options.remarks;
  return api.post("/api/super-admin/kit-enrollments", payload);
};

export const getStudentKitEnrollments = (studentId) => {
  return api.get(`/api/super-admin/students/${studentId}/kit-enrollments`);
};

export const adminUnenrollStudentInKit = (studentId, kitId, refundAmount) => {
  return api.post("/api/super-admin/kit-enrollments/unenroll", {
    studentId,
    kitId,
    refundAmount,
  });
};

export const getStudentKitPayments = (studentId) => {
  return api.get(`/api/super-admin/students/${studentId}/kit-payments`);
};

// ==================== STUDENT REPORTS (SUPER_ADMIN + STAFF) ====================

export const getAllStudentsReport = (search) => {
  return api.get("/api/reports/students", {
    params: search ? { search } : undefined,
  });
};

// Status + enrolled courses + performance summary + mock test scores
export const getStudentPerformance = (id) => {
  return api.get(`/api/reports/students/${id}/performance`);
};
