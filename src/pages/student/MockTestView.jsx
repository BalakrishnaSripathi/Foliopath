import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardList,
  Clock,
  Target,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { getMockTest, submitMockTestAttempt } from "../../api/mockTestService";
import Header from "../../components/layout/Header";

export default function MockTestView() {
  const { mockTestId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mockTestId]);

  const loadData = async () => {
    try {
      const { data } = await getMockTest(mockTestId);
      setTest(data);
    } catch (err) {
      console.error("Failed to load mock test:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, label) => {
    setAnswers((prev) => ({ ...prev, [questionId]: label }));
  };

  const handleSubmit = async () => {
    const unanswered = (test.questions || []).filter(
      (q) => !answers[q.id]
    ).length;
    if (unanswered > 0 && !confirm(`${unanswered} question(s) unanswered. Submit anyway?`)) {
      return;
    }
    setSubmitting(true);
    try {
      const payload = { mockTestId, submittedAt: new Date().toISOString(), answers };
      console.log("Submitting mock test attempt:", payload);
      const { data } = await submitMockTestAttempt(mockTestId, answers);
      setResult(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Failed to submit mock test:", err);
      alert(err.message || "Failed to submit mock test");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A86B]" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Mock test not found</p>
      </div>
    );
  }

  const questions = (test.questions || []).sort(
    (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#00A86B] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
          <div className="flex items-start gap-3">
            <ClipboardList className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-[#0B2545]">{test.title}</h1>
              {test.description && (
                <p className="text-sm text-slate-500 mt-1">{test.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4 text-slate-400" />
                  {questions.length} questions
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {test.durationMinutes} min
                </span>
                <span className="flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-slate-400" />
                  Pass: {test.passPercentage}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {result && (
          <div
            className={`mb-6 rounded-2xl border p-5 ${
              result.passed
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-center gap-3">
              {result.passed ? (
                <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
              )}
              <div>
                <p
                  className={`font-bold text-lg ${
                    result.passed ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {result.passed ? "Passed!" : "Not passed"}
                </p>
                <p className="text-sm text-slate-600">
                  Score: {result.score}/{result.total} &middot;{" "}
                  {result.percentage}% (pass mark: {test.passPercentage}%)
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div
              key={q.id || idx}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="p-4 sm:p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 flex-shrink-0 rounded-lg bg-[#0B2545] text-white text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span
                      className={`inline-block text-xs px-1.5 py-0.5 rounded mb-2 ${
                        q.questionType === "CODE"
                          ? "bg-purple-50 text-purple-600"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {q.questionType}
                    </span>
                    <p className="text-sm font-semibold text-[#0B2545] whitespace-pre-wrap">
                      {q.questionText}
                    </p>
                  </div>
                </div>

                {q.codeContent && (
                  <pre className="ml-10 text-xs font-mono bg-[#0B2545] text-green-400 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap">
                    {q.codeContent}
                  </pre>
                )}

                <div className="ml-10 space-y-2">
                  {(q.options || []).map((opt) => {
                    const selected = answers[q.id] === opt.label;
                    return (
                      <label
                        key={opt.label}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                          selected
                            ? "border-[#00A86B] bg-[#00A86B]/5"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${q.id || idx}`}
                          checked={selected}
                          onChange={() => handleSelectOption(q.id, opt.label)}
                          className="accent-[#00A86B]"
                          disabled={!!result}
                        />
                        <span className="text-xs font-bold text-slate-400">
                          {opt.label}.
                        </span>
                        <span
                          className={`text-sm ${
                            selected ? "text-[#0B2545] font-medium" : "text-slate-600"
                          }`}
                        >
                          {opt.text}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {!result && questions.length > 0 && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-[#00A86B] hover:bg-[#008f5a] text-white font-semibold px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Test"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
