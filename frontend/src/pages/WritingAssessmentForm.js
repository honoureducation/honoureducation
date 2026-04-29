import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { assessmentAPI } from '../services/api';
import writingImg1 from '../assets/writing1.jpg.jpeg';
import writingImg2 from '../assets/writing2.jpg.jpeg';
import writingImg3 from '../assets/writing3.jpg.jpeg';

const WRITING_QUESTIONS = [
  'Who and what can you see?',
  'What are they doing?',
  'Can you write a story for these pictures?'
];

const WRITING_SCORING = {
  'A': 'Labels or single words only; no sentences; meaning unclear.',
  'B': 'Fragmented or very short sentences; many errors; little sequence or link to pictures.',
  'C': 'Simple sentences with some sequence; basic vocabulary; capitals and full stops mostly correct.',
  'D': 'Organised into short paragraphs; clear sequence; developing vocabulary; mostly correct tense and punctuation.',
  'E': 'Fluent, cohesive narrative; varied sentences and precise vocabulary; accurate punctuation; minimal errors.'
};

function getPictureUrl(picNum) {
  const pictures = [writingImg1, writingImg2, writingImg3];
  return pictures[picNum % pictures.length];
}

export default function WritingAssessmentForm() {
  const [formData, setFormData] = useState({
    email: '',
    studentName: '',
    yearGroupAndClass: '',
    teacherName: ''
  });

  const [score, setScore] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.studentName) newErrors.studentName = 'Student name is required';
    if (!formData.yearGroupAndClass) newErrors.yearGroupAndClass = 'Year group/class is required';
    if (score === null) newErrors.score = 'Writing score is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('❌ Please fill in all required fields', {
        position: 'top-right',
        autoClose: 4000,
      });
      return;
    }

    setLoading(true);

    try {
      const assessmentData = {
        assessmentType: 'Writing Assessment',
        yearGroupType: 'junior',
        email: formData.email,
        studentName: formData.studentName,
        yearGroupAndClass: formData.yearGroupAndClass,
        teacherName: formData.teacherName,
        writingScore: score,
        level: score,
        totalScore: ['A', 'B', 'C', 'D', 'E'].indexOf(score),
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
        teacherName: ''
      });
      setScore(null);
      setNotes('');
      setErrors({});
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 md:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-xl">✏️</div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Writing Assessment</h1>
              <p className="text-gray-600 text-sm md:text-base">Year 7-9 / Grade 6-8</p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 md:p-6 rounded-r-lg animate-slideUp">
            <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>📋</span> Instructions for assessor
            </p>
            <ul className="text-sm text-gray-700 space-y-2 ml-6">
              <li>• Sit with the pupil in a calm, distraction-free space</li>
              <li>• Ask the pupil to write paragraphs / sentences for this picture</li>
              <li>• Use the questions to prompt</li>
            </ul>
          </div>
        </div>

        {/* Pictures and Questions */}
        <div className="card-elevated mb-8">
          <h2 className="section-title flex items-center gap-2 mb-6">
            <span>🖼️</span> Questions & Picture Prompts
          </h2>
          
          <ol className="space-y-2 text-gray-700 mb-6 ml-4">
            {WRITING_QUESTIONS.map((q, idx) => (
              <li key={idx} className="font-medium text-sm md:text-base">{idx + 1}. {q}</li>
            ))}
          </ol>

          {/* Pictures - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative bg-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 aspect-video md:aspect-square">
                  <img
                    src={getPictureUrl(i)}
                    alt={`Writing prompt picture ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="%236b7280"%3EImage ' + (i + 1) + '%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">Picture {i + 1}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          {/* Student Information Section */}
          <div className="card-bordered border-blue-500">
            <h2 className="section-title flex items-center gap-2 mb-6">
              <span>👤</span> Student Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="input-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`input-field ${errors.email ? 'input-field-error' : ''}`}
                  placeholder="teacher@example.com"
                  required
                />
                {errors.email && <p className="text-danger-600 text-xs mt-1">{errors.email}</p>}
              </div>
              
              <div>
                <label className="input-label">Student Name *</label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  className={`input-field ${errors.studentName ? 'input-field-error' : ''}`}
                  placeholder="e.g., John Smith"
                  required
                />
                {errors.studentName && <p className="text-danger-600 text-xs mt-1">{errors.studentName}</p>}
              </div>
              
              <div>
                <label className="input-label">Year Group & Class *</label>
                <input
                  type="text"
                  name="yearGroupAndClass"
                  value={formData.yearGroupAndClass}
                  onChange={handleInputChange}
                  className={`input-field ${errors.yearGroupAndClass ? 'input-field-error' : ''}`}
                  placeholder="e.g., Year 7A"
                  required
                />
                {errors.yearGroupAndClass && <p className="text-danger-600 text-xs mt-1">{errors.yearGroupAndClass}</p>}
              </div>
              
              <div>
                <label className="input-label">Teacher Name</label>
                <input
                  type="text"
                  name="teacherName"
                  value={formData.teacherName}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Your name (optional)"
                />
              </div>
            </div>
          </div>

          {/* Writing Quality Scoring */}
          <div className="card-bordered border-purple-500">
            <h2 className="section-title flex items-center gap-2 mb-6">
              <span>⭐</span> Writing Quality Score
            </h2>
            
            <div className="overflow-x-auto">
              <table className="table-base w-full">
                <thead>
                  <tr className="table-header">
                    <th className="table-cell font-bold w-16 md:w-20">Score</th>
                    <th className="table-cell font-bold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(WRITING_SCORING).map(([level], idx) => (
                    <tr
                      key={level}
                      onClick={() => setScore(level)}
                      className={`table-row cursor-pointer transition-all duration-150 ${
                        score === level
                          ? 'bg-primary-100 border-l-4 border-primary-600'
                          : 'border-l-4 border-transparent hover:bg-gray-50'
                      }`}
                    >
                      <td className="table-cell font-bold text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold ${
                          score === level
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {level}
                        </span>
                      </td>
                      <td className="table-cell text-sm md:text-base">
                        {WRITING_SCORING[level]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {score && (
              <div className="mt-4 p-4 bg-success-50 border border-success-200 rounded-lg flex items-center gap-3 animate-slideUp">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="text-success-700 font-semibold">Selected Score: <span className="text-lg">{score}</span></p>
                  <p className="text-success-600 text-sm">{WRITING_SCORING[score]}</p>
                </div>
              </div>
            )}

            {errors.score && (
              <div className="mt-4 p-4 bg-danger-50 border border-danger-200 rounded-lg flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <p className="text-danger-700 font-semibold">{errors.score}</p>
              </div>
            )}
          </div>

          {/* Teacher Observations */}
          <div className="card-bordered border-yellow-500">
            <h2 className="section-title flex items-center gap-2 mb-4">
              <span>📝</span> Teacher Observations
            </h2>
            <p className="input-helper mb-3">Optional: Record observations about sentence construction, vocabulary, spelling, punctuation, and engagement.</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Good vocabulary use but needs work on punctuation..."
              className="textarea-field"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 sm:gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1 py-3 md:py-4 text-base md:text-lg"
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Submitting...
                </>
              ) : (
                <>📤 Submit Assessment</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
