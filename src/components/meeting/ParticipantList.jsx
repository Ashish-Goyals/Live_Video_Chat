import React from 'react';
import {
  CrownIcon,
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  XIcon,
  UserMinusIcon,
  LockIcon,
} from 'lucide-react';

const ParticipantList = ({
  isOpen,
  onClose,
  localUser,
  localAudio,
  localVideo,
  remoteUsers,
  meetingHostId,
  isHost = false,
  onSetAudioAccess,
  onSetVideoAccess,
  onRemove,
}) => {
  if (!isOpen) return null;

  const allParticipants = [
    {
      socketId: 'local',
      userId: localUser?.id,
      userName: `${localUser?.name || 'You'} (You)`,
      isLocal: true,
      audioEnabled: localAudio,
      videoEnabled: localVideo,
      audioLocked: false,
      videoLocked: false,
    },
    ...remoteUsers,
  ];

  return (
    <aside className="w-full sm:w-80 bg-white border border-slate-200 flex flex-col z-30 shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-medium text-slate-900 text-base flex items-center gap-2">
          Participants ({allParticipants.length})
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <XIcon className="h-5 w-5" />
        </button>
      </div>
      {/* List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {allParticipants.map((p) => {
          const participantIsHost = meetingHostId && p.userId === meetingHostId;
          const showHostControls = isHost && !p.isLocal;
          return (
            <div
              key={p.socketId || p.userId}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-primary-light border border-primary-border text-primary font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                  {p.userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-slate-800 flex items-center gap-1.5 truncate">
                    {p.userName}
                    {participantIsHost && (
                      <CrownIcon
                        className="w-3.5 h-3.5 text-amber-500 shrink-0"
                        title="Host"
                      />
                    )}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 shrink-0">
                {showHostControls ? (
                  <>
                    <button
                      onClick={() =>
                        onSetAudioAccess(p.socketId, !!p.audioLocked)
                      }
                      title={
                        p.audioLocked
                          ? 'Unblock microphone'
                          : 'Block microphone'
                      }
                      className="relative p-1.5 rounded-lg hover:bg-slate-200 cursor-pointer transition-all"
                    >
                      {p.audioEnabled ? (
                        <MicIcon className="h-4 w-4 text-slate-600" />
                      ) : (
                        <MicOffIcon className="h-4 w-4 text-rose-500" />
                      )}
                      {p.audioLocked && (
                        <LockIcon className="w-2.5 h-2.5 absolute -top-1 -right-1 bg-slate-900 text-white rounded-full p-0.5" />
                      )}
                    </button>
                    <button
                      onClick={() =>
                        onSetVideoAccess(p.socketId, !!p.videoLocked)
                      }
                      title={p.videoLocked ? 'Unblock camera' : 'Block camera'}
                      className="relative p-1.5 rounded-lg hover:bg-slate-200 cursor-pointer transition-all"
                    >
                      {p.videoEnabled ? (
                        <VideoIcon className="h-4 w-4 text-slate-600" />
                      ) : (
                        <VideoOffIcon className="h-4 w-4 text-rose-500" />
                      )}
                      {p.videoLocked && (
                        <LockIcon className="w-2.5 h-2.5 absolute -top-1 -right-1 bg-slate-900 text-white rounded-full p-0.5" />
                      )}
                    </button>
                    <button
                      onClick={() => onRemove(p.socketId)}
                      title="Remove from meeting"
                      className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 cursor-pointer transition-all"
                    >
                      <UserMinusIcon className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="relative flex items-center">
                      {p.audioEnabled ? (
                        <MicIcon className="h-4 w-4 text-slate-600" />
                      ) : (
                        <MicOffIcon className="h-4 w-4 text-rose-500" />
                      )}
                      {p.audioLocked && (
                        <LockIcon className="w-2.5 h-2.5 absolute -top-1 -right-1 bg-slate-900 text-white rounded-full p-0.5" />
                      )}
                    </span>
                    <span className="relative flex items-center">
                      {p.videoEnabled ? (
                        <VideoIcon className="h-4 w-4 text-slate-600" />
                      ) : (
                        <VideoOffIcon className="h-4 w-4 text-rose-500" />
                      )}
                      {p.videoLocked && (
                        <LockIcon className="w-2.5 h-2.5 absolute -top-1 -right-1 bg-slate-900 text-white rounded-full p-0.5" />
                      )}
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default ParticipantList;
