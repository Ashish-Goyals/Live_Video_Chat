import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dummyUser, dummyMeetingDetails } from '../assets/asset';
import VideoGrid from '../components/meeting/VideoGrid';
import useWebRTC from '../hooks/useWebRTC';
import ChatPanel from '../components/meeting/ChatPanel';
import { useChat } from '../hooks/useChat';
import ParticipantList from '../components/meeting/ParticipantList';
import ControlBar from '../components/meeting/ControlBar';
import { toast } from 'react-hot-toast';
const MeetingRoom = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const userData = dummyUser;
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const handleMettingEnded = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);
  // Intialize WebRTC
  const {
    localStream,
    remoteUsers,
    audioEnabled,
    videoEnabled,
    toggleAudio,
    toggleVideo,
    endMeeting,
  } = useWebRTC(meetingId, userData, handleMettingEnded);

  // Initialize chat

  const { messages, unreadCount, isChatOpen, sendMessage, toggleChat } =
    useChat(meetingId, userData);
  const isHost = true;

  const handleLeave = () => {
    toast('You Left the Meeting');
    navigate('/dashboard');
  };

  const handleEndMetting = () => {
    endMeeting();
    toast('Meeting Ended For All Participants');
    navigate('/dashboard');
  };
  return (
    <div className="h-screen w-screen bg-slate-100 flex flex-col overflow-hidden relative font-sans">
      {/* Top Bar  */}
      <header className="w-full bg-white/90 backdrop-blur-md px-6 py-3 border-b border-slate-200 flex items-center justify-between z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">
            {dummyMeetingDetails.title} (
            {meetingId || dummyMeetingDetails.meetingId})
          </h2>
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </header>
      <div className="flex-1 flex overflow-hidden relative ">
        {/* Video Grid Center  */}
        <VideoGrid
          localStream={localStream}
          localUser={userData}
          remoteUsers={remoteUsers}
          audioEnabled={audioEnabled}
          videoEnabled={videoEnabled}
        />
        {/* In-Meeting chat Drwaer  */}
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
          meetingHostId={dummyUser.id}
        />
      </div>
      {/* Bottom Floating Control Bar  */}
      <ControlBar
        roomId={meetingId || dummyMeetingDetails.meetingId}
        audioEnabled={audioEnabled}
        videoEnabled={videoEnabled}
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
      />
    </div>
  );
};

export default MeetingRoom;
