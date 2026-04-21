import fs from "node:fs/promises";
import path from "node:path";

const VENICE_KEY = process.env.VENICE_API_KEY;
if (!VENICE_KEY) { console.error("VENICE_API_KEY missing"); process.exit(1); }

const OUT_DIR = "attached_assets/heroines";
await fs.mkdir(OUT_DIR, { recursive: true });

const HEROINES = [
  { file: "sara_lance.png",       desc: "photorealistic portrait of Caity Lotz as Sara Lance White Canary from Arrow TV show, face of Caity Lotz: angular jawline, defined sharp cheekbones, steel-blue eyes, straight platinum blonde hair shoulder-length windswept, fair porcelain skin, athletic dancer physique, wearing white leather White Canary costume open at collar showing collarbones, toned bare arms, white domino mask in hair, bo staff, smoky black eye makeup, bold lips, dangerous seductive smirk toward camera" },
  { file: "laurel_lance.png",     desc: "photorealistic portrait of Katie Cassidy as Laurel Lance Black Canary from Arrow TV show, face of Katie Cassidy: heart-shaped face, full pouty lips, wide hazel-green eyes, long straight dark chestnut brown hair over one bare shoulder, fair dewy skin, lean athletic build, wearing black leather Black Canary jacket open at collar over form-fitting black bodysuit showing collarbones, fishnet sleeves, sonic collar at throat, black domino mask raised on forehead, heavy smoky eyes, glossy red lips parted, smoldering stare" },
  { file: "thea_queen.png",       desc: "photorealistic portrait of Willa Holland as Thea Queen Speedy from Arrow TV show, face of Willa Holland: wide-set doe brown eyes, high delicate cheekbones, small upturned nose, petite feminine features, long dark brunette hair with auburn highlights loose and tousled, fair skin, slim figure, wearing dark red leather Speedy archer jacket open over form-fitting red bodysuit showing bare collarbones and shoulders, red domino mask pushed into hair, recurve bow in hand, smoky eye makeup, bold lips, teasing confident smirk" },
  { file: "nyssa_al_ghul.png",    desc: "photorealistic portrait of Katrina Law as Nyssa al Ghul from Arrow TV show, face of Katrina Law: strong defined jawline, high cheekbones, intense dark almond-shaped eyes, Hawaiian-mixed heritage features, long glossy jet black hair flowing loose, warm olive-tan skin, toned athletic build, wearing dark brown leather League of Assassins armor jacket open at collar showing toned neck and collarbones, bare toned arms, scimitar at hip, heavy black kohl eyeliner, one arched eyebrow, regal dangerously seductive expression" },
  { file: "dinah_drake.png",      desc: "photorealistic portrait of Juliana Harkavy as Dinah Drake Black Canary from Arrow TV show, face of Juliana Harkavy: distinctive full lips, wide dark expressive eyes, strong brow, medium-length wavy dark brunette hair tousled loose, fair skin, athletic build, wearing black leather Black Canary jacket open at collar over form-fitting black bodysuit showing bare collarbones, fishnet sleeve details, sonic device choker at throat, black domino mask raised, heavy smoky eyes, glossy bold red lips, one shoulder bared, smoldering pose" },
  { file: "emiko_queen.png",      desc: "photorealistic portrait of Sea Shimooka as Emiko Queen from Arrow TV show, face of Sea Shimooka: Japanese features, large expressive dark eyes with double eyelid, refined elegant bone structure, long straight glossy black hair over one shoulder, light olive skin, slender toned build, wearing dark green leather archer jacket open over form-fitting green bodysuit showing bare collarbones and toned arms, green domino mask raised in hair, recurve bow across back, smoky eye makeup, glossy lips, teasing half-smile" },
  { file: "felicity_smoak.png",   desc: "photorealistic portrait of Emily Bett Rickards as Felicity Smoak from Arrow TV show, face of Emily Bett Rickards: wide bright blue-green eyes, small upturned nose, warm smile, blonde hair worn loose over one shoulder, light fair skin, slim petite build, wearing sleek dark-rimmed glasses, fitted sleeveless top with scoop neckline showing bare collarbones and toned arms, glossy red lips, holographic blue tech screens glowing behind her, leaning slightly forward, playful teasing smirk, intelligent alluring gaze" },
  { file: "iris_west_allen.png",  desc: "photorealistic portrait of Candice Patton as Iris West-Allen from The Flash TV show, face of Candice Patton: large warm dark brown doe eyes, high cheekbones, full lips, radiant warm smile, long straight dark brown hair slightly windswept, medium warm-brown glowing skin, slim athletic figure, wearing a fitted open leather jacket over form-fitting top showing bare collarbones and toned arms, glossy lips parted, red-gold Speed Force lightning in background, smoky eye makeup, confident seductive smile" },
  { file: "caitlin_snow.png",     desc: "photorealistic portrait of Danielle Panabaker as Killer Frost from The Flash TV show, face of Danielle Panabaker: wide pale blue-grey eyes with icy contacts, defined cheekbones, straight nose, long wavy white-silver and ice-blue ombre hair wild and flowing, ghostly fair pale skin with subtle frost crystals at temples, wearing dark blue Killer Frost leather jacket open at collar over form-fitting icy blue bodysuit showing bare pale collarbones, frost crystals at fingertips, heavy dark eye makeup, glossy pale blue lips, cold seductive dangerous stare" },
  { file: "jesse_quick.png",      desc: "photorealistic portrait of Violett Beane as Jesse Quick from The Flash TV show, face of Violett Beane: wide hazel eyes, round friendly face, button nose, warm smile, wavy medium-length light brunette hair tousled loose, fair skin, athletic build, wearing yellow-and-black speedster suit hugging her curves with collar slightly open showing bare collarbones, golden lightning bolt emblem on chest, smoky eye makeup, glossy lips, golden lightning crackling around her, bright playful teasing smirk" },
  { file: "nora_west_allen.png",  desc: "photorealistic portrait of Jessica Parker Kennedy as Nora West-Allen XS from The Flash TV show, face of Jessica Parker Kennedy: warm mixed-race features, bright brown eyes, wide charming smile, long dark brown hair loose with strands across face, light caramel skin, athletic figure, wearing purple-and-gold speedster suit hugging her curves with collar slightly open showing bare collarbones, XS lightning emblem on chest, goggles pushed up into hair, smoky eye makeup, glossy lips slightly parted, violet lightning around her, teasing smile" },
  { file: "cecile_horton.png",    desc: "photorealistic portrait of Danielle Nicolet as Cecile Horton from The Flash TV show, face of Danielle Nicolet: bright warm brown eyes, wide confident smile, defined cheekbones, shoulder-length glossy dark hair swept to one side, warm medium-brown skin, elegant build, wearing a fitted blazer open over a form-fitting blouse showing bare collarbones and toned arms, glossy bold lips, soft purple psychic aura glowing at her temples, leaning forward with a knowing seductive smile, smoky eye makeup" },
  { file: "alex_danvers.png",     desc: "photorealistic portrait of Chyler Leigh as Alex Danvers from Supergirl TV show, face of Chyler Leigh: striking hazel eyes, angular defined jaw, straight nose, short layered auburn-brown hair slightly tousled, fair skin, fit muscular build, wearing black DEO tactical vest open over a form-fitting dark tank top showing toned bare arms and collarbones, utility belt at waist, sidearm holstered at hip, smoky eye makeup, glossy lips, intense smoldering stare, no-nonsense military confidence turned seductive" },
];

const STYLE = "photorealistic RAW photograph, celebrity portrait photography, hyperrealistic skin texture with visible pores, Canon EOS R5 85mm f/1.2 lens, dramatic Rembrandt lighting with deep shadow side, sharp focus on eyes and face, natural hair texture, catchlights in eyes, dark cinematic moody background bokeh, Maxim magazine editorial quality, 8k resolution, film grain, real human woman, sexy alluring expression";
const NEG = "cartoon, anime, illustration, painting, watercolor, sketch, 3D render, CGI, digital art, plastic skin, airbrushed, smooth skin, overprocessed, synthetic, wax figure, mannequin, blurry, pixelated, low quality, deformed, disfigured, extra fingers, mutated hands, bad anatomy, bad proportions, watermark, text, logo, border, multiple people, wide shot, child, underage, nudity, nude, topless, naked, exposed breasts, nipples, genitals";

async function genOne(h) {
  const prompt = `${h.desc}, direct smoldering gaze into camera lens, ${STYLE}`;
  const resp = await fetch("https://api.venice.ai/api/v1/image/generate", {
    method: "POST",
    headers: { Authorization: `Bearer ${VENICE_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "lustify-sdxl",
      prompt, negative_prompt: NEG,
      width: 768, height: 1024,
      steps: 45, cfg_scale: 9,
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
