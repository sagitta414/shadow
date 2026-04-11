import fs from "fs";
import path from "path";

const VENICE_API_KEY = process.env.VENICE_API_KEY;
if (!VENICE_API_KEY) { console.error("VENICE_API_KEY not set"); process.exit(1); }

const OUT_DIR = path.resolve("artifacts/shadowweave/public/villains");
fs.mkdirSync(OUT_DIR, { recursive: true });

function nameToSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

const APPEARANCES = {
  // Marvel
  "Proxima Midnight": "Fearsome alien warrior woman, long black hair, blue-grey skin, glowing yellow eyes, Black Order dark battle armour, imposing tall muscular build, wielding a glowing spear made of compressed starlight, expression of cold merciless conquest",
  "Shiklah":          "Shapeshifting monster queen, long flowing dark purple hair, pale skin, dark violet eyes, elegant gothic queenly gown with dark energy swirling around her, slender regal figure, fangs subtly visible in a powerful smile, crown of dark horns",
  "Black Mamba":      "Seductive mercenary woman, long dark hair, warm brown skin, dark eyes, sleek black bodysuit, a coiling psychic darkforce serpent manifesting around her as a black shadow snake, confident dangerous expression",
  "Asp":              "Striking mercenary woman, long wavy brown hair, green eyes, olive skin, yellow and black serpent-themed bodysuit, lean athletic build, electric venom energy crackling at her fingertips, sharp alert mercenary gaze",
  "Malice":           "Sinister possession entity, long silver hair, glowing violet eyes, pale translucent skin with dark energy beneath, dark ethereal robes, slender haunting figure, expression of cruel borrowed pleasure at occupying another's body",
  "Man-Killer":       "Towering powerful woman, long black hair, fierce dark eyes, enormous muscular build, green and black battle armour, intimidating physical presence, expression of righteous fury and absolute physical confidence",
  "Scorpia":          "Female Scorpion villain, dark hair pulled back, fierce brown eyes, green and yellow mechanised scorpion suit with articulated tail, lean athletic build beneath armour, aggressive combative stance",
  "Princess Python":  "Circus villain woman, long wavy red hair, vivid green eyes, theatrical green and gold serpent-themed bodysuit, slender acrobatic build, a massive python coiled around her shoulders and arms, theatrical confident smile",
  "Dragoness":        "Mutant villain woman, wild dark hair, fierce brown eyes, dark red and black tactical suit with wing-like protrusions, lean athletic build, fire and smoke trailing from her mouth, savage aerial combat stance",
  "Joystick":         "Playful mercenary villain woman, short spiky dark hair with coloured streaks, bright mischievous brown eyes, colourful red and yellow suit, athletic build, glowing energy batons in each hand, cocky grin of someone who treats violence as sport",
  // DC
  "Blackfire":        "Evil Tamaranean princess, long wild black hair, deep purple glowing eyes, orange-bronze skin, black and purple Tamaranean battle armour, powerful warrior build, dark starbolts crackling around her fists, expression of cruel triumphant ambition",
  "Terra":            "Teen Titans traitor, short blonde hair, sharp blue eyes, brown and black earth-control suit, petite athletic build, shards of rock and earth floating around her under her control, conflicted expression hiding cold betrayal",
  "Cheshire":         "Lethal Asian assassin, long straight black hair, sharp dark eyes, green and black tactical bodysuit with cat mask pushed up, lean dangerous build, poison-laced fingertips glowing faintly, expression of cold professional focus",
  "Lashina":          "Female Fury warrior, long dark hair, cold blue eyes, Apokolips black battle armour, powerfully built athletic figure, metallic razor-edged whips coiled around her arms, fierce expression of Apokoliptian supremacy",
  "Nyssa al Ghul":    "League of Assassins commander woman, long dark brown hair, intense dark eyes, olive skin, black League tactical outfit with red sash, lean dangerous build, Ra's al Ghul's ruthless intelligence in her expression",
  "Plastique":        "Explosive-powered terrorist woman, short red hair, fierce blue eyes, red and black tactical bodysuit, lean athletic build, small explosions crackling around her hands as she generates them, defiant expression of controlled destruction",
  "Queen Bee":        "Mind-control villainess, long dark hair, large hypnotic amber eyes, golden and black queen bee armour, slender commanding figure, psychic mind-control aura shimmer around her eyes, regal imperious expression of absolute control",
  "Mercy Graves":     "Android bodyguard woman, slick dark hair pulled back tight, silver-grey eyes, sleek black suit, athletic powerful build, subtle android mechanical panels visible at wrist, expression of unwavering protective loyalty and lethal capability",
  "Mad Harriet":      "Apokolips Female Fury psychotic, wild green-red hair, mad glowing eyes, spiked green and purple battle armour, compact explosive build, razor claws extended, gleefully unhinged expression of someone who loves violence unconditionally",
  "Shado":            "Yakuza archer assassin, long straight black hair, dark focused eyes, traditional Japanese assassin dark green and black outfit, lean precise build, drawing a black recurve bow with arrow nocked, expression of absolute calm deadly focus",
};

async function generatePortrait(name, description) {
  const slug = nameToSlug(name);
  const outPath = path.join(OUT_DIR, `${slug}.png`);
  if (fs.existsSync(outPath)) {
    console.log(`  [SKIP] ${name} — already exists`);
    return false;
  }

  const prompt = `RAW photograph, photorealistic, ${description}, comic book character portrait, dramatic studio lighting, cinematic lighting, 85mm lens, sharp focus on face, detailed eyes, skin texture visible, editorial portrait photography, 8k uhd resolution, hyperrealistic, masterpiece`;
  const negativePrompt = "cartoon, anime, illustration, painting, watercolor, sketch, drawing, 3D render, CGI, digital art, blurry, low quality, deformed, extra limbs, bad anatomy, watermark, text, logo, signature, male, man, boy, masculine";

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
        console.log(`  [429] ${name} — rate limited, waiting 55s...`);
        await new Promise(r => setTimeout(r, 55000));
        continue;
      }
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json();
      if (!json.images?.[0]) throw new Error("No image in response");
      const buf = Buffer.from(json.images[0], "base64");
      fs.writeFileSync(outPath, buf);
      console.log(`  [OK] ${name} → villains/${slug}.png`);
      return true;
    } catch (err) {
      console.error(`  [ERR] ${name}: ${err.message} (attempt ${attempts})`);
      if (attempts < 3) await new Promise(r => setTimeout(r, 10000));
    }
  }
  return false;
}

const names = Object.keys(APPEARANCES);
console.log(`Generating ${names.length} female villain portraits...\n`);
for (let i = 0; i < names.length; i++) {
  const name = names[i];
  console.log(`[${i + 1}/${names.length}] ${name}`);
  const generated = await generatePortrait(name, APPEARANCES[name]);
  if (generated && i < names.length - 1) {
    console.log(`  Waiting 8s...\n`);
    await new Promise(r => setTimeout(r, 8000));
  }
}
console.log("\nAll done!");
