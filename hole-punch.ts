import express, { Express, Request, Response , Application } from 'express';
import cors  from 'cors';
import { createServer } from 'http';
import { Server } from "socket.io";
import WebSocket, { WebSocketServer } from 'ws';
import { addClient, createClientStore, getClients } from './clientStore';
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

createClientStore();

io.on("connection", (socket, req) => {
  socket.emit("serverChatMessage", 'Welcome to socket chat app');
  const clientAddress = req.socket.remoteAddress;
  const clientPort = req.socket.remotePort;

  console.log(`client connected: ${clientAddress}:${clientPort}`);

  socket.on('register', (message) => {
    console.log(req.socket.remoteAddress);
  });

  socket.on('message', (data: string) => {
    const obj = JSON.parse(data);
    if (!obj.topic) {
      console.log("topic missing");
      return;
    }
    console.log(obj.topic);
    switch (obj.topic) {
      case MessageTopic.REGISTER:
        const client = {
          username: obj.data.username,
          privateAddress: req.socket.remoteAddress,
          privatePort: req.socket.remotePort
        }
        try {
          addClient(client);
        } catch (err: any) {
          console.log(err.message);
        }
        break;
    }
  })
});

app.get('/clients', (req, res) => {
  try {
    const clients = getClients();
    res.status(200).json({clients});
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
      message: "Cannot get clients"
    });
  }
});

server.listen(3000, () => {
  console.log(`Server listening on 3000`);
});
