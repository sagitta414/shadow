import fs from "node:fs/promises";
import path from "node:path";

const VENICE_KEY = process.env.VENICE_API_KEY;
if (!VENICE_KEY) { console.error("VENICE_API_KEY missing"); process.exit(1); }

const OUT_DIR = "attached_assets/heroines";
await fs.mkdir(OUT_DIR, { recursive: true });

const HEROINES = [
  { file: "sara_lance.png",       desc: "Caity Lotz as Sara Lance the White Canary, exact face likeness of actress Caity Lotz, blonde woman late 20s with her signature sharp cheekbones and icy blue eyes, heavy smoky eye makeup, platinum blonde hair tousled and windswept, wearing the white leather White Canary costume jacket open at the collar over a form-fitting white bodysuit, toned bare arms and shoulders visible, white domino mask pushed up in her hair, bo staff behind her, dangerous seductive smirk, leaning forward toward the camera" },
  { file: "laurel_lance.png",     desc: "Katie Cassidy as Laurel Lance the Black Canary, exact face likeness of actress Katie Cassidy, brunette woman late 20s with her signature full lips and hazel eyes, smoky eye makeup, long dark brown hair falling loose over bare shoulder, wearing the black leather Black Canary jacket open at the collar over a form-fitting black bodysuit revealing bare collarbones, fishnet gloves on her arms, sonic collar at her neck, black domino mask raised, glossy red lips slightly parted, intense smoldering gaze" },
  { file: "thea_queen.png",       desc: "Willa Holland as Thea Queen Speedy, exact face likeness of actress Willa Holland, young woman mid 20s with her signature big brown eyes and petite features, smoky eye makeup, long dark brown hair with auburn highlights loose and tousled, wearing the dark red leather Speedy archer jacket unzipped over a form-fitting red bodysuit showing bare collarbones and shoulders, red domino mask pushed up, recurve bow gripped in one hand, bold teasing smirk, bare arms visible" },
  { file: "nyssa_al_ghul.png",    desc: "Katrina Law as Nyssa al Ghul, exact face likeness of actress Katrina Law, Persian-American woman late 20s with her signature strong jaw and piercing dark eyes, heavy kohl eye makeup, long glossy black hair flowing loose, wearing the dark brown leather League of Assassins armor jacket open at the collar showing toned neck and collarbones, form-fitting beneath, olive skin bare arms visible, scimitar at her side, one arched eyebrow, regal dangerously seductive expression" },
  { file: "dinah_drake.png",      desc: "Juliana Harkavy as Dinah Drake the Black Canary, exact face likeness of actress Juliana Harkavy, brunette woman early 30s with her signature full lips and intense dark eyes, heavy smoky eye makeup, wavy dark brown hair tousled loose, wearing the black leather Black Canary jacket open at the collar over a form-fitting black bodysuit showing bare collarbones, fishnet sleeve details, sonic device choker at her neck, bold red glossy lips, one bare shoulder exposed, smoldering confident pose" },
  { file: "emiko_queen.png",      desc: "Sea Shimooka as Emiko Queen, exact face likeness of actress Sea Shimooka, young half-Japanese woman mid 20s with her signature refined features and sharp dark eyes, smoky eye makeup, long straight glossy black hair over one shoulder, wearing the dark green leather archer jacket open over a form-fitting green bodysuit showing bare collarbones and toned arms, green domino mask raised, recurve bow across her back, glossy lips, teasing half-smile" },
  { file: "felicity_smoak.png",   desc: "Emily Bett Rickards as Felicity Smoak, exact face likeness of actress Emily Bett Rickards, blonde woman late 20s with her signature wide bright blue eyes and cute nose, dark-rimmed glasses, platinum blonde hair loose over one shoulder, wearing a fitted sleeveless top with a scoop neckline showing her collarbone and bare arms, glossy red lips, holographic blue data screens glowing behind her, leaning forward with a playful teasing smirk, light fair skin" },
  { file: "iris_west_allen.png",  desc: "Candice Patton as Iris West-Allen, exact face likeness of actress Candice Patton, Black woman late 20s with her signature warm doe brown eyes and radiant smile, smoky eye makeup, long straight dark brown hair slightly windswept, medium-brown glowing skin, wearing an open fitted leather jacket over a form-fitting top showing bare collarbones and toned arms, glossy lips parted, faint red-gold Speed Force lightning swirling around her, confident seductive smile" },
  { file: "caitlin_snow.png",     desc: "Danielle Panabaker as Caitlin Snow and Killer Frost, exact face likeness of actress Danielle Panabaker, woman late 20s with her signature wide pale eyes and defined cheekbones, glowing icy-blue contacts, dark eye makeup, long wavy white-and-blue ombre hair wild and flowing, ghostly pale skin, wearing the dark blue Killer Frost leather jacket open at the collar over a form-fitting icy-blue bodysuit showing bare pale collarbones, frost crystals forming at her fingertips and temples, icy pale glossy lips, cold seductive stare" },
  { file: "jesse_quick.png",      desc: "Violett Beane as Jesse Quick, exact face likeness of actress Violett Beane, young woman mid 20s with her signature wide hazel eyes and bright smile, smoky eye makeup, wavy brown hair tousled and loose, wearing the yellow-and-black speedster suit hugging her curves with the collar open showing bare collarbones, suit zipper slightly down, lightning bolt emblem on chest, glossy lips, golden lightning crackling around her, playful teasing smirk" },
  { file: "nora_west_allen.png",  desc: "Jessica Parker Kennedy as Nora West-Allen XS, exact face likeness of actress Jessica Parker Kennedy, young biracial woman early 20s with her signature bright warm eyes and wide smile, smoky eye makeup, long dark brown hair loose with strands across her face, light brown skin, wearing the purple-and-gold speedster suit hugging her curves with the collar open showing bare collarbones, XS lightning emblem on chest, goggles pushed up in her hair, glossy lips parted, violet lightning crackling, charming teasing smile" },
  { file: "cecile_horton.png",    desc: "Danielle Nicolet as Cecile Horton, exact face likeness of actress Danielle Nicolet, Black woman mid 40s with her signature bright eyes and confident smile, smoky eye makeup, shoulder-length glossy dark hair swept to one side, medium-brown skin, wearing a fitted blazer open over a form-fitting low-cut blouse showing bare collarbone and décolletage, glossy bold lips, psychic violet aura at her temples, leaning forward with a knowing seductive smile, toned bare arms visible" },
  { file: "alex_danvers.png",     desc: "Chyler Leigh as Alex Danvers, exact face likeness of actress Chyler Leigh, brunette woman early 30s with her signature hazel eyes and angular jaw, smoky eye makeup, short layered auburn hair slightly tousled, fair skin, wearing the black DEO tactical vest open over a fitted dark tank top showing toned bare arms and collarbones, utility belt at her waist, sidearm holstered at hip, glossy lips, intense smoldering stare, bold confident smirk" },
];

const STYLE = "RAW photograph, photorealistic celebrity portrait, exact celebrity likeness, Canon EOS R5, 85mm f/1.4 lens, dramatic cinematic split lighting, deep shadows, catchlights in eyes, skin pores and natural texture visible, dewy glowing skin, natural hair texture, sharp focus on face and upper body, dark moody atmospheric background with soft bokeh, editorial Maxim magazine cover quality, 8k uhd resolution, hyperrealistic, perfect anatomy, film grain, sexy alluring pose, smoldering intense gaze, real human woman";
const NEG = "cartoon, anime, illustration, painting, watercolor, sketch, drawing, 3D render, CGI, digital art, artificial, fake, plastic skin, airbrushed, overprocessed, synthetic, wax figure, mannequin, blurry, out of focus, pixelated, low quality, deformed, disfigured, extra fingers, mutated hands, poorly drawn face, bad anatomy, extra limbs, bad proportions, watermark, text, logo, frame, border, multiple people, wide shot, child, underage, nudity, nude, topless, naked, exposed breasts, nipples, exposed genitals, fully undressed, no clothes";

async function genOne(h) {
  const prompt = `${h.desc}, smoldering direct gaze into camera, ${STYLE}`;
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
