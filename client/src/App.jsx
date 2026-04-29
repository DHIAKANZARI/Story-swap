import { useEffect, useState } from 'react';
import { socket } from './socket';
import { Avatar } from './components/ui/Avatar';
import HomeScreen from './components/screens/HomeScreen';
import LobbyScreen from './components/screens/LobbyScreen';
import WritingScreen from './components/screens/WritingScreen';
import ReadingVotingScreen from './components/screens/ReadingVotingScreen';
import ResultsScreen from './components/screens/ResultsScreen';
import AnimatedBackground from './components/ui/AnimatedBackground';
import ScreenWipe from './components/ui/ScreenWipe';

function App() {
  const [roomId, setRoomId] = useState(null);
  const [room, setRoom] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [currentStorySegments, setCurrentStorySegments] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [wipeTrigger, setWipeTrigger] = useState(0);

  useEffect(() => {
    socket.on('room-update', (updatedRoom) => {
      setRoom((prev) => {
        if (prev && prev.status !== updatedRoom.status) {
          setWipeTrigger(Date.now());
        }
        return updatedRoom;
      });
      if (updatedRoom.status !== 'writing') {
        setHasSubmitted(false);
      }
    });

    socket.on('player-submitted', (pId) => {
      if (pId === socket.id) {
        setHasSubmitted(true);
      }
    });

    socket.on('timer-tick', (time) => {
      setTimeRemaining(time);
    });

    socket.on('swap-stories', (segments) => {
      setWipeTrigger(Date.now() + 1); // trigger wipe
      setTimeout(() => {
        setCurrentStorySegments(segments);
        setHasSubmitted(false);
      }, 300); // sync with wipe peak
    });

    return () => {
      socket.off('room-update');
      socket.off('player-submitted');
      socket.off('timer-tick');
      socket.off('swap-stories');
    };
  }, []);

  if (!room) {
    return (
      <>
        <AnimatedBackground />
        <HomeScreen 
          onJoin={(code, name, avatarId) => {
            setPlayerName(name);
            socket.emit('join-room', { code, name, avatarId }, (res) => {
              if (res.error) alert(res.error);
              else setRoomId(res.room.code);
            });
          }}
          onCreate={(name, avatarId) => {
            setPlayerName(name);
            socket.emit('create-room', (res) => {
              setRoomId(res.code);
              socket.emit('join-room', { code: res.code, name, avatarId }, (joinRes) => {
                if (joinRes.error) alert(joinRes.error);
              });
            });
          }}
        />
      </>
    );
  }

  const myPlayer = room.players.find(p => p.id === socket.id);

  return (
    <>
      <AnimatedBackground />
      <ScreenWipe triggerKey={wipeTrigger} />
      
      <div className="app-container">
        {/* Header */}
        <header className="header">
          <div className="header-title" style={{ zIndex: 10 }}>Story Swap</div>
          <div className="header-info" style={{ zIndex: 10 }}>
            <div className="room-badge">
              Room Code: <span className="room-code-mono">{room.code}</span>
            </div>
            {myPlayer && <Avatar avatarId={myPlayer.avatarId} size={28} />}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="main-content" style={{ zIndex: 5, position: 'relative' }}>
          {room.status === 'lobby' && (
            <LobbyScreen room={room} socket={socket} />
          )}
          {room.status === 'writing' && (
            <WritingScreen 
              room={room} 
              socket={socket} 
              timeRemaining={timeRemaining} 
              currentStorySegments={currentStorySegments}
              hasSubmitted={hasSubmitted}
            />
          )}
          {room.status === 'reading' && (
            <ReadingVotingScreen room={room} socket={socket} />
          )}
          {room.status === 'results' && (
            <ResultsScreen room={room} />
          )}
        </main>
      </div>
    </>
  );
}

export default App;
