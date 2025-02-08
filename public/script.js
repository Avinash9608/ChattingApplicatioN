// const socket = io();

// // Show chat container and hide auth section after login
// const showChat = () => {
//   document.getElementById("auth-container").classList.add("hidden");
//   document.getElementById("chat-container").classList.remove("hidden");
//   const email = document.getElementById("email").value;
//   document.getElementById("user-email").textContent = email;
// };

// // Show login/signup again and hide chat on logout
// const showAuth = () => {
//   document.getElementById("auth-container").classList.remove("hidden");
//   document.getElementById("chat-container").classList.add("hidden");
// };

// // Attach functions to the window object
// window.signup = async () => {
//   const email = document.getElementById("email").value;
//   const password = document.getElementById("password").value;

//   const res = await fetch("/signup", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ username: email.split("@")[0], email, password }),
//   });

//   const data = await res.json();
//   alert(data.message);
//   if (res.ok) showChat();
// };

// window.login = async () => {
//   const email = document.getElementById("email").value;
//   const password = document.getElementById("password").value;

//   const res = await fetch("/login", {
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

// window.logout = () => {
//   alert("You have been logged out!");
//   showAuth();
// };

// window.sendMessage = () => {
//   const messageInput = document.getElementById("message");
//   const message = messageInput.value.trim();

//   if (message) {
//     socket.emit("message", { message });
//     addMessageToChat({ email: "You", message }, true);
//     messageInput.value = "";
//   }
// };
// const logout = () => {
//   alert("You have been logged out!");
//   showAuth();
// };

// const sendMessage = () => {
//   const messageInput = document.getElementById("message");
//   const message = messageInput.value.trim();

//   if (message) {
//     socket.emit("message", { message });
//     addMessageToChat({ email: "You", message }, true);
//     messageInput.value = "";
//   }
// };

// socket.on("message", (data) => {
//   addMessageToChat(data, false);
// });

// function addMessageToChat(data, isSelf) {
//   const chatBox = document.getElementById("chat-box");
//   const messageElement = document.createElement("div");

//   messageElement.classList.add("message");
//   if (isSelf) messageElement.classList.add("self");

//   messageElement.innerHTML = `<strong>${data.email}:</strong> ${data.message}`;
//   chatBox.appendChild(messageElement);
//   chatBox.scrollTop = chatBox.scrollHeight;
// }
// function updateProfilePic(event) {
//   const file = event.target.files[0];
//   if (file) {
//     const reader = new FileReader();
//     reader.onload = function (e) {
//       document.getElementById("profile-img").src = e.target.result;
//     };
//     reader.readAsDataURL(file);
//   }
// }
// function toggleOptions() {
//   document.querySelector(".more-options").classList.toggle("active");
// }

// // Close menu when clicking outside
// document.addEventListener("click", function (event) {
//   const moreOptions = document.querySelector(".more-options");
//   if (!moreOptions.contains(event.target)) {
//     moreOptions.classList.remove("active");
//   }
// });
// // window.sendFile = () => {
// //   const fileInput = document.getElementById("fileInput");
// //   const file = fileInput.files[0];

// //   if (file) {
// //     const reader = new FileReader();
// //     reader.onload = function (e) {
// //       socket.emit("file", { fileName: file.name, fileData: e.target.result });
// //       addMessageToChat(
// //         { email: "You", message: `Sent a file: ${file.name}` },
// //         true
// //       );
// //     };
// //     reader.readAsDataURL(file);
// //   }
// // };
// // window.sendFile = async () => {
// //   const fileInput = document.getElementById("fileInput");
// //   const file = fileInput.files[0];

// //   if (!file) return alert("Please select a file.");

// //   const formData = new FormData();
// //   formData.append("file", file);

// //   console.log("Uploading file:", file.name); // Debugging log

// //   try {
// //     const res = await fetch("/upload", { method: "POST", body: formData });
// //     const data = await res.json();

// //     console.log("Upload response:", data); // Debugging log

// //     if (res.ok) {
// //       socket.emit("file", {
// //         email: "You",
// //         fileName: data.fileName,
// //         fileUrl: data.fileUrl,
// //       });

// //       addFileToChat(
// //         {
// //           email: "You",
// //           fileName: data.fileName,
// //           fileUrl: data.fileUrl,
// //         },
// //         true
// //       );
// //     } else {
// //       alert(data.error);
// //     }
// //   } catch (error) {
// //     console.error("Error uploading file:", error);
// //   }
// // };

// // socket.on("file", (data) => {
// //   const chatBox = document.getElementById("chat-box");
// //   const fileLink = document.createElement("a");
// //   fileLink.href = data.fileData;
// //   fileLink.download = data.fileName;
// //   fileLink.textContent = `Download ${data.fileName}`;
// //   fileLink.classList.add("file-message");
// //   chatBox.appendChild(fileLink);
// // });

// window.sendFile = async () => {
//   const fileInput = document.getElementById("fileInput");
//   const file = fileInput.files[0];

//   if (!file) return alert("Please select a file.");

//   const formData = new FormData();
//   formData.append("file", file);

//   console.log("Uploading file:", file.name); // Debugging log

//   try {
//     const res = await fetch("/upload", { method: "POST", body: formData });
//     const data = await res.json();

//     console.log("Upload response:", data); // Debugging log

//     if (res.ok) {
//       socket.emit("file", {
//         email: "You",
//         fileName: data.fileName,
//         fileUrl: data.fileUrl,
//       });

//       addFileToChat(
//         {
//           email: "You",
//           fileName: data.fileName,
//           fileUrl: data.fileUrl,
//         },
//         true
//       );
//     } else {
//       alert(data.error);
//     }
//   } catch (error) {
//     console.error("Error uploading file:", error);
//   }
// };

// function addFileToChat(data, isOwnMessage = false) {
//   const chatBox = document.getElementById("chat-box");
//   const messageDiv = document.createElement("div");
//   messageDiv.classList.add("message");

//   if (isOwnMessage) messageDiv.classList.add("own-message");

//   messageDiv.innerHTML = `
//         <p><strong>${data.email}</strong></p>
//         <p><a href="${data.fileUrl}" target="_blank">${data.fileName}</a></p>
//       `;

//   chatBox.appendChild(messageDiv);
//   chatBox.scrollTop = chatBox.scrollHeight;
// }

// socket.on("file", (data) => {
//   console.log("Received file:", data); // Debugging log
//   addFileToChat(data);
// });
// function addFileToChat(data, isOwnMessage = false) {
//   const chatBox = document.getElementById("chat-box");
//   const messageDiv = document.createElement("div");
//   messageDiv.classList.add("message");

//   if (isOwnMessage) messageDiv.classList.add("own-message");

//   messageDiv.innerHTML = `
//       <p><strong>${data.email}</strong></p>
//       <p><a href="${data.fileUrl}" target="_blank">${data.fileName}</a></p>
//     `;

//   chatBox.appendChild(messageDiv);
//   chatBox.scrollTop = chatBox.scrollHeight;
// }
// // socket.on("file", (data) => {
// //   console.log("Received file:", data); // Debugging log
// //   addFileToChat(data);
// // });
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
window.sendMessage = () => {
  const messageInput = document.getElementById("message");
  const message = messageInput.value.trim();

  if (message) {
    socket.emit("message", { message });
    addMessageToChat({ email: "You", message }, true);
    messageInput.value = "";
  }
};

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
