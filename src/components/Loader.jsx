import React from 'react';
import { VideoIcon } from 'lucide-react';

const Loader = ({ text = 'Loading.........', fullScreen = false }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-slate-50 text-slate-900 ${
        fullScreen ? 'fixed inset-0 z-50' : 'flex-1 w-full py-24'
      }`}
    >
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-primary-light border-t-primary animate-spin" />
        <VideoIcon className="w-6 h-6 text-primary absolute" />
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-600 animate-pulse">
        {text}
      </p>
    </div>
  );
};

export default Loader;
