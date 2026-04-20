import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AssessmentSelector() {
  const navigate = useNavigate();

  const assessments = [
    {
      id: 'eal-ell',
      title: 'Secondary EAL & ELL Teacher Assessment',
      icon: '📝',
      description: 'Comprehensive English language assessment covering communication, listening, reading, speaking, and writing skills.',
      color: 'from-blue-500 to-blue-600',
      route: '/assessment/eal-ell'
    },
    {
      id: 'listening-p1',
      title: 'Listening Assessment Part 1',
      icon: '🎧',
      description: '13 personal questions (Year 7-13 / Grade 6-12) with CEFR level scoring (A1-C2).',
      color: 'from-purple-500 to-purple-600',
      route: '/assessment/listening'
    },
    {
      id: 'listening-p2',
      title: 'Listening Assessment Part 2',
      icon: '🎤',
      description: 'Paragraph comprehension test with two versions - Junior (4 questions) and Senior (10 questions).',
      color: 'from-cyan-500 to-cyan-600',
      route: '/assessment/listening-part2'
    },
    {
      id: 'speaking',
      title: 'Speaking Assessment',
      icon: '🎙️',
      description: '6 speaking comprehension questions (Year 7-9 / Grade 6-8) with CEFR level scoring (A1-C2).',
      color: 'from-red-500 to-red-600',
      route: '/assessment/speaking'
    },
    {
      id: 'reading',
      title: 'Reading Assessment',
      icon: '📚',
      description: 'Reading accuracy assessment with passage comprehension (Year 7-9 / Grade 6-8) using A-E scoring.',
      color: 'from-green-500 to-green-600',
      route: '/assessment/reading'
    },
    {
      id: 'writing',
      title: 'Writing Assessment',
      icon: '✏️',
      description: 'Writing quality assessment with picture prompts (Year 7-9 / Grade 6-8) using A-E scoring.',
      color: 'from-indigo-500 to-indigo-600',
      route: '/assessment/writing'
    }
  ];

  const handleSelectAssessment = (route) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Assessment Options</h1>
          <p className="text-xl text-gray-600">Select an assessment type to begin</p>
        </div>

        {/* Assessment Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {assessments.map((assessment) => (
            <div
              key={assessment.id}
              onClick={() => handleSelectAssessment(assessment.route)}
              className="group cursor-pointer"
            >
              <div className="h-full bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-transparent overflow-hidden">
                {/* Top Color Bar */}
                <div className={`h-2 bg-gradient-to-r ${assessment.color}`}></div>

                {/* Content */}
                <div className="p-8">
                  {/* Icon */}
                  <div className={`text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300`}>
                    {assessment.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all">
                    {assessment.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {assessment.description}
                  </p>

                  {/* Button */}
                  <button
                    onClick={() => handleSelectAssessment(assessment.route)}
                    className={`w-full px-6 py-3 bg-gradient-to-r ${assessment.color} text-white font-bold rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
                  >
                    Select Assessment
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
