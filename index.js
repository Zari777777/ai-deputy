import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Простой health-чек (Railway удобно проверять)
app.get("/", (req, res) => {
  res.json({ ok: true, service: "ai-deputy" });
});

app.post("/ask", async (req, res) => {
  const { question } = req.body ?? {};
  if (!question) {
    return res.status(400).json({ error: "Missing 'question' in body" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // ВАЖНО: шаблонная строка и кавычки
        Authorization: 'Bearer ${process.env.OPENAI_API_KEY}',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Ты — AI депутат от партии Respublica. Отвечай понятно, полезно и уважительно для граждан и предпринимателей. Пиши кратко и по делу.",
          },
          { role: "user", content: question },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const txt = await response.text();
      return res
        .status(500)
        .json({ error: "OpenAI API error", details: txt });
    }

    const data = await response.json();
    const answer =
      data?.choices?.[0]?.message?.content ??
      "Извини, не смог сформировать ответ.";

    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

const PORT = process.env.PORT || 3000;
// ВАЖНО: шаблонная строка и кавычки
app.listen(PORT, () => console.log('AI Deputy running on port ${PORT}'));
