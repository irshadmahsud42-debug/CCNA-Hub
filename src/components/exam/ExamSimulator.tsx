import React, { useState } from 'react';
import { CCNA_EXAM_QUESTIONS, CCNA_DOMAINS } from '../../data/ccnaData';
import { soundManager } from '../../utils/audio';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  RotateCcw,
  BookOpen,
  Clock,
  Sparkles,
  BarChart3,
} from 'lucide-react';

export const ExamSimulator: React.FC = () => {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);

  const question = CCNA_EXAM_QUESTIONS[currentQuestionIdx];
  const userAnswersForCurrent = selectedAnswers[question.id] || [];

  const handleOptionToggle = (optionId: string) => {
    soundManager.playKeyClick();
    if (question.isMultiSelect) {
      if (userAnswersForCurrent.includes(optionId)) {
        setSelectedAnswers({
          ...selectedAnswers,
          [question.id]: userAnswersForCurrent.filter((id) => id !== optionId),
        });
      } else {
        setSelectedAnswers({
          ...selectedAnswers,
          [question.id]: [...userAnswersForCurrent, optionId],
        });
      }
    } else {
      setSelectedAnswers({
        ...selectedAnswers,
        [question.id]: [optionId],
      });
    }
  };

  const calculateFinalScore = () => {
    let correctCount = 0;
    CCNA_EXAM_QUESTIONS.forEach((q) => {
      const userAns = selectedAnswers[q.id] || [];
      const isCorrect =
        userAns.length === q.correctOptionIds.length &&
        userAns.every((ans) => q.correctOptionIds.includes(ans));
      if (isCorrect) correctCount++;
    });

    const scaledScore = Math.round(300 + (correctCount / CCNA_EXAM_QUESTIONS.length) * 700);
    const passed = scaledScore >= 825;

    return {
      correctCount,
      total: CCNA_EXAM_QUESTIONS.length,
      scaledScore,
      passed,
    };
  };

  const submitExam = () => {
    soundManager.playFanfare();
    setExamSubmitted(true);
  };

  const resetExam = () => {
    soundManager.playKeyClick();
    setSelectedAnswers({});
    setCurrentQuestionIdx(0);
    setShowExplanation(false);
    setExamSubmitted(false);
  };

  const result = calculateFinalScore();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Top Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Certification Prep</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-medium">CCNA 200-301 Exam Simulator</span>
            <span aria-hidden="true">·</span>
            <span>Passing Score: 825 / 1000</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Official Exam Question Bank
          </h1>
          <p className="text-sm text-slate-300 mt-0.5 max-w-2xl">
            Test your readiness with scenario-based Cisco questions, routing table exhibits, and comprehensive technical rationales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetExam}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Exam</span>
          </button>
          {!examSubmitted && (
            <button
              onClick={submitExam}
              className="rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors shadow-sm"
            >
              Grade Exam Now
            </button>
          )}
        </div>
      </div>

      {!examSubmitted ? (
        /* Question Navigator & Main Question Box */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Question List Sidebar (4 cols) */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Question Navigator ({CCNA_EXAM_QUESTIONS.length} Items)
            </span>

            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
              {CCNA_EXAM_QUESTIONS.map((q, idx) => {
                const isCurrent = currentQuestionIdx === idx;
                const isAnswered = (selectedAnswers[q.id] || []).length > 0;

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      soundManager.playKeyClick();
                      setCurrentQuestionIdx(idx);
                      setShowExplanation(false);
                    }}
                    className={`h-9 rounded-xl border text-xs font-bold font-mono transition-all ${
                      isCurrent
                        ? 'border-emerald-400 bg-emerald-500 text-slate-950 shadow-md scale-105'
                        : isAnswered
                        ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                        : 'border-slate-800 bg-slate-950/70 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Q{idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Presentation Card (8 cols) */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-6">
            {/* Question Header */}
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold text-emerald-400 uppercase">
                  Question {currentQuestionIdx + 1} of {CCNA_EXAM_QUESTIONS.length}
                </span>
                <span>{question.isMultiSelect ? 'Multi-Select (Choose Two)' : 'Single Choice'}</span>
              </div>
              <h2 className="text-base font-semibold text-white leading-relaxed">
                {question.question}
              </h2>
            </div>

            {/* Exhibit Code Snippet if present */}
            {question.codeSnippet && (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
                <pre>{question.codeSnippet}</pre>
              </div>
            )}

            {/* Options List */}
            <div className="space-y-3">
              {question.options.map((opt) => {
                const isSelected = userAnswersForCurrent.includes(opt.id);

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionToggle(opt.id)}
                    className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/40 text-white ring-1 ring-emerald-500 shadow-sm'
                        : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg text-xs font-bold font-mono ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {opt.id}
                    </span>
                    <span className="flex-1 leading-relaxed">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions & Explanation */}
            <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-semibold"
              >
                <HelpCircle className="h-4 w-4" />
                <span>{showExplanation ? 'Hide Explanation' : 'Show Explanation'}</span>
              </button>

              {currentQuestionIdx < CCNA_EXAM_QUESTIONS.length - 1 && (
                <button
                  onClick={() => {
                    soundManager.playKeyClick();
                    setCurrentQuestionIdx((prev) => prev + 1);
                    setShowExplanation(false);
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors shadow-sm"
                >
                  <span>Next Question</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Explanation Drawer */}
            {showExplanation && (
              <div className="rounded-xl border border-sky-500/20 bg-sky-950/30 p-4 text-xs text-sky-200 space-y-2 animate-in fade-in">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-sky-400" />
                  <span>Correct Answer: {question.correctOptionIds.join(', ')}</span>
                </div>
                <p className="leading-relaxed text-slate-200">{question.explanation}</p>
                <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-2 font-mono">
                  Ref: {question.ciscoReference}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Exam Score Report */
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl max-w-2xl mx-auto text-center space-y-6">
          <div className="flex justify-center">
            {result.passed ? (
              <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                <Award className="h-8 w-8" />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40">
                <XCircle className="h-8 w-8" />
              </div>
            )}
          </div>

          <div>
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              CCNA 200-301 Exam Score Report
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-1">
              {result.passed ? 'PASSED / CERTIFIED!' : 'NOT PASSED - KEEP STUDYING'}
            </h2>
            <div className="font-mono text-4xl font-extrabold text-emerald-400 mt-2 tabular-nums">
              {result.scaledScore} / 1000
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Passing Standard: 825 · Correct Answers: {result.correctCount} of {result.total}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-center gap-3">
            <button
              onClick={resetExam}
              className="rounded-lg bg-emerald-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors shadow-sm"
            >
              Retake Practice Exam
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
