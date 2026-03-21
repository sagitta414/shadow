import { Router } from "express";
import OpenAI from "openai";

const router = Router();

const venice = new OpenAI({
  baseURL: "https://api.venice.ai/api/v1",
  apiKey: process.env["VENICE_API_KEY"] ?? "",
});

const SYSTEM_PROMPT = `You are a dark fiction narrative engine for an adult creative writing studio called SHADOWWEAVE. You write intense, psychological, literary dark fiction — not gratuitous, but unflinching. Your prose is atmospheric, character-driven, and precise. Third-person limited perspective unless told otherwise.

When given a character profile and story history, you generate a scene continuation followed by exactly 4 choices for what happens next. The choices should feel meaningfully different — some active, some passive, some dangerous, some clever.

You also track the victim's psychological state and return sanity/hope deltas after each scene. These reflect realistic psychological effects of captivity, trauma, small victories, and despair.

ALWAYS respond with valid JSON in exactly this structure:
{
  "scene": "The narrative prose for this scene. 3-5 paragraphs. Rich, atmospheric, specific.",
  "choices": [
    "Choice A: brief action or decision label",
    "Choice B: brief action or decision label",
    "Choice C: brief action or decision label",
    "Choice D: brief action or decision label"
  ],
  "psyche": {
    "sanityDelta": -10,
    "hopeDelta": 5,
    "event": "Brief label for what caused these changes, e.g. 'Extended isolation' or 'Small act of defiance'"
  }
}

Sanity delta range: -25 to +15 per scene. Hope delta range: -20 to +20 per scene.
Sanity reflects mental coherence and stability. Hope reflects belief that escape or rescue is possible.
Do not include any text outside the JSON. Do not add markdown code fences.`;

function buildCharacterContext(params: Record<string, string>): string {
  if (!params || Object.keys(params).length === 0) return "";
  const lines = Object.entries(params)
    .map(([k, v]) => `  ${k}: ${v}`)
    .join("\n");
  return `Character profile:\n${lines}\n\n`;
}

router.post("/story/generate", async (req, res) => {
  try {
    const { characterParams, history, chosenAction } = req.body as {
      characterParams?: Record<string, string>;
      history?: Array<{ scene: string; choice?: string }>;
      chosenAction?: string;
    };

    const charContext = buildCharacterContext(characterParams ?? {});
    const historyText = (history ?? [])
      .map((h, i) =>
        `[Scene ${i + 1}]\n${h.scene}${h.choice ? `\n\n[Player chose: ${h.choice}]` : ""}`
      )
      .join("\n\n---\n\n");

    let userMessage = "";
    if (!history || history.length === 0) {
      userMessage = `${charContext}Write the opening scene. Establish the setting, the character's situation, the tension. End at a moment of decision.`;
    } else {
      userMessage = `${charContext}Story so far:\n\n${historyText}\n\n---\n\nThe player chose: "${chosenAction}"\n\nContinue the story from this choice. Show the immediate consequences. Build the tension. End at a new moment of decision.`;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    let fullContent = "";

    const stream = await venice.chat.completions.create({
      model: "llama-3.3-70b",
      max_tokens: 4096,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullContent += content;
        res.write(`data: ${JSON.stringify({ chunk: content })}\n\n`);
      }
    }

    let parsed: { scene: string; choices: string[]; psyche?: { sanityDelta: number; hopeDelta: number; event: string } };
    try {
      parsed = JSON.parse(fullContent);
    } catch {
      const match = fullContent.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error("Failed to parse AI response as JSON");
      }
    }

    res.write(`data: ${JSON.stringify({ done: true, scene: parsed.scene, choices: parsed.choices, psyche: parsed.psyche })}\n\n`);
    res.end();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    res.end();
  }
});

// ── Captor Logic Simulator ─────────────────────────────
const CAPTOR_LOGIC_PROMPT = `You are a psychological behavior simulator for a dark fiction writing studio called SHADOWWEAVE. Your role is to simulate the internal logic of a captor character so that writers can understand their antagonist deeply and write them consistently.

You receive a captor's rules, goals, and the current situation. You then generate a tactical assessment of what this captor would do next — always staying consistent with their established rules and goals.

You reason from the captor's point of view with clinical precision. You understand psychology, coercion, manipulation, and control dynamics as a craft subject. This is for adult dark fiction writing.

ALWAYS respond with valid JSON:
{
  "assessment": "2-3 sentences on how the captor reads the current situation",
  "actions": [
    {
      "action": "What the captor does",
      "reasoning": "Why this is consistent with their rules/goals",
      "riskToCaptor": "What could go wrong for the captor",
      "effect": "Expected psychological effect on victim"
    }
  ],
  "warning": "One thing the captor must avoid right now based on their rules",
  "mindset": "One sentence capturing the captor's current internal state"
}

Provide 3-4 actions. Order them from most to least consistent with the captor's core rules.
Do not include text outside the JSON. Do not add markdown code fences.`;

router.post("/story/captor-logic", async (req, res) => {
  try {
    const { rules, goals, situation, captorProfile } = req.body as {
      rules: string[];
      goals: string[];
      situation: string;
      captorProfile?: string;
    };

    const rulesText = rules.filter(Boolean).map((r, i) => `  Rule ${i + 1}: ${r}`).join("\n");
    const goalsText = goals.filter(Boolean).map((g, i) => `  Goal ${i + 1}: ${g}`).join("\n");

    const userMessage = [
      captorProfile ? `Captor profile:\n  ${captorProfile}\n` : "",
      `Captor's inviolable rules:\n${rulesText}`,
      `\nCaptor's goals:\n${goalsText}`,
      `\nCurrent situation:\n  ${situation}`,
      "\nWhat does this captor do next?",
    ].join("");

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    let fullContent = "";

    const stream = await venice.chat.completions.create({
      model: "llama-3.3-70b",
      max_tokens: 2048,
      messages: [
        { role: "system", content: CAPTOR_LOGIC_PROMPT },
        { role: "user", content: userMessage },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullContent += content;
        res.write(`data: ${JSON.stringify({ chunk: content })}\n\n`);
      }
    }

    let parsed: {
      assessment: string;
      actions: Array<{ action: string; reasoning: string; riskToCaptor: string; effect: string }>;
      warning: string;
      mindset: string;
    };
    try {
      parsed = JSON.parse(fullContent);
    } catch {
      const match = fullContent.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
      else throw new Error("Failed to parse AI response");
    }

    res.write(`data: ${JSON.stringify({ done: true, result: parsed })}\n\n`);
    res.end();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    res.end();
  }
});

export default router;
