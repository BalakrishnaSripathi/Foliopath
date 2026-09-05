import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  BookOpen,
  Briefcase,
} from "lucide-react";
import CourseCard from "../CourseCard";
import InterviewKitCard from "../InterviewKitCard";
import { getPublishedCourses } from "../../api/courseService";
import { getPublishedKits } from "../../api/interviewKitService";

const toDate = (value) => {
  const t = value ? new Date(value).getTime() : NaN;
  return Number.isNaN(t) ? 0 : t;
};

const STATIC_ENROLLMENTS = [1249, 986, 642, 2130, 874, 1532];
const STATIC_PRICE = 499;
const STATIC_MRP = 999;
const STATIC_KIT_ENROLLMENTS = [1247, 983, 687];
const STATIC_KIT_BADGES = ["Popular", "Bestseller", "New"];

// Newest published courses for the homepage grid,
// with static enrollment counts and ₹999 → ₹499 promo pricing.
function pickLatestCourses(published) {
  return [...published]
    .sort(
      (a, b) =>
        toDate(b.publishedAt || b.createdDt) -
        toDate(a.publishedAt || a.createdDt)
    )
    .slice(0, 3)
    .map((course, idx) => ({
      ...course,
      enrollmentCount:
        course.enrollmentCount ||
        STATIC_ENROLLMENTS[idx % STATIC_ENROLLMENTS.length],
      price: STATIC_PRICE,
      originalPrice: STATIC_MRP,
    }));
}

// Newest published interview kits for the homepage grid,
// with static enrollments, badges and ₹999 → ₹499 promo pricing.
function pickLatestKits(published) {
  return [...published]
    .sort(
      (a, b) =>
        toDate(b.publishedAt || b.createdDt) -
        toDate(a.publishedAt || a.createdDt)
    )
    .slice(0, 3)
    .map((kit, idx) => ({
      ...kit,
      price: STATIC_PRICE,
      originalPrice: STATIC_MRP,
      enrollmentCount:
        kit.enrollmentCount ||
        STATIC_KIT_ENROLLMENTS[idx % STATIC_KIT_ENROLLMENTS.length],
      badge: STATIC_KIT_BADGES[idx % STATIC_KIT_BADGES.length],
    }));
}

function SectionHeader({ eyebrow, title, subtitle, to, linkLabel }) {
  return (
    <div
      data-aos="fade-up"
      className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4"
    >
      <div>
        <span className="text-xs font-bold text-[#00A86B] tracking-wider uppercase">
          {eyebrow}
        </span>
        <h3 className="text-2xl font-bold text-[#0B2545] mt-1">{title}</h3>
        {subtitle && (
          <p className="text-sm text-slate-500 mt-2 max-w-lg">{subtitle}</p>
        )}
      </div>
      <Link
        to={to}
        className="group text-sm font-bold text-[#00A86B] hover:text-[#008f5a] flex items-center gap-1 transition-colors duration-200"
      >
        {linkLabel}
        <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
          <div className="h-48 bg-slate-100" />
          <div className="p-6 space-y-3">
            <div className="h-3 bg-slate-100 rounded w-1/3" />
            <div className="h-4 bg-slate-100 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [kits, setKits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getPublishedCourses(), getPublishedKits()])
      .then(([coursesRes, kitsRes]) => {
        if (!active) return;
        setCourses(
          pickLatestCourses(Array.isArray(coursesRes.data) ? coursesRes.data : [])
        );
        setKits(
          pickLatestKits(Array.isArray(kitsRes.data) ? kitsRes.data : [])
        );
      })
      .catch((err) => console.error("Failed to load catalog:", err))
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
              Fresh from the catalog — our latest courses and interview kits for
              you to explore.
            </p>
          </div>
        </div>

        {loading ? (
          <Skeleton />
        ) : (
          <div className="space-y-14">
            {/* Courses */}
            <div>
              <SectionHeader
                eyebrow="Courses"
                title="Featured Courses"
                subtitle="Our newest launches — build in-demand skills step by step."
                to="/courses"
                linkLabel="View All Courses"
              />
              {courses.length === 0 ? (
                <div className="text-center py-14 border border-dashed border-slate-200 rounded-2xl">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">
                    No published courses yet — check back soon!
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
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

            {/* Interview Kits */}
            <div>
              <SectionHeader
                eyebrow="Interview Kits"
                title="Crack Your Next Interview"
                subtitle="Curated question banks and practice sets to ace every round."
                to="/interview-kits"
                linkLabel="View All Interview Kits"
              />
              {kits.length === 0 ? (
                <div className="text-center py-14 border border-dashed border-slate-200 rounded-2xl">
                  <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">
                    No interview kits published yet — check back soon!
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {kits.map((kit, idx) => (
                    <div
                      key={kit.id}
                      data-aos="fade-up"
                      data-aos-delay={idx * 120}
                      className="h-full"
                    >
                      <InterviewKitCard kit={kit} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}