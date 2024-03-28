const from = document.getElementById('form');
const input = document.getElementById('input');
const button = document.getElementById('send-button');

const socket = new WebSocket('ws://192.168.1.130:9090/');

// wait until the connection is established
socket.onopen = () => {
  registerClient();
}

from.addEventListener('submit', (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit('chatMessage', input.value);
    input.value = '';
    displayMessage(input.value, "me");
  }
  else {
    console.log('no text');
  }
});

async function registerClient() {
  socket.send(JSON.stringify({topic: "register", data: {username: "burek"}}));
}

function generateKeyPair() {
  
}

function displayMessage(message, author) {
  const newMessage = document.createElement('div');
  newMessage.innerHTML = message;
  newMessage.classList.add("message");
  if (author === "me") {
    newMessage.style.backgroundColor = '#03c2fc';
  }
  else{
    newMessage.style.backgroundColor = '#b0b0b0';
  }
  document.getElementById('messages').appendChild(newMessage);
}