import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import FoliopathLandingPage from "./components/FoliopathLandingPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourseForm from "./pages/admin/AdminCourseForm";
import AdminCourseContent from "./pages/admin/AdminCourseContent";
import CourseCatalog from "./pages/student/CourseCatalog";
import CourseDetail from "./pages/student/CourseDetail";
import LessonView from "./pages/student/LessonView";
import StudentDashboard from "./pages/student/StudentDashboard";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<FoliopathLandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Public course browsing */}
          <Route path="/courses" element={<CourseCatalog />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />

          {/* Admin routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses/new"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminCourseForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses/:courseId"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminCourseForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses/:courseId/content"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminCourseContent />
              </ProtectedRoute>
            }
          />

          {/* Student routes */}
          <Route
            path="/my-courses"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/lessons/:lessonId" element={<LessonView />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
