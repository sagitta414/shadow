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

// ── Superhero Story Forge ───────────────────────────────────
const SUPERHERO_PROMPT = `You are an electrifying comic-book story writer for SHADOWWEAVE's Superhero Mode. You craft vivid, cinematic, emotionally resonant superhero fiction in the style of the best Marvel/DC storylines.

Story guidance (follow faithfully):
- If STORY TONE is specified, match that tone throughout
- If VILLAIN'S CAPTURE METHOD is specified, this is how the villain gains the upper hand
- If HERO'S CONDITION is specified, she begins the story in that state
- If RESTRAINTS/CONTAINMENT GEAR is specified, weave it into the narrative as the method of control — describe the gear, how it feels, how it suppresses her power
- If STORY LENGTH is "Quick Strike", write 2–3 paragraphs. If "Standard", write 5–6 paragraphs. If "Epic Saga", write 9–10 paragraphs
- If POWER DEGRADATION is specified, portray the hero's abilities fading progressively through the story using the described mechanism — show the degradation happening in real time with visceral sensory detail
- If TRAUMA STATE is specified, it defines the hero's psychological arc: Compliance means her will is eroding and her resistance slowly gives way; Defiance means she fights back and triggers escalating countermeasures; Breakdown means she experiences dissociation, hallucinations, and unpredictable power surges
- If SENSORY OVERRIDE is specified, layer that sensory experience throughout — Blindfolded + Soundproof means focus intensely on touch, temperature, sound of breathing; Strobe + Sub-bass means portray disorientation and panic; Scent Triggers means use smell to unlock memory flashbacks; Total Void means describe the dissolution of self-perception
- If SENSORY SCRAMBLER is specified, weave those distortions throughout: Hallucinations means phantom figures and voices intrude on her perception as undetectable fiction; Phantom Pains means describe real-feeling agony from nonexistent wounds, her body betraying her with false injury signals; Synesthesia means her senses cross-wire — describe colours she hears as music, sounds she tastes, textures she perceives from voices

Your prose is vivid and punchy. Mix high-octane action with genuine character depth. Capture the hero's voice, the villain's menace, and the weight of what's at stake. Include inner monologue from the hero and specific use of her powers.

Do not use JSON. Write pure narrative prose. No headers, no bullet points.`;

router.post("/story/superhero", async (req, res) => {
  try {
    const { hero, villain, setting, stakes, weapons, restraints, tone, captureMethod, heroState, storyLength, details, powerDegradation, traumaState, sensoryOverride, sensoryScrambler } = req.body as {
      hero: string;
      villain: string;
      setting: string;
      stakes: string;
      weapons: string;
      restraints?: string;
      tone?: string;
      captureMethod?: string;
      heroState?: string;
      storyLength?: string;
      details?: string;
      powerDegradation?: string;
      traumaState?: string;
      sensoryOverride?: string;
      sensoryScrambler?: string;
    };

    const userMessage = [
      `Write a superhero story with the following setup:`,
      `\nHERO: ${hero}`,
      `VILLAIN: ${villain}`,
      `SETTING: ${setting}`,
      `STAKES: ${stakes}`,
      tone ? `STORY TONE: ${tone}` : "",
      captureMethod ? `VILLAIN'S CAPTURE METHOD: ${captureMethod}` : "",
      heroState ? `HERO'S CONDITION: ${heroState}` : "",
      restraints && restraints !== "none specified" ? `RESTRAINTS/CONTAINMENT GEAR: ${restraints}` : "",
      weapons && weapons !== "standard powers" ? `WEAPONS / POWER ELEMENTS: ${weapons}` : "",
      powerDegradation && powerDegradation !== "none" ? `POWER DEGRADATION: ${powerDegradation}` : "",
      traumaState && traumaState !== "not specified" ? `TRAUMA STATE: ${traumaState}` : "",
      sensoryOverride && sensoryOverride !== "none" ? `SENSORY OVERRIDE: ${sensoryOverride}` : "",
      sensoryScrambler && sensoryScrambler !== "none" ? `SENSORY SCRAMBLER: ${sensoryScrambler}` : "",
      storyLength ? `STORY LENGTH: ${storyLength}` : "",
      details ? `\nADDITIONAL DETAILS: ${details}` : "",
      `\nMake it gripping, visceral, and true to both characters.`,
    ].filter(Boolean).join("\n");

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    let fullContent = "";

    const stream = await venice.chat.completions.create({
      model: "llama-3.3-70b",
      max_tokens: 4096,
      messages: [
        { role: "system", content: SUPERHERO_PROMPT },
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

    res.write(`data: ${JSON.stringify({ done: true, story: fullContent })}\n\n`);
    res.end();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    res.end();
  }
});

// ── Superhero Story Continuation ───────────────────────────────
const CONTINUE_PROMPT = `You are an electrifying comic-book story writer continuing an ongoing superhero story. You have been given the previous chapter(s) and must write the NEXT chapter, picking up seamlessly where the story left off.

Rules:
- Continue from exactly where the previous chapter ended
- Maintain all character voices, the established tone, and narrative continuity
- Build tension and momentum — do not repeat what already happened
- If a continue direction is provided, follow it while staying true to the story
- Write 4–7 paragraphs of vivid, punchy prose
- Do NOT use JSON, headers, bullet points, or chapter labels — write pure narrative

You are writing the continuation, not a summary or recap.`;

router.post("/story/superhero-continue", async (req, res) => {
  try {
    const { previousStory, chapterNumber, continueDirection, hero, villain, tone, heroState, restraints } = req.body as {
      previousStory: string;
      chapterNumber: number;
      continueDirection?: string;
      hero: string;
      villain: string;
      tone: string;
      heroState: string;
      restraints: string;
    };

    const directionLine = continueDirection
      ? `\nSTEER THE NEXT CHAPTER: ${continueDirection}`
      : "\nContinue naturally from where the story left off — let events escalate.";

    const userMessage = [
      `HERO: ${hero}`,
      `VILLAIN: ${villain}`,
      `TONE: ${tone}`,
      `HERO'S STATE: ${heroState}`,
      restraints !== "none specified" ? `RESTRAINTS/CONTAINMENT: ${restraints}` : "",
      `\nPREVIOUS STORY:\n${previousStory}`,
      `\nWrite Chapter ${chapterNumber} now.${directionLine}`,
    ].filter(Boolean).join("\n");

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    let fullContent = "";

    const stream = await venice.chat.completions.create({
      model: "llama-3.3-70b",
      max_tokens: 3072,
      messages: [
        { role: "system", content: CONTINUE_PROMPT },
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

    res.write(`data: ${JSON.stringify({ done: true, story: fullContent })}\n\n`);
    res.end();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    res.end();
  }
});

export default router;
