import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Code, Lock } from "lucide-react";
import { getLesson } from "../../api/courseService";
import { isExecutableLanguage } from "../../api/codeExecutionService";
import CodePlayground from "../../components/CodePlayground";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/layout/Header";

const looksLikeHtml = (str) => /<\/?[a-z][\s\S]*>/i.test(str || "");

function RichContent({ content, className = "" }) {
  if (!content) return null;

  if (looksLikeHtml(content)) {
    return (
      <div
        className={`rich-text-content ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <div className={`whitespace-pre-wrap ${className}`}>{content}</div>
  );
}

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

function renderLessonItem(item, index) {
  return (
    <div
      key={item.id || index}
      className="border border-slate-200 rounded-2xl p-5 mb-5 bg-slate-50/50"
    >
      <h3 className="text-lg font-bold text-[#0B2545] mb-1">
        {index + 1}. {item.title}
      </h3>
      {item.description && (
        <p className="text-sm text-slate-500 mb-3">{item.description}</p>
      )}
      {item.content && (
        <RichContent
          content={item.content}
          className="text-sm text-slate-700 leading-relaxed mb-3"
        />
      )}
      {item.codeContent && isExecutableLanguage(item.codeLanguage) ? (
        <CodePlayground
          language={item.codeLanguage}
          starterCode={item.codeContent}
          height={260}
        />
      ) : item.codeContent ? (
        <div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0a1628] rounded-t-xl border border-slate-700 border-b-0">
            <Code className="w-3.5 h-3.5 text-[#00A86B]" />
            <span className="text-xs font-mono text-slate-400">
              {item.codeLanguage || "code"}
            </span>
          </div>
          <pre className="bg-[#0B2545] text-green-400 p-4 rounded-b-xl border border-slate-700 overflow-x-auto">
            <code className="text-sm font-mono whitespace-pre">
              {item.codeContent}
            </code>
          </pre>
        </div>
      ) : null}
    </div>
  );
}

function renderRawLessonContent(lesson) {
  const blocks = [];

  if (lesson.content) {
    try {
      const parsed = JSON.parse(lesson.content);
      if (Array.isArray(parsed)) {
        return parsed.map((block, idx) => renderContentBlock(block, idx));
      }
    } catch {
      blocks.push(
        <RichContent
          key="content"
          content={lesson.content}
          className="text-sm text-slate-700 leading-relaxed mb-4"
        />
      );
    }
  }

  if (lesson.codeContent) {
    blocks.push(
      isExecutableLanguage(lesson.codeLanguage) ? (
        <div key="code" className="mb-4">
          <CodePlayground
            language={lesson.codeLanguage}
            starterCode={lesson.codeContent}
          />
        </div>
      ) : (
        <div key="code" className="mb-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0a1628] rounded-t-xl border border-slate-700 border-b-0">
            <Code className="w-3.5 h-3.5 text-[#00A86B]" />
            <span className="text-xs font-mono text-slate-400">
              {lesson.codeLanguage || "code"}
            </span>
          </div>
          <pre className="bg-[#0B2545] text-green-400 p-4 rounded-b-xl border border-slate-700 overflow-x-auto">
            <code className="text-sm font-mono whitespace-pre">{lesson.codeContent}</code>
          </pre>
        </div>
      )
    );
  }

  if (lesson.documentUrl) {
    blocks.push(
      <a
        key="document"
        href={lesson.documentUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#00A86B] text-white text-sm font-semibold rounded-xl hover:bg-[#008f5a] transition-colors mb-4"
      >
        Open Document
      </a>
    );
  }

  if (lesson.items?.length > 0) {
    blocks.push(
      <div key="items" className="mt-6">
        <h2 className="text-base font-bold text-[#0B2545] uppercase tracking-wide mb-4">
          Lesson Sections
        </h2>
        {[...lesson.items]
          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
          .map((item, idx) => renderLessonItem(item, idx))}
      </div>
    );
  }

  return blocks.length > 0 ? blocks : null;
}

export default function LessonView() {
  const { moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLesson();
  }, [moduleId, lessonId]);

  const loadLesson = async () => {
    try {
      const { data } = await getLesson(moduleId, lessonId);
      setLesson(data);
    } catch (err) {
      console.error("Failed to load lesson:", err);
    } finally {
      setLoading(false);
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

  // Course content is locked until the student enrolls in the course
  // (the backend withholds content and sets locked = true).
  const isLocked = !!lesson.locked;

  if (isLocked) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-5">
              <Lock className="w-8 h-8 text-slate-400" />
            </div>
            <h1 className="text-xl font-bold text-[#0B2545]">
              This lesson is locked
            </h1>
            {lesson.title && (
              <p className="text-xs text-slate-400 mt-1">{lesson.title}</p>
            )}
            <p className="text-sm text-slate-500 mt-3 leading-relaxed">
              Enroll in this course to unlock all lessons, content and mock
              tests. The first modules are available as a free preview on the
              course page.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
              <button
                onClick={() =>
                  lesson.courseId
                    ? navigate(`/courses/${lesson.courseId}`)
                    : navigate("/courses")
                }
                className="px-6 py-2.5 bg-[#00A86B] hover:bg-[#008f5a] text-white text-sm font-bold rounded-xl shadow-md transition-all duration-200"
              >
                Go to Course &amp; Enroll
              </button>
              {!isAuthenticated && (
                <button
                  onClick={() => navigate("/login")}
                  className="px-6 py-2.5 bg-white border border-slate-200 text-[#0B2545] text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all duration-200"
                >
                  Login
                </button>
              )}
              <button
                onClick={() => navigate(-1)}
                className="text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const contentBlocks = renderRawLessonContent(lesson);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#00A86B] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <span className="text-xs font-semibold text-[#00A86B] uppercase tracking-wider">
              Lesson
            </span>
            <h1 className="text-2xl font-bold text-[#0B2545] mt-1">
              {lesson.title}
            </h1>
            {lesson.description && (
              <p className="text-sm text-slate-500 mt-2">
                {lesson.description}
              </p>
            )}
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
              {lesson.lessonType && (
                <span className="px-2 py-1 bg-slate-100 rounded">
                  {lesson.lessonType}
                </span>
              )}
              {lesson.estimatedMinutes && (
                <span>{lesson.estimatedMinutes} min read</span>
              )}
            </div>
          </div>

          <div className="p-6">
            {!contentBlocks ? (
              <p className="text-slate-400 text-center py-8">
                No content available for this lesson
              </p>
            ) : (
              <div className="prose prose-sm max-w-none">
                {contentBlocks}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
