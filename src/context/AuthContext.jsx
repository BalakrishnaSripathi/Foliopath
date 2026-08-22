import { createContext, useContext, useState, useEffect } from "react";
import { logout as logoutApi } from "../api/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("accessToken"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    const storedRole = localStorage.getItem("role");
    const storedUser = localStorage.getItem("user");
    if (storedToken) {
      setToken(storedToken);
      setRole(storedRole);
      if (storedUser) {
        try { setUser(JSON.parse(storedUser)); } catch { /* ignore */ }
      }
    }
    setLoading(false);
  }, []);

  const loginUser = (loginData) => {
    const accessToken = loginData.accessToken;
    const refreshToken = loginData.refreshToken;
    const userData = loginData.user;
    const userRole = userData?.roles?.[0] || "STUDENT";

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("role", userRole);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(accessToken);
    setRole(userRole);
    setUser(userData);
  };

  const logout = async () => {
    const refreshTokenValue = localStorage.getItem("refreshToken");
    try {
      if (refreshTokenValue) {
        await logoutApi(refreshTokenValue);
      }
    } catch {
      // clear locally even if the API call fails
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      setToken(null);
      setRole(null);
      setUser(null);
    }
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{ token, role, user, loading, isAuthenticated, loginUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
