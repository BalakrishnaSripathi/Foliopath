import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Target,
  ClipboardList,
  BookOpen,
  LayoutDashboard,
} from "lucide-react";
import { getMockTest, getMyMockTestAttempt } from "../../api/mockTestService";
import Header from "../../components/layout/Header";

export default function MockTestResultPage() {
  const { mockTestId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState(location.state?.result || null);
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(!result);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mockTestId]);

  const loadData = async () => {
    setLoading(true);
    try {
      let attempt = result;
      if (!attempt) {
        try {
          const { data } = await getMyMockTestAttempt(mockTestId);
          attempt = data;
        } catch {
          attempt = null;
        }
      }

      if (!attempt) {
        // No attempt yet — go take the test
        navigate(`/mock-tests/${mockTestId}`, { replace: true });
        return;
      }
      setResult(attempt);

      try {
        const { data } = await getMockTest(mockTestId);
        setTest(data);
      } catch {
        setTest(null);
      }
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

  if (!result) return null;

  const passed = !!result.passed;
  const passMark = test?.passPercentage ?? 50;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Result hero */}
        <div
          className="rounded-3xl overflow-hidden shadow-lg mb-8 bg-[#0B2545]"
        >
          <div
            className={`h-1.5 w-full ${passed ? "bg-[#00A86B]" : "bg-red-500"}`}
          />
          <div className="p-8 sm:p-10 text-center text-white">
            <div
              className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-5 ${
                passed ? "bg-[#00A86B]" : "bg-red-500"
              }`}
            >
              {passed ? (
                <CheckCircle2 className="w-11 h-11 text-white" />
              ) : (
                <XCircle className="w-11 h-11 text-white" />
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              {passed ? "Passed!" : "Fail"}
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              {passed
                ? "Congratulations! You cleared this mock test."
                : "Don't worry — keep practicing and try the next one."}
            </p>

            {test?.title && (
              <p className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-slate-200">
                <ClipboardList className="w-3.5 h-3.5" />
                {test.title}
              </p>
            )}

            {/* Score breakdown */}
            <div className="grid grid-cols-3 gap-3 mt-8">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-2xl font-black">
                  {result.score}/{result.total}
                </p>
                <p className="text-xs text-slate-300 mt-1">Correct</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p
                  className={`text-2xl font-black ${
                    passed ? "text-[#00A86B]" : "text-red-400"
                  }`}
                >
                  {result.percentage}%
                </p>
                <p className="text-xs text-slate-300 mt-1">Your Score</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-2xl font-black flex items-center justify-center gap-1">
                  <Target className="w-4 h-4 text-slate-300" />
                  {passMark}%
                </p>
                <p className="text-xs text-slate-300 mt-1">Pass Mark</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate("/StudentDashboard")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#00A86B] hover:bg-[#008f5a] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            <LayoutDashboard className="w-4 h-4" />
            Go to My Courses
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-[#0B2545] text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all duration-200"
          >
            <BookOpen className="w-4 h-4 text-[#00A86B]" />
            Back to Course
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Each mock test can be attempted only once.
          {result.submittedAt &&
            ` Submitted on ${new Date(result.submittedAt).toLocaleString()}.`}
        </p>
      </div>
    </div>
  );
}
