import fs from "node:fs/promises";
import path from "node:path";

const VENICE_KEY = process.env.VENICE_API_KEY;
if (!VENICE_KEY) { console.error("VENICE_API_KEY missing"); process.exit(1); }

const OUT_DIR = "attached_assets/heroines";
await fs.mkdir(OUT_DIR, { recursive: true });

const HEROINES = [
  { file: "sara_lance.png",       desc: "blonde woman, late 20s, sharp blue eyes, athletic toned build, shoulder-length straight blonde hair, fair skin, in white leather assassin outfit with shoulder armor, bo staff strapped to her back, white canary mask resting at her collar" },
  { file: "laurel_lance.png",     desc: "brunette woman, late 20s, hazel eyes, fit lean build, long straight dark brown hair, fair skin, in black leather vigilante outfit with sleek body armor and fishnet sleeves, sonic collar at her throat, black canary domino mask raised on her forehead" },
  { file: "thea_queen.png",       desc: "young brunette woman, mid 20s, deep brown eyes, slim athletic build, long dark brown hair with subtle red highlights, fair skin, in dark red hooded archer outfit with leather chest armor, recurve bow in hand, red domino mask raised" },
  { file: "nyssa_al_ghul.png",    desc: "Persian woman, late 20s, piercing dark eyes, lean lethal build, long jet black hair, olive skin, in dark brown League of Assassins leather armor with embossed sigils, scimitar across her back, regal cold expression" },
  { file: "dinah_drake.png",      desc: "brunette woman, early 30s, intense brown eyes, muscular athletic build, shoulder-length wavy dark brown hair, fair skin, in black leather vigilante outfit with body armor, sonic device at her throat, black canary domino mask raised" },
  { file: "emiko_queen.png",      desc: "young half-Japanese woman, mid 20s, sharp dark eyes, slim toned build, long straight black hair, light olive skin, in dark green hooded archer outfit with leather armor, recurve bow visible, green domino mask raised" },
  { file: "felicity_smoak.png",   desc: "blonde woman, late 20s, bright blue eyes behind dark-rimmed glasses, slender build, long straight platinum blonde hair, fair skin, in modern fitted business attire, holographic data screens glowing behind her" },
  { file: "iris_west_allen.png",  desc: "Black woman, late 20s, warm brown eyes, slim athletic build, long straight dark brown hair, medium-brown skin, in modern fitted dark jacket and top, faint Speed Force lightning swirling behind her in red and yellow streaks" },
  { file: "caitlin_snow.png",     desc: "woman, late 20s, glowing pale blue eyes, slim build, long wavy white-and-icy-blue hair, ghostly pale skin with frost crystals at her temples, in dark blue leather Killer Frost outfit with frost patterns, frost crystals on her fingertips" },
  { file: "jesse_quick.png",      desc: "young brunette woman, mid 20s, bright hazel eyes, athletic build, shoulder-length wavy dark brown hair, fair skin, in yellow-and-black speedster suit with lightning emblem, golden lightning crackling around her" },
  { file: "nora_west_allen.png",  desc: "young biracial woman, early 20s, warm brown eyes, athletic build, long straight dark brown hair, light brown skin, in purple-and-gold speedster suit with goggles raised, violet lightning crackling around her" },
  { file: "cecile_horton.png",    desc: "Black woman, mid 40s, intelligent brown eyes, elegant build, shoulder-length straight dark hair, medium-brown skin, in tailored dark business suit, faint psychic violet aura at her temples" },
  { file: "alex_danvers.png",     desc: "brunette woman, early 30s, sharp hazel eyes, fit muscular build, short layered auburn-brown hair, fair skin, in black tactical DEO operative gear with utility vest, sidearm holstered, no-nonsense military bearing" },
];

const STYLE = "RAW photograph, photorealistic, real person, natural beauty, Canon EOS R5, 85mm f/1.4 lens, dramatic cinematic lighting, Rembrandt key light, catchlights in eyes, skin pores visible, natural hair texture, detailed iris, sharp focus on face, dark moody atmospheric background with subtle bokeh, editorial portrait photography, magazine cover quality, 8k uhd resolution, hyperrealistic, masterpiece, perfect anatomy, film grain";
const NEG = "cartoon, anime, illustration, painting, watercolor, sketch, drawing, 3D render, CGI, digital art, artificial, fake, plastic skin, smooth skin, airbrushed, overprocessed, retouched, synthetic, wax figure, mannequin, doll-like, blurry, out of focus, motion blur, grainy, noisy, pixelated, low quality, deformed, disfigured, extra fingers, mutated hands, poorly drawn face, bad anatomy, extra limbs, cloned face, bad proportions, watermark, text, logo, signature, username, frame, border, multiple people, full body, wide shot";

async function genOne(h) {
  const prompt = `Cinematic head and shoulders portrait, ${h.desc}, intense direct gaze at camera, ${STYLE}`;
  const resp = await fetch("https://api.venice.ai/api/v1/image/generate", {
    method: "POST",
    headers: { Authorization: `Bearer ${VENICE_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "lustify-sdxl",
      prompt, negative_prompt: NEG,
      width: 768, height: 1024,
      steps: 32, cfg_scale: 7,
      safe_mode: false,
    }),
  });
  if (!resp.ok) throw new Error(`${h.file}: Venice ${resp.status} — ${await resp.text()}`);
  const json = await resp.json();
  const b64 = json.images?.[0];
  if (!b64) throw new Error(`${h.file}: no image returned — ${JSON.stringify(json).slice(0, 200)}`);
  const buf = Buffer.from(b64, "base64");
  await fs.writeFile(path.join(OUT_DIR, h.file), buf);
  console.log(`✓ ${h.file} (${buf.length} bytes)`);
}

const results = await Promise.allSettled(HEROINES.map(genOne));
let ok = 0, fail = 0;
for (const r of results) { if (r.status === "fulfilled") ok++; else { fail++; console.error("✗", r.reason?.message || r.reason); } }
console.log(`\nDone: ${ok} succeeded, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
