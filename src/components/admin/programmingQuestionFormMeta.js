import { SUPPORTED_PROGRAMMING_LANGUAGES } from "../../api/programmingQuestionService";

export const DIFFICULTY_LEVELS = ["EASY", "MEDIUM", "HARD"];

export const DIFFICULTY_STYLES = {
  EASY: "bg-green-100 text-green-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HARD: "bg-red-100 text-red-700",
};

let seq = 1000;

export const newTestCase = () => ({
  input: "",
  expectedOutput: "",
  isPublic: true,
  displayOrder: 1,
  _key: `tc-${++seq}`,
});

export const emptyProgrammingQuestion = (displayOrder) => ({
  title: "",
  problemStatement: "",
  difficulty: "MEDIUM",
  allowedLanguages: [...SUPPORTED_PROGRAMMING_LANGUAGES],
  inputFormat: "",
  outputFormat: "",
  constraints: "",
  sampleInput: "",
  sampleOutput: "",
  displayOrder,
  testCases: [newTestCase()],
});

/** Normalises an API question into the shape the form expects. */
export const toProgrammingQuestionForm = (q) => ({
  title: q.title || "",
  problemStatement: q.problemStatement || "",
  difficulty: q.difficulty || "MEDIUM",
  allowedLanguages:
    Array.isArray(q.allowedLanguages) && q.allowedLanguages.length > 0
      ? q.allowedLanguages
      : [...SUPPORTED_PROGRAMMING_LANGUAGES],
  inputFormat: q.inputFormat || "",
  outputFormat: q.outputFormat || "",
  constraints: q.constraints || "",
  sampleInput: q.sampleInput || "",
  sampleOutput: q.sampleOutput || "",
  displayOrder: q.displayOrder || 1,
  testCases: (q.testCases || []).map((tc) => ({ ...tc, _key: tc._key || `tc-${++seq}` })),
});
