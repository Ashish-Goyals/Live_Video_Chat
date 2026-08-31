import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full bg-white/60 backdrop-blur border-t border-slate-200/80 px-4 sm:px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <img src="/logo.svg" alt="Logo" className="w-5 h-5" />
          <span className="text-sm font-medium text-slate-700 tracking-tight">
            MeetUp<span className="text-primary">.</span>
          </span>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-500">
          <Link
            to="/dashboard"
            className="hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
          <Link to="/sessions" className="hover:text-primary transition-colors">
            Sessions
          </Link>
          <Link to="/pricing" className="hover:text-primary transition-colors">
            Pricing
          </Link>
        </nav>
        <p className="text-xs text-slate-400">
          © 2026 MeetUp. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
