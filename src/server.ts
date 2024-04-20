import express, { Request, Response , Application } from 'express';
import cors from 'cors';
import { IncomingMessage, createServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { addClient, createClientStore, getClients } from './clientStore';
import { MessageTopic } from './types/messageTopic';
import { Client } from './types/client';
import dotenv from 'dotenv'; 
dotenv.config();

const port = process.env.PORT || 5757;

console.log(process.env);

const app: Application = express();
const server = createServer(app);
const io = new WebSocketServer({ server });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// serve static site
app.use(express.static('public'));

createClientStore();

io.on("connection", (socket: any, req: any) => {
  socket.id = uuidv4();
  const publicAddress = req.headers['x-forwarded-for']?.toString()?.split(',')[1]?.trim();
  const publicPort = req.socket.remotePort;

  console.log(`client connected: ${publicAddress}:${publicPort}`);

  socket.on('message', (data: string) => {
    const obj = JSON.parse(data);
    if (!obj.topic) {
      console.log("topic missing");
      return;
    }

    switch (obj.topic) {
      case MessageTopic.REGISTER:
        const client: Client = {
          username: obj.data.username,
          publicAddress: publicAddress,
          publicPort: publicPort,
          socketId: socket.id
        }
        try {
          const clients = addClient(client);
          updateOnline(io, clients);
        } catch (err: any) {
          console.log(err.message);
        }
        break;
    }
  });

  socket.on('close', () => {
    console.log("client disconnected");
    try {
      let clients = getClients();
      let client = clients.find(client => client.socketId === socket.id);
      clients = addClient({...client, socketId: null});
      updateOnline(io, clients);
    } catch (err: any) {
      console.log(err.message);
    }
  });

  // send clients status to peer when connection is made
  const clients = getClients();
  io.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({topic: MessageTopic.UPDATE_ONLINE, data: clients}));
    }
  });
});

const updateOnline = (io: WebSocketServer, clients: Client[]) => {
  io.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({topic: MessageTopic.UPDATE_ONLINE, data: clients}));
    }
  });
}

server.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
