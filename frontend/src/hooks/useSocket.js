import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const BC_CHANNEL_NAME = 'playvix_slot_sync';

/**
 * Real-time socket hook with:
 * - Date-aware filtering (only updates for the selected date)
 * - Auto-reconnection
 * - BroadcastChannel for multi-tab sync
 */
export const useSocket = (pitchId, selectedDate, onSlotUpdate) => {
  const socketRef = useRef(null);
  const bcRef = useRef(null);

  const handleEvent = useCallback(
    (data) => {
      // Only apply updates matching current pitch + date
      if (data.pitchId === pitchId && data.date === selectedDate) {
        onSlotUpdate(data);
      }
    },
    [pitchId, selectedDate, onSlotUpdate],
  );

  // BroadcastChannel for multi-tab sync
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;

    bcRef.current = new BroadcastChannel(BC_CHANNEL_NAME);
    bcRef.current.onmessage = (e) => handleEvent(e.data);

    return () => {
      bcRef.current?.close();
      bcRef.current = null;
    };
  }, [handleEvent]);

  // Socket.io connection
  useEffect(() => {
    if (!pitchId) return;

    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join:pitch', pitchId);
    });

    const relay = (data) => {
      handleEvent(data);
      // Forward to other tabs
      try { bcRef.current?.postMessage(data); } catch (_) {}
    };

    socketRef.current.on('slot:reserved', relay);
    socketRef.current.on('slot:booked', relay);
    socketRef.current.on('slot:available', relay);

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave:pitch', pitchId);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [pitchId, handleEvent]);
};
