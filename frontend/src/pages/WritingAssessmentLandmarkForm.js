import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { assessmentAPI } from '../services/api';
import landmarkImg1 from '../assets/landmark_wall.png';
import landmarkImg2 from '../assets/landmark_colosseum.png';
import landmarkImg3 from '../assets/landmark_taj.png';

const WRITING_QUESTIONS = [
  '1. Who can you see?',
  '2. What are they doing?',
  '3. Can you write a story for these pictures?'
];

const WRITING_SCORING = [
  { level: 'A1 - Emerging Writer', scoreRange: '1–4', descriptor: 'A: Labels or single words only; no sentences; meaning unclear.', capabilities: 'Writes isolated words (e.g., “wall,” “building,” “India”). No sentence control. No link between ideas. Cannot describe or narrate.', errorFreq: '70–80% errors' },
  { level: 'A2 - Developing Writer', scoreRange: '5–8', descriptor: 'B: Fragmented or very short sentences; many errors; little sequence or link to pictures.', capabilities: 'Writes broken sentences (“The wall big. People walk.”). Minimal detail. No cohesion. Very limited vocabulary.', errorFreq: '60–70% errors' },
  { level: 'B1 - Competent Writer', scoreRange: '9–12', descriptor: 'C: Simple sentences with some sequence; basic vocabulary; capitals and full stops mostly correct.', capabilities: 'Writes a basic paragraph (4–6 sentences). Describes what they see. Attempts sequence (“First… then…”). Limited but clear meaning.', errorFreq: '60% errors' },
  { level: 'B2 - Proficient Writer', scoreRange: '13–15', descriptor: 'D: Organised into short paragraphs; clear sequence; developing vocabulary; mostly correct tense and punctuation.', capabilities: 'Writes a structured paragraph (6–10 sentences). Describes setting, atmosphere, and cultural significance. Uses some descriptive vocabulary and cohesive devices.', errorFreq: '40–50% errors' },
  { level: 'C1 - Advanced Writer', scoreRange: '16–17', descriptor: 'E: Fluent, cohesive narrative; varied sentences and precise vocabulary; accurate punctuation; minimal errors.', capabilities: 'Produces a well-developed descriptive or narrative piece. Uses imagery, tone, and advanced vocabulary. Shows cultural insight and perspective.', errorFreq: '30% errors' },
  { level: 'C2 - Mastery Writer', scoreRange: '18–20', descriptor: 'E (Extended Mastery): Fluent, cohesive narrative; precise vocabulary; minimal errors; stylistic control.', capabilities: 'Writes a sophisticated, vivid, near-academic description or narrative. Demonstrates nuance, symbolism, and cultural interpretation. Excellent cohesion and style.', errorFreq: '10–20% errors' }
];

function getPictureUrl(picNum) {
  const pictures = [landmarkImg1, landmarkImg2, landmarkImg3];
  return pictures[picNum % pictures.length];
}

export default function WritingAssessmentLandmarkForm() {
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

  const [score, setScore] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
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

    if (!score) {
      toast.error('❌ Please select a writing assessment score', {
        position: 'top-right',
        autoClose: 4000,
      });
      setErrors(p => ({ ...p, score: 'Score is required' }));
      setLoading(false);
      return;
    }

    try {
      const assessmentData = {
        assessmentType: 'Writing Assessment',
        yearGroupType: 'senior',
        email: formData.email,
        studentName: formData.studentName,
        yearGroupAndClass: formData.yearGroupAndClass,
        teacherName: formData.teacherName,
        term: formData.term,
        writingScore: score,
        level: score,
        totalScore: WRITING_SCORING.findIndex(s => s.level === score),
        writingNotes: notes
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
      setNotes('');
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
            onClick={() => navigate('/assessment/writing')}
            className="hover:text-blue-600 transition-colors"
          >
            Writing
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900">Senior (Landmarks)</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Writing Assessment Score</h1>
          <p className="text-gray-600 mb-4 font-medium uppercase tracking-wider text-xs">Year 10-13 / Grade 9-12</p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded space-y-2">
            <p className="text-sm text-gray-700"><strong>Instructions for assessor:</strong></p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>• Sit with the pupil in a calm, distraction-free space.</li>
              <li>• Ask the pupil to write paragraphs / sentences for this picture.</li>
              <li>• Use the questions to prompt.</li>
              <li>• Allow 10 minutes for student to write.</li>
            </ul>
          </div>
        </div>

        {/* Pictures and Questions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Questions</h2>
          <ol className="list-inside space-y-2 text-gray-700 mb-6">
            {WRITING_QUESTIONS.map((q, idx) => (
              <li key={idx} className="font-medium text-lg">{q}</li>
            ))}
          </ol>

          {/* Pictures */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="relative bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={getPictureUrl(i)}
                  alt={`Writing prompt scene ${i + 1}`}
                  className="w-full h-48 object-cover rounded-lg shadow-md border-4 border-purple-300"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="%236b7280"%3EImage %23' + (i + 1) + '%3C/text%3E%3C/svg%3E';
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

          {/* Writing Assessment Score */}
          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
              Writing Assessment Score
            </h3>

            <div className="space-y-3 md:space-y-0 md:bg-white md:border md:border-purple-500 md:rounded-xl md:overflow-hidden mb-6">
              {/* Desktop Header */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 p-5 border-b border-purple-500 font-bold text-slate-900 text-[13px] bg-white items-end">
                <div className="col-span-2">CEFR Level</div>
                <div className="col-span-2">Score Range<br />(20 pts)</div>
                <div className="col-span-3">Writing Descriptor<br />(Aligned to A–E)</div>
                <div className="col-span-3">What the Student Can Do<br />(Upper-Secondary Writing)</div>
                <div className="col-span-2">% Error Frequency</div>
              </div>

              {/* Rows */}
              <div className="flex flex-col gap-3 md:gap-0">
                {WRITING_SCORING.map(({ level, scoreRange, descriptor, capabilities, errorFreq }, idx) => (
                  <label
                    key={level}
                    className={`block md:grid md:grid-cols-12 gap-4 p-5 border md:border-t-0 md:border-x-0 cursor-pointer transition-colors duration-150 items-center rounded-xl md:rounded-none ${idx === WRITING_SCORING.length - 1 ? 'md:border-b-0' : 'md:border-b md:border-purple-300'
                      } ${score === level
                        ? 'bg-purple-50/50 shadow-sm md:shadow-none border-purple-500 md:border-purple-300'
                        : 'border-slate-200 hover:bg-slate-50/50 bg-white'
                      }`}
                  >
                    {/* CEFR Level & Radio */}
                    <div className="col-span-2 flex items-center gap-3 font-bold text-slate-900 mb-3 md:mb-0">
                      <input
                        type="radio"
                        name="writingScore"
                        value={level}
                        checked={score === level}
                        onChange={() => setScore(level)}
                        className="w-4 h-4 accent-purple-600 flex-shrink-0 cursor-pointer"
                      />
                      <span className="text-sm md:text-[13px] break-words whitespace-normal">{level}</span>
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
            {errors.score && <p className="form-error mt-2 text-red-500">{errors.score}</p>}
          </div>

          {/* Teacher Observations */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Teacher Observations</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record observations about sentence construction, vocabulary use, spelling, punctuation, and engagement..."
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
