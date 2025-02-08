console.log("Script loaded");
const socket = io();

// Show chat container and hide auth section after login
const showChat = () => {
  document.getElementById("auth-container").classList.add("hidden");
  document.getElementById("chat-container").classList.remove("hidden");
};

// Show login/signup again and hide chat on logout
const showAuth = () => {
  document.getElementById("auth-container").classList.remove("hidden");
  document.getElementById("chat-container").classList.add("hidden");
};

// const signup = async () => {
//   const email = document.getElementById("email").value;
//   const password = document.getElementById("password").value;

//   const res = await fetch("http://localhost:5500/signup", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ username: email.split("@")[0], email, password }),
//   });

//   const data = await res.json();
//   alert(data.message);
//   if (res.ok) showChat();
// };

// const login = async () => {
//   const email = document.getElementById("email").value;
//   const password = document.getElementById("password").value;

//   const res = await fetch("http://localhost:5500/login", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email, password }),
//   });

//   const data = await res.json();
//   alert(data.message);
//   if (res.ok) {
//     showChat();
//     socket.emit("join", email);
//   }
// };

// Attach functions to the window object
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
  if (res.ok) showChat();
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
    showChat();
    socket.emit("join", email);
  }
};

window.logout = () => {
  alert("You have been logged out!");
  showAuth();
};

window.sendMessage = () => {
  const messageInput = document.getElementById("message");
  const message = messageInput.value.trim();

  if (message) {
    socket.emit("message", { message });
    addMessageToChat({ email: "You", message }, true);
    messageInput.value = "";
  }
};
const logout = () => {
  alert("You have been logged out!");
  showAuth();
};

const sendMessage = () => {
  const messageInput = document.getElementById("message");
  const message = messageInput.value.trim();

  if (message) {
    socket.emit("message", { message });
    addMessageToChat({ email: "You", message }, true);
    messageInput.value = "";
  }
};

socket.on("message", (data) => {
  addMessageToChat(data, false);
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
