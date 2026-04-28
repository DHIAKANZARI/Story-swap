import { io } from 'socket.io-client';

// Use same host but port 3000 if dev, or relative if deployed
const URL = import.meta.env.DEV ? 'https://storyaa.onrender.com' : '/';
export const socket = io(URL, {
  autoConnect: true
});
