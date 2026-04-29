import { io } from 'socket.io-client';

export const socket = io('https://storyaa.onrender.com', {
  autoConnect: true,
  transports: ['websocket', 'polling']
});
