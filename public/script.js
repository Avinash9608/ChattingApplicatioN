const socket = io("http://localhost:5500");
let userEmail = "";

// Show chatbox and hide login/signup form
const showChat = () => {
  document.getElementById("auth-container").classList.add("hidden");
  document.getElementById("chat-container").classList.remove("hidden");
};

// Show login/signup form and hide chatbox
const showAuth = () => {
  document.getElementById("auth-container").classList.remove("hidden");
  document.getElementById("chat-container").classList.add("hidden");
};

window.signup = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("http://localhost:5500/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: email.split("@")[0], email, password }),
  });

  const data = await res.json();
  alert(data.message);
  if (res.ok) {
    userEmail = email;
    showChat();
  }
};

window.login = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("http://localhost:5500/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  alert(data.message);
  if (res.ok) {
    userEmail = email;
    showChat();
    socket.emit("join", email);
  }
};

const logout = () => {
  alert("You have been logged out!");
  userEmail = "";
  showAuth();
};

const sendMessage = () => {
  const messageInput = document.getElementById("message");
  const message = messageInput.value.trim();

  if (message) {
    // Emit message to the server
    socket.emit("message", { email: userEmail, message });

    // Add message to chatbox as "You"
    addMessageToChat({ email: "You", message }, true);
    messageInput.value = "";
  }
};

// Listen for incoming messages
socket.on("message", (data) => {
  if (data.email !== userEmail) {
    // Show sender's email for others
    addMessageToChat(data, false);
  }
});

function addMessageToChat(data, isSelf) {
  const chatBox = document.getElementById("chat-box");
  const messageElement = document.createElement("div");

  messageElement.classList.add("message");
  if (isSelf) messageElement.classList.add("self");

  messageElement.innerHTML = `<strong>${data.email}:</strong> ${data.message}`;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}
