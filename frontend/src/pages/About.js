import React from 'react';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">About Academic Excellence</h1>
          <p className="text-xl text-gray-600">Our mission to transform education through innovative assessment</p>
        </div>

        {/* Mission Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              We believe in the power of comprehensive assessment to unlock every student's potential. Our platform combines cutting-edge technology with educational expertise to provide teachers with the tools they need.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              Through intelligent evaluation systems, we empower educators to identify each student's strengths and areas for growth, fostering an environment where every learner can thrive.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl h-96 flex items-center justify-center text-6xl shadow-2xl">
            🎓
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition">
              <div className="text-4xl mb-3">👨‍🏫</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Excellence</h3>
              <p className="text-gray-600">Committed to the highest standards in education and assessment.</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition">
              <div className="text-4xl mb-3">🤝</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Collaboration</h3>
              <p className="text-gray-600">Fostering partnerships between teachers, students, and parents.</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition">
              <div className="text-4xl mb-3">💡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-600">Continuously improving our tools and methodologies.</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition">
              <div className="text-4xl mb-3">🌟</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Equity</h3>
              <p className="text-gray-600">Ensuring fair and accessible education for all students.</p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-gradient-to-r from-slate-900 to-purple-900 rounded-xl text-white p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Dedicated to Your Success</h2>
          <p className="text-lg text-gray-200 mb-6">
            Our team of education experts and technology professionals work tirelessly to provide the best assessment experience.
          </p>
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-3xl shadow-lg">
              👥
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
