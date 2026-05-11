import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

const NAV_LINKS = [
  { to: '/',           label: 'Home' },
  { to: '/dashboard',   label: 'Dashboard', requireAuth: true, dynamicRoute: true },
  { to: '/assessments', label: 'Assessments', requireAuth: true },
  { to: '/records',    label: 'Records', requireAuth: true },
  { to: '/about',      label: 'About' },
  { to: '/contact',    label: 'Contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    // Update user state when location changes
    setUser(authService.getCurrentUser());
  }, [location]);

  // Close mobile menu on route change
  useEffect(() => { setIsOpen(false); }, [location]);

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/';
  };

  const getDashboardRoute = () => {
    if (user?.role === 'admin' || user?.role === 'platform_admin' || user?.role === 'school_admin') return '/admin/dashboard';
    if (user?.role === 'teacher' && user?.status === 'approved') return '/teacher/dashboard';
    return '/';
  };

  const visibleNavLinks = NAV_LINKS.filter(link => {
    if (link.requireAuth && !authService.isAuthenticated()) {
      return false;
    }
    return true;
  }).map(link => {
    if (link.dynamicRoute) {
      return { ...link, to: getDashboardRoute() };
    }
    return link;
  });

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-slate-900/95 backdrop-blur-md shadow-lg'
          : 'bg-slate-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-blue-500 transition-colors">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0-2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <span className="text-white font-semibold text-base leading-none">Honour Education</span>
              <span className="block text-slate-400 text-[10px] uppercase tracking-wider leading-none mt-1">Academic Excellence</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {authService.isAdmin() ? (
              <>
                {visibleNavLinks.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                      isActive(to)
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
                <Link
                  to="/admin/dashboard"
                  className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Admin Console
                </Link>
              </>
            ) : (
              visibleNavLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive(to)
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {label}
                </Link>
              ))
            )}
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-semibold text-white">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <span className="text-sm font-medium">{user.firstName}</span>
                    <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                    <div className="py-2">
                      <div className="px-4 py-3 border-b border-slate-50">
                        <p className="text-sm font-bold text-slate-900 truncate">{user.fullName}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            (user.role === 'admin' || user.role === 'platform_admin' || user.role === 'school_admin') ? 'bg-indigo-100 text-indigo-700' :
                            user.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                            user.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-rose-100 text-rose-700'
                          }`}>
                            {user.role === 'admin' || user.role === 'platform_admin' || user.role === 'school_admin' ? 'Administrator' : 
                             user.status === 'approved' ? 'Teacher' :
                             user.status === 'pending' ? 'Pending Approval' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="py-1">
                        <Link
                          to={getDashboardRoute()}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          </svg>
                          Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          My Profile
                        </Link>
                        <Link
                          to="/records"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 0 012 2" />
                          </svg>
                          Assessment History
                        </Link>
                      </div>

                      <div className="border-t border-slate-50 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-slate-300 hover:text-white text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                >
                  Get Started
                </Link>
              </div>
            )}
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
          <div className="md:hidden border-t border-slate-800 py-4 space-y-1 animate-fade-in bg-slate-900 absolute left-0 right-0 px-4 shadow-2xl">
            {visibleNavLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive(to)
                    ? 'bg-slate-800 text-blue-400 border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {label}
              </Link>
            ))}
            
            {user ? (
              <div className="pt-4 pb-2 border-t border-slate-800 mt-4">
                <div className="px-4 py-3 bg-slate-800/50 rounded-2xl mb-4">
                  <p className="text-sm font-bold text-white truncate">{user.fullName}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
                <div className="space-y-1">
                  <Link
                    to={getDashboardRoute()}
                    className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl text-sm font-medium transition-colors"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-xl text-sm font-medium transition-colors mt-2"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 pb-2 border-t border-slate-800 mt-4 space-y-3">
                <Link
                  to="/login"
                  className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl text-sm font-medium transition-colors text-center"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block w-full text-center px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}