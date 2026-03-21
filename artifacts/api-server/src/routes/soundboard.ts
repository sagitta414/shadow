import { Router } from "express";
import OpenAI from "openai";

const router = Router();

const venice = new OpenAI({
  baseURL: "https://api.venice.ai/api/v1",
  apiKey: process.env["VENICE_API_KEY"] ?? "",
});

router.post("/story/soundboard", async (req, res) => {
  try {
    const { message, history, systemPrompt } = req.body as {
      message: string;
      history?: Array<{ role: "user" | "assistant"; content: string }>;
      systemPrompt?: string;
    };

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt ?? "You are a helpful dark fiction co-writer." },
      ...(history ?? []).map((h) => ({ role: h.role, content: h.content }) as OpenAI.ChatCompletionMessageParam),
      { role: "user", content: message },
    ];

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    const stream = await venice.chat.completions.create({
      model: "llama-3.3-70b",
      max_tokens: 1024,
      messages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ chunk: content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    res.end();
  }
});

export default router;
