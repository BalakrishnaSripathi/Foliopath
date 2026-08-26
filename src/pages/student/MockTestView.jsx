import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardList,
  Clock,
  Target,
  Lock,
} from "lucide-react";
import {
  getMockTest,
  submitMockTestAttempt,
  getMyMockTestAttempt,
} from "../../api/mockTestService";
import Header from "../../components/layout/Header";

export default function MockTestView() {
  const { mockTestId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mockTestId]);

  const goForResult = (result) => {
    navigate(`/mock-tests/${mockTestId}/result`, {
      replace: true,
      state: { result },
    });
  };

  const loadData = async () => {
    try {
      // A student can take each mock test only once — if an attempt
      // already exists jump straight to the result page.
      let existingResult = null;
      try {
        const { data } = await getMyMockTestAttempt(mockTestId);
        existingResult = data;
      } catch {
        existingResult = null;
      }

      const { data } = await getMockTest(mockTestId);
      setTest(data);

      if (existingResult) {
        goForResult(existingResult);
        return;
      }
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
      const { data } = await submitMockTestAttempt(mockTestId, answers);
      navigate(`/mock-tests/${mockTestId}/result`, {
        state: { result: data },
      });
    } catch (err) {
      console.error("Failed to submit mock test:", err);
      if (err.response?.status === 409 || err.response?.status === 400) {
        alert(
          err.response?.data?.message ||
            "You have already taken this mock test."
        );
        try {
          const { data } = await getMyMockTestAttempt(mockTestId);
          goForResult(data);
        } catch {
          navigate("/StudentDashboard");
        }
      } else {
        alert(err.message || "Failed to submit mock test");
      }
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
                <span className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-slate-400" />
                  One attempt only
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-slate-600">
          You can attempt this mock test{" "}
          <span className="font-semibold text-[#00A86B]">only once</span>. Your
          result will be shown right after you submit.
        </div>

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

        {questions.length > 0 && (
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
