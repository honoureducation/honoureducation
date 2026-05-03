import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logonew.PNG';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/assessments', label: 'Assessments' },
  { to: '/records', label: 'Records' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setIsOpen(false); }, [location]);

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-200 ${scrolled
        ? 'bg-slate-900/95 backdrop-blur-md shadow-lg'
        : 'bg-slate-900'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logo} alt="Honour Education Logo" className="h-10 w-auto object-contain" />
            <div className="hidden sm:block">
              <span className="text-white font-semibold text-sm leading-none">Honour Education</span>
              <span className="block text-slate-400 text-xs leading-none mt-0.5">Multilingual Mapping Assessment</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${isActive(to)
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/assessments"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
            >
              New Assessment
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden border-t border-slate-800 py-3 space-y-1 animate-fade-in">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(to)
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
              >
                {label}
              </Link>
            ))}
            <div className="pt-2 pb-1 px-1">
              <Link
                to="/assessments"
                className="block w-full text-center px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                New Assessment
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
