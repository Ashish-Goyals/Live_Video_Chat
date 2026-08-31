import { useState, useCallback, useRef, useEffect } from 'react';

import { socket } from '../config/socket';
import { useSound } from './useSound';

export const useChat = (roomId, user) => {
  const { play } = useSound();

  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const isChatOpenRef = useRef(isChatOpen);

  useEffect(() => {
    isChatOpenRef.current = isChatOpen;
  }, [isChatOpen]);

  useEffect(() => {
    if (!roomId) return;
    const handleReceiveMessage = (message) => {
      setMessages((prev) => [...prev, message]);
      play('message');

      if (!isChatOpenRef.current) setUnreadCount((prev) => prev + 1);
    };
    socket.on('receive-message', handleReceiveMessage);

    return () => {
      socket.off('receive-message', handleReceiveMessage);
    };
  }, [roomId]);

  const sendMessage = useCallback(
    (text) => {
      if (!text.trim() || !user) return;
      const message = {
        id: Date.now().toString(),
        text: text.trim(),
        senderName: user.name || user.fullName || 'You',
        senderId: user.id,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      socket.emit('send-message', { message, roomId });
      // setMessages((prev) => [...prev, message]);
    },
    [roomId, user?.id, user?.name]
  );

  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => {
      if (!prev) setUnreadCount(0);
      return !prev;
    });
  }, []);

  return {
    messages: messages,
    unreadCount: unreadCount,
    isChatOpen: isChatOpen,
    sendMessage: sendMessage,
    toggleChat: toggleChat,
  };
};
