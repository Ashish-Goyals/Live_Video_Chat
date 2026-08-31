import React from 'react';
import VideoTile from './VideoTile';

const VideoGrid = ({
  localStream,
  localUser,
  remoteUsers,
  audioEnabled,
  videoEnabled,
  isScreenSharing = false,
}) => {
  const totalParticipants = 1 + remoteUsers.length;

  //   Determin grid columns dynamically

  const getGridClass = () => {
    if (totalParticipants === 1) return 'grid-cols-1 max-w-4xl';
    if (totalParticipants === 2) return 'grid-cols-1 md:grid-cols-2 max-w-5xl';
    if (totalParticipants <= 4) return 'grid-cols-2 md:grid-cols-2  max-w-5xl';
    if (totalParticipants <= 6)
      return 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl';
    return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 max-w-7xl';
  };

  return (
    <div className="flex-1 w-full flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div
        className={`w-full grid gap-2 sm:gap-4 ${getGridClass()} max-h-[calc(100vh-120px)] sm:max-h-[calc(100vh-140px)] transition-all duration-300`}
      >
        {/* Local User file  */}
        <VideoTile
          stream={localStream}
          name={localUser?.name || 'You'}
          isLocal={true}
          audioEnabled={audioEnabled}
          videoEnabled={videoEnabled}
          isScreenSharing={isScreenSharing}
        />
        {/* Remote user tiles  */}
        {remoteUsers.map((remote) => (
          <VideoTile
            key={remote.socketId}
            stream={remote.stream}
            name={remote.userName}
            isLocal={false}
            audioEnabled={remote.audioEnabled}
            videoEnabled={remote.videoEnabled}
            isScreenSharing={remote.isScreenSharing}
          />
        ))}
      </div>
    </div>
  );
};

export default VideoGrid;
