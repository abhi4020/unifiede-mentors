
      // DOM Elements
      const loginScreen = document.getElementById("loginScreen");
      const chatApp = document.getElementById("chatApp");
      const loginForm = document.getElementById("loginForm");
      const usernameInput = document.getElementById("username");
      const userAvatar = document.getElementById("userAvatar");
      const userName = document.getElementById("userName");
      const logoutBtn = document.getElementById("logoutBtn");
      const roomsList = document.getElementById("roomsList");
      const createRoomBtn = document.getElementById("createRoomBtn");
      const usersList = document.getElementById("usersList");
      const currentRoom = document.getElementById("currentRoom");
      const messagesContainer = document.getElementById("messagesContainer");
      const messageForm = document.getElementById("messageForm");
      const messageInput = document.getElementById("messageInput");
      const createRoomModal = document.getElementById("createRoomModal");
      const roomInfoModal = document.getElementById("roomInfoModal");
      const createPollModal = document.getElementById("createPollModal");
      const roomInfoBtn = document.getElementById("roomInfoBtn");
      const createPollBtn = document.getElementById("createPollBtn");
      const fileUploadBtn = document.getElementById("fileUploadBtn");
      const voiceMessageBtn = document.getElementById("voiceMessageBtn");
      const searchToggleBtn = document.getElementById("searchToggleBtn");
      const searchContainer = document.getElementById("searchContainer");
      const searchInput = document.getElementById("searchInput");
      const filePreview = document.getElementById("filePreview");
      const typingIndicator = document.getElementById("typingIndicator");
      const typingUsers = document.getElementById("typingUsers");
      const reactionPicker = document.getElementById("reactionPicker");
      const connectionStatus = document.getElementById("connectionStatus");
      const notificationContainer = document.getElementById(
        "notificationContainer"
      );
      const formattingToolbar = document.querySelector(".formatting-toolbar");
      const emojiPickerBtn = document.getElementById("emojiPickerBtn");
      const themeToggle = document.getElementById("themeToggle");

      // Application State
      let currentUser = "";
      let activeRoom = "general";
      let users = [];
      let rooms = [
        {
          name: "general",
          description: "General discussion room for all topics.",
          created: "Today",
          users: 5,
        },
        {
          name: "technology",
          description: "Discuss the latest in tech and programming.",
          created: "Yesterday",
          users: 3,
        },
        {
          name: "gaming",
          description: "Talk about your favorite games and strategies.",
          created: "2 days ago",
          users: 7,
        },
        {
          name: "movies",
          description: "Share your thoughts on movies and TV shows.",
          created: "3 days ago",
          users: 4,
        },
      ];

      // Real-time communication state
      let typingUsersMap = new Map();
      let typingTimeout;
      let connectionInterval;
      let isConnected = true;
      let selectedFile = null;
      let isRecording = false;
      let mediaRecorder = null;
      let audioChunks = [];
      let searchActive = false;

      // Event Listeners
      loginForm.addEventListener("submit", handleLogin);
      logoutBtn.addEventListener("click", handleLogout);
      createRoomBtn.addEventListener("click", showCreateRoomModal);
      roomsList.addEventListener("click", handleRoomChange);
      messageForm.addEventListener("submit", handleMessageSend);
      roomInfoBtn.addEventListener("click", showRoomInfo);
      createPollBtn.addEventListener("click", showCreatePollModal);
      fileUploadBtn.addEventListener("click", triggerFileUpload);
      voiceMessageBtn.addEventListener("click", toggleVoiceRecording);
      searchToggleBtn.addEventListener("click", toggleSearch);
      searchInput.addEventListener("input", handleSearch);
      messageInput.addEventListener("input", handleTyping);
      messageInput.addEventListener("focus", handleFocus);
      messageInput.addEventListener("blur", handleBlur);
      emojiPickerBtn.addEventListener("click", showEmojiPicker);
      themeToggle.addEventListener("click", toggleTheme);

      // Formatting toolbar events
      formattingToolbar.addEventListener("click", handleFormatting);

      // Modal close events
      document.querySelectorAll(".close-modal").forEach((btn) => {
        btn.addEventListener("click", () => {
          createRoomModal.style.display = "none";
          roomInfoModal.style.display = "none";
          createPollModal.style.display = "none";
        });
      });

      document
        .getElementById("cancelCreateRoom")
        .addEventListener("click", () => {
          createRoomModal.style.display = "none";
        });

      document
        .getElementById("confirmCreateRoom")
        .addEventListener("click", handleCreateRoom);
      document.getElementById("closeRoomInfo").addEventListener("click", () => {
        roomInfoModal.style.display = "none";
      });

      document
        .getElementById("cancelCreatePoll")
        .addEventListener("click", () => {
          createPollModal.style.display = "none";
        });

      document
        .getElementById("confirmCreatePoll")
        .addEventListener("click", handleCreatePoll);
      document
        .getElementById("addPollOption")
        .addEventListener("click", addPollOption);

      // Reaction picker events
      document.querySelectorAll(".reaction-option").forEach((option) => {
        option.addEventListener("click", (e) => {
          const reaction = e.target.getAttribute("data-reaction");
          addReactionToMessage(reaction);
          reactionPicker.style.display = "none";
        });
      });

      // Close reaction picker when clicking outside
      document.addEventListener("click", (e) => {
        if (
          !e.target.closest(".reaction-picker") &&
          !e.target.closest(".message-reactions")
        ) {
          reactionPicker.style.display = "none";
        }
      });

      // File input change event
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.style.display = "none";
      fileInput.addEventListener("change", handleFileSelect);
      document.body.appendChild(fileInput);

      // Functions
      function handleLogin(e) {
        e.preventDefault();
        const username = usernameInput.value.trim();

        if (username) {
          currentUser = username;
          userAvatar.textContent = username.charAt(0).toUpperCase();
          userName.textContent = username;

          // In a real app, we would validate with the server
          if (isUsernameTaken(username)) {
            showNotification(
              "Username is already taken. Please choose another.",
              "error"
            );
            return;
          }

          loginScreen.style.display = "none";
          chatApp.style.display = "flex";

          // Add user to the users list
          addUser(username);

          showNotification(
            `Welcome to UnifiedChat Pro, ${username}!`,
            "success"
          );

          // In a real app, we would connect to WebSocket server here
          simulateWebSocketConnection();

          // Start connection simulation
          startConnectionSimulation();
        }
      }

      function handleLogout() {
        // In a real app, we would disconnect from WebSocket server here
        removeUser(currentUser);
        stopTyping();

        currentUser = "";
        loginScreen.style.display = "flex";
        chatApp.style.display = "none";
        messageInput.value = "";
        usernameInput.value = "";

        // Clear intervals
        clearInterval(connectionInterval);

        showNotification("You have been logged out.", "info");
      }

      function handleRoomChange(e) {
        const roomItem = e.target.closest(".room-item");
        if (roomItem) {
          // Update active room
          document.querySelectorAll(".room-item").forEach((item) => {
            item.classList.remove("active");
          });
          roomItem.classList.add("active");

          // Change room
          const roomName = roomItem.getAttribute("data-room");
          activeRoom = roomName;
          currentRoom.textContent =
            roomName.charAt(0).toUpperCase() + roomName.slice(1);

          // Clear messages and load room messages
          messagesContainer.innerHTML = "";
          addSystemMessage(`Welcome to the ${roomName} chat room!`);

          // In a real app, we would request room messages from server
          simulateRoomMessages(roomName);

          showNotification(`Joined ${roomName} room`, "info");
        }
      }

      function handleMessageSend(e) {
        e.preventDefault();
        const message = messageInput.value.trim();

        if (message || selectedFile) {
          // In a real app, we would send message via WebSocket
          if (selectedFile) {
            addFileMessage(currentUser, selectedFile, true);
            selectedFile = null;
            filePreview.style.display = "none";
          } else {
            addMessage(currentUser, message, true);
            simulateOtherUserResponse();
          }

          messageInput.value = "";
          stopTyping();
          scrollToBottom();
        }
      }

      function handleTyping() {
        // In a real app, we would send typing indicator via WebSocket
        if (!typingUsersMap.has(currentUser)) {
          typingUsersMap.set(currentUser, true);
          updateTypingIndicator();

          // Simulate other users typing
          if (Math.random() > 0.7) {
            const otherUsers = users.filter((u) => u !== currentUser);
            if (otherUsers.length > 0) {
              const randomUser =
                otherUsers[Math.floor(Math.random() * otherUsers.length)];
              if (!typingUsersMap.has(randomUser)) {
                typingUsersMap.set(randomUser, true);
                updateTypingIndicator();

                // Stop typing after a random delay
                setTimeout(() => {
                  typingUsersMap.delete(randomUser);
                  updateTypingIndicator();
                }, 2000 + Math.random() * 3000);
              }
            }
          }
        }

        // Clear existing timeout
        clearTimeout(typingTimeout);

        // Set new timeout to stop typing indicator
        typingTimeout = setTimeout(() => {
          typingUsersMap.delete(currentUser);
          updateTypingIndicator();
        }, 1000);
      }

      function handleFocus() {
        // In a real app, we would send focus event to server
        showNotification("You are now active in the chat", "info");
      }

      function handleBlur() {
        // In a real app, we would send blur event to server
        stopTyping();
      }

      function stopTyping() {
        typingUsersMap.delete(currentUser);
        updateTypingIndicator();
        clearTimeout(typingTimeout);
      }

      function updateTypingIndicator() {
        if (typingUsersMap.size > 0) {
          const names = Array.from(typingUsersMap.keys()).slice(0, 3);
          let text = "";

          if (names.length === 1) {
            text = `${names[0]} is typing`;
          } else if (names.length === 2) {
            text = `${names[0]} and ${names[1]} are typing`;
          } else {
            text = `${names[0]}, ${names[1]} and others are typing`;
          }

          typingUsers.textContent = text;
          typingIndicator.style.display = "block";
        } else {
          typingIndicator.style.display = "none";
        }
      }

      function triggerFileUpload() {
        fileInput.click();
      }

      function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
          selectedFile = file;

          // Display file preview
          filePreview.innerHTML = "";

          const fileItem = document.createElement("div");
          fileItem.className = "file-item";

          const fileIcon = document.createElement("div");
          fileIcon.className = "file-icon";
          fileIcon.innerHTML = getFileIcon(file.type);

          const fileInfo = document.createElement("div");
          fileInfo.className = "file-info";

          const fileName = document.createElement("div");
          fileName.className = "file-name";
          fileName.textContent = file.name;

          const fileSize = document.createElement("div");
          fileSize.className = "file-size";
          fileSize.textContent = formatFileSize(file.size);

          const removeFile = document.createElement("button");
          removeFile.className = "remove-file";
          removeFile.innerHTML = '<i class="fas fa-times"></i>';
          removeFile.addEventListener("click", () => {
            selectedFile = null;
            filePreview.style.display = "none";
          });

          fileInfo.appendChild(fileName);
          fileInfo.appendChild(fileSize);
          fileItem.appendChild(fileIcon);
          fileItem.appendChild(fileInfo);
          fileItem.appendChild(removeFile);
          filePreview.appendChild(fileItem);
          filePreview.style.display = "block";
        }
      }

      function getFileIcon(fileType) {
        if (fileType.startsWith("image/")) {
          return '<i class="fas fa-image"></i>';
        } else if (fileType.startsWith("video/")) {
          return '<i class="fas fa-video"></i>';
        } else if (fileType.includes("pdf")) {
          return '<i class="fas fa-file-pdf"></i>';
        } else if (fileType.includes("word") || fileType.includes("document")) {
          return '<i class="fas fa-file-word"></i>';
        } else if (fileType.includes("sheet") || fileType.includes("excel")) {
          return '<i class="fas fa-file-excel"></i>';
        } else {
          return '<i class="fas fa-file"></i>';
        }
      }

      function formatFileSize(bytes) {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
      }

      function toggleVoiceRecording() {
        if (!isRecording) {
          startVoiceRecording();
        } else {
          stopVoiceRecording();
        }
      }

      function startVoiceRecording() {
        // In a real app, this would use the Web Audio API
        isRecording = true;
        voiceMessageBtn.innerHTML = '<i class="fas fa-stop"></i>';
        voiceMessageBtn.style.color = "var(--accent-color)";

        // Simulate recording
        showNotification(
          "Voice recording started. Click stop to send.",
          "info"
        );
      }

      function stopVoiceRecording() {
        isRecording = false;
        voiceMessageBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        voiceMessageBtn.style.color = "";

        // Simulate sending voice message
        const duration = Math.floor(Math.random() * 10) + 5; // 5-15 seconds
        addVoiceMessage(currentUser, duration, true);
        showNotification("Voice message sent!", "success");
      }

      function toggleSearch() {
        searchActive = !searchActive;
        if (searchActive) {
          searchContainer.style.display = "block";
          searchInput.focus();
        } else {
          searchContainer.style.display = "none";
          searchInput.value = "";
          // Reset message highlights
          document.querySelectorAll(".message").forEach((msg) => {
            msg.style.backgroundColor = "";
          });
        }
      }

      function handleSearch() {
        const query = searchInput.value.toLowerCase();
        if (query.length < 2) {
          // Reset message highlights
          document.querySelectorAll(".message").forEach((msg) => {
            msg.style.backgroundColor = "";
          });
          return;
        }

        // Highlight messages containing the search query
        document.querySelectorAll(".message").forEach((msg) => {
          const text = msg
            .querySelector(".message-text")
            .textContent.toLowerCase();
          if (text.includes(query)) {
            msg.style.backgroundColor = "rgba(255, 215, 0, 0.2)";
          } else {
            msg.style.backgroundColor = "";
          }
        });
      }

      function showCreateRoomModal() {
        document.getElementById("roomName").value = "";
        document.getElementById("roomDescription").value = "";
        createRoomModal.style.display = "flex";
      }

      function handleCreateRoom() {
        const roomName = document.getElementById("roomName").value.trim();
        const roomDescription = document
          .getElementById("roomDescription")
          .value.trim();

        if (roomName) {
          // In a real app, we would send this to the server
          const newRoom = {
            name: roomName.toLowerCase(),
            description: roomDescription || "No description provided.",
            created: "Just now",
            users: 1,
          };

          rooms.push(newRoom);

          // Add to rooms list
          const roomItem = document.createElement("li");
          roomItem.className = "room-item";
          roomItem.setAttribute("data-room", newRoom.name);

          const roomIcon = document.createElement("i");
          roomIcon.className = "fas fa-hashtag room-icon";

          const roomNameSpan = document.createElement("span");
          roomNameSpan.textContent = roomName;

          roomItem.appendChild(roomIcon);
          roomItem.appendChild(roomNameSpan);
          roomsList.appendChild(roomItem);

          createRoomModal.style.display = "none";
          showNotification(
            `Room "${roomName}" created successfully!`,
            "success"
          );
        } else {
          showNotification("Please enter a room name.", "error");
        }
      }

      function showRoomInfo() {
        const room = rooms.find((r) => r.name === activeRoom);
        if (room) {
          document.getElementById("infoRoomName").textContent = room.name;
          document.getElementById("infoRoomCreated").textContent = room.created;
          document.getElementById("infoRoomUsers").textContent = room.users;
          document.getElementById("infoRoomDescription").textContent =
            room.description;
          roomInfoModal.style.display = "flex";
        }
      }

      function showCreatePollModal() {
        document.getElementById("pollQuestion").value = "";
        document.getElementById("pollOptions").innerHTML = `
                <input type="text" class="form-control poll-option-input" placeholder="Option 1">
                <input type="text" class="form-control poll-option-input" placeholder="Option 2">
            `;
        createPollModal.style.display = "flex";
      }

      function addPollOption() {
        const optionCount =
          document.querySelectorAll(".poll-option-input").length;
        const newOption = document.createElement("input");
        newOption.type = "text";
        newOption.className = "form-control poll-option-input";
        newOption.placeholder = `Option ${optionCount + 1}`;
        document.getElementById("pollOptions").appendChild(newOption);
      }

      function handleCreatePoll() {
        const question = document.getElementById("pollQuestion").value.trim();
        const options = Array.from(
          document.querySelectorAll(".poll-option-input")
        )
          .map((input) => input.value.trim())
          .filter((value) => value !== "");

        if (question && options.length >= 2) {
          addPollMessage(currentUser, question, options, true);
          createPollModal.style.display = "none";
          showNotification("Poll created successfully!", "success");
        } else {
          showNotification(
            "Please enter a question and at least 2 options.",
            "error"
          );
        }
      }

      function showEmojiPicker() {
        // In a real implementation, this would show an emoji picker
        const emojis = [
          "😀",
          "😂",
          "🥰",
          "😎",
          "🤔",
          "🙄",
          "😴",
          "🥳",
          "😡",
          "🤯",
        ];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        messageInput.value += randomEmoji;
        messageInput.focus();
      }

      function toggleTheme() {
        const currentTheme =
          document.body.getAttribute("data-theme") || "light";
        const newTheme = currentTheme === "light" ? "dark" : "light";
        document.body.setAttribute("data-theme", newTheme);

        // Update theme toggle icon
        themeToggle.innerHTML =
          newTheme === "dark"
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';

        // Save theme preference
        localStorage.setItem("chatTheme", newTheme);

        showNotification(
          `${newTheme === "dark" ? "Dark" : "Light"} theme activated`,
          "info"
        );
      }

      function handleFormatting(e) {
        if (
          e.target.tagName === "BUTTON" ||
          e.target.parentElement.tagName === "BUTTON"
        ) {
          const formatBtn = e.target.closest("button");
          const format = formatBtn.getAttribute("data-format");
          const input = messageInput;
          const start = input.selectionStart;
          const end = input.selectionEnd;
          const selectedText = input.value.substring(start, end);

          let formattedText = "";

          switch (format) {
            case "bold":
              formattedText = `**${selectedText}**`;
              break;
            case "italic":
              formattedText = `*${selectedText}*`;
              break;
            case "link":
              const url = prompt("Enter URL:");
              if (url) {
                formattedText = `[${selectedText}](${url})`;
              } else {
                return;
              }
              break;
          }

          input.value =
            input.value.substring(0, start) +
            formattedText +
            input.value.substring(end);
          input.focus();
          input.setSelectionRange(
            start + formattedText.length,
            start + formattedText.length
          );
        }
      }

      function showReactionPicker(messageId, x, y) {
        reactionPicker.style.display = "flex";
        reactionPicker.style.left = `${x}px`;
        reactionPicker.style.top = `${y}px`;
        reactionPicker.setAttribute("data-message-id", messageId);
      }

      function addReactionToMessage(reaction) {
        const messageId = reactionPicker.getAttribute("data-message-id");
        // In a real app, we would send this to the server
        const messageElement = document.querySelector(
          `[data-message-id="${messageId}"]`
        );
        if (messageElement) {
          let reactionsContainer =
            messageElement.querySelector(".message-reactions");
          if (!reactionsContainer) {
            reactionsContainer = document.createElement("div");
            reactionsContainer.className = "message-reactions";
            messageElement.appendChild(reactionsContainer);
          }

          // Check if reaction already exists
          let reactionElement = Array.from(reactionsContainer.children).find(
            (el) => el.getAttribute("data-reaction") === reaction
          );

          if (reactionElement) {
            // Increment count
            const countElement =
              reactionElement.querySelector(".reaction-count");
            let count = parseInt(countElement.textContent) + 1;
            countElement.textContent = count;
          } else {
            // Create new reaction
            reactionElement = document.createElement("div");
            reactionElement.className = "reaction";
            reactionElement.setAttribute("data-reaction", reaction);
            reactionElement.innerHTML = `
                        <span class="reaction-emoji">${reaction}</span>
                        <span class="reaction-count">1</span>
                    `;
            reactionsContainer.appendChild(reactionElement);

            // Add click event to reaction
            reactionElement.addEventListener("click", (e) => {
              e.stopPropagation();
              // In a real app, we would send reaction removal to server
              const countElement =
                reactionElement.querySelector(".reaction-count");
              let count = parseInt(countElement.textContent) - 1;

              if (count <= 0) {
                reactionElement.remove();
              } else {
                countElement.textContent = count;
              }
            });
          }
        }
      }

      function startConnectionSimulation() {
        // Simulate connection status changes
        connectionInterval = setInterval(() => {
          if (Math.random() > 0.9) {
            // Simulate connection issue
            isConnected = false;
            connectionStatus.querySelector(".connection-dot").className =
              "connection-dot disconnected";
            connectionStatus.querySelector("span").textContent =
              "Reconnecting...";

            // Show notification
            showNotification(
              "Connection lost. Attempting to reconnect...",
              "error"
            );

            // Simulate reconnection after a delay
            setTimeout(() => {
              isConnected = true;
              connectionStatus.querySelector(".connection-dot").className =
                "connection-dot connected";
              connectionStatus.querySelector("span").textContent = "Connected";
              showNotification("Connection restored", "success");
            }, 2000 + Math.random() * 3000);
          }
        }, 10000);
      }

      // Helper Functions
      function addUser(username) {
        if (!users.includes(username)) {
          users.push(username);

          const userItem = document.createElement("li");
          userItem.className = "user-item";

          const userStatus = document.createElement("div");
          userStatus.className = "user-status";

          const userName = document.createElement("span");
          userName.textContent = username;

          userItem.appendChild(userStatus);
          userItem.appendChild(userName);
          usersList.appendChild(userItem);

          // Show notification
          if (username !== currentUser) {
            showNotification(`${username} joined the chat`, "info");
          }
        }
      }

      function removeUser(username) {
        users = users.filter((user) => user !== username);
        const userItems = usersList.querySelectorAll(".user-item");
        userItems.forEach((item) => {
          if (item.textContent === username) {
            item.remove();
          }
        });

        // Show notification
        if (username !== currentUser) {
          showNotification(`${username} left the chat`, "info");
        }
      }

      function isUsernameTaken(username) {
        // In a real app, this would check with the server
        return users.includes(username);
      }

      function addMessage(sender, text, isOwn = false) {
        const messageId =
          "msg_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
        const messageDiv = document.createElement("div");
        messageDiv.className = `message ${isOwn ? "own" : "other"}`;
        messageDiv.setAttribute("data-message-id", messageId);

        const senderDiv = document.createElement("div");
        senderDiv.className = "message-sender";
        senderDiv.textContent = sender;

        const textDiv = document.createElement("div");
        textDiv.className = "message-text";
        textDiv.innerHTML = formatMessage(text);

        const timeDiv = document.createElement("div");
        timeDiv.className = "message-time";
        timeDiv.textContent = getCurrentTime();

        // Add message actions (reply, react, etc.)
        const actionsDiv = document.createElement("div");
        actionsDiv.className = "message-actions";

        const reactBtn = document.createElement("button");
        reactBtn.className = "message-action";
        reactBtn.innerHTML = '<i class="fas fa-smile"></i>';
        reactBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const rect = messageDiv.getBoundingClientRect();
          showReactionPicker(messageId, rect.left, rect.top - 40);
        });

        actionsDiv.appendChild(reactBtn);

        messageDiv.appendChild(senderDiv);
        messageDiv.appendChild(textDiv);
        messageDiv.appendChild(timeDiv);
        messageDiv.appendChild(actionsDiv);

        messagesContainer.appendChild(messageDiv);
        scrollToBottom();

        return messageId;
      }

      function addFileMessage(sender, file, isOwn = false) {
        const messageId =
          "msg_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
        const messageDiv = document.createElement("div");
        messageDiv.className = `message ${isOwn ? "own" : "other"}`;
        messageDiv.setAttribute("data-message-id", messageId);

        const senderDiv = document.createElement("div");
        senderDiv.className = "message-sender";
        senderDiv.textContent = sender;

        const fileDiv = document.createElement("div");
        fileDiv.className = "file-item";

        const fileIcon = document.createElement("div");
        fileIcon.className = "file-icon";
        fileIcon.innerHTML = getFileIcon(file.type);

        const fileInfo = document.createElement("div");
        fileInfo.className = "file-info";

        const fileName = document.createElement("div");
        fileName.className = "file-name";
        fileName.textContent = file.name;

        const fileSize = document.createElement("div");
        fileSize.className = "file-size";
        fileSize.textContent = formatFileSize(file.size);

        fileInfo.appendChild(fileName);
        fileInfo.appendChild(fileSize);
        fileDiv.appendChild(fileIcon);
        fileDiv.appendChild(fileInfo);

        const timeDiv = document.createElement("div");
        timeDiv.className = "message-time";
        timeDiv.textContent = getCurrentTime();

        messageDiv.appendChild(senderDiv);
        messageDiv.appendChild(fileDiv);
        messageDiv.appendChild(timeDiv);

        messagesContainer.appendChild(messageDiv);
        scrollToBottom();

        return messageId;
      }

      function addVoiceMessage(sender, duration, isOwn = false) {
        const messageId =
          "msg_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
        const messageDiv = document.createElement("div");
        messageDiv.className = `message ${isOwn ? "own" : "other"}`;
        messageDiv.setAttribute("data-message-id", messageId);

        const senderDiv = document.createElement("div");
        senderDiv.className = "message-sender";
        senderDiv.textContent = sender;

        const voiceContainer = document.createElement("div");
        voiceContainer.className = "voice-message-container";

        const voiceMessage = document.createElement("div");
        voiceMessage.className = "voice-message";

        const playPauseBtn = document.createElement("button");
        playPauseBtn.className = "play-pause-btn";
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';

        const voiceWaveform = document.createElement("div");
        voiceWaveform.className = "voice-waveform";

        const voiceProgress = document.createElement("div");
        voiceProgress.className = "voice-progress";

        const voiceDuration = document.createElement("div");
        voiceDuration.className = "voice-duration";
        voiceDuration.textContent = `${duration}s`;

        voiceWaveform.appendChild(voiceProgress);
        voiceMessage.appendChild(playPauseBtn);
        voiceMessage.appendChild(voiceWaveform);
        voiceMessage.appendChild(voiceDuration);
        voiceContainer.appendChild(voiceMessage);

        const timeDiv = document.createElement("div");
        timeDiv.className = "message-time";
        timeDiv.textContent = getCurrentTime();

        messageDiv.appendChild(senderDiv);
        messageDiv.appendChild(voiceContainer);
        messageDiv.appendChild(timeDiv);

        messagesContainer.appendChild(messageDiv);
        scrollToBottom();

        // Add play/pause functionality
        let isPlaying = false;
        let progress = 0;
        let progressInterval;

        playPauseBtn.addEventListener("click", () => {
          isPlaying = !isPlaying;
          playPauseBtn.innerHTML = isPlaying
            ? '<i class="fas fa-pause"></i>'
            : '<i class="fas fa-play"></i>';

          if (isPlaying) {
            progressInterval = setInterval(() => {
              progress += 1;
              voiceProgress.style.width = `${(progress / duration) * 100}%`;

              if (progress >= duration) {
                clearInterval(progressInterval);
                isPlaying = false;
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                progress = 0;
                voiceProgress.style.width = "0%";
              }
            }, 1000);
          } else {
            clearInterval(progressInterval);
          }
        });

        return messageId;
      }

      function addPollMessage(sender, question, options, isOwn = false) {
        const messageId =
          "msg_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
        const messageDiv = document.createElement("div");
        messageDiv.className = `message ${isOwn ? "own" : "other"}`;
        messageDiv.setAttribute("data-message-id", messageId);

        const senderDiv = document.createElement("div");
        senderDiv.className = "message-sender";
        senderDiv.textContent = sender;

        const pollContainer = document.createElement("div");
        pollContainer.className = "poll-container";

        const pollQuestion = document.createElement("div");
        pollQuestion.className = "poll-question";
        pollQuestion.textContent = question;

        const pollOptions = document.createElement("div");
        pollOptions.className = "poll-options";

        options.forEach((option, index) => {
          const optionDiv = document.createElement("div");
          optionDiv.className = "poll-option";

          const optionInput = document.createElement("input");
          optionInput.type = "radio";
          optionInput.name = `poll-${messageId}`;
          optionInput.value = index;
          optionInput.addEventListener("change", () => {
            // In a real app, we would send vote to server
            showNotification(`You voted for: ${option}`, "info");

            // Show results after voting
            showPollResults(pollContainer, options, index);
          });

          const optionLabel = document.createElement("span");
          optionLabel.textContent = option;

          optionDiv.appendChild(optionInput);
          optionDiv.appendChild(optionLabel);
          pollOptions.appendChild(optionDiv);
        });

        pollContainer.appendChild(pollQuestion);
        pollContainer.appendChild(pollOptions);

        const timeDiv = document.createElement("div");
        timeDiv.className = "message-time";
        timeDiv.textContent = getCurrentTime();

        messageDiv.appendChild(senderDiv);
        messageDiv.appendChild(pollContainer);
        messageDiv.appendChild(timeDiv);

        messagesContainer.appendChild(messageDiv);
        scrollToBottom();

        return messageId;
      }

      function showPollResults(pollContainer, options, selectedIndex) {
        // Simulate poll results
        const totalVotes = Math.floor(Math.random() * 20) + 5; // 5-25 votes
        const votes = [];
        let remainingVotes = totalVotes - 1; // Subtract user's vote

        // Generate random votes for other options
        for (let i = 0; i < options.length; i++) {
          if (i === selectedIndex) {
            votes.push(1); // User's vote
          } else {
            const optionVotes = Math.floor(Math.random() * remainingVotes);
            votes.push(optionVotes);
            remainingVotes -= optionVotes;
          }
        }

        // Add any remaining votes to a random option
        if (remainingVotes > 0) {
          const randomIndex = Math.floor(Math.random() * options.length);
          votes[randomIndex] += remainingVotes;
        }

        // Create results display
        const pollResults = document.createElement("div");
        pollResults.className = "poll-results";

        options.forEach((option, index) => {
          const percentage = Math.round((votes[index] / totalVotes) * 100);

          const resultDiv = document.createElement("div");
          resultDiv.className = "poll-result";

          const resultText = document.createElement("div");
          resultText.textContent = `${option} - ${percentage}% (${votes[index]} votes)`;

          const resultBar = document.createElement("div");
          resultBar.className = "poll-bar";
          resultBar.style.width = `${percentage}%`;

          if (index === selectedIndex) {
            resultText.style.fontWeight = "bold";
            resultBar.style.background = "var(--accent-color)";
          }

          resultDiv.appendChild(resultText);
          resultDiv.appendChild(resultBar);
          pollResults.appendChild(resultDiv);
        });

        // Replace options with results
        pollContainer.querySelector(".poll-options").style.display = "none";
        pollContainer.appendChild(pollResults);
      }

      function addSystemMessage(text) {
        const messageDiv = document.createElement("div");
        messageDiv.className = "message other";

        const senderDiv = document.createElement("div");
        senderDiv.className = "message-sender";
        senderDiv.textContent = "System";
        senderDiv.style.color = "#ff6b6b";

        const textDiv = document.createElement("div");
        textDiv.className = "message-text";
        textDiv.textContent = text;

        const timeDiv = document.createElement("div");
        timeDiv.className = "message-time";
        timeDiv.textContent = getCurrentTime();

        messageDiv.appendChild(senderDiv);
        messageDiv.appendChild(textDiv);
        messageDiv.appendChild(timeDiv);

        messagesContainer.appendChild(messageDiv);
        scrollToBottom();
      }

      function formatMessage(text) {
        // Simple markdown-like formatting
        return text
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.*?)\*/g, "<em>$1</em>")
          .replace(
            /\[(.*?)\]\((.*?)\)/g,
            '<a href="$2" target="_blank">$1</a>'
          );
      }

      function getCurrentTime() {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, "0")}:${now
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;
      }

      function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }

      function showNotification(message, type = "info") {
        const notification = document.createElement("div");
        notification.className = `notification ${type}`;

        const icon = document.createElement("i");
        icon.className = `notification-icon ${
          type === "success"
            ? "fas fa-check-circle"
            : type === "error"
            ? "fas fa-exclamation-circle"
            : "fas fa-info-circle"
        }`;

        const messageSpan = document.createElement("span");
        messageSpan.textContent = message;

        notification.appendChild(icon);
        notification.appendChild(messageSpan);
        notificationContainer.appendChild(notification);

        setTimeout(() => {
          notification.remove();
        }, 4000);
      }

      // Simulation functions (to be replaced with real WebSocket in production)
      function simulateWebSocketConnection() {
        // Simulate other users joining
        setTimeout(() => {
          addUser("AlexJohnson");
          addUser("TechGuru");
          addUser("ChatEnthusiast");
        }, 1000);

        // Simulate welcome messages
        setTimeout(() => {
          addMessage("AlexJohnson", "Hello everyone! How is your day going?");
        }, 2000);

        setTimeout(() => {
          addMessage(
            "TechGuru",
            "Hey there! Just working on a new project. Anyone into web development?"
          );
        }, 3500);

        // Simulate a poll
        setTimeout(() => {
          addPollMessage(
            "TechGuru",
            "What's your favorite programming language?",
            ["JavaScript", "Python", "Java", "C#", "Other"],
            false
          );
        }, 8000);

        // Simulate user leaving after some time
        setTimeout(() => {
          removeUser("ChatEnthusiast");
        }, 20000);
      }

      function simulateRoomMessages(roomName) {
        // Simulate room-specific messages
        if (roomName === "technology") {
          setTimeout(() => {
            addMessage(
              "TechGuru",
              `Welcome to the ${roomName} room! Let's talk about the latest in tech.`
            );
          }, 500);

          setTimeout(() => {
            addMessage(
              "CodeMaster",
              "Has anyone tried the new JavaScript framework that was released last week?"
            );
          }, 1500);
        } else if (roomName === "gaming") {
          setTimeout(() => {
            addMessage(
              "GameLover",
              `Welcome to the ${roomName} room! What games is everyone playing right now?`
            );
          }, 500);
        }
      }

      function simulateOtherUserResponse() {
        // Simulate responses from other users (for demo purposes)
        const responses = [
          { user: "AlexJohnson", message: "That's interesting! Tell me more." },
          { user: "TechGuru", message: "I completely agree with that point." },
          { user: "ChatEnthusiast", message: "Thanks for sharing!" },
          {
            user: "CodeMaster",
            message: "Has anyone tried that approach before?",
          },
        ];

        if (Math.random() > 0.5) {
          const response =
            responses[Math.floor(Math.random() * responses.length)];
          setTimeout(() => {
            addMessage(response.user, response.message);
          }, 1000 + Math.random() * 2000);
        }
      }

      // Initialize theme from localStorage
      const savedTheme = localStorage.getItem("chatTheme") || "light";
      document.body.setAttribute("data-theme", savedTheme);
      themeToggle.innerHTML =
        savedTheme === "dark"
          ? '<i class="fas fa-sun"></i>'
          : '<i class="fas fa-moon"></i>';

      // Initialize
      scrollToBottom();
    