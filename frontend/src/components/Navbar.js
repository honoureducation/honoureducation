import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white shadow-2xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-xl font-bold shadow-lg">
              📚
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold">Academic Excellence</h1>
              <p className="text-purple-300 text-xs">Student Assessment System</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="hover:text-purple-300 transition-colors duration-200 font-medium hover:scale-105 transform">Home</Link>
            <Link to="/about" className="hover:text-purple-300 transition-colors duration-200 font-medium hover:scale-105 transform">About</Link>
            
            {/* Assessment Link */}
            <Link to="/assessments" className="hover:text-purple-300 transition-colors duration-200 font-medium hover:scale-105 transform">📋 Assessment</Link>

            <Link to="/list" className="hover:text-purple-300 transition-colors duration-200 font-medium hover:scale-105 transform">Records</Link>
            <Link to="/contact" className="hover:text-purple-300 transition-colors duration-200 font-medium hover:scale-105 transform">Contact</Link>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg">
              Sign In
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-purple-800 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/" className="block px-4 py-2 hover:bg-purple-800 rounded-lg transition-colors">Home</Link>
            <Link to="/about" className="block px-4 py-2 hover:bg-purple-800 rounded-lg transition-colors">About</Link>
            <Link to="/assessments" className="block px-4 py-2 hover:bg-purple-800 rounded-lg transition-colors font-semibold">📋 Assessment</Link>
            <Link to="/list" className="block px-4 py-2 hover:bg-purple-800 rounded-lg transition-colors">Records</Link>
            <Link to="/contact" className="block px-4 py-2 hover:bg-purple-800 rounded-lg transition-colors">Contact</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
