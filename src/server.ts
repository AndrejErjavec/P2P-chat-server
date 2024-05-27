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

  console.log('client connected');

  // console.log(`client connected: ${publicAddress}:${publicPort}`);

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
      case MessageTopic.REGISTER: {
        const client: Client = {
          username: obj.data.username,
          publicAddress: req.headers['x-forwarded-for'].toString(),
          publicPort: req.socket.remotePort,
          privateAddress: obj.data.privateAddress,
          privatePort: obj.data.privatePort,
          socketId: socket.id
        }
        try {
          const clients = addClient(client);

          const me = getClients().filter(client => {
            return client.socketId == socket.id
          });

          const message: SocketMessage = {
            topic: "register-response",
            code: "success",
            data: {message: "register successful", me: me[0]}
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
        break;
      }

      case MessageTopic.CHAT_REQUEST: {
        console.log("received chat-request to forward")
        const {
          discoverySocketId
        } = obj.data

        let sendTo = null;
        io.clients.forEach((client: any) => {
          if (client.id == discoverySocketId) {
            sendTo = client
          }
        });

        if (sendTo != null) {
          const message: SocketMessage = {
            topic: "chat-request",
            code: "success",
            data: obj.data
          }
          try {
            sendTo!.send(JSON.stringify(message))
          } catch(e: any) {
            console.log(e)
          }
        } else {
          console.log("sendto is null")
        }
        break;
      }

      case MessageTopic.FORWARD_MESSAGE: {
        console.log("received forward message request")
        const socketId = obj.data.discoverySocketId;
        const message = obj.data.message;
        const timestamp = obj.data.timestamp;
        const sender = obj.data.sender;
        const receiver = obj.data.receiver;

        let sendTo = null;
        io.clients.forEach((client: any) => {
          if (client.id == socketId) {
            sendTo = client
          }
        });

        if (sendTo != null) {
          const obj2: SocketMessage = {
            topic: "chat-message",
            code: "success",
            data: {
              message: message,
              timestamp: timestamp,
              sender: sender,
              receiver: receiver
            }
          }
  
          try {
            sendTo!.send(JSON.stringify(obj2))
          } catch(e: any) {
            console.log(e)
          }
        } else {
          console.log("sendto is null")
        }
        break;
      }

      case MessageTopic.ALL_USERS: {
        try {
          let clients = getClients()

          clients = clients.filter(client => {
            return client.socketId != socket.id
          });

          const message: SocketMessage = {
            topic: "all-users-response",
            code: "success",
            data: clients
          }

          socket.send(JSON.stringify(message))
        } catch (err: any) {
          console.log(err.message);
          const message: SocketMessage = {
            topic: "all-users-response",
            code: "failure",
            data: {message: "error getting users"}
          }
          socket.send(JSON.stringify(message));
        }
        break;
      }

      case MessageTopic.USER_DATA: {
        const username = obj.data.username;
        const user = getClients().find(client => {
          return client.username == username
        });


        const msg: SocketMessage = {
          topic: "user-data-response",
          code: "success",
          data: user
        }
        socket.send(JSON.stringify(msg));
        break;
      }

      case MessageTopic.GET_ONLINE: {
        const clients = getClients();
        updateOnline(io, socket, clients)
        break;
      }
    }
  });

  socket.on('close', () => {
    console.log("client disconnected");
    try {
      let clients = getClients();
      let client = clients.find(client => client.socketId === socket.id);
      if (client) {
        clients = addClient({...client, socketId: null});
      updateOnline(io, socket, clients);
      }
    } catch (err: any) {
      console.log(err.message);
    }
  });
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

server.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
