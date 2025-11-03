const BASE_URL = "https://openrouter.ai/api/v1";
const MODEL = "openai/gpt-3.5-turbo";

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
  const bannedWords = [
    "kill",
    "suicide",
    "hate",
    "terrorism",
    "explicit",
    "violence",
    "abuse",
    "self-harm"
  ];
  const lower = text.toLowerCase();
  return bannedWords.some((word) => lower.includes(word));
}

async function sendToAI(userPrompt) {
  const statusBox = document.getElementById("status");
  const conversations = document.getElementById("conversations");

  if (isContentUnsafe(userPrompt)) {
    alert("⚠️ Your input/output violated the moderation policy.");
    return;
  }

  statusBox.textContent = "⏳ Generating response...";

  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are Ava, a concise and friendly AI chat assistant. Keep responses clear, natural, and conversational — avoid long textbook explanations unless the user asks for them."
          },
          { role: "user", content: userPrompt }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok)
      throw new Error(data.error?.message || "API request failed.");

    const aiOutput =
      data.choices?.[0]?.message?.content?.trim() || "No response received.";
    if (isContentUnsafe(aiOutput)) {
      alert("⚠️ Output blocked due to unsafe content.");
      return;
    }


    const userDiv = document.createElement("div");
    userDiv.className = "chat-bubble user-bubble";
    userDiv.innerHTML = `<div class="chat-text">${userPrompt}</div>`;
    conversations.appendChild(userDiv);

    const aiDiv = document.createElement("div");
    aiDiv.className = "chat-bubble ai-bubble";
    aiDiv.innerHTML = `<div class="chat-text">🤖 ${aiOutput}</div>`;
    conversations.appendChild(aiDiv);

 
    conversations.scrollTop = conversations.scrollHeight;
    statusBox.textContent = "";
  } catch (err) {
    console.error(err);
    statusBox.textContent = "❌ Error: " + err.message;
  }
}


document.getElementById("sendBtn").addEventListener("click", () => {
  const inputField = document.getElementById("userPrompt");
  const userPrompt = inputField.value.trim();
  const suggestionsBox = document.querySelector(".suggestions");
  const chatArea = document.getElementById("conversations");

  if (!userPrompt) {
    alert("Please enter a prompt.");
    return;
  }

  if (chatArea.children.length === 0 && suggestionsBox) {
    suggestionsBox.remove();
  }

  sendToAI(userPrompt);
  inputField.value = "";
});

document.getElementById("userPrompt").addEventListener("keypress", function (e) {
  if (window.innerWidth > 1200) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      document.getElementById("sendBtn").click();
    }
  }

});
