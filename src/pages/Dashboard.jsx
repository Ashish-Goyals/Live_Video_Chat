import React, { useState, useEffect } from 'react';
import {
  ShieldCheckIcon,
  PlusIcon,
  KeyboardIcon,
  ArrowRightIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useUser, useAuth } from '@clerk/react';
import api from '../config/api.js';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const userName = user?.fullName || user?.firstName || 'User';
  const userEmail =
    user?.primaryEmailAddress?.emailAddress || 'user@example.com';
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [joinId, setJoinId] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isLoaded || !isSignedIn) return;
      try {
        const token = await getToken();
        const { data } = await api.get('/api/meetings/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(data);
      } catch (error) {
        toast.error(error.response?.data?.error || error.message);
      }
    };
    fetchStats();
    const onFocus = () => fetchStats();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [isLoaded, isSignedIn, getToken]);

  const handleCreateMeeting = async () => {
    if (!isLoaded || !isSignedIn) return;
    setIsCreating(true);
    try {
      const token = await getToken();
      const res = await api.post(
        '/api/meetings',
        { title: `${userName}'s Meeting` },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Meeting Created');
      navigate(`/meeting/${res.data.meeting.meetingId}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create meeting');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinMeeting = async (e) => {
    e.preventDefault();
    const cleanId = joinId.trim();
    if (!/^[a-z]{3}(?:-[a-z]{3}){2}$/.test(cleanId)) {
      toast.error('Please enter a valid meeting ID');
      return;
    }
    try {
      const token = await getToken();
      await api.get(`/api/meetings/${cleanId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate(`/meeting/${cleanId}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to join meeting');
    }
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 lg:py-12 flex flex-col justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 pr-5 py-2 rounded-full bg-white/25 text-xs font-medium">
              <ShieldCheckIcon size={14} />
              Secure Peer-to-Peer Encryption
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl text-slate-800 leading-tight font-medium">
              High Quality Video Calls.
              <br />
              <span className="text-primary">Built for everyone.</span>
            </h1>
            <p className="text-slate-700 text-sm sm:text-base max-w-xl leading-relaxed">
              Connect, collaborate, and celebrate from anywhere with ultra-low
              latency video, screen sharing, and real-time chat.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch gap-3 pt-2">
              <button
                disabled={isCreating}
                onClick={handleCreateMeeting}
                className="cursor-pointer bg-primary hover:bg-primary-hover text-white font-medium px-6 py-3 rounded-full shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm"
              >
                <PlusIcon className="w-4 h-4" />
                <span>{isCreating ? 'Creating...' : 'New Meeting'}</span>
              </button>
              <form
                onSubmit={handleJoinMeeting}
                className="flex-1 flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <KeyboardIcon className="w-4 h-4 text-primary/90 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={joinId}
                    placeholder="Enter Meeting Code (e.g. abc-def-ghi)"
                    onChange={(e) => setJoinId(e.target.value)}
                    className="w-full bg-white/75 border border-slate-200 focus:border-primary/60 focus:ring-1 focus:ring-primary/60 rounded-full pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!joinId.trim()}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-medium px-5 py-3 rounded-full transition-all flex items-center justify-center gap-1 cursor-pointer text-sm shrink-0"
                >
                  <span>Join</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right column - Clock Card */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="w-full bg-white/25 backdrop-blur rounded-3xl p-5 sm:p-8 border border-slate-200 text-center space-y-4 relative overflow-hidden">
            <div className="space-y-1">
              <p className="text-base sm:text-xl text-left">
                Hi, <span className="font-medium">{userName}</span>
              </p>
              <h2 className="text-4xl sm:text-5xl xl:text-7xl my-2 sm:my-4 text-slate-900 tracking-wide">
                {currentTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </h2>
              <p className="font-medium tracking-wide text-primary text-xs sm:text-sm">
                {currentTime.toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div className="pt-4 border-t border-white/30 text-sm text-slate-600">
              <div className="flex flex-wrap items-center justify-between gap-2 py-3 px-2 sm:px-4">
                <p className="text-xs sm:text-sm truncate max-w-[65%]">
                  Logged in as:{' '}
                  <span className="text-slate-900 font-medium">
                    {userEmail}
                  </span>
                </p>
                <span
                  className={`px-3 py-1 rounded-full font-semibold text-xs uppercase shrink-0 ${
                    stats?.plan === 'premium'
                      ? 'bg-blue-700 text-white'
                      : 'bg-white/70 text-slate-800'
                  }`}
                >
                  {stats?.plan || 'Free'}
                </span>
              </div>
              {stats && (
                <div className="w-full bg-white/50 rounded-2xl px-4 py-3 border border-slate-100">
                  <div className="flex items-center justify-between text-xs sm:text-sm gap-2">
                    <span>Monthly Meetings</span>
                    <span className="text-xs text-slate-600 font-mono">
                      {stats.monthlyLimit
                        ? `${stats.monthlyCount}/${stats.monthlyLimit} Used`
                        : `${stats.monthlyCount} Created (Unlimited)`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
