const express = require('express');
const http = require('http');
const cors = require('cors');
const { initSocket } = require('./socket');

const app = express();
app.use(cors({
  origin: storyaaa.netlify.app,
  methods: ["GET", "POST"]
}));


const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

app.get('/', (req, res) => {
  res.send('Story Swap Server is running');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
