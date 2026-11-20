import React from 'react';
import ReadAloudButton from './ReadAloudButton';

/**
 * Writing questions shown one card per question:
 * the question, a "Read Question" button (AI reads it aloud),
 * and a lined box where the student types their answer.
 */
const countWords = (t = '') => (t.trim() ? t.trim().split(/\s+/).length : 0);

export default function WritingQuestions({
  questions = [],
  answers = [],
  onAnswerChange,
  note = 'Allow 10 minutes for the student to write.',
  title = 'Writing Questions',
}) {
  const answered = questions.filter((_, i) => (answers[i] || '').trim()).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-black text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Press <strong>Read Question</strong> to hear a question, then type your answer in the box.
          </p>
        </div>
        <span className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          {answered} / {questions.length} answered
        </span>
      </div>

      {note && (
        <div className="flex items-center gap-2 mb-5 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-100 text-sm font-semibold text-blue-700">
          <span aria-hidden="true">⏱️</span>
          Note: {note}
        </div>
      )}

      <div className="space-y-5">
        {questions.map((q, idx) => {
          const value = answers[idx] || '';
          const isStory = /story|paragraph|sentence/i.test(q);
          return (
            <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="text-base font-bold text-slate-900 leading-snug">
                  <span className="text-indigo-500 mr-2">{idx + 1}.</span>
                  {q}
                </p>
                <ReadAloudButton text={q} />
              </div>
              <textarea
                value={value}
                onChange={(e) => onAnswerChange(idx, e.target.value)}
                rows={isStory ? 8 : 3}
                placeholder={isStory ? 'Write your story here…' : 'Write your answer here…'}
                spellCheck={false}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-white text-base text-slate-900 leading-8 resize-y focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                style={{
                  // Lined-paper look, matching the writing sheet
                  backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 31px, #e2e8f0 31px, #e2e8f0 32px)',
                  backgroundAttachment: 'local',
                  lineHeight: '32px',
                }}
              />
              <p className="text-[11px] font-semibold text-slate-400 mt-1 text-right">
                {countWords(value)} words
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
