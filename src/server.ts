import express, { Request, Response , Application } from 'express';
import cors from 'cors';
import { IncomingMessage, createServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { addClient, createClientStore, getClients } from './clientStore';
import { MessageTopic } from './types/messageTopic';
import { Client } from './types/client';
import dotenv from 'dotenv';
import { SocketMessage } from 'types/socketMessage';
dotenv.config();

const port = process.env.PORT || 5757;

const app: Application = express();
const server = createServer(app);
const io = new WebSocketServer({ server });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// serve static site
app.use(express.static('public'));

createClientStore();

io.on("connection", (socket: any, req: IncomingMessage) => {
  socket.id = uuidv4();
  // const publicAddress = req.headers['x-forwarded-for']?.toString()?.split(',')[1]?.trim();

  const publicAddress = req.socket.remoteAddress;
  const publicPort = req.socket.remotePort;

  console.log(`client connected: ${publicAddress}:${publicPort}`);

  const message: SocketMessage = {
    topic: "welcome",
    code: "success",
    data: {message: "welcome to server"}
  }

  socket.send(JSON.stringify(message))

  socket.on('message', (data: string) => {
    console.log(data.toString());

    const obj = JSON.parse(data);
    if (!obj.topic) {
      console.log("topic missing");
      return;
    }

    switch (obj.topic) {
      case MessageTopic.REGISTER:
        const client: Client = {
          username: obj.data.username,
          publicAddress: publicAddress.split(':')[3] || null,
          publicPort: publicPort,
          privateAddress: obj.data.privateAddress,
          privatePort: obj.data.privatePort,
          socketId: socket.id
        }
        try {
          const clients = addClient(client);
          const message: SocketMessage = {
            topic: "register-response",
            code: "success",
            data: {message: "register successful"}
          }
          socket.send(JSON.stringify(message))
          updateOnline(io, socket, clients);
        } catch (err: any) {
          console.log(err.message);
          const message: SocketMessage = {
            topic: "register-response",
            code: "failure",
            data: {message: "error when register"}
          }
          socket.send(JSON.stringify(message));
        }

      case MessageTopic.GET_ONLINE:
        const clients = getClients();
        updateOnline(io, socket, clients)
    }
  });

  socket.on('close', () => {
    console.log("client disconnected");
    try {
      let clients = getClients();
      let client = clients.find(client => client.socketId === socket.id);
      clients = addClient({...client, socketId: null});
      updateOnline(io, socket, clients);
    } catch (err: any) {
      console.log(err.message);
    }
  });

  // send clients status to peer when connection is made
});

const updateOnline = (io: WebSocketServer, socket: any, clients: Client[]) => {
  io.clients.forEach((ws: any) => {
    if (ws.readyState === WebSocket.OPEN) {
      const online = clients.filter(client => {
        return client.socketId != ws.id && client.socketId != null
      });
      // console.log(`${ws.id} ==> ${online.map(client => (client.socketId))}`)
      ws.send(JSON.stringify({topic: "update-online", code:"success", data: online}));
    }
  });
}

app.post('/register', (req, res) => {
  const {username, privatePort} = req.body;
  if (!username || !privatePort) {
    res.status(400).json({
      message: "missing data"
    });
    return;
  }
  
});

server.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
