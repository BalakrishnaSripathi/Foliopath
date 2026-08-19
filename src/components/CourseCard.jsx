import React from "react";
import { Star } from "lucide-react";

export default function CourseCard({ course }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
      <div className="relative overflow-hidden h-48">
        <img
          src={course.img}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-3 left-3 bg-[#0B2545] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
          {course.badge}
        </span>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>{course.category}</span>
          <div className="flex items-center gap-1 text-amber-500 font-bold">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{course.rating}</span>
            <span className="text-slate-400 font-normal">
              ({course.students})
            </span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-[#0B2545] line-clamp-2 group-hover:text-[#00A86B] transition-colors duration-200 cursor-pointer">
          {course.title}
        </h3>

        <p className="text-xs text-slate-500">
          By{" "}
          <span className="font-semibold text-slate-700">{course.author}</span>
        </p>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xl font-black text-[#0B2545]">
            {course.price}
          </span>
          <button className="px-4 py-2 bg-emerald-50 text-[#00A86B] hover:bg-[#00A86B] hover:text-white rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-md active:scale-[0.97]">
            Enroll Now
          </button>
        </div>
      </div>
    </div>
  );
}
