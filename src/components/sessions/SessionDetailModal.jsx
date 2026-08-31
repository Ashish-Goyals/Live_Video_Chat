import { useState } from 'react';
import { XIcon } from 'lucide-react';

import SessionChatTab from './SessionChatTab';
import SessionParticipants from './SessionParticipants';

const SessionDetailModal = ({ session, loading, onClose }) => {
  const [activeTab, setActiveTab] = useState('chat');

  if (!session) return null;

  const isEnded = session.status === 'ended';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          {loading ? (
            <div className="w-full animate-pulse">
              <div className="flex items-center gap-2">
                <div className="h-5 w-24 rounded-md bg-slate-200" />
                <div className="h-5 w-16 rounded-full bg-slate-200" />
              </div>

              <div className="h-7 w-64 rounded-md bg-slate-200 mt-2" />

              <div className="h-4 w-80 rounded-md bg-slate-200 mt-2" />
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                  ID: {session.meetingId}
                </span>

                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    isEnded
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {isEnded ? 'Ended' : 'Active'}
                </span>
              </div>

              <h2 className="text-2xl font-medium text-slate-900 mt-1">
                {session.title || 'Meeting Details'}
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Host : {session.host?.name || 'Unknown'} ● Created{' '}
                {new Date(session.createdAt).toLocaleString()}
              </p>
            </div>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
            aria-label="Close session details"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        {loading ? (
          <div className="flex border-b border-slate-100 px-6 bg-slate-50/50 animate-pulse">
            <div className="h-5 w-36 bg-slate-200 rounded my-4 mx-3" />
            <div className="h-5 w-36 bg-slate-200 rounded my-4 mx-3" />
          </div>
        ) : (
          <div className="flex border-b border-slate-100 px-6 bg-slate-50/50">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-4 font-medium text-sm border-b-2 cursor-pointer transition-all ${
                activeTab === 'chat'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Chat Transcript ({session.messages?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('participants')}
              className={`px-3 py-4 font-medium text-sm border-b-2 cursor-pointer transition-all ${
                activeTab === 'participants'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Participants Log ({session.participants?.length || 0})
            </button>
          </div>
        )}

        {/* Tab Content */}
        <div className="flex-1 p-6 overflow-y-auto min-h-75">
          {loading ? (
            <SessionDetailSkeleton />
          ) : activeTab === 'chat' ? (
            <SessionChatTab messages={session.messages} />
          ) : (
            <SessionParticipants
              participants={session.participants}
              host={session.host}
            />
          )}
        </div>
      </div>
    </div>
  );
};

/*
 * Modal Skeleton
 */
const SessionDetailSkeleton = () => {
  return (
    <div className="animate-pulse space-y-5">
      {/* Chat message skeletons */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />

          <div className="space-y-2 flex-1">
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="h-10 w-3/4 bg-slate-200 rounded-2xl" />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <div className="space-y-2 w-3/4">
            <div className="h-4 w-24 bg-slate-200 rounded ml-auto" />
            <div className="h-10 w-full bg-slate-200 rounded-2xl" />
          </div>

          <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
        </div>

        <div className="flex gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />

          <div className="space-y-2 flex-1">
            <div className="h-4 w-28 bg-slate-200 rounded" />
            <div className="h-16 w-4/5 bg-slate-200 rounded-2xl" />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <div className="space-y-2 w-2/3">
            <div className="h-4 w-20 bg-slate-200 rounded ml-auto" />
            <div className="h-12 w-full bg-slate-200 rounded-2xl" />
          </div>

          <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
        </div>
      </div>
    </div>
  );
};

export default SessionDetailModal;
