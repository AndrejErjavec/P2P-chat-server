import express, { Request, Response , Application } from 'express';
import { createServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import cors from 'cors';
import { addClient, createClientStore, getClients } from './clientStore';
import { MessageTopic } from './types/messageTopic';

const app: Application = express();
const server = createServer(app);
const io = new WebSocketServer({ server });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({origin: true}));

// serve static site
app.use(express.static('public'));

createClientStore();

io.on("connection", (socket, req) => {
  const privateAddress = req.socket.remoteAddress;
  const privatePort = req.socket.remotePort;
  // if connected from local network, the header will be undefined
  const publicAddress = req.headers['x-forwarded-for']?.toString()?.split(',')[0]?.trim();

  console.log(`client connected: ${publicAddress} | ${privateAddress}:${privatePort}`);

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
          privateAddress: privateAddress,
          privatePort: privatePort,
          publicAddress: publicAddress
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

app.get('/clients', (req: Request, res: Response) => {
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
