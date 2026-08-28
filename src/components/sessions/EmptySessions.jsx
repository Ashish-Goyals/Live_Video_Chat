import React from 'react';
import { Link } from 'react-router-dom';
import { VideoIcon, ArrowRightIcon } from 'lucide-react';

const EmptySessions = () => {
  return (
    <div className="w-full bg-white/50 backdrop-blur rounded-3xl p-12 xl:py-24 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-primary-light border border-primary-border flex items-center justify-center">
        <VideoIcon className="w-7 h-7 text-primary" />
      </div>
      <div className="space-y-1">
        <h3 className="text-xl lg:text-2xl font-medium text-slate-700">
          No Meeting History Yet
        </h3>
        <p className="text-sm text-slate-400 max-w-md">
          Once you create or join meeting calls, your sessions, participants and
          chat logs will appear here.
        </p>
      </div>
      <Link
        to="/dashboard"
        className="bg-primary hover:bg-primary-hover text-white font-medium px-6 py-3 rounded-full text-sm transition-all inline-flex items-center gap-2 mt-2"
      >
        Start a Meeting
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </div>
  );
};

export default EmptySessions;
