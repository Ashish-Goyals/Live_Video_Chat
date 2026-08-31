import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { useAuth, useUser } from '@clerk/react';
import { toast } from 'react-hot-toast';

import EmptySessions from '../components/sessions/EmptySessions';
import SessionCard from '../components/sessions/SessionCard';
import SessionCardSkeleton from '../components/sessions/SessionCardSkeleton';
import SessionDetailModal from '../components/sessions/SessionDetailModal';
import api from '../config/api';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  // Initial page loading
  const [loading, setLoading] = useState(true);

  // Individual card loading states
  const [detailsLoadingId, setDetailsLoadingId] = useState(null);
  const [rejoiningId, setRejoiningId] = useState(null);

  const navigate = useNavigate();

  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const fetchSessions = async () => {
      if (!isLoaded) return;

      if (!isSignedIn) {
        setLoading(false);
        return;
      }

      try {
        const token = await getToken();

        if (!token) {
          setLoading(false);
          return;
        }

        const res = await api.get('/api/meetings/sessions', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setSessions(res.data.meetings || []);
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
        toast.error('Error fetching sessions');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [isLoaded, isSignedIn, getToken]);

  // View Details
  const onOpenSessionDetails = async (sessionId) => {
    try {
      setDetailsLoadingId(sessionId);

      // Open modal immediately
      setSelectedSession({
        id: sessionId,
        meetingId: '',
        title: '',
        status: 'active',
        createdAt: null,
        host: null,
        messages: [],
        participants: [],
      });

      const token = await getToken();

      if (!token) {
        toast.error('Authentication required');
        setSelectedSession(null);
        return;
      }

      const res = await api.get(`/api/meetings/sessions/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSelectedSession(res.data.meeting);
    } catch (error) {
      console.error('Failed to fetch session details:', error);
      toast.error('Failed to fetch session details');
      setSelectedSession(null);
    } finally {
      setDetailsLoadingId(null);
    }
  };

  // Re-Join
  const handleRejoin = (meetingId) => {
    setRejoiningId(meetingId);

    navigate(`/meeting/${meetingId}`);
  };

  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Back link */}
      <Link
        to="/dashboard"
        className="inline-flex items-center text-sm gap-1 mb-5 text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeftIcon size={14} />
        Go to Dashboard
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

      {/* Content */}
      {loading ? (
        /*
         * Initial page loading:
         * Show multiple skeleton cards
         */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <SessionCardSkeleton key={index} />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <EmptySessions />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              isHost={session.host?.id === user?.id}

              // Individual loading states
              isViewingDetails={detailsLoadingId === session.id}
              isRejoining={rejoiningId === session.meetingId}

              onOpenDetails={onOpenSessionDetails}
              onRejoin={handleRejoin}
            />
          ))}
        </div>
      )}

      {/* Details Modal */}
      <SessionDetailModal
        session={selectedSession}
        loading={detailsLoadingId !== null}
        onClose={() => {
          setSelectedSession(null);
          setDetailsLoadingId(null);
        }}
      />
    </main>
  );
};

export default Sessions;
