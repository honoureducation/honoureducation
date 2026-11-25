import React, { useState, useEffect } from 'react';
import StudentPicker from '../components/StudentPicker';
import { studentLabel, studentYearClass } from '../utils/students';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { assessmentAPI } from '../services/api';
import AIAssistantConductor from '../components/AIAssistantConductor';
import { aggregateReading, secondaryLevel } from '../utils/readingAutoScore';
import readin2nd1 from '../assets/readin2nd1.jpg.jpeg';
import readin2nd2 from '../assets/readin2nd2.jpg.jpeg';
import reading2nd3 from '../assets/reading2nd3.jpg.jpeg';

const READING_STORY_SENIOR = `A World Between Worlds

In a small international school nestled in the heart of Tokyo, a group of 17-year-old students gathered in the bustling cafeteria, their laughter and chatter a blend of various accents and languages. These students had grown up in a unique environment, navigating the complexities of living in a culture different from their parents' and the one they were born into.

Ava, originally from Brazil, moved to Japan with her family when she was just eight. As she shared stories of her recent trip back to São Paulo, her classmates listened intently, fascinated by her tales of vibrant street festivals and tropical beaches. Meanwhile, Amir, whose parents came from Egypt but who spent his early years in London, nodded along, relating Ava's experiences to his own summer visits to Cairo, filled with bustling bazaars and aromatic spices. Despite their diverse backgrounds, the common thread of living in Japan tied them together.

Their lives were a tapestry of cultural experiences, from celebrating Japanese festivals to observing Ramadan with their families. This multicultural environment had its challenges, too. Sometimes, Ava felt like she was living in a state of in-betweenness, not entirely fitting in with her Brazilian roots nor fully embracing Japanese customs. However, with each other's support, they found solace in their shared experiences, carving out a unique identity that was neither here nor there but entirely their own.

These third culture students, had developed a profound understanding of the value of diversity. They learned to appreciate different perspectives and adapt to ever-changing environments, skills they knew would serve them well in life. As they prepared for university applications and life beyond their school, they carried with them not just academic knowledge but also a deeper wisdom that came from growing up between worlds.`;

const READING_SCORING = [
  { level: 'A1 - Emerging', scoreRange: '1–4', descriptor: 'Very limited comprehension', capabilities: 'Recognises isolated words; cannot follow narrative; relies entirely on teacher scaffolds; cannot interpret cultural references.', errorFreq: '25+ errors' },
  { level: 'A2 - Developing', scoreRange: '5–8', descriptor: 'Basic comprehension of simple details', capabilities: 'Understands simple facts (characters, setting); struggles with abstract ideas; cannot explain identity themes; answers literal WH-questions only.', errorFreq: '15–20 errors' },
  { level: 'B1 - Secure', scoreRange: '9–12', descriptor: 'Understands main ideas and simple inferences', capabilities: 'Explains basic motivations (e.g., why Ava feels “in-between”); identifies multicultural themes; makes simple inferences with partial evidence.', errorFreq: '15 errors' },
  { level: 'B2 - Proficient', scoreRange: '13–15', descriptor: 'Analyses deeper meaning and implied ideas', capabilities: 'Interprets cultural identity conflict; explains “third culture” experiences; analyses relationships; identifies themes with textual evidence; summarises accurately.', errorFreq: '10–15 errors' },
  { level: 'C1 - Advanced', scoreRange: '16–17', descriptor: 'Critical, analytical reading', capabilities: 'Evaluates author intention; analyses tone, perspective, and cultural nuance; synthesises ideas across paragraphs; critiques representation of identity.', errorFreq: '10 errors' },
  { level: 'C2 - Mastery', scoreRange: '18–20', descriptor: 'Near-native academic reading', capabilities: 'Interprets subtle nuance, symbolism, and implied meaning; critiques cultural framing; evaluates bias; produces sophisticated, evidence-rich analysis.', errorFreq: '0–5 errors' }
];

function getPictureUrlSenior(picNum) {
  const pictures = [readin2nd1, readin2nd2, reading2nd3];
  return pictures[picNum % pictures.length];
}

const READING_QUESTIONS_SENIOR = [
  'Paragraph 1: In a small international school nestled in the heart of Tokyo, a group of 17-year-old students gathered in the bustling cafeteria, their laughter and chatter a blend of various accents and languages. These students had grown up in a unique environment, navigating the complexities of living in a culture different from their parents\' and the one they were born into.',
  'Paragraph 2: Ava, originally from Brazil, moved to Japan with her family when she was just eight. As she shared stories of her recent trip back to São Paulo, her classmates listened intently, fascinated by her tales of vibrant street festivals and tropical beaches. Meanwhile, Amir, whose parents came from Egypt but who spent his early years in London, nodded along, relating Ava\'s experiences to his own summer visits to Cairo, filled with bustling bazaars and aromatic spices. Despite their diverse backgrounds, the common thread of living in Japan tied them together.',
  'Paragraph 3: Their lives were a tapestry of cultural experiences, from celebrating Japanese festivals to observing Ramadan with their families. This multicultural environment had its challenges, too. Sometimes, Ava felt like she was living in a state of in-betweenness, not entirely fitting in with her Brazilian roots nor fully embracing Japanese customs. However, with each other\'s support, they found solace in their shared experiences, carving out a unique identity that was neither here nor there but entirely their own.',
  'Paragraph 4: These third culture students, had developed a profound understanding of the value of diversity. They learned to appreciate different perspectives and adapt to ever-changing environments, skills they knew would serve them well in life. As they prepared for university applications and life beyond their school, they carried with them not just academic knowledge but also a deeper wisdom that came from growing up between worlds.'
];

const READING_ITEMS = READING_QUESTIONS_SENIOR.map((q) => {
  const sep = q.indexOf(': ');
  return { label: q.slice(0, sep), text: q.slice(sep + 2) };
});

export default function ReadingAssessmentSeniorForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedTerm = searchParams.get('term') || 'T1';

  const [formData, setFormData] = useState({
    email: '',
    studentName: '',
    yearGroupAndClass: '',
    teacherName: '',
    term: preSelectedTerm
  });

  const [manualScore, setScore] = useState(null);
  const [teacherNotes, setTeacherNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiAnswers, setAiAnswers] = useState([]);
  const [readingResults, setReadingResults] = useState([]);

  // Auto-score from what the AI heard; the teacher only needs to submit
  const readingAgg = aggregateReading(readingResults);
  const autoScore = secondaryLevel(readingAgg);
  const score = manualScore || autoScore;
  const isAutoScore = !manualScore && !!autoScore;

  // Write the AI-captured reading mistakes into the Teacher Notes
  useEffect(() => {
    const read = (readingResults || []).filter((r) => r.analysis.hasReading);
    if (read.length === 0) return;
    const summary = ['[AI Reading Check]', ...read.map((r) => r.summary)].join('\n');
    setTeacherNotes((prev) => {
      if (!prev) return summary;
      const marker = prev.indexOf('[AI Reading Check]');
      if (marker !== -1) return `${prev.slice(0, marker)}${summary}`.trimStart();
      return `${prev}\n\n${summary}`;
    });
  }, [readingResults]);

  useEffect(() => {
    if (preSelectedTerm) {
      setFormData(prev => ({ ...prev, term: preSelectedTerm }));
    }
  }, [preSelectedTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.email || !formData.studentName || !formData.yearGroupAndClass) {
      toast.error('❌ Please fill in email, student name, and year group/class', {
        position: 'top-right',
        autoClose: 4000,
      });
      setLoading(false);
      return;
    }

    if (score === null) {
      toast.error('No score yet. Let the pupil read first, or select a reading assessment score', {
        position: 'top-right',
        autoClose: 4000,
      });
      setLoading(false);
      return;
    }

    try {
      const assessmentData = {
        assessmentType: 'Reading Assessment',
        yearGroupType: 'senior',
        email: formData.email,
        studentName: formData.studentName,
        yearGroupAndClass: formData.yearGroupAndClass,
        teacherName: formData.teacherName,
        term: formData.term,
        readingScore: score,
        level: score,
        totalScore: READING_SCORING.findIndex(s => s.level === score),
        readingNotes: teacherNotes
      };

      await assessmentAPI.createAssessment(assessmentData);
      toast.success('✅ Assessment submitted successfully!', {
        position: 'top-right',
        autoClose: 4000,
      });

      setFormData({
        email: '',
        studentName: '',
        yearGroupAndClass: '',
        teacherName: '',
        term: preSelectedTerm
      });
      setScore(null);
      setTeacherNotes('');
    } catch (err) {
      toast.error(`❌ Error: ${err.message || 'Failed to submit assessment'}`, {
        position: 'top-right',
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6 font-medium">
          <button 
            onClick={() => navigate('/assessments')}
            className="hover:text-blue-600 transition-colors"
          >
            Assessments
          </button>
          <span className="text-slate-300">/</span>
          <button 
            onClick={() => navigate('/assessment/reading')}
            className="hover:text-blue-600 transition-colors"
          >
            Reading
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900">Senior</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Reading Assessment</h1>
          <p className="text-gray-600 mb-4 font-medium uppercase tracking-wider text-xs">Year 10-13 / Grade 9-12</p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded space-y-2">
            <p className="text-sm text-gray-700"><strong>Instructions for assessor:</strong></p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>• Present the story and ask the pupil to read aloud.</li>
              <li>• Allow 10-15 seconds per line.</li>
              <li>• Use the Teacher Notes box to mark accuracy, fluency, and comments.</li>
            </ul>
          </div>
        </div>

        {/* AI Assessment Conductor */}
        <AIAssistantConductor
          mode="reading"
          readingItems={READING_ITEMS}
          title="AI Reading Conductor"
          onAnswersArrayChange={setAiAnswers}
          onReadingResultsChange={setReadingResults}
        />

        {/* Story Section */}
        <div className="bg-gray-100 rounded-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">The Story</h2>
          <div className="bg-white p-6 rounded-lg mb-6 text-gray-800 leading-relaxed border-l-4 border-teal-500">
            {READING_STORY_SENIOR.split('\n\n').map((paragraph, idx) => (
              <div key={idx} className="mb-4 last:mb-0">
                <p className={`${idx === 0 ? 'font-bold text-gray-900 mb-2' : 'mb-2'}`}>{paragraph}</p>
                {idx > 0 && aiAnswers && aiAnswers[idx - 1] && (
                  <div className="mt-2 mb-3 text-sm text-indigo-700 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 shadow-inner">
                    <span className="font-bold mr-1">AI Reading Check:</span> {readingResults[idx - 1]?.summary || `"${aiAnswers[idx - 1]}"`}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Supporting Pictures */}
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="relative bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={getPictureUrlSenior(i)}
                  alt={`Story scene ${i + 1}`}
                  className="w-full h-48 object-cover rounded-lg shadow-md border-2 border-teal-300"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="%236b7280"%3EImage ' + (i + 1) + '%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Student Information Section */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Student Information</h2>
            <StudentPicker
              tier="secondary"
              value={formData.studentName}
              onSelect={(s) => {
                setFormData((p) => ({
                  ...p,
                  studentName: studentLabel(s),
                  yearGroupAndClass: studentYearClass(s),
                  email: s.email || p.email || localStorage.getItem('userEmail') || '',
                }));
              }}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Student Name</label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Year Group & Class</label>
                <input
                  type="text"
                  name="yearGroupAndClass"
                  value={formData.yearGroupAndClass}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Teacher Name</label>
                <input
                  type="text"
                  name="teacherName"
                  value={formData.teacherName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Assessment Term</label>
                <select
                  name="term"
                  value={formData.term}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="T1">Term 1 (T1)</option>
                  <option value="T2">Term 2 (T2)</option>
                  <option value="T3">Term 3 (T3)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reading Assessment Score */}
          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
              Reading Assessment Score
            </h3>
            {score && (
              <div className="mb-4 flex flex-wrap items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm">
                <span className="font-bold text-emerald-800">{isAutoScore ? '✨ Auto-scored from the reading:' : 'Selected level:'}</span>
                <span className="font-black text-emerald-900 bg-white px-2 py-0.5 rounded-lg border border-emerald-200">{score}</span>
                {readingAgg.hasReading && (
                  <span className="text-emerald-700 text-xs font-semibold">{readingAgg.accuracy}% accuracy · {readingAgg.errorsPer100} errors / 100 words</span>
                )}
                {!isAutoScore && autoScore && autoScore !== score && (
                  <button type="button" onClick={() => setScore(null)} className="text-xs font-bold text-emerald-700 underline">Use AI score ({autoScore})</button>
                )}
              </div>
            )}
            {!score && (
              <p className="mb-4 text-xs font-semibold text-slate-500">The score is selected automatically once the pupil has read. Click a different row only if you disagree.</p>
            )}
            
            <div className="space-y-3 md:space-y-0 md:bg-white md:border md:border-purple-500 md:rounded-xl md:overflow-hidden">
              {/* Desktop Header */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 p-5 border-b border-purple-500 font-bold text-slate-900 text-[13px] bg-white items-end">
                <div className="col-span-2">CEFR Level</div>
                <div className="col-span-2">Score Range<br />(20 pts)</div>
                <div className="col-span-3">Descriptor<br />(Upper Secondary)</div>
                <div className="col-span-3">What the Student Can Do<br />(Reading)</div>
                <div className="col-span-2">Error Frequency<br />(per 100 words)</div>
              </div>

              {/* Rows */}
              <div className="flex flex-col gap-3 md:gap-0">
                {READING_SCORING.map(({ level, scoreRange, descriptor, capabilities, errorFreq }, idx) => (
                  <label
                    key={level}
                    className={`block md:grid md:grid-cols-12 gap-4 p-5 border md:border-t-0 md:border-x-0 cursor-pointer transition-colors duration-150 items-center rounded-xl md:rounded-none ${
                      idx === READING_SCORING.length - 1 ? 'md:border-b-0' : 'md:border-b md:border-purple-300'
                    } ${
                      score === level
                        ? 'bg-purple-50/50 shadow-sm md:shadow-none border-purple-500 md:border-purple-300'
                        : 'border-slate-200 hover:bg-slate-50/50 bg-white'
                    }`}
                  >
                    {/* CEFR Level & Radio */}
                    <div className="col-span-2 flex items-center gap-3 font-bold text-slate-900 mb-3 md:mb-0">
                      <input
                        type="radio"
                        name="readingScore"
                        value={level}
                        checked={score === level}
                        onChange={() => setScore(level)}
                        className="w-4 h-4 accent-purple-600 flex-shrink-0 cursor-pointer"
                      />
                      <span className="text-sm md:text-[13px] whitespace-nowrap">{level}</span>
                    </div>

                    {/* Score Range */}
                    <div className="col-span-2 text-sm md:text-[13px] font-bold text-slate-900 mb-2 md:mb-0 flex justify-between md:block">
                      <span className="md:hidden text-slate-500 font-normal">Score Range:</span>
                      {scoreRange}
                    </div>

                    {/* Descriptor */}
                    <div className="col-span-3 text-sm md:text-[13px] text-slate-700 mb-2 md:mb-0">
                      <span className="md:hidden text-slate-500 font-normal block mb-1">Descriptor:</span>
                      {descriptor}
                    </div>

                    {/* Capabilities */}
                    <div className="col-span-3 text-sm md:text-[13px] text-slate-700 leading-relaxed mb-3 md:mb-0">
                      <span className="md:hidden text-slate-500 font-normal block mb-1">Student can:</span>
                      {capabilities}
                    </div>

                    {/* Error Freq */}
                    <div className="col-span-2 text-sm md:text-[13px] font-bold text-slate-900 flex justify-between md:block pt-3 border-t border-slate-100 md:border-0 md:pt-0">
                      <span className="md:hidden text-slate-500 font-normal">Error Freq:</span>
                      {errorFreq}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Teacher Notes */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Teacher Notes</h3>
            <textarea
              value={teacherNotes}
              onChange={(e) => setTeacherNotes(e.target.value)}
              placeholder="Mark accuracy, fluency errors, and additional comments..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 h-24 resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-2xl hover:from-orange-600 hover:to-red-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-xl shadow-orange-600/20 flex items-center justify-center gap-2 text-base"
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
          </div>
        </form>
      </div>
    </div>
  );
}
