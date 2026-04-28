const { Server } = require('socket.io');
const { createRoom, getRoom, joinRoom, leaveRoom, getCurrentStoryIdForPlayer } = require('./gameState');

let io;
const activeTimers = new Map(); // roomCode -> timeout/interval handle

function initSocket(server) {
  io = new Server(server, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    let currentRoom = null;

    socket.on('create-room', (callback) => {
      const room = createRoom(socket.id);
      currentRoom = room.code;
      socket.join(room.code);
      callback({ code: room.code });
    });

    socket.on('join-room', ({ code, name, avatarId }, callback) => {
      const room = joinRoom(code.toUpperCase(), { id: socket.id, name, avatarId });
      if (!room) {
        callback({ error: 'Room not found or game already started.' });
        return;
      }
      currentRoom = room.code;
      socket.join(room.code);
      io.to(room.code).emit('room-update', room);
      callback({ room });
    });

    socket.on('update-settings', (settings) => {
      if (!currentRoom) return;
      const room = getRoom(currentRoom);
      if (room && room.host === socket.id) {
        room.settings = { ...room.settings, ...settings };
        io.to(currentRoom).emit('room-update', room);
      }
    });

    socket.on('start-game', () => {
      if (!currentRoom) return;
      const room = getRoom(currentRoom);
      if (room && room.host === socket.id && room.players.length > 1) {
        room.status = 'writing';
        room.currentRound = 1;

        // Initialize stories
        room.players.forEach(p => {
          room.stories[p.id] = [];
        });

        io.to(currentRoom).emit('room-update', room);
        startRound(room);
      }
    });

    socket.on('submit-text', ({ text }) => {
      if (!currentRoom) return;
      const room = getRoom(currentRoom);
      if (!room || room.status !== 'writing') return;

      handleSubmission(room, socket.id, text);
    });

    socket.on('cast-vote', ({ votedForId }) => {
      if (!currentRoom) return;
      const room = getRoom(currentRoom);
      if (!room || room.status !== 'reading') return;

      room.votes[socket.id] = votedForId;
      io.to(currentRoom).emit('room-update', room);

      // Check if everyone voted (active players)
      const expectedVotes = room.players.filter(p => p.connected).length;
      if (Object.keys(room.votes).length >= expectedVotes) {
        room.status = 'results';
        io.to(currentRoom).emit('room-update', room);
      }
    });

    socket.on('disconnect', () => {
      if (currentRoom) {
        const roomLeft = leaveRoom(currentRoom, socket.id);
        if (roomLeft) {
          const room = getRoom(currentRoom);
          if (room) {
            io.to(currentRoom).emit('room-update', room);
            // If we are waiting for submissions, verify if we can proceed
            if (room.status === 'writing' && isRoundComplete(room)) {
              endRound(room);
            }
          } else {
             // Room was deleted
             if (activeTimers.has(currentRoom)) {
                 clearInterval(activeTimers.get(currentRoom));
                 activeTimers.delete(currentRoom);
             }
          }
        }
      }
    });
  });
}

function startRound(room) {
  room.submissions.clear();
  let timeRemaining = room.settings.timeLimit;
  room.timerEnd = Date.now() + timeRemaining * 1000;

  // Initial emit to inform players what story they have right now
  emitSwapStories(room);
  io.to(room.code).emit('timer-tick', timeRemaining);

  const intervalId = setInterval(() => {
    timeRemaining = Math.max(0, Math.ceil((room.timerEnd - Date.now()) / 1000));
    io.to(room.code).emit('timer-tick', timeRemaining);

    if (timeRemaining <= 0) {
      clearInterval(intervalId);
      activeTimers.delete(room.code);
      endRound(room);
    }
  }, 1000);

  activeTimers.set(room.code, intervalId);
}

function handleSubmission(room, playerId, text) {
  if (room.submissions.has(playerId)) return;
  
  const playerIndex = room.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return;
  
  const p = room.players[playerIndex];
  
  // Find which story this text goes to
  const targetStoryId = getCurrentStoryIdForPlayer(room, playerIndex);
  
  room.stories[targetStoryId].push({
    text: text ? text.trim() : '...', // default if empty or undefined logic handled differently below, wait let's just make sure both blocks are identical pattern
    authorId: p.id,
    authorName: p.name,
    authorAvatarId: p.avatarId,
    color: p.color
  });
  
  room.submissions.add(playerId);
  io.to(room.code).emit('player-submitted', playerId);

  if (isRoundComplete(room)) {
    if (activeTimers.has(room.code)) {
      clearInterval(activeTimers.get(room.code));
      activeTimers.delete(room.code);
    }
    endRound(room);
  }
}

function isRoundComplete(room) {
  // Check if all *connected* players have submitted
  const expectedPlayers = room.players.filter(p => p.connected);
  return expectedPlayers.every(p => room.submissions.has(p.id));
}

function endRound(room) {
  // Auto-submit for any ghosts or non-submitted disconnected players
  room.players.forEach((p, index) => {
    if (!room.submissions.has(p.id)) {
      const targetStoryId = getCurrentStoryIdForPlayer(room, index);
      room.stories[targetStoryId].push({
        text: '...', // Ghost submitted empty
        authorId: p.id,
        authorName: p.name,
        authorAvatarId: p.avatarId,
        color: p.color
      });
      room.submissions.add(p.id);
    }
  });

  if (room.currentRound >= room.settings.rounds) {
    room.status = 'reading';
    io.to(room.code).emit('room-update', room);
  } else {
    room.currentRound++;
    io.to(room.code).emit('room-update', room);
    startRound(room);
  }
}

function emitSwapStories(room) {
    // Send each player the text of the story they are about to continue
    room.players.forEach((p, index) => {
        const targetStoryId = getCurrentStoryIdForPlayer(room, index);
        const storySegments = room.stories[targetStoryId];
        // Only emit if player is connected
        if (p.connected) {
             io.to(p.id).emit('swap-stories', storySegments);
        }
    });
}

module.exports = { initSocket };
