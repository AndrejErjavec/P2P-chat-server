import express, { Express, Request, Response , Application } from 'express';
import cors  from 'cors';
import { createServer } from 'http';
import { Server } from "socket.io";
import WebSocket, { WebSocketServer } from 'ws';
import { addClient, getClients } from './clientStore';
import { MessageTopic } from './types/messageTopic';

const app: Application = express();
const server = createServer(app);
//const io = new Server(server, { /* options */ });
const io = new WebSocketServer({ port: 9090 });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({origin: true}));

// serve static site
app.use(express.static('public'));

io.on("connection", (socket, req) => {
  socket.emit("serverChatMessage", 'Welcome to socket chat app');
  const clientAddress = req.socket.remoteAddress;
  const clientPort = req.socket.remotePort;

  console.log(`client connected: ${clientAddress}:${clientPort}`);

  socket.on('register', (message) => {
    console.log(req.socket.remoteAddress);
  });

  socket.on('message', (data) => {
    console.log(data);
  })
});

app.get('/clients', (req, res) => {
  try {
    const clients = getClients();
    res.status(200).json({clients});
  } catch (err) {
    res.status(500).json({
      error: err,
      message: "Cannot get clients"
    });
  }
});

app.post('/register', (req, res) => {
  try {
    const data = req.body;
    res.status(200).json({
      message: "ok"
    });
    console.log(data);
  } catch (err) {
    res.status(500).json({
      error: err,
      message: "Cannot register"
    });
  }
});

server.listen(3000, () => {
  console.log(`Server listening on 3000`);
});
