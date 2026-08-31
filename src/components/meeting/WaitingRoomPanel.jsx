import React from 'react';
import { UserIcon, CheckIcon, XIcon } from 'lucide-react';

const WaitingRoomPanel = ({ requests, onAdmit, onDeny }) => {
  if (!requests || requests.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-800">
          Waiting Room ({requests.length})
        </h3>
      </div>
      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
        {requests.map((req) => (
          <div
            key={req.socketId}
            className="flex items-center justify-between gap-2 px-4 py-3"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary-light border border-primary-border text-primary font-bold flex items-center justify-center text-xs shrink-0">
                {req.name ? (
                  req.name.charAt(0).toUpperCase()
                ) : (
                  <UserIcon className="w-4 h-4" />
                )}
              </div>
              <span className="text-sm font-medium text-slate-800 truncate">
                {req.name || 'Anonymous'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => onAdmit(req.socketId)}
                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 transition-all cursor-pointer"
                title="Admit"
              >
                <CheckIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeny(req.socketId)}
                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all cursor-pointer"
                title="Deny"
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

export default WaitingRoomPanel;
