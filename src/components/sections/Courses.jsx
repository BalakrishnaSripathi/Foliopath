import React from "react";
import { ChevronRight } from "lucide-react";
import CourseCard from "../CourseCard";

const courses = [
  {
    id: 744,
    title: "AI System Design",
    category: "Interview Preparation",
    author: "PracticAI",
    rating: 5.0,
    students: "1",
    price: "₹499",
    badge: "New",
    img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=80",
    slug: "ai-system-design",
    level: "Intermediate",
    language: "English",
    curriculum: [
      { title: "Foundations", description: "How to think about AI system design" },
      { title: "LLM Systems", description: "Designing applications powered by large language models" },
      { title: "RAG Systems", description: "Building retrieval-based architectures" },
      { title: "Agent Systems", description: "Designing autonomous and multi-agent workflows" },
      { title: "Production Systems", description: "Scaling, optimizing, and maintaining systems" },
      { title: "Real Scenarios", description: "Solving actual interview-style system design problems" },
    ],
  },
  {
    id: 1,
    title: "Everything You Need to Know About Business",
    category: "Business",
    author: "Dr. Sarah Jenkins",
    rating: 4.8,
    students: "12.5k",
    price: "$49.99",
    badge: "Bestseller",
    img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    title: "Executive Leadership & Strategic Growth",
    category: "Management",
    author: "Marcus Vance",
    rating: 4.9,
    students: "8.2k",
    price: "$59.99",
    badge: "Popular",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    title: "Financial Analysis & Data Driven Decisions",
    category: "Finance",
    author: "Elena Rostova",
    rating: 4.7,
    students: "15.1k",
    price: "$44.99",
    badge: "Trending",
    img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80",
  },
];

export default function Courses() {
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
          </div>
          <button className="text-sm font-bold text-[#00A86B] hover:text-[#008f5a] flex items-center gap-1 transition-colors duration-200">
            View All Courses <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, idx) => (
            <div
              key={course.id}
              data-aos="fade-up"
              data-aos-delay={idx * 120}
            >
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
