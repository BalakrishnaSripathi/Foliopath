import api from "./axios";

// ==================== CAPTCHA ====================

export const getCaptcha = () => {
  return api.get("/api/auth/captcha");
};

// ==================== REGISTRATION (STUDENT) ====================

export const registerStudent = (data) => {
  return api.post("/api/auth/student/register", {
    username: data.username,
    email: data.email,
    password: data.password,
    confirmPassword: data.confirmPassword,
    firstName: data.firstName,
    lastName: data.lastName || "",
    mobileNumber: data.mobileNumber || "",
  });
};

export const verifyOtp = (email, otp) => {
  return api.post("/api/auth/student/verify-otp", { email, otp });
};

export const resendOtp = (email) => {
  return api.post("/api/auth/student/resend-otp", { email });
};

// ==================== STAFF PASSWORD SETUP ====================

export const setStaffPassword = ({ token, newPassword, confirmPassword }) => {
  return api.post("/api/auth/staff/set-password", {
    token,
    newPassword,
    confirmPassword,
  });
};

// ==================== PASSWORD RESET (STUDENT) ====================

export const forgotPassword = (email) => {
  return api.post("/api/auth/student/forgot-password", { email });
};

export const resetPassword = ({ email, otp, newPassword, confirmPassword }) => {
  return api.post("/api/auth/student/reset-password", {
    email,
    otp,
    newPassword,
    confirmPassword,
  });
};

// ==================== SESSION ====================

export const login = ({ usernameOrEmail, password, captchaId, captchaCode }) => {
  return api.post("/api/auth/login", {
    usernameOrEmail,
    password,
    captchaId,
    captchaCode,
  });
};

export const refreshToken = (refreshToken) => {
  return api.post("/api/auth/refresh-token", { refreshToken });
};

export const logout = (refreshToken) => {
  return api.post("/api/auth/logout", { refreshToken });
};

export const getCurrentUser = () => {
  return api.get("/api/auth/me");
};
