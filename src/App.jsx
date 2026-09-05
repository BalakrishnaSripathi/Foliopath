import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import FoliopathLandingPage from "./components/FoliopathLandingPage";
import AboutUs from "./pages/AboutUs";
import ContactUsPage from "./pages/ContactUsPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import VerifyOtp from "./pages/VerifyOtp";
import SetPassword from "./pages/SetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminShell from "./components/admin/AdminShell";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import StaffDashboard from "./pages/staff/StaffDashboard";
import AdminCourseForm from "./pages/admin/AdminCourseForm";
import AdminCourseContent from "./pages/admin/AdminCourseContent";
import AdminMockTest from "./pages/admin/AdminMockTest";
import CourseCatalog from "./pages/student/CourseCatalog";
import CourseDetail from "./pages/student/CourseDetail";
import KitCatalog from "./pages/KitCatalog";
import KitDetail from "./pages/KitDetail";
import StudentShell from "./pages/student/StudentShell";
import StudentDashboard from "./pages/student/StudentDashboard";
import CartPage from "./pages/student/CartPage";

function HomeRedirect() {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A86B]" />
      </div>
    );
  }

  if (isAuthenticated && role === "STUDENT") {
    return <Navigate to="/StudentDashboard" replace />;
  }

  return <FoliopathLandingPage />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/set-password" element={<SetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/login" element={<Login />} />

          {/* Public course browsing */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUsPage />} />
          <Route path="/courses" element={<CourseCatalog />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          <Route path="/interview-kits" element={<KitCatalog />} />
          <Route path="/interview-kits/:kitId" element={<KitDetail />} />

          {/* Super Admin / Admin — nested under AdminShell layout */}
          <Route
            path="/super-admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <AdminShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<SuperAdminDashboard />} />
            <Route path="courses/:courseId/content" element={<AdminCourseContent />} />
            <Route path="courses/:courseId/modules/:moduleId/mock-tests" element={<AdminMockTest />} />
          </Route>
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN", "STAFF"]}>
                <AdminShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<SuperAdminDashboard />} />
            <Route path="courses/:courseId/content" element={<AdminCourseContent />} />
            <Route path="courses/:courseId/modules/:moduleId/mock-tests" element={<AdminMockTest />} />
          </Route>

          {/* Staff */}
          <Route
            path="/staff/dashboard"
            element={
              <ProtectedRoute allowedRoles={["STAFF"]}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses/new"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN", "STAFF"]}>
                <AdminCourseForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses/:courseId"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN", "STAFF"]}>
                <AdminCourseForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses/:courseId/modules/:moduleId/mock-tests"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN", "STAFF"]}>
                <AdminMockTest />
              </ProtectedRoute>
            }
          />

          {/* Student shell — sidebar + topbar for all student pages */}
          <Route
            path="/StudentDashboard"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="my-courses" element={<StudentDashboard />} />
            <Route path="lessons/:moduleId/:lessonId" element={<StudentDashboard />} />
            <Route path="mock-tests/:mockTestId" element={<StudentDashboard />} />
            <Route path="mock-tests/:mockTestId/result" element={<StudentDashboard />} />
            <Route path="interview-kits" element={<StudentDashboard />} />
            <Route path="progress" element={<StudentDashboard />} />
            <Route path="certificates" element={<StudentDashboard />} />
            <Route path="payments" element={<StudentDashboard />} />
            <Route path="notifications" element={<StudentDashboard />} />
            <Route path="settings" element={<StudentDashboard />} />
          </Route>

          {/* Legacy /my-courses redirect */}
          <Route
            path="/my-courses"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
          </Route>

          {/* Cart & Profile */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <CartPage />
              </ProtectedRoute>
            }
          />
          {/* Profile is now part of Settings tab */}
          <Route
            path="/my-profile"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <Navigate to="/StudentDashboard/settings" replace />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
