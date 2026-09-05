import React from "react";
import {
  Sparkles,
  Users,
  BadgeCheck,
  Clock,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const differentiators = [
  {
    icon: Sparkles,
    title: "Cutting-edge Curriculum",
    desc: "Industry-led content that stays relevant and is updated constantly.",
  },
  {
    icon: Users,
    title: "Expert Mentorship",
    desc: "Learn directly from seasoned professionals and industry leaders.",
  },
  {
    icon: BadgeCheck,
    title: "Recognized Certifications",
    desc: "Earn verified credentials trusted by top employers worldwide.",
  },
  {
    icon: Clock,
    title: "Flexible Learning",
    desc: "Study at your own pace with schedules that fit your everyday life.",
  },
  {
    icon: Briefcase,
    title: "Career Guidance",
    desc: "Portfolio building and placement support to launch your dream career.",
  },
];

const stats = [
  { value: "40+", label: "Courses & Kits" },
  { value: "10K+", label: "Active Learners" },
  { value: "100%", label: "Placement Support" },
  { value: "4.8/5", label: "Learner Rating" },
];

export default function WhyDifferent() {
  return (
    <section
      id="why-foliopath"
      className="py-24 bg-slate-50 relative overflow-hidden"
    >
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#00A86B]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-24 w-80 h-80 rounded-full bg-indigo-200/20 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          data-aos="fade-up"
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold tracking-wide uppercase rounded-full bg-white border border-[#00A86B]/20 text-[#00A86B] shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Why Foliopath 360
          </span>
          <h2 className="mt-5 text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-[#0B2545] leading-tight">
            Built differently.{" "}
            <span className="text-[#00A86B]">Built for your success.</span>
          </h2>
          <p className="mt-4 text-slate-500 text-base leading-relaxed">
            We go beyond traditional learning to deliver an experience designed
            around measurable outcomes — from first lesson to dream job.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {differentiators.map((item, idx) => (
            <div
              key={item.title}
              data-aos="fade-up"
              data-aos-delay={idx * 80}
              className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-7 overflow-hidden"
            >
              <div className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-[#00A86B] to-teal-400 group-hover:w-full transition-all duration-500" />
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-50 to-emerald-100 text-[#00A86B] rounded-xl ring-1 ring-[#00A86B]/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-3xl font-black text-slate-100 group-hover:text-[#00A86B]/15 transition-colors duration-300">
                  0{idx + 1}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#0B2545] mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}

          {/* CTA card */}
          <div
            data-aos="fade-up"
            data-aos-delay={differentiators.length * 80}
            className="relative rounded-2xl bg-gradient-to-br from-[#0B2545] to-slate-800 text-white p-8 flex flex-col justify-between overflow-hidden group"
          >
            <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-[#00A86B]/20 blur-2xl" />
            <div className="relative">
              <h3 className="text-xl font-bold mb-2 leading-snug">
                Not sure where to start?
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Talk to our learning advisors and get a personalized success
                plan today.
              </p>
            </div>
            <Link
              to="/contact"
              className="relative mt-6 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#00A86B] text-white font-semibold rounded-xl shadow-lg shadow-[#00A86B]/25 hover:bg-[#008f5a] transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] group-hover:shadow-emerald"
            >
              Talk to an Advisor
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        <div
          data-aos="fade-up"
          data-aos-delay="120"
          className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center bg-white rounded-2xl border border-slate-100 shadow-sm py-7 px-4"
            >
              <div className="text-3xl font-black text-[#00A86B]">
                {stat.value}
              </div>
              <div className="mt-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}