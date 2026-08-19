import React from "react";
import { CheckCircle2 } from "lucide-react";

const benefits = [
  "Personalized feedback and 1-on-1 mentorship",
  "Flexible schedules fitted to your everyday routine",
];

export default function LearnerOutcomes() {
  return (
    <section className="py-16 bg-teal-50/40 border-y border-teal-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div
            data-aos="zoom-in"
            data-aos-delay="100"
            className="order-2 lg:order-1 relative"
          >
            <img
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80"
              alt="Students studying together"
              className="rounded-2xl shadow-lg border-4 border-white"
            />
          </div>

          <div className="order-1 lg:order-2 space-y-6">
            <h2
              data-aos="fade-left"
              data-aos-delay="100"
              className="text-3xl font-bold text-[#0B2545]"
            >
              Learner outcomes on Foliopath 360
            </h2>
            <p
              data-aos="fade-left"
              data-aos-delay="200"
              className="text-slate-600 leading-relaxed"
            >
              87% of people learning for professional development report career
              benefits like getting a promotion, a raise, or starting a new
              career.
            </p>

            <div className="space-y-3">
              {benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  data-aos="fade-left"
                  data-aos-delay={300 + idx * 100}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#00A86B] shrink-0 mt-0.5" />
                  <span className="text-slate-700 text-sm font-medium">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            <button
              data-aos="fade-up"
              data-aos-delay="500"
              className="px-6 py-3 bg-[#00A86B] text-white font-semibold rounded-full shadow hover:bg-[#008f5a] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.97]"
            >
              Explore Courses
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
