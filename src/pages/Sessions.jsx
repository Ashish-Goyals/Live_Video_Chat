import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { dummySessions } from '../assets/asset';
import EmptySessions from '../components/sessions/EmptySessions';
import SessionCard from '../components/sessions/SessionCard';
import SessionDetailModal from '../components/sessions/SessionDetailModal';

const Sessions = () => {
  const [sessions] = useState(dummySessions);
  const [selectedSession, setSelectedSession] = useState(null);
  const navigate = useNavigate();
  const onOpenSessionDetails = (sessionId) => {
    const session = sessions.find(
      (s) => s.id === sessionId || s.meetingId === sessionId
    );

    if (session) {
      setSelectedSession(session);
    }
  };
  return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
      {/* Back link */}
      <Link
        to="/dashboard"
        className="inline-flex items-center text-sm gap-1 mb-5 text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeftIcon size={14} /> Go to Dashboard
      </Link>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-slate-900">
          Meeting Sessions.
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review your past and active meeting history, participant logs and chat
          transcripts.
        </p>
      </div>

      {/* Session Grid / Empty State */}
      {sessions.length === 0 ? (
        <EmptySessions />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onOpenDetails={onOpenSessionDetails}
              onRejoin={(meetingId) => navigate(`/meeting/${meetingId}`)}
            />
          ))}
        </div>
      )}

      {/* Session Detail Modal */}
      <SessionDetailModal
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
      />
    </main>
  );
};

export default Sessions;
