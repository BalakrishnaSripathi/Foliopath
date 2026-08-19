import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Code } from "lucide-react";
import { getLesson, getModules } from "../../api/courseService";

function renderContentBlock(block, index) {
  if (block.type === "heading") {
    return (
      <h2 key={index} className="text-xl font-bold text-[#0B2545] mt-6 mb-3">
        {block.body}
      </h2>
    );
  }

  if (block.type === "text") {
    return (
      <div
        key={index}
        className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-4"
      >
        {block.body}
      </div>
    );
  }

  if (block.type === "code") {
    return (
      <div key={index} className="mb-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-[#0a1628] rounded-t-xl border border-slate-700 border-b-0">
          <Code className="w-3.5 h-3.5 text-[#00A86B]" />
          <span className="text-xs font-mono text-slate-400">
            {block.language || "code"}
          </span>
        </div>
        <pre className="bg-[#0B2545] text-green-400 p-4 rounded-b-xl border border-slate-700 overflow-x-auto">
          <code className="text-sm font-mono whitespace-pre">{block.body}</code>
        </pre>
      </div>
    );
  }

  return null;
}

export default function LessonView() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState(null);

  useEffect(() => {
    loadData();
  }, [lessonId]);

  const loadData = async () => {
    try {
      const { data: lessonData } = await getLesson(lessonId);
      setLesson(lessonData);
      setCourseId(lessonData.moduleId);

      // Find course ID from module
      // We need to find which course this module belongs to
      // The lesson has moduleId, we need to find courseId
      // For now, navigate back uses browser history
    } catch (err) {
      console.error("Failed to load lesson:", err);
    } finally {
      setLoading(false);
    }
  };

  const parseContent = (content) => {
    if (!content) return [];
    try {
      return JSON.parse(content);
    } catch {
      return [{ type: "text", body: content }];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A86B]" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Lesson not found</p>
      </div>
    );
  }

  const contentBlocks = parseContent(lesson.content);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#00A86B] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Lesson Header */}
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <span className="text-xs font-semibold text-[#00A86B] uppercase tracking-wider">
              Lesson
            </span>
            <h1 className="text-2xl font-bold text-[#0B2545] mt-1">
              {lesson.title}
            </h1>
          </div>

          {/* Lesson Content */}
          <div className="p-6">
            {contentBlocks.length === 0 ? (
              <p className="text-slate-400 text-center py-8">
                No content available for this lesson
              </p>
            ) : (
              <div className="prose prose-sm max-w-none">
                {contentBlocks.map((block, idx) =>
                  renderContentBlock(block, idx)
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
