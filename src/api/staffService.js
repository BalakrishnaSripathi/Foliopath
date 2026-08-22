import api from "./axios";

// ==================== STAFF DASHBOARD ====================

export const getStaffDashboard = () => {
  return api.get("/api/staff/dashboard");
};
