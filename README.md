# Story Swap Game

A real-time multiplayer "story swap" web game where friends write stories together! Built with React, Node.js, Express, Socket.io, and Tailwind CSS.

## Features

- **Real-time Multiplayer:** Uses Socket.io for instantaneous game state updates.
- **Configurable Settings:** Host can change time limit (60s, 90s, 120s) and number of rounds.
- **Pass the Story:** When the timer hits 0 (or everyone submits early), stories are shuffled. You receive someone else's story to continue!
- **Anonymous Avatars:** Join instantly without authentication. Avatars are auto-generated.
- **Voting Phase:** Read the glorious creations and vote for your favorite. The winner is celebrated with confetti!

## Technology Stack

- **Client:** React, Vite, Tailwind CSS, Socket.io-client, Lucide React icons, React Confetti.
- **Server:** Node.js, Express, Socket.io. State is stored entirely in memory.

## Prerequisites

- Node.js (v18+ recommended)
- npm

## Running locally

The application is structured into two main folders: `client` and `server`. You will need to run both simultaneously.

### 1. Server

Open a terminal and navigate to the `server` directory:

```bash
cd server
npm install
npm start
```

This will run the server on `http://localhost:3000`.

*(Alternatively, use `npm run dev` to start with nodemon for active development).*

### 2. Client

Open another terminal and navigate to the `client` directory:

```bash
cd client
npm install
npm start
```

The frontend will start using Vite on a local port (usually `http://localhost:5173`).

---

### How to play

1. Open the client URL in your browser.
2. Enter your name and click **Host a New Game**.
3. Share the 4-letter **Room Code** with your friends.
4. They can open the same URL, enter the code, and join.
5. Choose your settings and click **Start Game!**
6. Write your part of the story before the timer runs out!
7. Vote for the best result at the end.
