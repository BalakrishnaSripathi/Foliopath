import { useState, useEffect } from "react";
import { Search, BookOpen } from "lucide-react";
import { getAllCourses } from "../api/courseService";
import { getPublishedKits } from "../api/interviewKitService";
import { enrichCourse, enrichKit } from "../lib/staticCatalog";
import Header from "../components/layout/Header";
import CourseCard from "../components/CourseCard";
import InterviewKitCard from "../components/InterviewKitCard";

const TABS = [
  { key: "all", label: "All" },
  { key: "courses", label: "Courses" },
  { key: "kits", label: "Interview Kits" },
];

function CatalogTabs({ active, onChange }) {
  return (
    <div className="mt-8 flex justify-center gap-2 sm:gap-3">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
            active === tab.key
              ? "bg-[#00A86B] text-white shadow-md shadow-[#00A86B]/25"
              : "bg-white text-slate-600 border border-slate-200 hover:border-[#00A86B] hover:text-[#00A86B]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default function Catalog() {
  const [courses, setCourses] = useState([]);
  const [kits, setKits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    let active = true;
    Promise.all([getAllCourses(), getPublishedKits()])
      .then(([coursesRes, kitsRes]) => {
        if (!active) return;
        const courseList = Array.isArray(coursesRes.data) ? coursesRes.data : [];
        const kitList = Array.isArray(kitsRes.data) ? kitsRes.data : [];
        setCourses(courseList.map((course, idx) => enrichCourse(course, idx)));
        setKits(kitList.map((kit, idx) => enrichKit(kit, idx)));
      })
      .catch((err) => console.error("Failed to load catalog:", err))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const query = search.trim().toLowerCase();

  const filteredCourses = (activeTab === "kits" ? [] : courses).filter(
    (course) => {
      const matchesSearch =
        !query ||
        course.title?.toLowerCase().includes(query) ||
        course.shortDescription?.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query);
      const matchesLevel = !filterLevel || course.level === filterLevel;
      return matchesSearch && matchesLevel;
    }
  );

  const filteredKits = (activeTab === "courses" ? [] : kits).filter((kit) => {
    const matchesSearch =
      !query ||
      kit.name?.toLowerCase().includes(query) ||
      kit.description?.toLowerCase().includes(query);
    const matchesLevel = !filterLevel || kit.level === filterLevel;
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
            Explore Courses &amp; Kits
          </h1>
          <p className="text-slate-500 mt-2">
            Find the perfect course or interview kit to advance your career
          </p>

          <CatalogTabs active={activeTab} onChange={setActiveTab} />

          <div className="mt-6 max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses & kits..."
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

        {filteredCourses.length === 0 && filteredKits.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {courses.length === 0 && kits.length === 0
                ? "No courses or kits available yet"
                : activeTab === "courses"
                ? "No courses match your search"
                : activeTab === "kits"
                ? "No interview kits match your search"
                : "No courses or kits match your search"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {filteredCourses.map((course) => (
              <CourseCard key={`course-${course.id}`} course={course} />
            ))}
            {filteredKits.map((kit) => (
              <InterviewKitCard key={`kit-${kit.id}`} kit={kit} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
