import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import logo from '../assets/logonew.PNG';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  {
    to: '/dashboard', label: 'Dashboard', requireAuth: true, dynamicRoute: true, icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
      </svg>
    )
  },
  {
    to: '/students', label: 'Students', requireAuth: true, requireTeacher: true, icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    )
  },
  {
    to: '/assessments', label: 'Assessments', requireAuth: true, requireTeacher: true, icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 0 012 2" />
      </svg>
    )
  },
  {
    to: '/records', label: 'Records', requireAuth: true, requireTeacher: true, icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 0 012 2v14a2 2 0 01-2 2h-2a2 0 01-2-2z" />
      </svg>
    )
  },
  { to: '/learn', label: 'Courses' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
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

  // Sidebar: lock page scroll while open, close on Esc or when the screen gets wide
  useEffect(() => {
    if (!isOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') setIsOpen(false); };
    const onResize = () => { if (window.innerWidth >= 1024) setIsOpen(false); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [isOpen]);

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
    const isAuth = authService.isAuthenticated();
    if (link.requireAuth && !isAuth) return false;
    if (link.hideOnAuth && isAuth) return false;
    if (link.requireTeacher && !authService.isApprovedTeacher()) return false;
    return true;
  }).map(link => {
    if (link.dynamicRoute) {
      return { ...link, to: getDashboardRoute() };
    }
    return link;
  });

  return (
    <>
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-slate-900/95 backdrop-blur-md shadow-xl border-b border-white/5'
          : 'bg-slate-900 border-b border-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link to={user ? getDashboardRoute() : "/"} className="flex items-center gap-2.5 group shrink-0 min-w-0">
            <div className="h-9 sm:h-10 shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <img src={logo} alt="Honour Education Logo" className="h-full w-auto object-contain drop-shadow-lg" />
            </div>
            <div className="hidden sm:block lg:hidden xl:block">
              <span className="block text-white font-black text-base lg:text-lg leading-none tracking-tight whitespace-nowrap">Honour Education</span>
              <span className="block text-blue-400 text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.18em] leading-none mt-1 whitespace-nowrap">Multilingual Mapping Programme</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5 mx-2 xl:mx-4 min-w-0">
            {visibleNavLinks.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                className={`px-2.5 xl:px-3 py-2 rounded-xl text-[13px] xl:text-sm font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 group ${isActive(to)
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
              >
                {icon && <span className={`hidden 2xl:inline transition-colors ${isActive(to) ? 'text-blue-400' : 'text-slate-500 group-hover:text-white'}`}>{icon}</span>}
                {label}
              </Link>
            ))}

          </div>

          {/* Right actions */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {user ? (
              <div className="flex items-center gap-3 pl-2 xl:pl-3 border-l border-slate-800">
                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center gap-2 xl:gap-3 px-2 xl:px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700">
                    <div className="w-7 h-7 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-xs font-black text-white shadow-inner">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <div className="text-left hidden 2xl:block">
                      <p className="text-xs font-bold text-white leading-none">{user.firstName}</p>
                      <p className="text-[10px] text-slate-500 leading-none mt-1 uppercase font-black">
                        {['admin', 'platform_admin', 'school_admin'].includes(user?.role) ? 'Admin' : 'Teacher'}
                      </p>
                    </div>
                    <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 z-50">
                    <div className="py-2">
                      <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50 rounded-t-2xl">
                        <p className="text-sm font-black text-slate-900 truncate">{user.fullName}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                      </div>

                      <div className="p-2">
                        <Link
                          to={getDashboardRoute()}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 font-bold hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors group/item"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-100/50 flex items-center justify-center text-blue-600 group-hover/item:scale-110 transition-transform">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                            </svg>
                          </div>
                          Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 font-bold hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors group/item"
                        >
                          <div className="w-8 h-8 rounded-lg bg-indigo-100/50 flex items-center justify-center text-indigo-600 group-hover/item:scale-110 transition-transform">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          My Profile
                        </Link>
                      </div>

                      <div className="border-t border-slate-50 mt-1 p-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-rose-600 font-bold hover:bg-rose-50 rounded-xl transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-rose-100/50 flex items-center justify-center text-rose-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                          </div>
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
                  className="px-4 py-2 text-slate-300 hover:text-white text-sm font-bold transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-black rounded-xl transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

      </div>
    </nav>
      {/* Mobile / small-screen sidebar — slides over the page, doesn't move anything */}
      <div
        className={`lg:hidden fixed inset-0 z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        aria-hidden={!isOpen}
      >
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Main menu"
          className={`absolute top-0 right-0 h-full w-[85vw] max-w-sm bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex items-center justify-between gap-3 px-5 h-16 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <img src={logo} alt="" className="h-9 w-auto object-contain" />
              <div className="min-w-0">
                <span className="block text-white font-black text-base leading-none truncate">Honour Education</span>
                <span className="block text-blue-400 text-[9px] font-bold uppercase tracking-[0.18em] leading-none mt-1 truncate">Multilingual Mapping Programme</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className="grid grid-cols-1 gap-1.5">
          {visibleNavLinks.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-colors ${isActive(to)
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-900/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
            >
              {icon && <span className={isActive(to) ? 'text-blue-400' : 'text-slate-500'}>{icon}</span>}
              {label}
            </Link>
          ))}
          </div>

          {user ? (
            <div className="pt-5 border-t border-slate-800 mt-5">
              <div className="flex items-center gap-4 px-4 py-4 bg-slate-800/50 rounded-2xl mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-sm font-black text-white">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-black text-white truncate">{user.fullName}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to={getDashboardRoute()}
                  className="flex flex-col items-center gap-2 px-4 py-5 bg-slate-800 hover:bg-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-300 transition-all active:scale-95"
                >
                  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  </svg>
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="flex flex-col items-center gap-2 px-4 py-5 bg-slate-800 hover:bg-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-300 transition-all active:scale-95"
                >
                  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </Link>
              </div>
              <button
                onClick={handleLogout}
                className="w-full mt-4 flex items-center justify-center gap-3 px-4 py-4 bg-rose-500/10 text-rose-500 rounded-2xl text-sm font-black transition-all active:scale-95 border border-rose-500/20"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-5 border-t border-slate-800 mt-5 space-y-3">
              <Link
                to="/login"
                className="block px-4 py-4 text-slate-300 hover:text-white hover:bg-slate-800 rounded-2xl text-sm font-black text-center border border-slate-800"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block w-full text-center px-4 py-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-black rounded-2xl transition-all shadow-xl shadow-blue-600/10"
              >
                Get Started
              </Link>
            </div>
          )}
          </div>
        </aside>
      </div>
    </>
  );
}