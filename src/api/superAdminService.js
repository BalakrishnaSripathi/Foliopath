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

export const deleteStaff = (id) => {
  return api.delete(`/api/super-admin/staff/${id}`);
};
