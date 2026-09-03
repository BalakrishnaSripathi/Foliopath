import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, Loader2, MapPin, Phone, Mail, MessageSquare, Globe, MessageCircle, Rss, Users } from "lucide-react";
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
    icon: MapPin,
    title: "Our Address",
    lines: ["Foliopath 360 Inc.", "Mumbai, Maharashtra, India"],
  },
  {
    icon: Phone,
    title: "Phone Number",
    lines: ["+91 98765 43210", "+91 22 4567 8900"],
  },
  {
    icon: Mail,
    title: "Email Address",
    lines: ["support@foliopath.com", "info@foliopath.com"],
  },
];

const socialLinks = [
  { icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/919876543210", color: "bg-[#25D366]", handle: "@foliopath" },
  { icon: Globe, label: "Instagram", href: "https://instagram.com/foliopath", color: "bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]", handle: "@followus" },
  { icon: Rss, label: "YouTube", href: "https://youtube.com/@foliopath", color: "bg-red-600", handle: "@foliopath" },
  { icon: Users, label: "LinkedIn", href: "https://linkedin.com/company/foliopath", color: "bg-[#0A66C2]", handle: "Foliopath 360" },
];

export default function ContactUsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState(null);

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

      {/* Hero */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1600&q=80"
            alt="Contact us"
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
            Get in Touch
          </span>
          <h1
            data-aos="fade-up"
            data-aos-delay="200"
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-lg"
          >
            Contact <span className="text-[#00A86B]">Us</span>
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

      {/* Contact Info Cards */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {contactCards.map((card, idx) => (
              <div
                key={idx}
                data-aos="fade-up"
                data-aos-delay={idx * 120}
                className="p-7 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#00A86B]/30 hover:shadow-xl transition-all duration-300 group text-center"
              >
                <div className="w-14 h-14 bg-teal-50 text-[#00A86B] rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
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

      {/* Get in Touch */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-6 items-start">
          <div
            data-aos="fade-up"
            data-aos-delay="100"
            className="lg:col-span-3 bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-[#00A86B] text-white rounded-xl flex items-center justify-center shadow-md shadow-emerald-200">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#0B2545]">
                  Get in Touch
                </h2>
                <p className="text-[11px] text-slate-500">
                  Fill the form and we'll get back soon
                </p>
              </div>
            </div>

              {globalError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
                  {globalError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-2">
                <div className="grid grid-cols-2 gap-3">
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

                <div className="grid grid-cols-2 gap-3">
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
                    rows={3}
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
                  className="h-9 w-full rounded-lg bg-[#00A86B] hover:bg-[#008f5a] text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
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

          {/* Follow Up boxes */}
          <div data-aos="fade-up" data-aos-delay="150" className="lg:col-span-2 flex flex-col justify-center gap-2.5">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 bg-[#0B2545] text-[#00A86B] rounded-lg flex items-center justify-center shadow-md">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#0B2545]">Follow Us On</h3>
                <p className="text-[11px] text-slate-500">Connect with us on social media</p>
              </div>
            </div>

            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group max-w-sm"
              >
                <div className={`w-8 h-8 ${social.color} text-white rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                  <social.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#0B2545]">{social.label}</p>
                </div>
                <span className="text-[#00A86B] opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs font-semibold">
                  Follow →
                </span>
              </a>
            ))}
          </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
