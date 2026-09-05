import React from "react";
import { Link } from "react-router-dom";
import { Briefcase, FileQuestion, Users, BadgePercent } from "lucide-react";

const levelColors = {
  BEGINNER: "bg-green-100 text-green-700",
  INTERMEDIATE: "bg-amber-100 text-amber-700",
  ADVANCED: "bg-red-100 text-red-700",
};

const badgeColors = {
  NEW: "bg-[#00A86B] text-white",
  BESTSELLER: "bg-amber-500 text-white",
  POPULAR: "bg-blue-600 text-white",
};

const money = (v) =>
  Number.isFinite(Number(v))
    ? `₹${Math.round(Number(v)).toLocaleString("en-IN")}`
    : "";

export default function InterviewKitCard({ kit }) {
  const {
    id,
    name,
    description,
    thumbnailUrl,
    level,
    price,
    questionCount,
    enrollmentCount,
    originalPrice,
    discountAmount,
    badge,
  } = kit;

  const image = thumbnailUrl || null;
  const sell = Number(price || 0);
  const mrp = Number(originalPrice);
  const hasDiscount = Number.isFinite(mrp) && mrp > 0 && mrp > sell;
  const discountPct = hasDiscount ? Math.round(((mrp - sell) / mrp) * 100) : 0;
  const saveAmt = hasDiscount
    ? mrp - sell
    : Number(discountAmount) > 0
      ? Number(discountAmount)
      : 0;
  const displayPrice = sell > 0 ? money(sell) : "Free";

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 h-full flex flex-col">
      <Link
        to={id ? `/interview-kits/${id}` : "/interview-kits"}
        className="relative overflow-hidden h-48 block bg-gradient-to-br from-[#422006] to-[#78350f]"
      >
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-amber-200">
            <Briefcase className="w-12 h-12 text-amber-300" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-200/70">
              Interview Kit
            </span>
          </div>
        )}
        {badge && (
          <span
            className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
              badgeColors[badge?.toUpperCase()] || "bg-[#0B2545] text-white"
            }`}
          >
            {badge}
          </span>
        )}
        {hasDiscount && (
          <span className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-md bg-red-500 text-white shadow-sm">
            {discountPct}% OFF
          </span>
        )}
      </Link>

      <div className="p-6 space-y-4 flex flex-col flex-1">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            {typeof questionCount === "number" && (
              <>
                <FileQuestion className="w-3.5 h-3.5" />
                {questionCount} questions
              </>
            )}
            {level && (
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  levelColors[level] || "bg-slate-100 text-slate-600"
                }`}
              >
                {level}
              </span>
            )}
          </span>
          {enrollmentCount > 0 && (
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Users className="w-3.5 h-3.5" />
              <span>{enrollmentCount}</span>
            </div>
          )}
        </div>

        <h3 className="text-lg font-bold text-[#0B2545] line-clamp-2 group-hover:text-[#B45309] transition-colors duration-200">
          {name}
        </h3>

        {description && (
          <p className="text-xs text-slate-500 line-clamp-2">{description}</p>
        )}

        <div className="pt-4 mt-auto border-t border-slate-100 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-xl font-black text-[#0B2545]">
                {displayPrice}
              </span>
              {hasDiscount && (
                <span className="text-sm text-slate-400 line-through">
                  {money(mrp)}
                </span>
              )}
            </div>
            {hasDiscount && (
              <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-bold text-[#00A86B]">
                <BadgePercent className="w-3.5 h-3.5" />
                Save {money(saveAmt)}
              </span>
            )}
          </div>
          <Link
            to={id ? `/interview-kits/${id}` : "/interview-kits"}
            className="flex-shrink-0 px-4 py-2 bg-amber-50 text-[#B45309] hover:bg-[#B45309] hover:text-white rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-md active:scale-[0.97]"
          >
            View Kit
          </Link>
        </div>
      </div>
    </div>
  );
}