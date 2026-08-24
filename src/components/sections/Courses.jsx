import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, BookOpen } from "lucide-react";
import CourseCard from "../CourseCard";
import { getPublishedCourses } from "../../api/courseService";

const toDate = (value) => {
  const t = value ? new Date(value).getTime() : NaN;
  return Number.isNaN(t) ? 0 : t;
};

// Pick the 3 highlighted courses: one New, one Bestseller, one Popular.
function pickHighlights(published) {
  if (!published.length) return [];

  const byEnrollments = [...published].sort(
    (a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0)
  );
  const byNewest = [...published].sort(
    (a, b) =>
      toDate(b.publishedAt || b.createdDt) -
      toDate(a.publishedAt || a.createdDt)
  );

  const bestseller = byEnrollments[0];

  const popular =
    byEnrollments.find(
      (c) => c.id !== bestseller?.id && (c.enrollmentCount || 0) > 0
    ) ||
    byEnrollments.find((c) => c.id !== bestseller?.id) ||
    null;

  const isNew = (c) => toDate(c.publishedAt || c.createdDt);
  const fresh =
    [...byNewest]
      .filter(
        (c) => c.id !== bestseller?.id && c.id !== popular?.id
      )
      .sort((a, b) => isNew(b) - isNew(a))[0] || null;

  const picks = [];
  const usedIds = new Set();
  const add = (course, badge) => {
    if (course && !usedIds.has(course.id)) {
      usedIds.add(course.id);
      picks.push({ ...course, badge });
    }
  };

  add(bestseller, "Bestseller");
  add(popular, "Popular");
  add(fresh, "New");

  // Fill up to 3 cards when fewer distinct courses exist
  for (const course of byNewest) {
    if (picks.length >= 3) break;
    add(course, course.badge || "New");
  }

  // Order on screen: New, Bestseller, Popular
  const order = { New: 0, Bestseller: 1, Popular: 2 };
  return picks
    .slice(0, 3)
    .sort((a, b) => (order[a.badge] ?? 3) - (order[b.badge] ?? 3));
}

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getPublishedCourses()
      .then(({ data }) => {
        if (active) setCourses(pickHighlights(Array.isArray(data) ? data : []));
      })
      .catch((err) => console.error("Failed to load courses:", err))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="courses" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          data-aos="fade-up"
          className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4"
        >
          <div>
            <span className="text-xs font-bold text-[#00A86B] tracking-wider uppercase">
              Catalog
            </span>
            <h2 className="text-3xl font-bold text-[#0B2545] mt-1">
              Get choice of your course
            </h2>
            <p className="text-sm text-slate-500 mt-2 max-w-lg">
              Handpicked highlights — our newest launch, the all-time
              bestseller and the most popular with learners right now.
            </p>
          </div>
          <Link
            to="/courses"
            className="group text-sm font-bold text-[#00A86B] hover:text-[#008f5a] flex items-center gap-1 transition-colors duration-200"
          >
            View All Courses
            <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-100 overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-slate-100" />
                <div className="p-6 space-y-3">
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">
              No published courses yet — check back soon!
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#00A86B] hover:text-[#008f5a]"
            >
              Explore Courses <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, idx) => (
              <div
                key={course.id}
                data-aos="fade-up"
                data-aos-delay={idx * 120}
                className="h-full"
              >
                <CourseCard course={course} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
