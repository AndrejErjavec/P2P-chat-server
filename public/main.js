const socket = io();

const from = document.getElementById('form');
const input = document.getElementById('input');
const button = document.getElementById('send-button');

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

socket.on('serverChatMessage', (message) => {
  displayMessage(message, "other");
});

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