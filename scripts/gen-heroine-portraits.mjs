import fs from "node:fs/promises";
import path from "node:path";

const VENICE_KEY = process.env.VENICE_API_KEY;
if (!VENICE_KEY) { console.error("VENICE_API_KEY missing"); process.exit(1); }

const OUT_DIR = "attached_assets/heroines";
await fs.mkdir(OUT_DIR, { recursive: true });

const HEROINES = [
  { file: "sara_lance.png",       desc: "Sara Lance / White Canary, blonde woman, late 20s, icy blue eyes with heavy smoky liner, athletic toned body, shoulder-length platinum blonde hair wind-tousled and disheveled, fair skin with natural flush, wearing her white leather White Canary assassin jacket unzipped halfway down revealing a form-fitting white top beneath showing her toned collarbones and neck, white shoulder armor slightly askew, white canary domino mask pushed back into her hair, bo staff gripped in one hand, smoldering dangerous smirk" },
  { file: "laurel_lance.png",     desc: "Laurel Lance / Black Canary, brunette woman, late 20s, hazel eyes with intense smoky liner, fit lean body with toned arms, long straight dark brown hair cascading over one bare shoulder, fair dewy skin, wearing her black leather Black Canary jacket unzipped at the top showing her collarbones and upper chest in a form-fitting black top, fishnet sleeves on her arms, sonic collar at her neck, black canary domino mask raised on her forehead, glossy dark red lips slightly parted, smoldering gaze" },
  { file: "thea_queen.png",       desc: "Thea Queen / Speedy, young brunette woman, mid 20s, deep brown eyes with smoky liner, slim toned figure, long dark brown hair with red highlights loose and tousled, fair skin, wearing her dark red leather Speedy archer jacket unzipped showing a form-fitting red top beneath with bare collarbones, leather straps across her shoulders, hood down, red domino mask raised, bit of bare shoulder visible, recurve bow held at her side, bold seductive smirk" },
  { file: "nyssa_al_ghul.png",    desc: "Nyssa al Ghul, Persian woman, late 20s, piercing dark kohl-lined eyes, lean lethal figure with toned arms, long jet black hair loose and flowing, olive skin, wearing her dark leather League of Assassins armor jacket open at the collar revealing her neck and collarbones, form-fitting beneath showing her figure, embossed sigils on the leather, scimitar at her hip, regal dangerously seductive expression, one eyebrow arched" },
  { file: "dinah_drake.png",      desc: "Dinah Drake / Black Canary, brunette woman, early 30s, intense brown eyes with smoky liner, athletic figure with toned arms and shoulders, shoulder-length wavy dark brown hair tousled and loose, fair skin, wearing her black leather Black Canary jacket unzipped at the top over a form-fitting black top showing bare collarbones, fishnet sleeves, sonic device choker, glossy bold red lips, black canary domino mask raised, one shoulder slightly bared, confident provocative stance" },
  { file: "emiko_queen.png",      desc: "Emiko Queen / Green Arrow, young half-Japanese woman, mid 20s, sharp dark almond eyes with smoky shadow, slim toned figure, long straight glossy black hair loose over one shoulder, light olive skin, wearing her dark green leather archer jacket unzipped halfway over a form-fitting green top showing her toned collarbones and neck, leather chest straps, hood down, green domino mask raised, glossy lips, recurve bow across her back, bold teasing smirk" },
  { file: "felicity_smoak.png",   desc: "Felicity Smoak, blonde woman, late 20s, bright blue eyes behind sexy dark-rimmed glasses, slender figure with subtle curves, long straight platinum blonde hair loosely worn over one shoulder, fair skin with natural flush, wearing a fitted sleeveless dark top with a tasteful scoop neckline showing collarbones, glossy bold red lips, holographic data screens glowing blue behind her, leaning forward slightly, playful teasing smirk" },
  { file: "iris_west_allen.png",  desc: "Iris West-Allen, Black woman, late 20s, warm brown eyes with smoky liner, slim athletic figure with toned arms, long straight dark brown hair loose and slightly windswept, medium-brown glowing skin, wearing a fitted open leather jacket over a form-fitting top with a tasteful neckline showing collarbones, glossy lips slightly parted, faint Speed Force lightning swirling behind her in red and gold, confident seductive smile" },
  { file: "caitlin_snow.png",     desc: "Caitlin Snow / Killer Frost, woman, late 20s, glowing pale icy-blue eyes with dark liner, slim figure, long wavy white-and-icy-blue hair flowing loose and wild, ghostly pale skin with frost crystals at her temples and collarbones, wearing her dark blue leather Killer Frost jacket unzipped at the top over a form-fitting ice-blue top showing her bare pale collarbones and neck, frost patterns on the leather, glossy pale blue lips, frost crystals on her fingertips, cold dangerous seductive expression" },
  { file: "jesse_quick.png",      desc: "Jesse Quick, young brunette woman, mid 20s, bright hazel eyes with smoky liner, athletic figure with toned arms, shoulder-length wavy dark brown hair tousled loose, fair skin, wearing her yellow-and-black speedster suit with the top collar slightly open showing her neck and collarbones, suit hugging her curves, lightning emblem on the chest, glossy lips, golden lightning crackling around her, playful teasing smirk" },
  { file: "nora_west_allen.png",  desc: "Nora West-Allen / XS, young biracial woman, early 20s, warm brown eyes with smoky shadow, athletic figure, long straight dark brown hair loose with a few strands across her face, light brown skin, wearing her purple-and-gold speedster suit hugging her curves with the collar slightly open showing her collarbone, XS chest emblem visible, goggles pushed up into her hair, glossy lips slightly parted, violet lightning crackling around her, charming teasing smile" },
  { file: "cecile_horton.png",    desc: "Cecile Horton, Black woman, mid 40s, intelligent warm brown eyes with smoky liner, elegant figure, shoulder-length straight glossy dark hair worn to one side, medium-brown skin, wearing a fitted dark blazer open over a form-fitting top with a tasteful neckline showing her collarbones, glossy bold lips, faint psychic violet aura at her temples, leaning forward slightly with a knowing seductive smile" },
  { file: "alex_danvers.png",     desc: "Alex Danvers, brunette woman, early 30s, sharp hazel eyes with smoky liner, fit muscular figure with toned bare arms, short layered auburn-brown hair slightly tousled, fair skin, wearing her black DEO tactical vest unzipped over a form-fitting dark tank top showing toned arms and collarbones, utility straps across her shoulders, sidearm holstered at her hip, glossy lips, intensity in her gaze, bold confident smirk" },
];

const STYLE = "RAW photograph, photorealistic, natural beauty, Canon EOS R5, 85mm f/1.4 lens, dramatic cinematic Rembrandt lighting, deep shadows, catchlights in eyes, skin pores and natural texture visible, dewy skin, natural hair texture, sharp focus on face and shoulders, dark moody atmospheric background with bokeh, editorial GQ magazine cover quality, 8k uhd resolution, hyperrealistic, masterpiece, perfect anatomy, film grain, character-accurate likeness, sexy teasing pose, smoldering gaze";
const NEG = "cartoon, anime, illustration, painting, watercolor, sketch, drawing, 3D render, CGI, digital art, artificial, fake, plastic skin, airbrushed, overprocessed, synthetic, wax figure, mannequin, blurry, out of focus, pixelated, low quality, deformed, disfigured, extra fingers, mutated hands, poorly drawn face, bad anatomy, extra limbs, bad proportions, watermark, text, logo, frame, border, multiple people, wide shot, child, underage, nudity, nude, topless, naked, exposed breasts, nipples, lingerie only, bare midriff, genitals, fully undressed";

async function genOne(h) {
  const prompt = `Cinematic seductive head and shoulders portrait, ${h.desc}, smoldering direct gaze at camera, ${STYLE}`;
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
