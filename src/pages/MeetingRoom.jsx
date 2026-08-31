import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoGrid from '../components/meeting/VideoGrid';
import { useWebRTC } from '../hooks/useWebRTC';
import ChatPanel from '../components/meeting/ChatPanel';
import { useChat } from '../hooks/useChat';
import ParticipantList from '../components/meeting/ParticipantList';
import ControlBar from '../components/meeting/ControlBar';
import WaitingRoomPanel from '../components/meeting/WaitingRoomPanel';
import AccessRequestsPanel from '../components/meeting/AccessRequestsPanel';
import { toast } from 'react-hot-toast';
import { useUser, useAuth } from '@clerk/react';
import api from '../config/api';
import Loader from '../components/Loader';

const MeetingRoom = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();

  const userData = useMemo(() => {
    if (!user) return null;
    return {
      id: user.id,
      name:
        user.fullName ||
        user.firstName ||
        user.primaryEmailAddress?.emailAddress?.split('@')[0] ||
        'user',
      email: user.primaryEmailAddress?.emailAddress || '',
      image: user.imageUrl || '',
    };
  }, [
    user?.id,
    user?.fullName,
    user?.firstName,
    user?.primaryEmailAddress?.emailAddress,
    user?.imageUrl,
  ]);

  const [meeting, setMeeting] = useState(null);
  const [loadingMeeting, setLoadingMeeting] = useState(true);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);

  // Fetch meeting details to validate BEFORE enabling WebRTC camera access
  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const token = await getToken();
        const res = await api.get(`/api/meetings/${meetingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMeeting(res.data.meeting);
      } catch (error) {
        console.error('Error fetching meeting:', error);
        toast.error(error.response?.data?.error || 'Failed to join meeting');
        navigate('/dashboard');
      } finally {
        setLoadingMeeting(false);
      }
    };

    if (meetingId) {
      fetchMeeting();
    }
  }, [meetingId, navigate]);

  const handleMettingEnded = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);
  const {
    localStream,
    remoteUsers,
    audioEnabled,
    videoEnabled,
    audioLocked,
    videoLocked,
    toggleAudio,
    toggleVideo,
    endMeeting,
    admissionStatus,
    pendingRequests,
    admitParticipant,
    denyParticipant,
    removeParticipant,
    setParticipantAudioAccess,
    setParticipantVideoAccess,
    accessRequests,
    grantAccessRequest,
    denyAccessRequest,
    isScreenSharing,
    toggleScreenShare,
  } = useWebRTC(
    meetingId,
    userData,
    handleMettingEnded,
    !loadingMeeting && !!meeting
  );

  const { messages, unreadCount, isChatOpen, sendMessage, toggleChat } =
    useChat(meetingId, userData);

  const hostId = meeting?.host?.id || meeting?.host;
  const isHost = Boolean(
    userData?.id && hostId && hostId.toString() === userData.id.toString()
  );

  const handleLeave = () => {
    toast('You Left the Meeting');
    navigate('/dashboard');
  };

  const handleEndMetting = () => {
    endMeeting();
    toast('Meeting Ended For All Participants');
    navigate('/dashboard');
  };

  if (loadingMeeting) {
    return <Loader text="Joining Meeting Room..........." fullScreen />;
  }

  if (admissionStatus === 'waiting') {
    return (
      <div className="h-screen w-screen bg-slate-900 flex flex-col items-center justify-center gap-4 text-white">
        <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-primary animate-spin" />
        <h2 className="text-lg font-medium">
          Waiting for the host to admit you...
        </h2>
        <p className="text-sm text-slate-400">
          You'll join automatically once approved.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-5 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-sm font-medium transition-all cursor-pointer"
        >
          Cancel & Leave
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-100 flex flex-col overflow-hidden relative font-sans">
      {/* Top Bar  */}
      <header className="w-full bg-white/90 backdrop-blur-md px-6 py-3 border-b border-slate-200 flex items-center justify-between z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">
            {meeting?.title || 'Meeting'} ({meetingId})
          </h2>
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </header>
      {isHost && (
        <>
          <WaitingRoomPanel
            requests={pendingRequests}
            onAdmit={admitParticipant}
            onDeny={denyParticipant}
          />
          <AccessRequestsPanel
            requests={accessRequests}
            onGrant={grantAccessRequest}
            onDeny={denyAccessRequest}
          />
        </>
      )}
      <div className="flex-1 flex overflow-hidden relative ">
        {/* Video Grid Center  */}
        <VideoGrid
          localStream={localStream}
          localUser={userData}
          remoteUsers={remoteUsers}
          audioEnabled={audioEnabled}
          videoEnabled={videoEnabled}
          isScreenSharing={isScreenSharing}
        />
        {/* In-Meeting chat Drawer  */}
        <ChatPanel
          isOpen={isChatOpen}
          messages={messages}
          onSendMessage={sendMessage}
          onClose={toggleChat}
          currentUser={userData}
        />
        {/* Participants Drawer  */}
        <ParticipantList
          isOpen={isParticipantsOpen}
          onClose={() => {
            setIsParticipantsOpen(false);
          }}
          localUser={userData}
          localAudio={audioEnabled}
          localVideo={videoEnabled}
          remoteUsers={remoteUsers}
          meetingHostId={hostId}
          isHost={isHost}
          onSetAudioAccess={setParticipantAudioAccess}
          onSetVideoAccess={setParticipantVideoAccess}
          onRemove={removeParticipant}
        />
      </div>
      {/* Bottom Floating Control Bar  */}
      <ControlBar
        roomId={meetingId}
        audioEnabled={audioEnabled}
        videoEnabled={videoEnabled}
        audioLocked={audioLocked}
        videoLocked={videoLocked}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleChat={toggleChat}
        onToggleParticipants={() => setIsParticipantsOpen((prev) => !prev)}
        isChatOpen={isChatOpen}
        isParticipantsOpen={isParticipantsOpen}
        unreadCount={unreadCount}
        participantsCount={remoteUsers.length + 1}
        isHost={isHost}
        onLeave={handleLeave}
        onEndMeeting={handleEndMetting}
        isScreenSharing={isScreenSharing}
        onToggleScreenShare={toggleScreenShare}
      />
    </div>
  );
};

export default MeetingRoom;
