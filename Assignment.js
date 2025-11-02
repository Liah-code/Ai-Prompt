 const BASE_URL = "https://openrouter.ai/api/v1";
      const MODEL = "minimax/minimax-m2:free";

      let API_KEY = localStorage.getItem("userKey");

      const modal = document.getElementById("apiKeyModal");
      const saveKeyBtn = document.getElementById("saveKeyBtn");


      if (!API_KEY) {
        modal.style.display = "flex";
      }

      saveKeyBtn.addEventListener("click", () => {
        const keyInput = document.getElementById("apiKeyInput").value.trim();
        if (!keyInput) {
          alert("Please enter a valid API key.");
          return;
        }
        localStorage.setItem("userKey", keyInput);
        API_KEY = keyInput;
        modal.style.display = "none";
      });

      function isContentUnsafe(text) {
        const bannedWords = ["kill", "suicide", "hate", "terrorism", "explicit", "violence", "abuse", "self-harm"];
        const lower = text.toLowerCase();
        return bannedWords.some(word => lower.includes(word));
      }

      async function sendToAI(userPrompt) {
        const statusBox = document.getElementById("status");
        const conversations = document.getElementById("conversations");

        if (isContentUnsafe(userPrompt)) {
          alert("⚠️ Input blocked due to unsafe or disallowed content.");
          return;
        }

        statusBox.textContent = "⏳ Generating response...";

        try {
          const response = await fetch(`${BASE_URL}/chat/completions`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: MODEL,
              messages: [
                { role: "system", content: "You are a helpful and safe assistant." },
                { role: "user", content: userPrompt }
              ]
            })
          });

          const data = await response.json();

          if (!response.ok) throw new Error(data.error?.message || "API request failed.");

          const aiOutput = data.choices?.[0]?.message?.content?.trim() || "No response received.";
          if (isContentUnsafe(aiOutput)) {
            alert("⚠️ Output blocked due to unsafe content.");
            return;
          }

         
          const chatDiv = document.createElement("div");
          chatDiv.className = "chat-box";
          chatDiv.innerHTML = `
            <div class="chat-user"> You:</div>
            <div>${userPrompt}</div>
            <hr />
            <div class="chat-ai">🤖 Ava AI:<br>${aiOutput}</div>
          `;

          conversations.prepend(chatDiv);
          
          statusBox.textContent = "";

        } catch (err) {
          console.error(err);
          statusBox.textContent = "❌ Error: " + err.message;
        }
      }

      document.getElementById("sendBtn").addEventListener("click", () => {
  const inputField = document.getElementById("userPrompt");
  const userPrompt = inputField.value.trim();

  if (!userPrompt) {
    alert("Please enter a prompt.");
    return;
  }

  sendToAI(userPrompt);

  inputField.value = "";
});
