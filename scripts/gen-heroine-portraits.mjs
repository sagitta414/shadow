import fs from "node:fs/promises";
import path from "node:path";

const VENICE_KEY = process.env.VENICE_API_KEY;
if (!VENICE_KEY) { console.error("VENICE_API_KEY missing"); process.exit(1); }

const OUT_DIR = "attached_assets/heroines";
await fs.mkdir(OUT_DIR, { recursive: true });

const HEROINES = [
  { file: "sara_lance.png",       desc: "Sara Lance / White Canary, blonde woman, late 20s, sharp blue eyes, athletic toned build, shoulder-length straight platinum blonde hair, fair skin, wearing the screen-accurate fitted white leather White Canary assassin jacket fully zipped over a high-neck top, white shoulder armor, white canary domino mask pushed up into her hair, bo staff resting on her shoulder, confident smirk" },
  { file: "laurel_lance.png",     desc: "Laurel Lance / Black Canary, brunette woman, late 20s, hazel eyes, fit lean build, long straight dark brown hair flowing over one shoulder, fair skin, wearing the screen-accurate full black leather Black Canary tactical jacket zipped to the throat with body armor and fishnet sleeves, sonic collar at her neck, black canary domino mask raised on her forehead, sultry confident expression" },
  { file: "thea_queen.png",       desc: "Thea Queen / Speedy, young brunette woman, mid 20s, deep brown eyes with smoky liner, slim athletic build, long dark brown hair with red highlights swept to one side, fair skin, wearing the screen-accurate fitted dark red leather Speedy archer jacket fully zipped with leather chest armor, hood down, red domino mask raised, recurve bow on her back, sultry confident smirk" },
  { file: "nyssa_al_ghul.png",    desc: "Nyssa al Ghul, Persian woman, late 20s, piercing dark kohl-rimmed eyes, lean lethal build, long jet black hair flowing loose, olive skin, wearing the screen-accurate dark brown leather League of Assassins armor with high collar and embossed sigils fully covering her, scimitar across her back, regal commanding seductive expression" },
  { file: "dinah_drake.png",      desc: "Dinah Drake / Black Canary, brunette woman, early 30s, intense smoky brown eyes, athletic build, shoulder-length wavy dark brown hair, fair skin, wearing the screen-accurate full black leather Black Canary tactical jacket zipped to the throat with body armor and fishnet sleeves, sonic device choker, glossy lips, black canary domino mask raised, confident smoldering pose" },
  { file: "emiko_queen.png",      desc: "Emiko Queen / Green Arrow, young half-Japanese woman, mid 20s, sharp dark eyes with smoky shadow, slim toned build, long straight glossy black hair, light olive skin, wearing the screen-accurate fitted dark green hooded leather archer jacket fully zipped with leather chest armor, hood down, green domino mask raised, recurve bow at her side, glossy lips, sultry expression" },
  { file: "felicity_smoak.png",   desc: "Felicity Smoak, blonde woman, late 20s, bright blue eyes behind dark-rimmed glasses, slender build, long straight platinum blonde hair worn over one shoulder, fair skin, wearing a tasteful fitted black sleeveless dress with a modest neckline, glossy red lips, holographic data screens glowing behind her in soft blue light, playful confident smirk" },
  { file: "iris_west_allen.png",  desc: "Iris West-Allen, Black woman, late 20s, warm brown eyes with smoky liner, slim athletic build, long straight dark brown hair, medium-brown glowing skin, wearing a fitted dark leather jacket zipped over a tasteful top with a modest neckline, glossy lips, faint Speed Force lightning swirling behind her in red and gold streaks, confident charming smile" },
  { file: "caitlin_snow.png",     desc: "Caitlin Snow / Killer Frost, woman, late 20s, glowing pale icy-blue eyes, slim build, long wavy white-and-icy-blue hair flowing loose, ghostly pale skin with subtle frost crystals at her temples, wearing the screen-accurate fitted dark blue leather Killer Frost jacket fully zipped to the throat with frost patterns and high collar, glossy pale blue lips, frost crystals forming on her fingertips, cold seductive expression" },
  { file: "jesse_quick.png",      desc: "Jesse Quick, young brunette woman, mid 20s, bright hazel eyes with smoky liner, athletic build, shoulder-length wavy dark brown hair tousled, fair skin, wearing the screen-accurate full yellow-and-black speedster suit fully zipped with lightning emblem on the chest, glossy lips, golden lightning crackling around her, confident smirk" },
  { file: "nora_west_allen.png",  desc: "Nora West-Allen / XS, young biracial woman, early 20s, warm brown eyes with smoky shadow, athletic build, long straight dark brown hair, light brown skin, wearing the screen-accurate full purple-and-gold speedster suit fully zipped with the XS chest emblem, goggles raised onto her hair, glossy lips, violet lightning crackling around her, charming confident smile" },
  { file: "cecile_horton.png",    desc: "Cecile Horton, Black woman, mid 40s, intelligent smoky brown eyes, elegant build, shoulder-length straight glossy dark hair, medium-brown skin, wearing a tasteful tailored dark blazer over a modest blouse, glossy lips, faint psychic violet aura at her temples, confident knowing smile" },
  { file: "alex_danvers.png",     desc: "Alex Danvers, brunette woman, early 30s, sharp hazel eyes with smoky liner, fit muscular build, short layered auburn-brown hair, fair skin, wearing the screen-accurate full black tactical DEO operative jacket zipped to the throat with utility vest and side holster, glossy lips, no-nonsense military bearing with a confident smirk" },
];

const STYLE = "RAW photograph, photorealistic, real person, natural beauty, Canon EOS R5, 85mm f/1.4 lens, dramatic cinematic key lighting, soft Rembrandt light, catchlights in eyes, skin pores visible, natural skin texture, natural hair texture, detailed iris, sharp focus on face, dark moody atmospheric background with subtle bokeh, editorial fashion magazine cover quality, 8k uhd resolution, hyperrealistic, masterpiece, perfect anatomy, film grain, costume-accurate to live-action TV character, fully clothed, screen-accurate superhero costume, tasteful flattering pose";
const NEG = "cartoon, anime, illustration, painting, watercolor, sketch, drawing, 3D render, CGI, digital art, artificial, fake, plastic skin, smooth skin, airbrushed, overprocessed, retouched, synthetic, wax figure, mannequin, doll-like, blurry, out of focus, motion blur, grainy, noisy, pixelated, low quality, deformed, disfigured, extra fingers, mutated hands, poorly drawn face, bad anatomy, extra limbs, cloned face, bad proportions, watermark, text, logo, signature, username, frame, border, multiple people, full body, wide shot, child, young, underage, nudity, nude, topless, naked, exposed breasts, exposed cleavage, deep cleavage, exposed nipples, lingerie, bra, bare chest, bare midriff, exposed midriff, unzipped, partially unzipped, low-cut, plunging neckline, see-through, sheer fabric, wardrobe malfunction, NSFW";

async function genOne(h) {
  const prompt = `Cinematic head and shoulders portrait, ${h.desc}, confident captivating direct gaze at camera, costume-accurate styling, ${STYLE}`;
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
