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
  // Marvel Female Villains
  "Typhoid Mary":    "Dangerous beautiful woman, wild dark hair with red streaks, piercing pale blue eyes, one side of face with faint burn scarring, slim athletic build, black leather outfit with red accents, fierce split-personality intensity in her expression, flames flickering around her hands",
  "Madame Masque":   "Mysterious powerful woman, sleek dark hair, wearing a golden iron mask over half her face, elegant black tactical bodysuit, slender commanding figure, one eye visible — dark and ruthless, high-fashion villain aesthetic, Vogue-dark editorial look",
  "Viper":           "Striking dangerous woman, long straight green-tinted black hair, cold green eyes, flawless pale olive skin, form-fitting black and green bodysuit, lithe predatory build, a serpent coiled around her arm, cold composed expression of absolute authority",
  "Titania":         "Massively powerful woman, long wild auburn hair, fierce brown eyes, enormous muscular build yet feminine physique, battle-scarred confident expression, orange and brown villain costume, towering presence, gamma-enhanced muscles visible",
  "Moonstone":       "Beautiful manipulative woman, long platinum blonde hair, icy blue eyes, slender elegant figure, silver and black Moonstone costume with glowing gem embedded in chest, floating slightly off the ground, cold calculating smile",
  "Selene":          "Ancient immortal beauty, long straight black hair, ageless pale skin, deep dark eyes glowing red at the iris edges, black Hellfire Club gown, slender timeless figure, aura of psychic energy, aristocratic and terrifying expression",
  "Deathbird":       "Fierce alien warrior woman, sharp angular features, deep violet skin, long black hair, massive black feathered wings fully spread, yellow predator eyes, battle armour with exposed shoulders, savage and proud expression",
  "Spiral":          "Otherworldly sorceress, silver-white wild hair, six arms each holding a gleaming blade, pale skin covered in mystical tattoos, swirling magical energy around her, slender acrobatic figure, manic wide eyes filled with arcane power",
  "Satana":          "Demonic sensual woman, long dark red hair, glowing amber eyes with slit pupils, pale skin, curved horns barely visible in her hair, black leather corset with mystical symbols, slender figure with supernatural beauty, soul-fire flickering around her fingertips",
  "Goblin Queen":    "Corrupted beauty, long flowing red hair, glowing green eyes, pale skin, black and red demonic sorceress gown, slender powerful figure, dark energy crackling around her hands, expression of triumphant madness and tragic beauty",
  "Arclight":        "Fierce Marauder woman, short spiky purple hair, grey eyes, lean athletic build, purple and black combat suit, concussive shockwave energy rippling from her hands, aggressive combat stance, scar across left cheek",
  "Shriek":          "Unhinged villain woman, wild tangled black hair with white streaks, screaming dark eyes, pale gaunt face, tattered black outfit, sonic energy emanating from her open mouth, manic terrifying expression of pure chaos",
  "Sin":             "Ruthless fascist woman, cropped red hair, cold pale blue eyes, a red skull brand on her cheek, tactical black and red military uniform, lean hard build, expression of fanatical conviction and inherited evil",
  "Vertigo":         "Savage Land mutate woman, long wavy green hair, unsettling swirling eyes, olive skin, green and black tribal villain costume, slender build, waves of psychic vertigo energy distorting the air around her",
  "Callisto":        "Underground Morlock leader woman, shaved head on one side with long dark hair on the other, one eye covered by a black patch, multiple facial piercings, lean scarred muscular build, dark patchwork underground outfit, fierce expression of underground survival authority",
  "Lady Mastermind": "Elegant illusionist woman, long wavy auburn hair, sharp green eyes, high cheekbones, slender sophisticated figure, Victorian-style black and gold villain gown, illusion energy shimmering around her hands, aristocratic smirk of contempt",
  "Superia":         "Commanding imperious woman, long platinum blonde hair swept back, cold blue eyes, tall powerful athletic build, white and blue advanced armour, regal authoritative posture, expression of supreme self-certainty",
  "Skein":           "Unusual villain woman, close-cropped silver hair, pale grey eyes, slender figure, black bodysuit with thread-like patterns, long ribbons of fabric and fibre swirling around her like tentacles under telekinetic control",
  "Snapdragon":      "Lethal mercenary woman, short bleached platinum blonde hair, cold grey eyes, lean hard athletic build, military tactical black outfit, combat knife at her hip, expression of professional sadistic focus",
  "Nekra":           "Gothic horror villain woman, stark white skin, jet black hair, glowing red eyes, lean angular figure, dark robes, hatred energy radiating as visible black aura, gaunt fierce beautiful face twisted with ancient rage",
  // DC Female Villains
  "Harley Quinn":    "Iconic chaotic woman, blonde hair in two pigtails dyed red and blue at the tips, bright blue eyes, pale white-painted skin, red and black diamond harlequin outfit, wide manic grin, oversized mallet resting on her shoulder, playful dangerous energy",
  "Poison Ivy":      "Seductive botanical villain, long flowing red hair woven with vines and leaves, vivid green eyes, pale skin with subtle green plant-vein patterns, form-fitting leaf and vine costume, slender figure, flowers blooming in her hair, sultry powerful expression",
  "Catwoman":        "Sleek dangerous woman, dark brown hair under a black cat-eared cowl, sharp green eyes, form-fitting black latex catsuit, slender athletic build, retractable claws, confident predatory smile, diamond necklace at her throat",
  "Killer Frost":    "Ice-cold villain woman, pale ice-blue skin, white hair with frost crystals, pale blue eyes, sleek white and silver frost costume, slender figure with ice forming around her hands, expression of cold fury",
  "Talia al Ghul":   "Lethal aristocratic woman, long straight black hair, dark striking eyes with kohl liner, olive Mediterranean skin, black League of Shadows tactical suit with gold detailing, lean dangerous build, expression of regal lethal intelligence",
  "Enchantress":     "Ancient sorceress, long white hair wild around her, glowing white eyes, pale skin covered in dark mystical runes, tattered black witch robes with ethereal glow, slender unearthly figure, swirling dark magic surrounding her",
  "Black Siren":     "Dangerous Canary villain, long blonde hair, sharp blue eyes, black leather bodysuit with Canary emblem crossed out, lean athletic build, mouth open mid-sonic-scream with sonic waves visible, fierce expression of Earth-2 fury",
  "Star Sapphire":   "Regal violet lantern woman, long dark hair, intense violet-glowing eyes, slender figure in Star Sapphire violet crystal armour, violet energy ring glowing on her finger, love-energy crystalline wings, powerful commanding presence",
  "Silver Banshee":  "Terrifying undead woman, long wild white hair, hollow black and white skull-like face markings, skeletal hands, tattered ancient Celtic robes, lean spectral figure, mouth open in silent scream, supernatural horror beauty",
  "Maxima":          "Alien empress warrior woman, long dark red hair, commanding red eyes, rich amber skin, imposing powerful build in golden Almeracian battle armour, haughty imperial expression, psychic energy crackling around her hands",
  "Livewire":        "Electric punk villain woman, short spiky bleached platinum blonde hair, electric blue glowing eyes, lean energetic build, blue and white bodysuit crackling with electricity, lightning arcing from her fingertips, sharp grin of dangerous joy",
  "Lady Shiva":      "World's deadliest martial artist, long straight black hair, dark intense eyes, lean perfectly conditioned Asian build, red and black martial combat uniform, utterly calm expression of supreme fighting confidence",
  "Ravager":         "Teen mercenary villain, long silver-white hair, one eye covered by a black tactical patch, lean scarred athletic build, black and orange Deathstroke-style armour, twin blades, fierce expression of someone who has nothing to lose",
  "Superwoman":      "Dark Superman counterpart woman, long black hair, glowing red eyes, powerful athletic build, dark Crime Syndicate cape and armour, intimidating imposing presence, cold expression of absolute power and contempt",
  "Emerald Empress": "Futuristic sorceress, long dark hair, green glowing eyes, slender figure in emerald green robes, the massive floating Emerald Eye of Ekron glowing beside her head, Legion of Super-Villains energy crackling around her",
  "Jinx":            "Supernatural hex villain, long pink hair, glowing lilac eyes, grey-tinted skin, Teen Titans villain purple robes, slender figure, bad-luck hex energy shimmering in violet around her hands, mysterious expression",
  "Doctor Poison":   "Chemical weapons villain, brown hair under a white laboratory mask covering the upper face, dark eyes above the mask, scientist build in white tactical combat suit with chemical canisters, cold clinical ruthless expression",
  "Volcana":         "Fire villain woman, long wild flame-orange hair with actual fire flickering in it, amber eyes, warm brown skin, slender figure wreathed in fire, black and orange heat-resistant suit, confident fierce smile surrounded by flames",
  "Scandal Savage":  "Immortal's daughter warrior, long dark hair, strong lean build with old battle scars, dark eyes, black tactical suit with crossed blade holsters, Lamentation Blades at her hips, expression of weary invincible determination",
  "Bleez":           "Red Lantern rage villain, long dark hair, pale lavender skin, Red Lantern insignia on chest, wide bat-like wings, glowing red eyes, red ring on her finger, red rage plasma dripping from her lips, expression of infinite grief-fuelled rage",
};

async function generatePortrait(name, description) {
  const slug = nameToSlug(name);
  const outPath = path.join(OUT_DIR, `${slug}.png`);
  if (fs.existsSync(outPath)) {
    console.log(`  [SKIP] ${name} — already exists`);
    return true;
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
  const slug = nameToSlug(name);
  const alreadyExists = fs.existsSync(path.join(OUT_DIR, `${slug}.png`));
  console.log(`[${i + 1}/${names.length}] ${name}`);
  const generated = await generatePortrait(name, APPEARANCES[name]);
  if (!alreadyExists && generated && i < names.length - 1) {
    console.log(`  Waiting 8s...\n`);
    await new Promise(r => setTimeout(r, 8000));
  }
}
console.log("\nAll done!");
