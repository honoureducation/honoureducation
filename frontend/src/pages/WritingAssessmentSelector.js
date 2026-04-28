import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function WritingAssessmentSelector() {
  const navigate = useNavigate();

  const options = [
    {
      id: 'junior-assessor',
      title: 'Year 7-9 / Grade 6-8',
      subtitle: 'Assessor Form',
      icon: '✏️',
      description: 'Writing assessment with sports picture prompts. Includes instructions, A-E scoring rubric, and teacher observations.',
      color: 'from-indigo-500 to-indigo-600',
      route: '/assessment/writing/junior'
    },
    {
      id: 'junior-student',
      title: 'Year 7-9',
      subtitle: 'Student Writing Sheet',
      icon: '📄',
      description: 'Student writing sheet with sports picture prompts. Questions and lined writing space for student response.',
      color: 'from-blue-500 to-blue-600',
      route: '/assessment/writing/junior-student'
    },
    {
      id: 'senior-student',
      title: 'Year 10-13 / Grade 9-12',
      subtitle: 'Student Writing Sheet',
      icon: '🗺️',
      description: 'Student writing sheet with landmark picture prompts. Questions and lined writing space for student response.',
      color: 'from-purple-500 to-purple-600',
      route: '/assessment/writing/senior-student'
    },
    {
      id: 'senior-assessor',
      title: 'Year 10-13 / Grade 9-12',
      subtitle: 'Assessor Form',
      icon: '📝',
      description: 'Writing assessment with landmark picture prompts. Includes instructions, A-E scoring rubric, and teacher observations.',
      color: 'from-violet-500 to-violet-600',
      route: '/assessment/writing/senior'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Writing Assessment</h1>
          <p className="text-xl text-gray-600">Select the grade level</p>
        </div>

        {/* Options Grid — 2x2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {options.map((option) => (
            <div
              key={option.id}
              onClick={() => navigate(option.route)}
              className="group cursor-pointer"
            >
              <div className="h-full bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                {/* Top Color Bar */}
                <div className={`h-2 bg-gradient-to-r ${option.color}`}></div>

                {/* Content */}
                <div className="p-8">
                  {/* Icon */}
                  <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {option.icon}
                  </div>

                  {/* Title + Subtitle */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all">
                    {option.title}
                  </h3>
                  <p className={`text-sm font-semibold mb-3 bg-gradient-to-r ${option.color} bg-clip-text text-transparent`}>
                    {option.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {option.description}
                  </p>

                  {/* Button */}
                  <button
                    onClick={() => navigate(option.route)}
                    className={`w-full px-6 py-3 bg-gradient-to-r ${option.color} text-white font-bold rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
                  >
                    Select
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/assessments')}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold rounded-lg transition-all duration-200"
          >
            ← Back to Assessments
          </button>
        </div>
      </div>
    </div>
  );
}
