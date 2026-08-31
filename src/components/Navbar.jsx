import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, HistoryIcon, ZapIcon } from 'lucide-react';
import { UserButton, useUser } from '@clerk/react';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/sessions', label: 'Sessions', icon: HistoryIcon },
  { to: '/pricing', label: 'Pricing', icon: ZapIcon },
];

const Navbar = () => {
  const { isSignedIn, user } = useUser();
  const location = useLocation();
  const userName =
    user?.fullName ||
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress?.split('@')[0] ||
    'User';

  return (
    <>
      {/* Top Header */}
      <header className="w-full bg-white/90 backdrop-blur sticky top-0 z-40 border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link to="/dashboard" className="flex items-center gap-1.5 shrink-0">
            <img src="/logo.svg" alt="Logo" className="w-6 h-6" />
            <span className="text-xl font-medium tracking-tight text-slate-900 flex items-center">
              MeetUp<span className="text-primary">.</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          {isSignedIn && (
            <nav className="hidden md:flex items-center gap-1 flex-1 ml-4">
              {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                    location.pathname === to
                      ? 'ring ring-blue-100 bg-blue-50 text-slate-800'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right */}
          {isSignedIn && (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-sm font-medium text-slate-600 truncate max-w-[140px]">
                {userName}
              </span>
              <UserButton afterSignOutUrl="/login" />
            </div>
          )}
        </div>
      </header>

      {/* Mobile Bottom Nav (native app style) */}
      {isSignedIn && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-center justify-around px-2 py-2">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-[11px] font-medium transition-all min-w-[64px] ${
                    active
                      ? 'text-primary'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${active ? 'text-primary' : 'text-slate-500'}`}
                    strokeWidth={active ? 2.4 : 2}
                  />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
};

export default Navbar;
