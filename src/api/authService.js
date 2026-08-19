import api from "./axios";

export const register = (data) => {
  return api.post("/auth/register", {
    name: data.name,
    email: data.email,
    password: data.password,
    mobileNumber: data.mobile,
    role: data.role || "STUDENT",
  });
};

export const login = (data) => {
  return api.post("/auth/login", {
    email: data.email,
    password: data.password,
  });
};

export const forgotPassword = (email) => {
  return api.post("/auth/forgot-password", { email });
};

export const verifyOtp = (email, otp) => {
  return api.post("/auth/verify-otp", { email, otp });
};

export const resetPassword = (email, otp, newPassword) => {
  return api.post("/auth/reset-password", { email, otp, newPassword });
};
