import React from "react";
import { Link } from "react-router-dom";
import { Star, Users, BadgePercent } from "lucide-react";

const levelLabels = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

const badgeColors = {
  NEW: "bg-[#00A86B] text-white",
  BESTSELLER: "bg-amber-500 text-white",
  POPULAR: "bg-blue-600 text-white",
};

const toNum = (v) => (v === null || v === undefined || v === "" ? NaN : Number(v));

const money = (v) =>
  Number.isFinite(v) ? `₹${Math.round(v).toLocaleString("en-IN")}` : "";

export default function CourseCard({ course }) {
  const {
    id,
    title,
    badge,
    img,
    thumbnailUrl,
    category,
    level,
    author,
    rating,
    enrollmentCount,
    price,
    originalPrice,
    discountPercentage,
    discountAmount,
  } = course;

  const image = thumbnailUrl || img;
  const displayPrice =
    typeof price === "number" || /^\d+(\.\d+)?$/.test(price || "")
      ? `₹${Number(price || 0).toLocaleString("en-IN")}`
      : price;

  const sell = Number(price || 0);
  const mrpInput = toNum(originalPrice);
  const pctInput = toNum(discountPercentage);
  const amtInput = toNum(discountAmount);

  let mrp = mrpInput;
  let amt = amtInput;
  let pct = pctInput;

  if (Number.isFinite(mrp) && mrp > sell) {
    if (!Number.isFinite(amt)) amt = mrp - sell;
  } else if (Number.isFinite(amt) && amt > 0) {
    mrp = sell + amt;
  } else if (Number.isFinite(pct) && pct > 0 && sell > 0) {
    mrp = sell / (1 - pct / 100);
    amt = mrp - sell;
  }

  if (!Number.isFinite(pct) && Number.isFinite(amt) && amt > 0 && Number.isFinite(mrp) && mrp > 0) {
    pct = Math.round((amt / mrp) * 100);
  }

  const hasDiscount = Number.isFinite(amt) && amt > 0 && Number.isFinite(mrp) && mrp > sell;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 h-full flex flex-col">
      <Link to={id ? `/courses/${id}` : "#"} className="relative overflow-hidden h-48 block">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0B2545] to-[#13315c] flex items-center justify-center">
            <span className="text-3xl font-black text-[#00A86B]">
              {(title || "F").charAt(0)}
            </span>
          </div>
        )}
        {badge && (
          <span
            className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
              badgeColors[badge?.toUpperCase()] ||
              "bg-[#0B2545] text-white"
            }`}
          >
            {badge}
          </span>
        )}
        {hasDiscount && (
          <span className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-md bg-red-500 text-white shadow-sm">
            {pct && pct > 0 ? `${Math.round(pct)}% OFF` : "Discount"}
          </span>
        )}
      </Link>

      <div className="p-6 space-y-4 flex flex-col flex-1">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>{category || (level ? levelLabels[level] || level : "")}</span>
          {(rating || enrollmentCount > 0) && (
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              {rating && (
                <>
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{rating}</span>
                </>
              )}
              {enrollmentCount > 0 && (
                <>
                  {rating && (
                    <span className="text-slate-300 font-normal mx-0.5">
                      |
                    </span>
                  )}
                  <Users className="w-3.5 h-3.5" />
                  <span>{enrollmentCount}</span>
                </>
              )}
            </div>
          )}
        </div>

        <h3 className="text-lg font-bold text-[#0B2545] line-clamp-2 group-hover:text-[#00A86B] transition-colors duration-200 cursor-pointer">
          {title}
        </h3>

        {author && (
          <p className="text-xs text-slate-500">
            By{" "}
            <span className="font-semibold text-slate-700">{author}</span>
          </p>
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
                Save {money(amt)}
              </span>
            )}
          </div>
          <Link
            to={id ? `/courses/${id}` : "#"}
            className="flex-shrink-0 px-4 py-2 bg-emerald-50 text-[#00A86B] hover:bg-[#00A86B] hover:text-white rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-md active:scale-[0.97]"
          >
            Enroll Now
          </Link>
        </div>
      </div>
    </div>
  );
}