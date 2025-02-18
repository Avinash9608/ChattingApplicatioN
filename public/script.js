const socket = io();

// Utility functions to show/hide UI sections
const showChat = () => {
  document.getElementById("auth-container").classList.add("hidden");
  document.getElementById("chat-container").classList.remove("hidden");
  const email = document.getElementById("email").value;
  document.getElementById("user-email").textContent = email;
};

const showAuth = () => {
  document.getElementById("auth-container").classList.remove("hidden");
  document.getElementById("chat-container").classList.add("hidden");
};

// Signup function
window.signup = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email.split("@")[0], email, password }),
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) showChat();
  } catch (error) {
    console.error("Signup Error:", error);
    alert("Signup failed!");
  }
};

// Login function
window.login = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("/login", {
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
  } catch (error) {
    console.error("Login Error:", error);
    alert("Login failed!");
  }
};

// Logout function
window.logout = () => {
  alert("You have been logged out!");
  showAuth();
};

// Send chat message
// window.sendMessage = () => {
//   const messageInput = document.getElementById("message");
//   const message = messageInput.value.trim();

//   if (message) {
//     socket.emit("message", { message });
//     addMessageToChat({ email: "You", message }, true);
//     messageInput.value = "";
//   }

// };
window.sendMessage = () => {
  const messageInput = document.getElementById("message");
  const message = messageInput.value.trim();

  if (message) {
    socket.emit("message", { email: "You", message });

    // If the message mentions @chatbot, ask the server to get a response
    if (message.includes("@chatbot")) {
      socket.emit("chatbot_request", message);
    }

    addMessageToChat({ email: "You", message }, true);
    messageInput.value = "";
  }
};

// Listen for chatbot responses
socket.on("chatbot_response", (data) => {
  addMessageToChat({ email: "Chatbot", message: data.response }, false);
});

// Listen for incoming messages
socket.on("message", (data) => {
  addMessageToChat(data, false);
});

// Add message to chat UI
function addMessageToChat(data, isSelf) {
  const chatBox = document.getElementById("chat-box");
  const messageElement = document.createElement("div");

  messageElement.classList.add("message");
  if (isSelf) messageElement.classList.add("self");

  messageElement.innerHTML = `<strong>${data.email}:</strong> ${data.message}`;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Update profile picture preview
function updateProfilePic(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById("profile-img").src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// Toggle options menu
function toggleOptions() {
  document.querySelector(".more-options").classList.toggle("active");
}

// Close menu when clicking outside
document.addEventListener("click", (event) => {
  const moreOptions = document.querySelector(".more-options");
  if (!moreOptions.contains(event.target)) {
    moreOptions.classList.remove("active");
  }
});

// Send file function
window.sendFile = async () => {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  if (!file) return alert("Please select a file.");

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (res.ok) {
      // Emit the file event ONCE
      const fileData = {
        email: "You",
        fileName: data.fileName,
        fileUrl: data.fileUrl,
      };
      socket.emit("file", fileData);

      // Ensure it's added only once
      addFileToChat(fileData, true);
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};

// Add file to chat UI
function addFileToChat(data, isOwnMessage = false) {
  const chatBox = document.getElementById("chat-box");
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");

  if (isOwnMessage) messageDiv.classList.add("own-message");

  messageDiv.innerHTML = `
      <p><strong>${data.email}</strong></p>
      <p><a href="${data.fileUrl}" target="_blank">${data.fileName}</a></p>
    `;

  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Listen for incoming file messages

socket.on("file", (data) => {
  // Prevent duplicate file messages
  const existingMessages = Array.from(document.querySelectorAll(".message"));
  const alreadyExists = existingMessages.some((msg) =>
    msg.innerHTML.includes(data.fileUrl)
  );

  if (!alreadyExists) {
    addFileToChat(data);
  }
});
