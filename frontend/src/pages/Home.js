import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Welcome to
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Academic Excellence
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-purple-200 mb-8 max-w-2xl mx-auto">
              Revolutionizing student assessment with intelligent, comprehensive evaluation tools
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/form" className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg">
                Start Assessment →
              </Link>
              <Link to="/about" className="px-8 py-4 bg-white text-purple-900 hover:bg-purple-50 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Why Choose Us?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-2xl mb-4 shadow-lg">
                📊
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Comprehensive Analytics</h3>
              <p className="text-gray-600">
                Detailed insights into student performance with real-time tracking and analysis capabilities.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-2xl mb-4 shadow-lg">
                ✅
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Easy Assessment</h3>
              <p className="text-gray-600">
                User-friendly interface designed for educators to quickly evaluate student competencies.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-2xl mb-4 shadow-lg">
                🎯
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Targeted Insights</h3>
              <p className="text-gray-600">
                Identify areas of improvement and celebrate student achievements with precision.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-slate-900 to-purple-900 text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">1000+</div>
              <p className="text-gray-300 mt-2">Students Assessed</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">500+</div>
              <p className="text-gray-300 mt-2">Teachers Using</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">50+</div>
              <p className="text-gray-300 mt-2">Schools Served</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">98%</div>
              <p className="text-gray-300 mt-2">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Assess Your Students?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Get started with our comprehensive assessment platform today. It takes just minutes to set up.
          </p>
          <Link to="/form" className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg">
            Begin Assessment Now
          </Link>
        </div>
      </section>
    </div>
  );
}
