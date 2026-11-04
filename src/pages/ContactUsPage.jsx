import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Send,
  Loader2,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Globe,
  MessageCircle,
  Rss,
  Users,
  ChevronDown,
  Clock,
  GraduationCap,
  Wrench,
  Briefcase,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { ContactUsSchema } from "../components/contact/contactUsSchema";
import { contactUsApi } from "../api/contactUsController";

const inputCls = (hasError) =>
  `h-9 w-full rounded-lg border text-sm transition outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#00A86B]/20 px-3.5
  ${hasError ? "border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-400/20" : "border-slate-200 bg-slate-50 focus:border-[#00A86B]"}`;

const selectCls = (hasError) =>
  `h-9 w-full rounded-lg border text-sm transition outline-none bg-slate-50 focus:ring-2 focus:ring-[#00A86B]/20 text-slate-700 px-3.5
  ${hasError ? "border-red-400 bg-red-50/20 focus:border-red-500" : "border-slate-200 focus:border-[#00A86B]"}`;

const contactCards = [
  {
    icon: Mail,
    title: "Email",
    lines: ["support@foliopath.com", "info@foliopath.com"],
    card: "bg-sky-50/70 border-sky-100 hover:border-sky-300",
    iconBox: "bg-sky-100 text-sky-600",
  },
  {
    icon: Phone,
    title: "Phone",
    lines: ["+91 98765 43210", "+91 22 4567 8900"],
    card: "bg-emerald-50/70 border-emerald-100 hover:border-emerald-300",
    iconBox: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: MapPin,
    title: "Address",
    lines: ["Foliopath 360 Inc.", "Mumbai, Maharashtra, India"],
    card: "bg-amber-50/70 border-amber-100 hover:border-amber-300",
    iconBox: "bg-amber-100 text-amber-600",
  },
  {
    icon: Clock,
    title: "Working Hours",
    lines: ["Mon – Sat: 9:00 AM – 7:00 PM", "Sunday: Closed"],
    card: "bg-violet-50/70 border-violet-100 hover:border-violet-300",
    iconBox: "bg-violet-100 text-violet-600",
  },
];

const helpTopics = [
  {
    icon: GraduationCap,
    title: "Student",
    desc: "Course access, enrollment, and learning support.",
  },
  {
    icon: Users,
    title: "Instructor",
    desc: "Teaching, content creation, and collaboration.",
  },
  {
    icon: Wrench,
    title: "Technical",
    desc: "Login, payments, and platform issues.",
  },
  {
    icon: Briefcase,
    title: "Business",
    desc: "Partnerships, bulk enrollment, and enterprise.",
  },
];

const socialLinks = [
  { icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/919876543210", color: "bg-[#25D366]", handle: "@foliopath" },
  { icon: Globe, label: "Instagram", href: "https://instagram.com/foliopath", color: "bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]", handle: "@foliopath" },
  { icon: Rss, label: "YouTube", href: "https://youtube.com/@foliopath", color: "bg-red-600", handle: "@foliopath" },
  { icon: Users, label: "LinkedIn", href: "https://linkedin.com/company/foliopath", color: "bg-[#0A66C2]", handle: "Foliopath 360" },
];

const faqs = [
  {
    q: "What is Foliopath 360, and how does it work?",
    a: "Foliopath 360 is an online learning platform offering courses and interview kits. Browse the catalog, enroll in what fits your goals, and learn at your own pace from your dashboard.",
  },
  {
    q: "How can I create a student account?",
    a: "Click Sign Up, choose the student registration option, and enter your name, email, and password. Verify your email if prompted, then log in to start learning.",
  },
  {
    q: "How do I enroll in a course?",
    a: "Open the course page, click Enroll, and complete the payment. Once confirmed, the course appears in My Courses on your dashboard and is ready to access.",
  },
  {
    q: "What should I do if my payment is successful but my course is still locked?",
    a: "Wait a few minutes and refresh your dashboard. If the course is still locked, contact support with your registered email and payment ID so we can resolve it quickly.",
  },
  {
    q: "How can I download my course completion certificate?",
    a: "Complete all required lessons and assessments, then open the Certificates section of your dashboard to view and download your certificate.",
  },
];

export default function ContactUsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    reset,
  } = useForm({
    resolver: zodResolver(ContactUsSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      mobileNum: "",
      emailId: "",
      currentPosition: "",
      message: "",
    },
  });

  const scrollToForm = () => {
    document
      .getElementById("contact-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setGlobalError(null);
    try {
      await contactUsApi.createContactUs({
        fullName: data.fullName,
        mobileNumber: data.mobileNum,
        email: data.emailId,
        currentPosition: data.currentPosition,
        message: data.message,
      });
      toast.success("Message sent successfully! Our team will reach out shortly.", {
        className: "!bg-[#0B2545] !text-white",
      });
      reset();
    } catch (error) {
      console.error("Contact request submission failure:", error);
      setGlobalError(
        error.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-[#00A86B] selection:text-white">
      <Header />

      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1600&q=80"
            alt="Foliopath 360 team ready to help"
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
            Contact Foliopath 360
          </span>
          <h1
            data-aos="fade-up"
            data-aos-delay="200"
            className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-white tracking-tight leading-tight drop-shadow-lg"
          >
            Get in Touch <span className="text-[#00A86B]">With Us</span>
          </h1>
          <p
            data-aos="fade-up"
            data-aos-delay="300"
            className="mt-6 text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed"
          >
            Have a question, suggestion, or just want to say hello? Reach out to
            us through any of the channels below or fill out the form.
          </p>
        </div>
      </section>

      {/* 2. Contact Information */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactCards.map((card, idx) => (
              <div
                key={card.title}
                data-aos="fade-up"
                data-aos-delay={idx * 100}
                className={`p-7 rounded-2xl border hover:shadow-xl transition-all duration-300 group text-center ${card.card}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300 ${card.iconBox}`}>
                  <card.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-[#0B2545] mb-2">
                  {card.title}
                </h3>
                {card.lines.map((line, i) => (
                  <p key={i} className="text-sm text-slate-500 leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Contact Form */}
      <section
        id="contact-form"
        className="py-16 bg-gradient-to-b from-slate-50 via-emerald-50/40 to-white scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <span className="inline-block px-3 py-1 text-[10px] font-bold tracking-wide uppercase rounded-full bg-emerald-100 text-[#00A86B] mb-3">
              Enquiry
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[#0B2545] tracking-tight">
              Contact Form
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Share your details and enquiry — we'll get back to you soon.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 items-start">
          <div
            data-aos="fade-up"
            className="bg-white rounded-3xl p-5 sm:p-7 border border-emerald-100 shadow-[0_20px_50px_-24px_rgba(0,168,107,0.35)]"
          >
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00A86B] to-[#007a4d] text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-display font-extrabold text-[#0B2545]">
                  Send Us a Message
                </h3>
                <p className="text-[11px] text-slate-500">
                  User details and enquiry submission
                </p>
              </div>
            </div>

            {globalError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
                {globalError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-2">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-600">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("fullName")}
                    className={inputCls(!!errors.fullName)}
                    placeholder="Full name"
                  />
                  <div className="h-3 text-[10px] text-red-500 font-medium leading-none flex items-center">
                    {errors.fullName?.message || <span className="opacity-0">&nbsp;</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-600">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("mobileNum")}
                    className={inputCls(!!errors.mobileNum)}
                    placeholder="+91 98765 43210"
                  />
                  <div className="h-3 text-[10px] text-red-500 font-medium leading-none flex items-center">
                    {errors.mobileNum?.message || <span className="opacity-0">&nbsp;</span>}
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-600">
                    E-mail Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    {...register("emailId")}
                    className={inputCls(!!errors.emailId)}
                    placeholder="you@example.com"
                  />
                  <div className="h-3 text-[10px] text-red-500 font-medium leading-none flex items-center">
                    {errors.emailId?.message || <span className="opacity-0">&nbsp;</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-600">
                    Current Position <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="currentPosition"
                    control={control}
                    render={({ field }) => (
                      <select
                        value={field.value}
                        onChange={field.onChange}
                        className={selectCls(!!errors.currentPosition)}
                      >
                        <option value="">Select position</option>
                        <option value="STUDENT">Student</option>
                        <option value="DEVELOPER">Developer</option>
                        <option value="WORKING_PROFESSIONAL">Working Professional</option>
                        <option value="FREELANCER">Freelancer</option>
                        <option value="DEVOPS_ENGINEER">DevOps Engineer</option>
                        <option value="TEST_ENGINEER">Test Engineer</option>
                        <option value="QA_ENGINEER">QA Engineer</option>
                        <option value="OTHER">Other</option>
                      </select>
                    )}
                  />
                  <div className="h-3 text-[10px] text-red-500 font-medium leading-none flex items-center">
                    {errors.currentPosition?.message || <span className="opacity-0">&nbsp;</span>}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register("message")}
                  rows={4}
                  className={`w-full rounded-lg border text-sm transition outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#00A86B]/20 px-3.5 py-2 resize-none
                    ${
                      errors.message
                        ? "border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-400/20"
                        : "border-slate-200 bg-slate-50 focus:border-[#00A86B]"
                    }`}
                  placeholder="Write your message here..."
                />
                <div className="h-3 text-[10px] text-red-500 font-medium leading-none flex items-center">
                  {errors.message?.message || <span className="opacity-0">&nbsp;</span>}
                </div>
              </div>

              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="h-10 w-full rounded-lg bg-[#00A86B] hover:bg-[#008f5a] text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Message
                  </>
                )}
              </button>

              <p className="text-[10px] text-slate-400 text-center">
                Your information is kept private and never shared.
              </p>
            </form>
          </div>

          <aside
            id="faqs"
            data-aos="fade-up"
            data-aos-delay="100"
            className="lg:sticky lg:top-24 rounded-3xl bg-white p-5 border border-emerald-100 shadow-lg"
          >
            <div className="mb-4">
              <span className="inline-block px-3 py-1 text-[10px] font-bold tracking-wide uppercase rounded-full bg-emerald-50 text-[#007a4d] border border-emerald-200 mb-3">
                Support
              </span>
              <h3 className="text-xl font-display font-extrabold text-[#0B2545] leading-tight">
                Frequently Asked Questions
              </h3>
              <p className="mt-1.5 text-[11px] text-slate-500">
                Quick answers about courses, kits, and support.
              </p>
            </div>

            <div className="space-y-2.5">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={faq.q}
                    className={`rounded-xl border transition-colors duration-300 ${
                      isOpen
                        ? "bg-emerald-50/60 border-emerald-200"
                        : "bg-slate-50 border-slate-100 hover:border-emerald-200"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
                    >
                      <span className="text-xs sm:text-sm font-semibold text-[#0B2545]">
                        {faq.q}
                      </span>
                      <span
                        className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isOpen
                            ? "bg-[#00A86B] text-white rotate-180"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 -mt-1 text-xs leading-relaxed text-slate-600 border-t border-slate-100 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
          </div>
        </div>
      </section>

      {/* 4. How Can We Help You? */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[#0B2545] tracking-tight">
              How Can We Help You?
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Choose the area that best matches your enquiry and we'll connect you
              with the right team.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {helpTopics.map((topic, idx) => (
              <button
                key={topic.title}
                type="button"
                onClick={scrollToForm}
                data-aos="fade-up"
                data-aos-delay={idx * 100}
                className="group text-left p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#00A86B]/40 hover:bg-emerald-50/40 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 bg-white text-[#00A86B] rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <topic.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#0B2545] mb-1.5">
                  {topic.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {topic.desc}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Social Media Links */}
      <section className="relative overflow-hidden py-16 bg-gradient-to-br from-[#0B2545] via-[#0f2f57] to-[#13315c]">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#00A86B]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-block px-3.5 py-1.5 text-xs font-bold tracking-wide uppercase rounded-full bg-[#00A86B]/15 text-[#34d399] border border-[#00A86B]/20 mb-4">
              Stay Connected
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              Social Media Links
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
              Follow us for updates, learning tips, and interview preparation.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                title={social.label}
                aria-label={social.label}
                className="group rounded-2xl bg-white/[0.06] border border-white/10 p-5 hover:bg-white/[0.1] hover:border-[#00A86B]/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 ${social.color} text-white rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <social.icon className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#34d399] transition-colors duration-300" />
                </div>
                <p className="mt-4 text-sm font-bold text-white">{social.label}</p>
                <p className="mt-0.5 text-xs text-slate-300">{social.handle}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <Footer />
    </div>
  );
}
