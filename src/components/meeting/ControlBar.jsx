import { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  CheckIcon,
  CopyIcon,
  VideoOffIcon,
  VideoIcon,
  MicIcon,
  MicOffIcon,
  MessageSquareIcon,
  PhoneOffIcon,
  UserIcon,
} from 'lucide-react';
const ControlBar = ({
  roomId,
  audioEnabled,
  videoEnabled,
  onToggleAudio,
  onToggleVideo,
  onToggleChat,
  onToggleParticipants,
  isChatOpen,
  isParticipantsOpen,
  unreadCount,
  participantsCount,
  isHost,
  onLeave,
  onEndMetting,
}) => {
  const [copied, setCopied] = useState(false);
  const copyMeetingId = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Meeting link Copied !');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <footer className="w-full bg-white/90 backdrop-blur-md border-t border-slate-200/80 px-6 py-4 flex items-center justify-between z-40 shadow-lg shadow-slate-200/50 ">
      {/* Left Info / Copy Link  */}
      <div className="hidden sm:flex items-center gap-3">
        <span className="text-xs font-medium text-slate-600 font-mono tracking-wider">
          Id: {roomId}{' '}
        </span>
        <button
          onClick={copyMeetingId}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 hover:text-slate-900 flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-all"
        >
          {copied ? (
            <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <CopyIcon className="w-3.5 h-3.5" />
          )}
          <span>{copied ? 'Copied!' : 'Copy link'}</span>
        </button>
      </div>
      {/* Center Controls  */}
      <div className="flex items-center gap-3 mx-auto sm:mx-0 ">
        {/* Audio Togle  */}
        <button
          onClick={onToggleAudio}
          className={`p-3.5 rounded-2xl transition-all cursor-pointer border ${audioEnabled ? 'bg-slate-100 hover-bg-slate-200 text-slate-800 border-slate-300 shadow-xs' : 'bg-rose-50 hiver-bg-rose-100 text-rose-600 border-rose-200 shdaow-xs'}`}
          title={audioEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
        >
          {audioEnabled ? (
            <MicIcon className="w-5 h-5" />
          ) : (
            <MicOffIcon className="w-5 h-5" />
          )}
        </button>
        {/* Video Togle  */}
        <button
          onClick={onToggleVideo}
          className={`p-3.5 rounded-2xl transition-all cursor-pointer border ${videoEnabled ? 'bg-slate-100 hover-bg-slate-200 text-slate-800 border-slate-300 shadow-xs' : 'bg-rose-50 hiver-bg-rose-100 text-rose-600 border-rose-200 shdaow-xs'}`}
          title={videoEnabled ? 'Turn Off camera' : 'Turn On camera'}
        >
          {videoEnabled ? (
            <VideoIcon className="w-5 h-5" />
          ) : (
            <VideoOffIcon className="w-5 h-5" />
          )}
        </button>
        {/* Chat Toggle  */}
        <button
          onClick={onToggleChat}
          className={`p-3.5 rounded-2xl transition-all cursor-pointer border ${isChatOpen ? 'bg-primary text-white border-primary shadow-md shadow-primary/20  ' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-xs'}`}
          title="Toggle IN-Meeting Chat"
        >
          <MessageSquareIcon className="w-5 h-5" />
          {unreadCount > 0 && !isChatOpen && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
              {unreadCount}
            </span>
          )}
        </button>
        {/* participants toggle  */}
        <button
          onClick={onToggleParticipants}
          className={`relative p-3.5 rounded-2xl transition-all cursor-pointer border ${isParticipantsOpen ? 'bg-primary text-white border-primary shadow-md shadow-primary/20  ' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-xs'}`}
          title="Toggle Participants List"
        >
          <UserIcon className="w-5 h-5" />

          <span className="absolute -top-1 -right-1 bg-slate-200 text-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-slate-300">
            {participantsCount}
          </span>
        </button>

        {/* Leave / End meeting  */}
        {!isHost ? (
          <button
            onClick={onEndMetting}
            className="p-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25 transition-all cursor-pointer border border-red-500 ml-2 font-medium text-xs flex items-center gap-1.5 "
            title="End Meeting For all"
          >
            <PhoneOffIcon className="w-5 h-5" />
            <span className="hidden sm:inline">End Meeting</span>
          </button>
        ) : (
          <button
            onClick={onLeave}
            className="p-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25 transition-all cursor-pointer border border-red-500 ml-2"
            title="Leave Meeting"
          >
            <PhoneOffIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* RIght placeholdr  */}
      <div className="hidden sm:block w-32 text-right">
        <span className="font-medium text-slate-400 ">Meetup Room</span>
      </div>
    </footer>
  );
};

export default ControlBar;
