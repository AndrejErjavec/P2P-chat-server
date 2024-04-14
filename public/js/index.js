const serverForm = document.querySelector('#server-form');
const serverInput = document.querySelector('#server-input');
const messageForm = document.querySelector('#message-form');
const messageInput = document.querySelector('#message-input');
const messageBox = document.querySelector('#message');
const username = document.querySelector('#username');
const onlineUsers = document.querySelector('#online-users');

let socket = null;

serverForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (serverInput.value && username.value) {
    socket = new WebSocket(`wss://${serverInput.value}`);
    // wait until the connection is established
    socket.onopen = () => {
      registerClient(username.value);
      displayMessage('connected');
    };

    socket.onmessage = (message) => {
      console.log("got message");
      const users = JSON.parse(message.data).data;
      displayOnlineUsers(users);
    };
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

async function registerClient(username) {
  socket.send(JSON.stringify({topic: "register", data: {username: username}}));
}

function generateKeyPair() {
  
}

function displayMessage(message) {
  messageBox.innerHTML = message;
}

function displayOnlineUsers(users) {
  console.log(users);
  onlineUsers.innerHTML = '';
  users.forEach(user => {
    const userDiv = document.createElement('div');
    const username = document.createElement('div');
    const status = document.createElement('div');
    if (user.socketId) {
      status.classList.add('online-indicator');
    } else {
      status.classList.add('offline-indicator');
    }
    userDiv.appendChild(username);
    userDiv.appendChild(status);
    username.innerHTML = user.username;
    onlineUsers.appendChild(userDiv);
  });
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