import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import FoliopathLandingPage from "./components/FoliopathLandingPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import VerifyOtp from "./pages/VerifyOtp";
import SetPassword from "./pages/SetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import StaffDashboard from "./pages/staff/StaffDashboard";
import AdminCourseForm from "./pages/admin/AdminCourseForm";
import AdminCourseContent from "./pages/admin/AdminCourseContent";
import AdminMockTest from "./pages/admin/AdminMockTest";
import CourseCatalog from "./pages/student/CourseCatalog";
import CourseDetail from "./pages/student/CourseDetail";
import LessonView from "./pages/student/LessonView";
import MockTestView from "./pages/student/MockTestView";
import MockTestResultPage from "./pages/student/MockTestResultPage";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfile from "./pages/student/StudentProfile";
import CartPage from "./pages/student/CartPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<FoliopathLandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/set-password" element={<SetPassword />} />
          <Route path="/login" element={<Login />} />

          {/* Public course browsing */}
          <Route path="/courses" element={<CourseCatalog />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />

          {/* Combined dashboard (users + staff + courses) */}
          <Route
            path="/super-admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN", "STAFF"]}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Staff dashboard (personal overview) */}
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
            path="/admin/courses/:courseId/content"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN", "STAFF"]}>
                <AdminCourseContent />
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

          {/* Student routes */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-courses"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-profile"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lessons/:moduleId/:lessonId"
            element={<LessonView />}
          />
          <Route
            path="/mock-tests/:mockTestId"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <MockTestView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mock-tests/:mockTestId/result"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <MockTestResultPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
