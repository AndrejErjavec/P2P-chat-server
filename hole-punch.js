import express from 'express';
import { createServer } from 'http';
import { Server } from "socket.io";
import { addClient } from './clients.js';

const app = express();
const server = createServer(app);
const io = new Server(server, { /* options */ });

app.use(express.static('public'));

io.on("connection", (socket) => {
  const clientAddress = socket.handshake.address.split(':')[3];

  socket.emit("serverChatMessage", 'Welcome to socket chat app');
  console.log(`client connected`);

  socket.on('chatMessage', (message) => {
    io.emit("serverChatMessage", message);
  });

  socket.on('disconnect', () => {
    console.log('client disconnected');
  });
});


//app.get('/', (req, res) => {
//  res.send('<h1>Hello world</h1>');
//})

server.listen(3000, () => {
  console.log(`Server listening on 3000`);
});
