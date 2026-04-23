import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { assessmentAPI } from '../services/api';

const READING_STORY = `The Mountain Field

Asha and Rafi met at the rocky edge of their village, where the mountain winds rushed across the open field. Asha was the only girl who played football in the whole valley, and she carried her ball with pride. Some leaders shake their heads when they saw her train, saying the game was not for girls, but she refused to stop. Rafi walked beside her each day, cheering her on as they climbed the steep path.

The ground was uneven, with stones hidden under the grass, and the thin air made their breaths short. Still, Asha dribbled and kicked with fierce joy. Rafi practised with her, blocking shots and passing the ball across the slope. Sometimes they slipped, sometimes the wind blew the ball too far, but they always tried again.

Asha's brother often joined them, laughing as he chased the ball down the hill. Their father watched from the field's edge, nodding proudly whenever Asha made a strong strike. He told her she had the spirit of a true player.

One evening, as the sun dipped behind the mountains, Asha scored a goal that echoed across the valley. She stood tall, imagining a stadium full of cheering fans. One day, she whispered, she would be a football hero. And with Rafi, her brother, and her father believing in her, the dream felt closer than ever.`;

const READING_SCORING = {
  'A': 'Very limited decoding and blending; frequent pauses; >15 errors per 100 words.',
  'B': 'Many errors, often misreads common digraphs; choppy phrasing; 11–15 errors per 100 words.',
  'C': 'Some errors; blends most words; occasional mistakes on longer words, 6–10 errors per 100 words.',
  'D': 'Few errors; reads in phrases with steady pace; self-corrects; 1–5 errors per 100 words.',
  'E': 'Accurate, fluent, and expressive; handles unfamiliar words; 0–1 errors per 100 words.'
};

function getPictureUrl(picNum) {
  const pictures = [
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&h=300&fit=crop'
  ];
  return pictures[picNum % pictures.length];
}

export default function ReadingAssessmentForm() {
  const [formData, setFormData] = useState({
    email: '',
    studentName: '',
    yearGroupAndClass: '',
    teacherName: ''
  });

  const [score, setScore] = useState(null);
  const [teacherNotes, setTeacherNotes] = useState('');
  const [loading, setLoading] = useState(false);

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
      toast.error('❌ Please select a reading accuracy score (A-E)', {
        position: 'top-right',
        autoClose: 4000,
      });
      setLoading(false);
      return;
    }

    try {
      const assessmentData = {
        assessmentType: 'Reading Assessment',
        yearGroupType: 'junior',
        email: formData.email,
        studentName: formData.studentName,
        yearGroupAndClass: formData.yearGroupAndClass,
        teacherName: formData.teacherName,
        readingScore: score,
        level: score,
        totalScore: ['A', 'B', 'C', 'D', 'E'].indexOf(score),
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
        teacherName: ''
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Reading Assessment</h1>
          <p className="text-gray-600 mb-4">Year 7-9 / Grade 6-8</p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded space-y-2">
            <p className="text-sm text-gray-700"><strong>Instructions for assessor:</strong></p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>• Present the story and ask the pupil to read aloud.</li>
              <li>• Allow 10-20 seconds per line.</li>
              <li>• Use the Teacher Notes box to mark accuracy, fluency, and comments.</li>
            </ul>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-gray-100 rounded-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">The Story</h2>
          <div className="bg-white p-6 rounded-lg mb-6 text-gray-800 leading-relaxed">
            {READING_STORY.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4">{paragraph}</p>
            ))}
          </div>

          {/* Supporting Pictures */}
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <img
                key={i}
                src={getPictureUrl(i)}
                alt={`Story picture ${i + 1}`}
                className="w-full h-48 object-cover rounded-lg shadow-md"
              />
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
            </div>
          </div>

          {/* Reading Accuracy Scoring */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Reading Accuracy Score (A-E)</h3>
            <div className="space-y-4">
              {Object.entries(READING_SCORING).map(([level, description]) => (
                <label key={level} className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-all" style={{borderColor: score === level ? '#6366f1' : '#e5e7eb', backgroundColor: score === level ? '#f0f4ff' : 'transparent'}}>
                  <input
                    type="radio"
                    name="readingScore"
                    value={level}
                    checked={score === level}
                    onChange={() => setScore(level)}
                    className="w-5 h-5 mt-1 cursor-pointer"
                  />
                  <div className="ml-4">
                    <p className="font-bold text-lg text-gray-900">{level}</p>
                    <p className="text-sm text-gray-600">{description}</p>
                  </div>
                </label>
              ))}
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 shadow-lg"
            >
              {loading ? 'Submitting...' : '📤 Submit Assessment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
