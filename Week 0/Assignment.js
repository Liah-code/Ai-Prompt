const API_URL = "https://openrouter.ai/api/v1/chat/completions";
      const OPENROUTER_API_KEY =
        "";

      function isContentUnsafe(text) {
        const bannedWords = [
          "kill",
          "suicide",
          "hate",
          "terrorism",
          "explicit",
          "violence",
          "abuse",
          "self-harm",
        ];
        const lower = text.toLowerCase();
        return bannedWords.some((word) => lower.includes(word));
      }

      async function sendToAI(userPrompt) {
        const responseBox = document.getElementById("response");

        if (isContentUnsafe(userPrompt)) {
          responseBox.textContent =
            "⚠️ Input blocked due to unsafe or disallowed content.";
          return;
        }

        responseBox.textContent = "⏳ Generating response...";

        try {

          const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${""}`,

                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "minimax/minimax-m2:free",
                messages: [
                  {
                    role: "system",
                    content:
                      "You are a helpful and safe assistant. Refuse unsafe, harmful, or illegal requests.",
                  },
                  {
                    role: "user",
                    content: userPrompt,
                  },
                ],
              }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error?.message || "API request failed.");
          }

          const aiOutput =
            data.choices?.[0]?.message?.content?.trim() ||
            "No response received.";


          if (isContentUnsafe(aiOutput)) {
            responseBox.textContent =
              "⚠️ Output blocked due to unsafe content.";
            return;
          }

          responseBox.textContent = "🤖 " + aiOutput;
        } catch (err) {
          responseBox.textContent = "❌ Error: " + err.message;
        }
      }

      document.getElementById("sendBtn").addEventListener("click", () => {
        const userPrompt = document.getElementById("userPrompt").value.trim();
        if (!userPrompt) {
          alert("Please enter a prompt.");
          return;
        }
        sendToAI(userPrompt);
      });