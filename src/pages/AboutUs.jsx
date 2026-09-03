import React from "react";
import { Target, Eye, Heart, Users, BookOpen, Award, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const values = [
  {
    icon: Heart,
    title: "Student First",
    desc: "Every decision we make starts with the learner. We build tools and content that empower students to achieve their goals.",
  },
  {
    icon: Users,
    title: "Inclusive Community",
    desc: "We believe education should be accessible to everyone, regardless of background, location, or financial situation.",
  },
  {
    icon: BookOpen,
    title: "Quality Content",
    desc: "We partner with industry experts to deliver curriculum that is relevant, up-to-date, and practically applicable.",
  },
  {
    icon: Award,
    title: "Recognized Impact",
    desc: "Our certifications are trusted by employers worldwide, opening doors to real career opportunities for our learners.",
  },
];

const stats = [
  { value: "10K+", label: "Students Enrolled" },
  { value: "50+", label: "Expert Courses" },
  { value: "100+", label: "Industry Mentors" },
  { value: "95%", label: "Completion Rate" },
];

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-[#00A86B] selection:text-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80"
            alt="Students collaborating"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0B2545]/60" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span
            data-aos="fade-down"
            data-aos-delay="100"
            className="inline-block px-3.5 py-1.5 text-xs font-bold tracking-wide uppercase rounded-full bg-emerald-100 text-[#00A86B] mb-6"
          >
            About Us
          </span>
          <h1
            data-aos="fade-up"
            data-aos-delay="200"
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-lg"
          >
            Empowering Learners{" "}
            <span className="text-[#00A86B]">Worldwide</span>
          </h1>
          <p
            data-aos="fade-up"
            data-aos-delay="300"
            className="mt-6 text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed"
          >
            Foliopath 360 is on a mission to make quality education accessible
            to every student. We combine technology, expert instructors, and a
            learner-first approach to create transformative learning experiences.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission */}
            <div
              data-aos="fade-right"
              data-aos-delay="100"
              className="relative p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-14 h-14 bg-[#00A86B] text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-200">
                <Target className="w-7 h-7" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0B2545] mb-4">
                Our Mission
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                To democratize education by providing affordable, high-quality,
                and industry-relevant courses that equip students with the skills
                they need to thrive in today's fast-evolving world. We are
                committed to breaking barriers and making learning an
                enriching experience for everyone, everywhere.
              </p>
            </div>

            {/* Vision */}
            <div
              data-aos="fade-left"
              data-aos-delay="200"
              className="relative p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#0B2545] to-slate-800 text-white hover:shadow-xl transition-all duration-300"
            >
              <div className="w-14 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                <Eye className="w-7 h-7" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mb-4">
                Our Vision
              </h2>
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                To become the global leader in online education — a platform
                where every learner can access world-class mentorship, build
                real-world skills, and earn credentials recognized by top
                employers. We envision a future where education knows no
                boundaries and every individual has the power to shape their
                own career.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                data-aos="zoom-in"
                data-aos-delay={idx * 100}
                className="text-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <p className="text-3xl sm:text-4xl font-black text-[#00A86B]">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            data-aos="fade-up"
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <h2 className="text-3xl font-bold text-[#0B2545]">
              Our Core Values
            </h2>
            <p className="mt-3 text-slate-500 text-sm">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => (
              <div
                key={idx}
                data-aos="fade-up"
                data-aos-delay={idx * 100}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#00A86B]/30 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-teal-50 text-[#00A86B] rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#0B2545] mb-2">
                  {value.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#0B2545] to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            data-aos="fade-up"
            className="text-3xl sm:text-4xl font-black text-white mb-4"
          >
            Ready to Start Learning?
          </h2>
          <p
            data-aos="fade-up"
            data-aos-delay="100"
            className="text-slate-400 max-w-xl mx-auto mb-8 text-sm"
          >
            Join thousands of students who are already building their future
            with Foliopath 360.
          </p>
          <Link
            to="/courses"
            data-aos="fade-up"
            data-aos-delay="200"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#00A86B] text-white font-bold rounded-full shadow-lg hover:bg-[#008f5a] hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97]"
          >
            Explore Courses
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
