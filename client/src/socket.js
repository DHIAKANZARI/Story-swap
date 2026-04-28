import { io } from 'socket.io-client';

const URL = 'https://storyaa.onrender.com';

export const socket = io(URL, {
  autoConnect: true
});