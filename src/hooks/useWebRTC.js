import { useState, useEffect, useRef, useCallback } from 'react';
import { socket } from '../config/socket';
import toast from 'react-hot-toast';
import { useSound } from './useSound';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export const useWebRTC = (roomId, user, onMeetingEnded, enabled = true) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioLocked, setAudioLocked] = useState(false);
  const [videoLocked, setVideoLocked] = useState(false);

  const [admissionStatus, setAdmissionStatus] = useState('idle');
  const [pendingRequests, setPendingRequests] = useState([]); // waiting-room join requests
  const [accessRequests, setAccessRequests] = useState([]); // mic/cam access requests (host side)

  const peersRef = useRef(new Map());
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const isScreenSharingRef = useRef(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const { play } = useSound();

  const initLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (error) {
      toast.error('Could not access camera/microphone');
      console.error('Media devices access error:', error);
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        localStreamRef.current = audioStream;
        setLocalStream(audioStream);
        setVideoEnabled(false);
        return audioStream;
      } catch (err) {
        console.error('Audio-only fallback error:', err);
        return null;
      }
    }
  }, []);

  const createPeerConnection = useCallback((targetSocketId, targetUser) => {
    if (peersRef.current.has(targetSocketId)) {
      return peersRef.current.get(targetSocketId);
    }

    const peer = new RTCPeerConnection(ICE_SERVERS);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        if (
          track.kind === 'video' &&
          isScreenSharingRef.current &&
          screenStreamRef.current
        ) {
          peer.addTrack(
            screenStreamRef.current.getVideoTracks()[0],
            screenStreamRef.current
          );
        } else {
          peer.addTrack(track, localStreamRef.current);
        }
      });
    }
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          targetSocketId,
          senderSocketId: socket.id,
          candidate: event.candidate,
        });
      }
    };

    peer.ontrack = (event) => {
      const remoteStream = event.streams[0];
      setRemoteUsers((prev) => {
        const existingIndex = prev.findIndex(
          (u) => u.socketId === targetSocketId
        );
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            stream: remoteStream,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              socketId: targetSocketId,
              userId: targetUser?.userId,
              userName: targetUser?.name || 'Participant',
              stream: remoteStream,
              audioEnabled: targetUser?.audioEnabled ?? true,
              videoEnabled: targetUser?.videoEnabled ?? true,
              audioLocked: targetUser?.audioLocked ?? false,
              videoLocked: targetUser?.videoLocked ?? false,
            },
          ];
        }
      });
    };

    peersRef.current.set(targetSocketId, peer);
    return peer;
  }, []);

  useEffect(() => {
    if (!roomId || !user || !enabled) return;

    let isMounted = true;

    const startSession = async () => {
      const stream = await initLocalStream();
      if (!isMounted) return;

      if (!socket.connected) {
        socket.connect();
      }

      socket.emit('join-room', {
        roomId,
        user,
        audioEnabled: true,
        videoEnabled: true,
      });

      socket.on('waiting-for-admission', () => {
        setAdmissionStatus('waiting');
      });

      socket.on('admitted', () => {
        setAdmissionStatus('admitted');
      });

      socket.on('join-denied', ({ message }) => {
        setAdmissionStatus('denied');
        toast.error(message || 'The host declined your request to join.');
        if (onMeetingEnded) onMeetingEnded(message);
      });

      socket.on('join-request', ({ socketId, name, userId }) => {
        play('join');
        setPendingRequests((prev) =>
          prev.some((r) => r.socketId === socketId)
            ? prev
            : [...prev, { socketId, name, userId }]
        );
      });

      socket.on('join-request-cancelled', ({ socketId }) => {
        setPendingRequests((prev) =>
          prev.filter((r) => r.socketId !== socketId)
        );
      });

      // Host receives a request from a blocked participant asking for mic/cam back
      socket.on('access-request', ({ socketId, name, type }) => {
        play('join');
        setAccessRequests((prev) =>
          prev.some((r) => r.socketId === socketId && r.type === type)
            ? prev
            : [...prev, { socketId, name, type }]
        );
      });

      // My own access request was declined by the host
      socket.on('access-denied', ({ type }) => {
        toast.error(
          type === 'audio'
            ? 'Host declined your request to unmute'
            : 'Host declined your request to enable camera'
        );
      });

      socket.on('all-users', (existingUsers) => {
        existingUsers.forEach((existingUser) => {
          const peer = createPeerConnection(
            existingUser.socketId,
            existingUser
          );

          peer
            .createOffer()
            .then((offer) => peer.setLocalDescription(offer))
            .then(() => {
              socket.emit('offer', {
                targetSocketId: existingUser.socketId,
                callerSocketId: socket.id,
                sdp: peer.localDescription,
              });
            })
            .catch((err) => console.error('Error creating offer:', err));
        });
      });

      socket.on('user-joined', (newUser) => {
        play('join');
        toast(`${newUser.name} joined the meeting`, { icon: '👋' });
        createPeerConnection(newUser.socketId, newUser);
      });

      socket.on('offer', async ({ callerSocketId, sdp, callerUser }) => {
        const peer = createPeerConnection(callerSocketId, callerUser);
        try {
          await peer.setRemoteDescription(new RTCSessionDescription(sdp));
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);

          socket.emit('answer', {
            targetSocketId: callerSocketId,
            responderSocketId: socket.id,
            sdp: peer.localDescription,
          });
        } catch (err) {
          console.error('Error handling offer:', err);
        }
      });

      socket.on('answer', async ({ responderSocketId, sdp }) => {
        const peer = peersRef.current.get(responderSocketId);
        if (peer) {
          try {
            await peer.setRemoteDescription(new RTCSessionDescription(sdp));
          } catch (err) {
            console.error('Error setting remote description from answer:', err);
          }
        }
      });

      socket.on('ice-candidate', async ({ senderSocketId, candidate }) => {
        const peer = peersRef.current.get(senderSocketId);
        if (peer && candidate) {
          try {
            await peer.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            console.error('Error adding ICE candidate:', err);
          }
        }
      });

      socket.on(
        'user-toggled-audio',
        ({ socketId, audioEnabled, audioLocked }) => {
          setRemoteUsers((prev) =>
            prev.map((u) =>
              u.socketId === socketId
                ? {
                    ...u,
                    audioEnabled,
                    audioLocked: audioLocked ?? u.audioLocked,
                  }
                : u
            )
          );
        }
      );

      socket.on(
        'user-toggled-video',
        ({ socketId, videoEnabled, videoLocked }) => {
          setRemoteUsers((prev) =>
            prev.map((u) =>
              u.socketId === socketId
                ? {
                    ...u,
                    videoEnabled,
                    videoLocked: videoLocked ?? u.videoLocked,
                  }
                : u
            )
          );
        }
      );

      // My mic was force-muted / blocked by the host
      socket.on('force-mute-audio', ({ locked } = {}) => {
        if (localStreamRef.current) {
          const audioTrack = localStreamRef.current.getAudioTracks()[0];
          if (audioTrack) audioTrack.enabled = false;
        }
        setAudioEnabled(false);
        if (locked) {
          setAudioLocked(true);
          toast('Host has blocked your microphone');
        }
      });

      // My mic access was restored by the host
      socket.on('force-unmute-audio', () => {
        if (localStreamRef.current) {
          const audioTrack = localStreamRef.current.getAudioTracks()[0];
          if (audioTrack) audioTrack.enabled = true;
        }
        setAudioEnabled(true);
        setAudioLocked(false);
        toast.success('Host restored your microphone access');
      });

      // My camera was force-muted / blocked by the host
      socket.on('force-mute-video', ({ locked } = {}) => {
        if (localStreamRef.current) {
          const videoTrack = localStreamRef.current.getVideoTracks()[0];
          if (videoTrack) videoTrack.enabled = false;
        }
        setVideoEnabled(false);
        if (locked) {
          setVideoLocked(true);
          toast('Host has blocked your camera');
        }
      });

      // My camera access was restored by the host
      socket.on('force-unmute-video', () => {
        if (localStreamRef.current) {
          const videoTrack = localStreamRef.current.getVideoTracks()[0];
          if (videoTrack) videoTrack.enabled = true;
        }
        setVideoEnabled(true);
        setVideoLocked(false);
        toast.success('Host restored your camera access');
      });

      socket.on('removed-from-meeting', ({ message }) => {
        toast.error(message || 'You were removed from the meeting');
        if (onMeetingEnded) onMeetingEnded(message);
      });

      socket.on('user-left', ({ socketId, user: leftUser }) => {
        play('leave');
        if (leftUser) {
          toast(`${leftUser.name} left the meeting`);
        }
        const peer = peersRef.current.get(socketId);
        if (peer) {
          peer.close();
          peersRef.current.delete(socketId);
        }
        setRemoteUsers((prev) => prev.filter((u) => u.socketId !== socketId));
        setAccessRequests((prev) =>
          prev.filter((r) => r.socketId !== socketId)
        );
      });
      socket.on('user-screen-share-toggled', ({ socketId, sharing }) => {
        setRemoteUsers((prev) =>
          prev.map((u) =>
            u.socketId === socketId ? { ...u, isScreenSharing: sharing } : u
          )
        );
      });
      socket.on('meeting-ended', ({ message }) => {
        play('end');
        toast.error(message || 'This meeting has ended');
        if (onMeetingEnded) {
          onMeetingEnded(message);
        }
      });
    };

    startSession();

    return () => {
      isMounted = false;

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      peersRef.current.forEach((peer) => peer.close());
      peersRef.current.clear();

      socket.off('waiting-for-admission');
      socket.off('admitted');
      socket.off('join-denied');
      socket.off('join-request');
      socket.off('join-request-cancelled');
      socket.off('access-request');
      socket.off('access-denied');
      socket.off('all-users');
      socket.off('user-joined');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('user-toggled-audio');
      socket.off('user-toggled-video');
      socket.off('force-mute-audio');
      socket.off('force-unmute-audio');
      socket.off('force-mute-video');
      socket.off('force-unmute-video');
      socket.off('removed-from-meeting');
      socket.off('user-left');
      socket.off('user-screen-share-toggled');

      socket.off('meeting-ended');
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
      }

      socket.disconnect();
    };
  }, [
    roomId,
    user?.id,
    enabled,
    createPeerConnection,
    initLocalStream,
    onMeetingEnded,
    play,
  ]);

  // If blocked by the host, clicking this sends a request instead of flipping state
  const toggleAudio = () => {
    if (audioLocked) {
      socket.emit('request-audio-access', { roomId });
      toast('Requesting mic access from host...');
      return;
    }
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        const newState = !audioEnabled;
        audioTrack.enabled = newState;
        setAudioEnabled(newState);
        play(newState ? 'unmute' : 'mute');
        socket.emit('toggle-audio', { roomId, audioEnabled: newState });
      }
    }
  };

  // If blocked by the host, clicking this sends a request instead of flipping state
  const toggleVideo = () => {
    if (videoLocked) {
      socket.emit('request-video-access', { roomId });
      toast('Requesting camera access from host...');
      return;
    }
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        const newState = !videoEnabled;
        videoTrack.enabled = newState;
        setVideoEnabled(newState);
        socket.emit('toggle-video', { roomId, videoEnabled: newState });
      }
    }
  };
  // Start sharing the screen: swaps the outgoing video track on every existing
  // peer connection without renegotiating (replaceTrack), and swaps the local
  // preview to show the screen instead of the camera.
  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      const screenTrack = screenStream.getVideoTracks()[0];
      screenStreamRef.current = screenStream;
      isScreenSharingRef.current = true;

      peersRef.current.forEach((peer) => {
        const sender = peer.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(screenTrack);
      });

      setLocalStream(screenStream);
      setIsScreenSharing(true);
      socket.emit('screen-share-toggled', { roomId, sharing: true });

      screenTrack.onended = () => stopScreenShare();
    } catch (err) {
      if (err.name !== 'NotAllowedError') {
        toast.error('Could not start screen sharing');
      }
      console.error('Screen share error:', err);
    }
  }, [roomId]);

  const stopScreenShare = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    isScreenSharingRef.current = false;

    const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
    if (cameraTrack) {
      peersRef.current.forEach((peer) => {
        const sender = peer.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(cameraTrack);
      });
    }

    setLocalStream(localStreamRef.current);
    setIsScreenSharing(false);
    socket.emit('screen-share-toggled', { roomId, sharing: false });
  }, [roomId]);

  const toggleScreenShare = useCallback(() => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  }, [isScreenSharing, startScreenShare, stopScreenShare]);
  const endMeeting = useCallback(() => {
    if (roomId) {
      socket.emit('end-meeting', { roomId });
    }
  }, [roomId]);

  const admitParticipant = useCallback(
    (socketId) => {
      socket.emit('admit-participant', { roomId, socketId });
      setPendingRequests((prev) => prev.filter((r) => r.socketId !== socketId));
    },
    [roomId]
  );

  const denyParticipant = useCallback(
    (socketId) => {
      socket.emit('deny-participant', { roomId, socketId });
      setPendingRequests((prev) => prev.filter((r) => r.socketId !== socketId));
    },
    [roomId]
  );

  const removeParticipant = useCallback(
    (targetSocketId) => {
      socket.emit('remove-participant', { roomId, targetSocketId });
    },
    [roomId]
  );

  // Host controls — instant, no participant approval involved (used from ParticipantList)
  const setParticipantAudioAccess = useCallback(
    (targetSocketId, allow) => {
      socket.emit(allow ? 'host-unmute-audio' : 'host-mute-audio', {
        roomId,
        targetSocketId,
      });
      setAccessRequests((prev) =>
        prev.filter(
          (r) => !(r.socketId === targetSocketId && r.type === 'audio')
        )
      );
    },
    [roomId]
  );

  const setParticipantVideoAccess = useCallback(
    (targetSocketId, allow) => {
      socket.emit(allow ? 'host-unmute-video' : 'host-mute-video', {
        roomId,
        targetSocketId,
      });
      setAccessRequests((prev) =>
        prev.filter(
          (r) => !(r.socketId === targetSocketId && r.type === 'video')
        )
      );
    },
    [roomId]
  );

  // Respond to a participant's access request (host side)
  const grantAccessRequest = useCallback(
    (targetSocketId, type) => {
      if (type === 'audio') {
        setParticipantAudioAccess(targetSocketId, true);
      } else {
        setParticipantVideoAccess(targetSocketId, true);
      }
    },
    [setParticipantAudioAccess, setParticipantVideoAccess]
  );

  const denyAccessRequest = useCallback(
    (targetSocketId, type) => {
      socket.emit(
        type === 'audio' ? 'deny-audio-access' : 'deny-video-access',
        {
          roomId,
          targetSocketId,
        }
      );
      setAccessRequests((prev) =>
        prev.filter((r) => !(r.socketId === targetSocketId && r.type === type))
      );
    },
    [roomId]
  );

  return {
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
  };
};
