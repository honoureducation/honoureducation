import React, { useState, useEffect } from 'react';
import StudentDetailsCard from '../components/StudentDetailsCard';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { assessmentAPI } from '../services/api';
import AIAssistantConductor from '../components/AIAssistantConductor';
import ReadAloudButton from '../components/ReadAloudButton';
import { scoreAgainstKey } from '../utils/listeningRubric';

/* ── Data ─────────────────────────────────────────────────── */
const PASSAGE_JUNIOR = [
  'I usually wake up at 6:30 in the morning. After breakfast, I take the bus to school. I enjoy science because we do lots of experiments. At the weekend, I like to play football with my friends or watch movies with my family.',
];

const PASSAGE_SENIOR = [
  'Last weekend, our school organised a community volunteering event in the city. Students were able to choose from several activities, including helping at a local food bank, supporting a beach clean-up, and assisting elderly residents with digital skills training. More than two hundred students took part.',
  'Although the event was successful overall, the organisers identified a few challenges. Firstly, the weather forecast changed unexpectedly, causing delays for the beach clean-up team. Secondly, some students mentioned that they would have liked clearer instructions before arriving at their assigned locations.',
  "Despite these issues, feedback from community partners was extremely positive. They especially appreciated the students' professionalism and teamwork. As a result, the school is considering making the event a monthly programme rather than an annual one.",
];

const QUESTIONS_JUNIOR = [
  'What time does the student wake up?',
  'How does the student travel to school?',
  'What subject does the student enjoy?',
  'What does the student do at the weekend?',
];

const QUESTIONS_SENIOR = [
  'What types of volunteering activities were available?',
  'How many students took part in the event?',
  'What unexpected problem affected one of the teams?',
  'What did some students want before arriving at their locations?',
  'Which group had delays, and why?',
  'What kind of feedback did the community partners give?',
  'Why is the school considering changing the frequency of the event?',
  'Which student qualities were mentioned positively?',
  'Identify one challenge and one positive outcome mentioned in the passage.',
  'Summarise the overall success of the event in one sentence.',
];

// Answer keys taken from the teacher script (internal marking only — never shown).
// Each idea lists alternative words; "need" = ideas required for full marks.
const ANSWER_KEY_JUNIOR = [
  { ideas: [["6 30", "630", "six thirty", "half past six", "6 and 30"]] },
  { ideas: [["bus", "school bus"]] },
  { ideas: [["science"]] },
  { ideas: [["football", "soccer"], ["movie", "movies", "film", "films"]], need: 2 },
];

const ANSWER_KEY_SENIOR = [
  { ideas: [["food bank", "food"], ["beach", "clean up", "cleanup", "cleaning"], ["elderly", "old people", "older people", "digital", "computer", "technology"]], need: 2 },
  { ideas: [["200", "two hundred", "more than 200"]] },
  { ideas: [["weather", "forecast", "rain", "storm"], ["delay", "delays", "late", "beach"]], need: 2 },
  { ideas: [["instructions", "information", "directions", "guidance"], ["clear", "clearer", "better", "more"]], need: 2 },
  { ideas: [["beach", "clean up", "cleanup"], ["weather", "forecast", "rain"]], need: 2 },
  { ideas: [["positive", "good", "great", "excellent", "happy", "pleased", "appreciated"]] },
  { ideas: [["positive", "feedback", "success", "successful", "appreciated", "went well"], ["monthly", "every month", "month", "more often", "annual", "every year"]], need: 2 },
  { ideas: [["professional", "professionalism"], ["teamwork", "team work", "team", "together"]], need: 2 },
  { ideas: [["weather", "forecast", "delay", "instructions"], ["positive", "feedback", "teamwork", "professional", "200", "two hundred", "success"]], need: 2 },
  { ideas: [["success", "successful", "positive", "went well", "great", "good"]] },
];

const CEFR_BANDS_JUNIOR = [
  { range: '0–1', level: 'A1', desc: 'Understands very little; isolated words only.', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  { range: '2–4', level: 'A2', desc: 'Understands simple, clear factual details with support.', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  { range: '5–6', level: 'B1', desc: 'Can follow main points and extract key information.', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  { range: '6–7', level: 'B2', desc: 'Accurate, detailed listening; understands all essential information.', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  { range: '8', level: 'C1-C2', desc: 'Fully accurate, precise, confident comprehension. No errors.', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
];

const CEFR_BANDS_SENIOR = [
  { range: '0–4', level: 'A1', desc: 'Understands almost none of the text; isolated words only.', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  { range: '5–8', level: 'A2', desc: 'Understands basic, simple information; may catch 1–2 details.', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  { range: '9–12', level: 'B1', desc: 'Understands main ideas but misses detail; partial comprehension.', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  { range: '13–16', level: 'B2', desc: 'Good comprehension of details, reasons, cause/effect; mostly accurate.', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  { range: '17–18', level: 'C1', desc: 'Very accurate and detailed understanding; able to interpret implied meaning.', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  { range: '19–20', level: 'C2', desc: 'Near-native comprehension; precise, complete, nuanced understanding.', color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200' },
];

const CEFR_COLORS = {
  A1: 'text-red-600 bg-red-50 border-red-200',
  A2: 'text-orange-600 bg-orange-50 border-orange-200',
  B1: 'text-amber-600 bg-amber-50 border-amber-200',
  B2: 'text-blue-600 bg-blue-50 border-blue-200',
  C1: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  'C1-C2': 'text-emerald-600 bg-emerald-50 border-emerald-200',
  C2: 'text-violet-600 bg-violet-50 border-violet-200',
};

function getCefrJunior(t) {
  if (t <= 1) return 'A1'; if (t <= 4) return 'A2'; if (t <= 5) return 'B1';
  if (t <= 7) return 'B2'; return 'C1-C2';
}
function getCefrSenior(t) {
  if (t <= 4) return 'A1'; if (t <= 8) return 'A2'; if (t <= 12) return 'B1';
  if (t <= 16) return 'B2'; if (t <= 18) return 'C1'; return 'C2';
}

/* ── Component ────────────────────────────────────────────── */
export default function ListeningAssessmentPart2Form({ yearGroupProp }) {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const preSelectedTerm = searchParams.get('term') || 'T1';

  // Support both prop-based and route-based year group detection
  const yearGroup = yearGroupProp || params.yearGroup || 'junior';
  const isJunior = yearGroup === 'junior';

  const questions = isJunior ? QUESTIONS_JUNIOR : QUESTIONS_SENIOR;
  const passage = isJunior ? PASSAGE_JUNIOR : PASSAGE_SENIOR;
  const answerKey = isJunior ? ANSWER_KEY_JUNIOR : ANSWER_KEY_SENIOR;
  const cefrBands = isJunior ? CEFR_BANDS_JUNIOR : CEFR_BANDS_SENIOR;
  const maxScore = isJunior ? 8 : 20;
  const getCefr = isJunior ? getCefrJunior : getCefrSenior;

  const [formData, setFormData] = useState({
    email: '',
    studentName: '',
    yearGroupAndClass: '',
    teacherName: '',
    term: preSelectedTerm
  });
  const [scores, setScores] = useState(Array(questions.length).fill(null));
  const [totalScore, setTotalScore] = useState(0);
  const [cefrLevel, setCefrLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const [, setTranscript] = useState('');
  const [aiAnswers, setAIAnswers] = useState([]);

  useEffect(() => {
    if (preSelectedTerm) {
      setFormData(prev => ({ ...prev, term: preSelectedTerm }));
    }
  }, [preSelectedTerm]);

  // Auto-scoring based on AI transcript
  useEffect(() => {
    let changed = false;
    const nextScores = [...scores];

    aiAnswers.forEach((ans, i) => {
      if (ans && ans.trim().length > 0) {
        // Marked against the answer key: 2 = correct & complete sentence,
        // 1 = partly correct (or correct but one/two words), 0 = wrong
        const inferredScore = scoreAgainstKey(ans, answerKey[i]).score;

        if (nextScores[i] !== inferredScore) {
          nextScores[i] = inferredScore;
          changed = true;
        }
      }
    });

    if (changed) {
      setScores(nextScores);
      const total = nextScores.reduce((s, v) => s + (v ?? 0), 0);
      setTotalScore(total);
      setCefrLevel(getCefr(total));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiAnswers]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleScore = (idx, val) => {
    const next = [...scores];
    next[idx] = val;
    setScores(next);
    const total = next.reduce((s, v) => s + (v ?? 0), 0);
    setTotalScore(total);
    setCefrLevel(getCefr(total));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.studentName || !formData.yearGroupAndClass) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (scores.includes(null)) {
      toast.error(`Please score all ${questions.length} questions.`);
      return;
    }
    setLoading(true);
    try {
      await assessmentAPI.createAssessment({
        assessmentType: 'Listening Part 2',
        yearGroupType: yearGroup,
        email: formData.email,
        studentName: formData.studentName,
        yearGroupAndClass: formData.yearGroupAndClass,
        teacherName: formData.teacherName,
        term: formData.term,
        listeningAssessmentAnswers: scores.map((score, i) => ({ questionId: i + 1, score })),
        totalScore,
        cefrLevel,
        level: cefrLevel,
      });
      toast.success('Assessment submitted successfully!');
      setFormData({
        email: '',
        studentName: '',
        yearGroupAndClass: '',
        teacherName: '',
        term: preSelectedTerm
      });
      setScores(Array(questions.length).fill(null));
      setTotalScore(0);
      setCefrLevel('');
    } catch (err) {
      toast.error(`Failed to submit: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const answered = scores.filter(s => s !== null).length;
  const progress = Math.round((answered / questions.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="breadcrumb mb-2">
            <button onClick={() => navigate('/assessments')} className="hover:text-slate-700 transition-colors">
              Assessments
            </button>
            <span className="breadcrumb-sep">/</span>
            <button onClick={() => navigate('/assessment/listening-part2')} className="hover:text-slate-700 transition-colors">
              Listening Part 2
            </button>
            <span className="breadcrumb-sep">/</span>
            <span className="text-slate-700 font-medium">{isJunior ? 'Year 7–9' : 'Year 10–13'}</span>
          </nav>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="page-title">Listening Assessment Part 2</h1>
              <p className="page-subtitle">
                {isJunior ? 'Year 7–9 · Grade 6–8' : 'Year 10–13 · Grade 9–12'} · Max score: {maxScore}
              </p>
            </div>
            {cefrLevel && (
              <span className={`badge text-sm px-3 py-1.5 border ${CEFR_COLORS[cefrLevel]}`}>
                CEFR {cefrLevel}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Student info */}
          <StudentDetailsCard
            formData={formData}
            setFormData={setFormData}
            onChange={handleInput}
            accent="blue"
          />

          {/* Listening passage — read by the teacher or by the AI voice (🔊) */}
          <div className="info-banner">
            <svg className="info-banner-icon w-6 h-6 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <p className="font-semibold text-slate-800 text-lg">Listening passage (read aloud):</p>
                <ReadAloudButton text={passage.join(' ')} label="Listen to Passage" />
              </div>
              <div className="text-slate-800 text-lg md:text-xl leading-relaxed space-y-3">
                {passage.map((para, i) => (
                  <p key={i}>
                    {i === 0 ? '"' : ''}{para}{i === passage.length - 1 ? '"' : ''}
                  </p>
                ))}
              </div>
              <p className="text-sm text-slate-500 mt-4">
                Record score '0' for no response, '1' for good response and '2' for a complete response.
              </p>
            </div>
          </div>

          <AIAssistantConductor
            questions={questions}
            onCompleteTextChange={setTranscript}
            onAnswersArrayChange={setAIAnswers}
          />

          {/* Questions */}
          <div className="card-section">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-heading mb-0">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
                Assessment Questions
              </h2>
              <span className="text-xs text-slate-500">{answered}/{questions.length} scored</span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-1.5 mb-5">
              <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="w-12">Question</th>
                    <th></th>
                    <th className="text-center w-32">No response (0)</th>
                    <th className="text-center w-32">Some comprehension (1)</th>
                    <th className="text-center w-32">Full comprehension (2)</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, i) => {
                    // Junior questions continue numbering from Part 1 (13 questions), so start at 14
                    const qNum = isJunior ? i + 14 : i + 1;
                    return (
                      <React.Fragment key={i}>
                        <tr className={scores[i] !== null ? 'bg-blue-50/40' : ''}>
                          <td className="text-slate-500 font-medium text-sm align-top pt-4">{qNum}</td>
                          <td className="text-slate-800 pt-4">
                            <div className="font-medium">{q}</div>
                            {aiAnswers[i] && (
                              <div className="mt-2 text-sm text-indigo-700 bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100 shadow-inner mb-3">
                                <span className="font-bold mr-1">Student Answer (AI):</span> "{aiAnswers[i]}"
                                <span className="block mt-1 text-xs font-bold text-slate-600">
                                  AI mark: {scoreAgainstKey(aiAnswers[i], answerKey[i]).score}/2 · {scoreAgainstKey(aiAnswers[i], answerKey[i]).reason}
                                </span>
                              </div>
                            )}
                          </td>
                          {[0, 1, 2].map(val => (
                            <td key={val} className="text-center pt-4">
                              <input
                                type="radio"
                                name={`q-${i}`}
                                value={val}
                                checked={scores[i] === val}
                                onChange={() => handleScore(i, val)}
                                className="w-4 h-4 accent-blue-600 cursor-pointer"
                              />
                            </td>
                          ))}
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Score summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="score-box-blue">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Total Score</p>
              <p className="text-4xl font-bold text-blue-700">
                {totalScore}<span className="text-lg text-blue-400">/{maxScore}</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">{questions.length} questions × 2 points</p>
            </div>
            <div className={`score-box border ${cefrLevel ? CEFR_COLORS[cefrLevel] : 'bg-slate-50 border-slate-200'}`}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1 opacity-70">CEFR Level</p>
              <p className="text-4xl font-bold">{cefrLevel || '—'}</p>
              {cefrLevel && (
                <p className="text-xs mt-1 opacity-70">
                  {cefrBands.find(b => b.level === cefrLevel)?.desc}
                </p>
              )}
            </div>
          </div>

          {/* CEFR reference */}
          <div className="card-section">
            <h2 className="section-heading">CEFR Scoring Reference</h2>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Total Score (out of {maxScore})</th>
                    <th>CEFR Level</th>
                    <th>{isJunior ? 'Descriptor' : 'Meaning / Interpretation'}</th>
                  </tr>
                </thead>
                <tbody>
                  {cefrBands.map(({ range, level, desc, color }) => (
                    <tr key={level} className={cefrLevel === level ? 'bg-blue-50/60' : ''}>
                      <td className="font-semibold">{range}</td>
                      <td><span className={`font-bold ${color}`}>{level}</span></td>
                      <td className="text-slate-500 text-xs">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-8 py-4 bg-gradient-to-r ${isJunior ? 'from-blue-600 to-indigo-600 shadow-blue-600/20' : 'from-orange-500 to-red-600 shadow-orange-600/20'} text-white font-bold rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-xl flex items-center justify-center gap-2 text-base`}
            >
              {loading ? (
                <>
                  <span className="spinner" /> Submitting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Submit Assessment
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/assessment/listening')}
              className="px-8 py-4 bg-white text-slate-600 font-bold rounded-2xl border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base shadow-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
