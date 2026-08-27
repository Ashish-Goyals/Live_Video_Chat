import React, { useState, useRef, useCallback, useEffect } from 'react';
import { dummyRemoteParticipants } from '../assets/asset';
import { toast } from 'react-hot-toast';
import { Mic, MicOff, Webcam, WebcamOff } from 'lucide-react';

const useWebRTC = (_roomId, user, onMeetingEnded, _enabled = true) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState(dummyRemoteParticipants);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const [videoEnabled, setVideoEnabled] = useState(true);

  const localStreamRef = useRef(null);

  // intialize local camera stream if avialable in browser
  const initLocalStream = useCallback(async () => {
    try {
      if (navigator?.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        setLocalStream(stream);
        return stream;
      }
    } catch (_error) {
      console.log('Mock WebRTC: Running in camera preview fallback mode.');
    }
    return null;
  }, []);
  useEffect(() => {
    initLocalStream();
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [initLocalStream]);

  //   Toggle Local Mic

  const toggleAudio = () => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) audioTrack.enabled = newState;
    }
    toast(newState ? 'Microphone Turned On ' : 'Microphone Turned Off', {
      icon: newState ? <Mic /> : <MicOff />,
    });
  };

  //   Toggle Local Camera

  const toggleVideo = async () => {
    const newState = !videoEnabled;
    setVideoEnabled(newState);
    if (localStreamRef.current) {
      if (!newState) {
        // Stop the track entirely — turns off the camera indicator light
        localStreamRef.current
          .getVideoTracks()
          .forEach((track) => track.stop());
      } else {
        // Restart the camera
        try {
          const newStream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          const newVideoTrack = newStream.getVideoTracks()[0];
          // Replace track in the existing stream
          localStreamRef.current
            .getVideoTracks()
            .forEach((t) => localStreamRef.current.removeTrack(t));
          localStreamRef.current.addTrack(newVideoTrack);
          setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
        } catch (_err) {
          setVideoEnabled(false);
        }
      }
    }
    toast(newState ? 'Camera Turned On' : 'Camera Turned Off', {
      icon: newState ? <Webcam /> : <WebcamOff />,
    });
  };

  //   End Meeting For Everyone

  const endMeeting = useCallback(() => {
    if (onMeetingEnded) {
      onMeetingEnded('Meeting Ended');
    }
  }, [onMeetingEnded]);
  return {
    localStream,
    remoteUsers,
    audioEnabled,
    videoEnabled,
    toggleAudio,
    toggleVideo,
    endMeeting,
  };
};

export default useWebRTC;
