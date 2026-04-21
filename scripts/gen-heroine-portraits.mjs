import fs from "node:fs/promises";
import path from "node:path";

const VENICE_KEY = process.env.VENICE_API_KEY;
if (!VENICE_KEY) { console.error("VENICE_API_KEY missing"); process.exit(1); }

const OUT_DIR = "attached_assets/heroines";
await fs.mkdir(OUT_DIR, { recursive: true });

const HEROINES = [
  { file: "sara_lance.png",       desc: "blonde woman, late 20s, sharp blue eyes, athletic toned build with full natural curves, shoulder-length straight platinum blonde hair, fair skin, wearing a partially unzipped white leather assassin bodysuit revealing deep cleavage, exposed midriff and toned abs, white canary mask pushed up into her hair, bo staff lazily resting against her shoulder" },
  { file: "laurel_lance.png",     desc: "brunette woman, late 20s, hazel eyes, fit lean build with full chest, long straight dark brown hair tousled over one shoulder, fair skin, wearing an unzipped black leather vigilante corset top with deep cleavage, fishnet sleeves, leather choker with sonic collar, lips slightly parted, black canary domino mask raised on her forehead" },
  { file: "thea_queen.png",       desc: "young brunette woman, mid 20s, deep brown eyes with smoky liner, slim athletic build with subtle curves, long dark brown hair with red highlights swept aside, fair skin, wearing an unzipped dark red leather archer top with bare shoulders, leather harness across her chest, hood down, red domino mask raised, sultry expression" },
  { file: "nyssa_al_ghul.png",    desc: "Persian woman, late 20s, piercing dark kohl-rimmed eyes, lean lethal build with elegant curves, long jet black hair flowing loose, olive skin, wearing a low-cut dark leather League of Assassins top with bare collarbones and shoulders, embossed sigils, scimitar lazily held, regal seductive expression" },
  { file: "dinah_drake.png",      desc: "brunette woman, early 30s, intense smoky brown eyes, athletic build with full curves, shoulder-length wavy dark brown hair, fair skin, wearing an unzipped black leather corset top with deep cleavage, fishnet sleeves, sonic choker at her throat, glossy red lips, black canary domino mask raised, confident pose" },
  { file: "emiko_queen.png",      desc: "young half-Japanese woman, mid 20s, sharp dark eyes with smoky shadow, slim toned build with subtle curves, long straight glossy black hair, light olive skin, wearing an unzipped dark green leather archer top with bare shoulders, leather chest harness, hood down, green domino mask raised, glossy lips" },
  { file: "felicity_smoak.png",   desc: "blonde woman, late 20s, bright blue eyes behind dark-rimmed glasses, slender build with full natural chest, long straight platinum blonde hair worn over one shoulder, fair skin, wearing a low-cut fitted black blouse partially unbuttoned showing cleavage, glossy red lips, holographic data screens glowing behind her" },
  { file: "iris_west_allen.png",  desc: "Black woman, late 20s, warm brown eyes with smoky liner, slim athletic build with full curves, long straight dark brown hair, medium-brown glowing skin, wearing a low-cut fitted dark leather top with bare shoulders, glossy lips slightly parted, faint Speed Force lightning swirling behind her in red and gold streaks" },
  { file: "caitlin_snow.png",     desc: "woman, late 20s, glowing pale icy-blue eyes, slim build with subtle curves, long wavy white-and-icy-blue hair flowing loose, ghostly pale skin with frost crystals at her temples and collarbones, wearing an unzipped dark blue leather Killer Frost corset with frost patterns and bare shoulders, deep cleavage, glossy pale blue lips, frost crystals forming on her fingertips, seductive cold expression" },
  { file: "jesse_quick.png",      desc: "young brunette woman, mid 20s, bright hazel eyes with smoky liner, athletic build with full curves, shoulder-length wavy dark brown hair tousled, fair skin, wearing an unzipped yellow-and-black speedster top with deep cleavage, lightning emblem partially visible, glossy red lips, golden lightning crackling around her" },
  { file: "nora_west_allen.png",  desc: "young biracial woman, early 20s, warm brown eyes with smoky shadow, athletic build with subtle curves, long straight dark brown hair, light brown skin, wearing an unzipped purple-and-gold speedster top with deep cleavage, goggles raised onto her hair, glossy lips, violet lightning crackling around her" },
  { file: "cecile_horton.png",    desc: "Black woman, mid 40s, intelligent smoky brown eyes, elegant build with full curves, shoulder-length straight glossy dark hair, medium-brown skin, wearing a low-cut tailored dark blazer partially unbuttoned showing cleavage, glossy lips, faint psychic violet aura at her temples, confident sultry expression" },
  { file: "alex_danvers.png",     desc: "brunette woman, early 30s, sharp hazel eyes with smoky liner, fit muscular build with full curves, short layered auburn-brown hair, fair skin, wearing an unzipped black tactical DEO top with deep cleavage and bare collarbones, sidearm holstered low on her hip, glossy lips, no-nonsense military bearing turned seductive" },
];

const STYLE = "RAW photograph, photorealistic, real person, natural beauty, Canon EOS R5, 85mm f/1.4 lens, dramatic cinematic boudoir lighting, soft Rembrandt key light, catchlights in eyes, skin pores visible, natural skin texture, dewy skin, natural hair texture, detailed iris, sharp focus on face and chest, dark moody atmospheric background with subtle bokeh, editorial Maxim magazine cover quality, 8k uhd resolution, hyperrealistic, masterpiece, perfect anatomy, film grain, NSFW, sensual pose, intimate composition";
const NEG = "cartoon, anime, illustration, painting, watercolor, sketch, drawing, 3D render, CGI, digital art, artificial, fake, plastic skin, smooth skin, airbrushed, overprocessed, retouched, synthetic, wax figure, mannequin, doll-like, blurry, out of focus, motion blur, grainy, noisy, pixelated, low quality, deformed, disfigured, extra fingers, mutated hands, poorly drawn face, bad anatomy, extra limbs, cloned face, bad proportions, watermark, text, logo, signature, username, frame, border, multiple people, full body, wide shot, child, young, underage, modest, conservative, covered up, turtleneck, baggy clothing";

async function genOne(h) {
  const prompt = `Cinematic seductive head and chest portrait, ${h.desc}, sultry smoldering direct gaze at camera, lips slightly parted, suggestive intimate pose, ${STYLE}`;
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
