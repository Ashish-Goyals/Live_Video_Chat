import React from 'react';
import { MicIcon, VideoIcon, CheckIcon, XIcon } from 'lucide-react';

const AccessRequestsPanel = ({ requests, onGrant, onDeny }) => {
  if (!requests || requests.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-800">
          Access Requests ({requests.length})
        </h3>
      </div>
      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
        {requests.map((req) => (
          <div
            key={`${req.socketId}-${req.type}`}
            className="flex items-center justify-between gap-2 px-4 py-3"
          >
            <div className="flex items-center gap-2 min-w-0">
              {req.type === 'audio' ? (
                <MicIcon className="w-4 h-4 text-slate-500 shrink-0" />
              ) : (
                <VideoIcon className="w-4 h-4 text-slate-500 shrink-0" />
              )}
              <span className="text-sm font-medium text-slate-800 truncate">
                {req.name} wants to{' '}
                {req.type === 'audio' ? 'unmute' : 'enable camera'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => onGrant(req.socketId, req.type)}
                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 transition-all cursor-pointer"
                title="Allow"
              >
                <CheckIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeny(req.socketId, req.type)}
                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all cursor-pointer"
                title="Decline"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccessRequestsPanel;
