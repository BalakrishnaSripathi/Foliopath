import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Clock, CheckCircle } from "lucide-react";
import { getMyEnrollments } from "../../api/courseService";

export default function StudentDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      const { data } = await getMyEnrollments();
      setEnrollments(data);
    } catch (err) {
      console.error("Failed to load enrollments:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A86B]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-[#0B2545] mb-2">
          My Learning
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Continue your learning journey
        </p>

        {enrollments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">
              You haven't enrolled in any courses yet
            </p>
            <Link
              to="/courses"
              className="text-[#00A86B] font-semibold hover:underline"
            >
              Browse courses
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment, idx) => (
              <Link
                key={enrollment.id}
                to={`/courses/${enrollment.courseId}`}
                data-aos="fade-up"
                data-aos-delay={idx * 100}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#00A86B]/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-[#00A86B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-[#0B2545] truncate">
                      {enrollment.courseTitle}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Enrolled{" "}
                    {new Date(enrollment.enrolledAt).toLocaleDateString()}
                  </span>
                  {enrollment.completed ? (
                    <span className="flex items-center gap-1 text-green-600 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  ) : (
                    <span className="text-[#00A86B] font-semibold">
                      In Progress
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
