import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, BookOpen } from "lucide-react";
import { getAllCourses } from "../../api/courseService";
import Header from "../../components/layout/Header";

const levelColors = {
  BEGINNER: "bg-green-100 text-green-700",
  INTERMEDIATE: "bg-amber-100 text-amber-700",
  ADVANCED: "bg-red-100 text-red-700",
};

function CatalogTabs({ active }) {
  const tabs = [
    { key: "courses", label: "Courses", href: "/courses" },
    { key: "kits", label: "Interview Kits", href: "/interview-kits" },
  ];
  return (
    <div className="mt-8 flex justify-center gap-2 sm:gap-3">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          to={tab.href}
          className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
            active === tab.key
              ? "bg-[#00A86B] text-white shadow-md shadow-[#00A86B]/25"
              : "bg-white text-slate-600 border border-slate-200 hover:border-[#00A86B] hover:text-[#00A86B]"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("");

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

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      !search.trim() ||
      course.title?.toLowerCase().includes(search.toLowerCase()) ||
      course.shortDescription?.toLowerCase().includes(search.toLowerCase()) ||
      course.description?.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = !filterLevel || course.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A86B]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#0B2545]">
            Explore Our Courses
          </h1>
          <p className="text-slate-500 mt-2">
            Find the perfect course to advance your career
          </p>

          <CatalogTabs active="courses" />

          <div className="mt-6 max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..."
                className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-[#00A86B] focus:outline-none shadow-sm text-sm"
              />
            </div>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-[#00A86B] focus:outline-none shadow-sm text-sm"
            >
              <option value="">All Levels</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {courses.length === 0
                ? "No courses available yet"
                : "No courses match your search"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredCourses.map((course) => (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="relative overflow-hidden h-48">
                  <img
                    src={
                      course.thumbnailUrl ||
                      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80"
                    }
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {course.level && (
                    <span
                      className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                        levelColors[course.level] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {course.level}
                    </span>
                  )}
                  {Number(course.originalPrice) > Number(course.price || 0) && (
                    <span className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-md bg-red-500 text-white shadow-sm">
                      {Math.round(
                        ((Number(course.originalPrice) - Number(course.price || 0)) /
                          Number(course.originalPrice)) *
                          100
                      )}
                      % OFF
                    </span>
                  )}
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {course.modules?.length || 0} modules
                    </span>
                    {course.language && (
                      <span className="text-slate-300">|</span>
                    )}
                    {course.language && (
                      <span>{course.language}</span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-[#0B2545] line-clamp-2 group-hover:text-[#00A86B] transition-colors duration-200">
                    {course.title}
                  </h3>

                  {course.shortDescription && (
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {course.shortDescription}
                    </p>
                  )}

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-xl font-black text-[#0B2545]">
                          ₹{course.price || 0}
                        </span>
                        {(Number(course.originalPrice) > Number(course.price || 0)) && (
                          <span className="text-sm text-slate-400 line-through">
                            ₹{Number(course.originalPrice).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                      {(Number(course.originalPrice) > Number(course.price || 0)) && (
                        <span className="mt-0.5 inline-block text-xs font-bold text-[#00A86B]">
                          Save ₹
                          {(
                            Number(course.originalPrice) - Number(course.price || 0)
                          ).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
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
