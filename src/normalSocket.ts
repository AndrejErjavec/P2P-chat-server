import net from 'net';

const server = net.createServer(socket => {
  console.log("client connected");
  socket.write("haha");
  setTimeout(() => {
    socket.write("bakaba");
  }, 10000);
  

  socket.on('close', () => {
    console.log("client disconected")
  });

  socket.on('data', (data) => {
    console.log(data);
  });
});

server.listen(5757, () => {
  console.log("server listening on port 5757");
});