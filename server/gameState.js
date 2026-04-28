const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code;
  do {
    code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (rooms.has(code));
  return code;
}

const getRandomColor = () => {
  const colors = [
    'bg-red-200', 'bg-orange-200', 'bg-amber-200', 'bg-yellow-200', 
    'bg-lime-200', 'bg-green-200', 'bg-emerald-200', 'bg-teal-200', 
    'bg-cyan-200', 'bg-sky-200', 'bg-blue-200', 'bg-indigo-200', 
    'bg-violet-200', 'bg-purple-200', 'bg-fuchsia-200', 'bg-pink-200', 'bg-rose-200'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function createRoom(hostId) {
  const code = generateRoomCode();
  const room = {
    code,
    host: hostId,
    status: 'lobby', // lobby, writing, reading, results
    settings: { timeLimit: 60, rounds: 3 },
    players: [], // { id, name, avatar, color, connected }
    currentRound: 1,
    stories: {}, // map of initialPlayerId -> array of { text, authorId, authorName, color }
    submissions: new Set(), // playerIds who submitted this round
    votes: {}, // voterId -> votedStoryInitialPlayerId
    timerEnd: null,
  };
  rooms.set(code, room);
  return room;
}

function getRoom(code) {
  return rooms.get(code);
}

function joinRoom(code, player) {
  const room = rooms.get(code);
  if (!room) return null;

  // Reconnect check
  const existingPlayer = room.players.find(p => p.id === player.id || p.name === player.name);
  if (existingPlayer) {
    existingPlayer.connected = true;
    existingPlayer.id = player.id; // update socket id
    return room;
  }

  if (room.status !== 'lobby') {
    return null; // Cannot join mid-game unless reconnecting
  }

  room.players.push({
    id: player.id,
    name: player.name,
    avatarId: player.avatarId,
    color: getRandomColor(),
    connected: true
  });

  return room;
}

function leaveRoom(code, playerId) {
    const room = rooms.get(code);
    if (!room) return false;
    
    const player = room.players.find(p => p.id === playerId);
    if (player) {
        if (room.status === 'lobby') {
            room.players = room.players.filter(p => p.id !== playerId);
            if (room.host === playerId && room.players.length > 0) {
                room.host = room.players[0].id;
            }
        } else {
            player.connected = false;
        }
        
        if (room.players.filter(p => p.connected).length === 0) {
            rooms.delete(code);
        }
        return true;
    }
    return false;
}

function getCurrentStoryIdForPlayer(room, playerIndex) {
  const numPlayers = room.players.length;
  // In round R, player i receives story started by player (i - R + 1)
  const initialPlayerIndex = (playerIndex - room.currentRound + 1 + numPlayers * room.currentRound) % numPlayers;
  return room.players[initialPlayerIndex].id;
}

module.exports = {
  createRoom,
  getRoom,
  joinRoom,
  leaveRoom,
  getCurrentStoryIdForPlayer
};
