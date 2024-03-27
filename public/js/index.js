const from = document.getElementById('form');
const input = document.getElementById('input');
const button = document.getElementById('send-button');

const socket = new WebSocket('ws://192.168.1.130:9090/');

const clientData = {
  name: "client1",
  ip: "1.1.1.1"
}

registerClient();

// wait until the connection is established
socket.onopen = () => {}

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
  try {
    const response = await axios.post('http://192.168.1.130:3000/register', clientData);
    console.log(response.data);
  } catch (err) {
    console.log(err);
  }
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