import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { assessmentAPI } from '../services/api';

export default function AssessmentForm() {
  const [formData, setFormData] = useState({
    email: '',
    studentName: '',
    yearGroupAndClass: '',
    teacherName: '',
    respondToGreeting: '',
    followSimpleInstructions: '',
    englishLanguageSupport: [],
    listeningSkillsLevel: '',
    readingSkillsLevel: '',
    speakingSkillsLevel: '',
    writingSkillsLevel: '',
    supportNeeds: [],
    readingAge: '',
    cat4Levels: '',
    bookBandLevel: '',
    phonicsLevel: '',
    developmentAreas: '',
    suggestionsForMaterials: '',
    classroomSupportIdeas: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e, fieldName) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [fieldName]: checked
        ? [...prev[fieldName], value]
        : prev[fieldName].filter(item => item !== value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        assessmentType: 'EAL & ELL'
      };
      await assessmentAPI.createAssessment(dataToSubmit);
      toast.success('✅ Assessment submitted successfully!', {
        position: 'top-right',
        autoClose: 4000,
      });
      setFormData({
        email: '',
        studentName: '',
        yearGroupAndClass: '',
        teacherName: '',
        respondToGreeting: '',
        followSimpleInstructions: '',
        englishLanguageSupport: [],
        listeningSkillsLevel: '',
        readingSkillsLevel: '',
        speakingSkillsLevel: '',
        writingSkillsLevel: '',
        supportNeeds: [],
        readingAge: '',
        cat4Levels: '',
        bookBandLevel: '',
        phonicsLevel: '',
        developmentAreas: '',
        suggestionsForMaterials: '',
        classroomSupportIdeas: ''
      });
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Secondary EAL & ELL Teacher Assessment</h1>
          <p className="text-gray-600">Inclusion Team Assessment Form</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded">
            ✅ Assessment submitted successfully!
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Information */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-blue-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-blue-500">📋</span> Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Valid email"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Student's name *</label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  placeholder="Short answer text"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Year group and class name *</label>
                <input
                  type="text"
                  name="yearGroupAndClass"
                  value={formData.yearGroupAndClass}
                  onChange={handleInputChange}
                  placeholder="e.g. Year 7 - 7A"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Teacher name</label>
                <input
                  type="text"
                  name="teacherName"
                  value={formData.teacherName}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Communication Skills */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-purple-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-purple-500">💬</span> Communication Skills
            </h2>

            <div className="space-y-6">
              <div>
                <p className="font-bold text-gray-900 mb-3">This child can respond to a greeting and share their name. *</p>
                <div className="flex gap-6">
                  {['Yes', 'Partly', 'No'].map(option => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="respondToGreeting"
                        value={option}
                        checked={formData.respondToGreeting === option}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-bold text-gray-900 mb-3">This child can follow simple instructions in English and answer simple questions. *</p>
                <div className="flex gap-6">
                  {['Yes', 'Partly', 'No'].map(option => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="followSimpleInstructions"
                        value={option}
                        checked={formData.followSimpleInstructions === option}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: English Language Support */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-pink-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-pink-500">🌍</span> English Language Support Needs
            </h2>
            <p className="text-gray-600 mb-4">This child is in need of help with the English language. (Tick all that apply) *</p>

            <div className="space-y-3">
              {[
                { value: 'New to English', label: 'He/she is new to English (Speaks mother tongue at home)' },
                { value: 'Basic English Speaker', label: 'He/she can speak some basic English and have a basic conversation' },
                { value: 'Basic Writing', label: 'He/she can write some basic sentences independently' },
                { value: 'Reading Difficulties', label: 'He/she cannot read an age 8 level book/text fluently in English' },
                { value: 'Discussion Contribution', label: 'He/she can not contribute to a discussion in English' },
                { value: 'Writing Paragraphs', label: 'He/she cannot write a comprehensible paragraph in English' }
              ].map(item => (
                <label key={item.value} className="flex items-start gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    value={item.value}
                    checked={formData.englishLanguageSupport.includes(item.value)}
                    onChange={(e) => handleCheckboxChange(e, 'englishLanguageSupport')}
                    className="w-4 h-4 mt-1"
                  />
                  <span className="text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 4: Skills Assessment */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-green-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-green-500">📊</span> Skills Assessment (Rate 1-5)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-3">Listening Skills Level (1=Low, 5=Good)</label>
                <select
                  name="listeningSkillsLevel"
                  value={formData.listeningSkillsLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select level</option>
                  {[1, 2, 3, 4, 5].map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-3">Reading & Reviewing Level (1=Low, 5=Good)</label>
                <select
                  name="readingSkillsLevel"
                  value={formData.readingSkillsLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select level</option>
                  {[1, 2, 3, 4, 5].map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-3">Speaking Level (1=Low, 5=Good)</label>
                <select
                  name="speakingSkillsLevel"
                  value={formData.speakingSkillsLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select level</option>
                  {[1, 2, 3, 4, 5].map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-3">Writing in English Level (1=Low, 5=Good)</label>
                <select
                  name="writingSkillsLevel"
                  value={formData.writingSkillsLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select level</option>
                  {[1, 2, 3, 4, 5].map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Support Areas */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-yellow-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-yellow-500">🎯</span> Support Areas Needed
            </h2>
            <p className="text-gray-600 mb-4">This child needs support with the following... (Tick all that apply)</p>

            <div className="space-y-3">
              {[
                'Speaking English',
                'Reading English',
                'Writing English',
                'Understanding basic instructions',
                'Key vocabulary understanding'
              ].map(item => (
                <label key={item} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    value={item}
                    checked={formData.supportNeeds.includes(item)}
                    onChange={(e) => handleCheckboxChange(e, 'supportNeeds')}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 6: Additional Assessment Data */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-orange-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-orange-500">📝</span> Assessment Levels
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Last reading age (GL or STAR assessments)</label>
                <input
                  type="text"
                  name="readingAge"
                  value={formData.readingAge}
                  onChange={handleInputChange}
                  placeholder="e.g. RA-7; CA-10"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">CAT 4 Levels (Verbal and Non-Verbal)</label>
                <input
                  type="text"
                  name="cat4Levels"
                  value={formData.cat4Levels}
                  onChange={handleInputChange}
                  placeholder="e.g. V-?; NV-?"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Book band level assessed</label>
                <input
                  type="text"
                  name="bookBandLevel"
                  value={formData.bookBandLevel}
                  onChange={handleInputChange}
                  placeholder="Book band level"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Phonics level or fresh start level</label>
                <input
                  type="text"
                  name="phonicsLevel"
                  value={formData.phonicsLevel}
                  onChange={handleInputChange}
                  placeholder="Phonics level"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 7: Text Areas */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-indigo-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-indigo-500">✍️</span> Detailed Assessment Notes
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">What other areas of development does the child need with reference to language and literature?</label>
                <textarea
                  name="developmentAreas"
                  value={formData.developmentAreas}
                  onChange={handleInputChange}
                  placeholder="Long answer text"
                  rows="4"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Suggestions for materials, resources or teaching ideas</label>
                <textarea
                  name="suggestionsForMaterials"
                  value={formData.suggestionsForMaterials}
                  onChange={handleInputChange}
                  placeholder="Long answer text"
                  rows="4"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Please give ideas on how you could support this child in class</label>
                <textarea
                  name="classroomSupportIdeas"
                  value={formData.classroomSupportIdeas}
                  onChange={handleInputChange}
                  placeholder="Short answer text"
                  rows="3"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : '✓ Submit Assessment'}
            </button>
            <button
              type="reset"
              className="px-8 py-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded-lg transition-all"
              onClick={() => window.location.reload()}
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
