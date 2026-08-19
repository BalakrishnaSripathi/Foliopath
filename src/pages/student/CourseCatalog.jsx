import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Star, Users, Clock } from "lucide-react";
import { getAllCourses, searchCourses } from "../../api/courseService";

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const { data } = await getAllCourses();
      setCourses(data);
    } catch (err) {
      console.error("Failed to load courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) {
      loadCourses();
      return;
    }
    try {
      const { data } = await searchCourses(search);
      setCourses(data);
    } catch (err) {
      console.error(err);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#0B2545]">
            Explore Our Courses
          </h1>
          <p className="text-slate-500 mt-2">
            Find the perfect course to advance your career
          </p>

          <form onSubmit={handleSearch} className="mt-6 max-w-md mx-auto">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..."
                className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-[#00A86B] focus:outline-none shadow-sm text-sm"
              />
            </div>
          </form>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500">No courses found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, idx) => (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                data-aos="fade-up"
                data-aos-delay={idx * 100}
                className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="relative overflow-hidden h-48">
                  <img
                    src={course.imageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80"}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {course.category && (
                    <span className="absolute top-3 left-3 bg-[#0B2545] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                      {course.category}
                    </span>
                  )}
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {course.rating || "New"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {course.totalStudents || 0} students
                    </span>
                    {course.level && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {course.level}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-[#0B2545] line-clamp-2 group-hover:text-[#00A86B] transition-colors duration-200">
                    {course.title}
                  </h3>

                  {course.instructorName && (
                    <p className="text-xs text-slate-500">
                      By{" "}
                      <span className="font-semibold text-slate-700">
                        {course.instructorName}
                      </span>
                    </p>
                  )}

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xl font-black text-[#0B2545]">
                      ₹{course.price}
                    </span>
                    <span className="px-4 py-2 bg-emerald-50 text-[#00A86B] rounded-lg text-sm font-semibold">
                      View Course
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
