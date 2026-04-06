import fs from "fs";
import path from "path";

const VENICE_API_KEY = process.env.VENICE_API_KEY;
if (!VENICE_API_KEY) { console.error("VENICE_API_KEY not set"); process.exit(1); }

const OUT_DIR = path.resolve("artifacts/shadowweave/public/bond");
fs.mkdirSync(OUT_DIR, { recursive: true });

function nameToSlug(name) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

const BOND_APPEARANCES = {
  "Rachel Adams":      "Beautiful young woman, long wavy dark brown hair past shoulders, expressive large brown eyes, delicate soft facial features, slim slender build, fair pale skin, natural beauty",
  "Paris Kennedy":     "Attractive woman, shoulder-length blonde hair, blue eyes, girl-next-door features, hourglass figure, warm smile, classic all-American looks",
  "Callie Calypso":    "Attractive brunette woman, natural wavy mid-length brown hair, hazel eyes, toned athletic build, light olive skin, energetic and spirited appearance",
  "Liz Tyler":         "Beautiful woman with long flowing auburn-red hair, green eyes, full curves, porcelain fair complexion, expressive face, sensual look",
  "Ariel Anderssen":   "Tall slender elegant British woman, light brown hair worn loose, blue-grey eyes, refined aristocratic features, graceful willowy figure, sophisticated beauty",
  "Alexis Taylor":     "Attractive brunette woman, dark brown straight hair, intense dark brown eyes, slender figure, high cheekbones, Mediterranean features, controlled composure",
  "Sasha Fae":         "Petite woman with platinum white-blonde very short hair, wide blue eyes, elfin delicate features, tiny slim frame, fragile ethereal appearance",
  "Christina Carter":  "Fit athletic woman with chestnut brown hair, bright green eyes, toned sculpted physique, strong yet feminine build, capable confident look",
  "Kendra James":      "Tall statuesque woman with dark hair, warm brown skin, structured elegant facial features, commanding presence, slim toned figure",
  "Dia Zerva":         "Edgy woman with dark hair, dark eyes, visible tattoos, curvy figure, fierce expression, alternative punk aesthetic",
  "Harmony Rose":      "Beautiful woman with curly blonde hair, soft blue eyes, generous full curves, round sweet face, innocent expression, generous hourglass figure",
  "Veruca James":      "Striking woman with vivid red hair, sharp green eyes, slim toned figure, natural authority in her bearing, fierce intelligent expression",
  "Monica Jene":       "Mysterious woman with jet black hair, dark smouldering eyes, olive complexion, angular elegant features, slender exotic figure",
  "Sadie Holmes":      "Slender woman with dark brunette hair, wide soft brown eyes, willowy slim build, gentle refined features, natural vulnerability in her expression",
  "Shara Deane":       "Gothic beauty with long raven black hair, dramatic dark eyes, ivory porcelain skin, full lips, slim figure, dramatic elegant appearance",
  "Hannah Perez":      "Beautiful Latina woman with long dark brown hair, rich brown eyes, full warm curves, expressive emotional face, naturally animated expressions",
  "Jasmine St Claire": "Exotic statuesque woman with long dark layered hair, deep brown eyes, lightly bronzed complexion, full commanding curves, theatrical presence",
  "Dee Williams":      "Athletic compact woman with short dark hair, warm brown eyes, defined muscular physique, toned fit body, powerful yet feminine build",
  "Sandra Silvers":    "Elegant mature woman with silver-blonde hair, blue eyes, poised refined figure, graceful sophisticated appearance, timeless classical beauty",
  "Amanda Foxx":       "Beautiful blonde woman with long golden blonde hair, bright blue eyes, full generous hourglass figure, warm radiant smile, naturally cheerful look",
};

async function generatePortrait(name, description) {
  const slug = nameToSlug(name);
  const outPath = path.join(OUT_DIR, `${slug}.png`);
  if (fs.existsSync(outPath)) {
    console.log(`  [SKIP] ${name} — already exists`);
    return true;
  }

  const prompt = `RAW photograph, photorealistic, ${description}, real person, natural beauty, Canon EOS R5, 85mm f/1.4 lens, natural studio lighting, Rembrandt lighting, catchlights in eyes, skin pores visible, natural hair texture, detailed iris, sharp focus on face, soft bokeh background, editorial portrait photography, Vogue magazine quality, 8k uhd resolution, hyperrealistic, masterpiece, perfect anatomy`;
  const negativePrompt = "cartoon, anime, illustration, painting, watercolor, sketch, drawing, 3D render, CGI, digital art, artificial, fake, plastic skin, smooth skin, airbrushed, overprocessed, retouched, synthetic, wax figure, mannequin, doll-like, blurry, out of focus, motion blur, grainy, noisy, pixelated, low quality, deformed, disfigured, extra fingers, mutated hands, poorly drawn face, bad anatomy, extra limbs, cloned face, bad proportions, watermark, text, logo, signature";

  let attempts = 0;
  while (attempts < 3) {
    attempts++;
    try {
      const resp = await fetch("https://api.venice.ai/api/v1/image/generate", {
        method: "POST",
        headers: { "Authorization": `Bearer ${VENICE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "lustify-sdxl", prompt, negative_prompt: negativePrompt, width: 512, height: 768, steps: 32, safe_mode: false }),
      });
      if (resp.status === 429) {
        console.log(`  [429] ${name} — rate limited, waiting 50s...`);
        await new Promise(r => setTimeout(r, 50000));
        continue;
      }
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json();
      if (!json.images?.[0]) throw new Error("No image in response");
      const buf = Buffer.from(json.images[0], "base64");
      fs.writeFileSync(outPath, buf);
      console.log(`  [OK] ${name} → bond/${slug}.png`);
      return true;
    } catch (err) {
      console.error(`  [ERR] ${name}: ${err.message} (attempt ${attempts})`);
      if (attempts < 3) await new Promise(r => setTimeout(r, 10000));
    }
  }
  return false;
}

const names = Object.keys(BOND_APPEARANCES);
console.log(`Generating ${names.length} Bond Captive portraits...\n`);
for (let i = 0; i < names.length; i++) {
  const name = names[i];
  console.log(`[${i + 1}/${names.length}] ${name}`);
  await generatePortrait(name, BOND_APPEARANCES[name]);
  if (i < names.length - 1) {
    console.log(`  Waiting 8s...\n`);
    await new Promise(r => setTimeout(r, 8000));
  }
}
console.log("\nDone!");
