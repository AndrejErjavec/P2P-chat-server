const serverForm = document.getElementById('server-form');
const serverInput = document.getElementById('server-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messageBox = document.querySelector('#message');

let socket = null;

serverForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (serverInput.value) {
    socket = new WebSocket(`ws://${serverInput.value}`);
    // wait until the connection is established
    socket.onopen = () => {
      registerClient();
      displayMessage('connected');
    }
  } else {
    displayMessage('no server address');
  }
});

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (messageInput.value) {
    socket.emit('chatMessage', messageInput.value);
    input.value = '';
    displayChatMessage(input.value, "me");
  }
  else {
    displayMessage('no text');
  }
});

async function registerClient() {
  socket.send(JSON.stringify({topic: "register", data: {username: "jufka"}}));
}

function generateKeyPair() {
  
}

function displayMessage(message) {
  messageBox.innerHTML = message;
}

function displayChatMessage(message, author) {
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