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
  "Nebula":          "Dangerous cyborg alien woman, pale blue-grey skin, partially cybernetic skull and face with silver metal plating on one side, fierce sharp dark eyes, sleek dark black armour, lean athletic dangerous build, expression of cold ruthless ambition and barely contained fury",
  "Emma Frost":      "Seductive and powerful mutant woman, long platinum blonde hair, piercing ice-blue eyes, porcelain white skin, elegant white corset and white bodysuit, slender curvaceous figure, one hand transformed to faceted diamond, imperious expression of absolute superiority and immaculate confidence",
  "Dark Phoenix":    "Cosmic-powered woman wreathed in flames, long flowing red hair surrounded by blazing fire and cosmic energy, glowing white-gold eyes, red and gold Phoenix Force bodysuit, powerful imposing figure, enormous fiery Phoenix raptor silhouette forming behind her, expression of terrifying omnipotent power",
  "Destiny":         "Blind precognitive woman, short grey-white hair, milky white sightless eyes, older distinguished face with wisdom etched into it, dark navy blue Victorian-styled villain outfit, slender frame, holding a worn book of prophecies, expression of serene knowing as if she has already seen how everything ends",
  "Anaconda":        "Massive powerfully-built woman, dark skin, short black hair, intense dark eyes, green and silver Serpent Society bodysuit, enormous muscular build, elongated superhuman arms that can stretch and constrict, snake-scale tattoo pattern on arms, expression of confident physical dominance",
  "Lady Bullseye":   "Lethal Japanese assassin woman, long straight black hair, cold dark eyes, white and black Hand ninja assassin outfit, lean whip-fast athletic build, holding playing cards with razor precision between her fingers, expression of perfect icy professional calm",
  "Mysteria":        "Theatrical female Mysterio villain, long dark hair inside a large fishbowl-style helmet with swirling green smoke inside, dark green and purple costume matching Mysterio's style, slender figure, dramatic gesturing pose, mist and illusions swirling around her, expression of theatrical confidence behind the glass",
  "Fer-de-Lance":    "Lethal woman with serpent powers, dark hair, fierce brown eyes, tan skin, yellow and black serpent-patterned Serpent Society bodysuit, athletic build with retractable venomous spurs at her wrists, coiled ready-to-strike posture, sharp dangerous expression",
  "Death":           "Cosmic entity in female form, long flowing black hair, skin the colour of starless void, glowing white pinpoint eyes, shimmering black robes that dissolve into shadow and stars, ethereal otherworldly figure, absolute serene power in her expression, stars and galaxies visible in the void of her flowing gown",
  "Bombshell":       "Explosive-powered mercenary woman, long blonde hair, fierce blue eyes, orange and yellow tactical bodysuit with burn marks, athletic build, small controlled explosions detonating in her outstretched palm, confident grin of someone who enjoys the destruction she causes",
  // DC
  "Knockout":        "Massive Female Fury warrior woman, long wild red hair, fierce green eyes, pale skin, red and black Apokolips battle armour, enormous powerfully muscular build, expression of joyful savage love of combat and violence, dramatic fighting stance",
  "Doctor Cyber":    "Cybernetically-enhanced villain woman, half her face sleek silver metal with glowing red cybernetic eye, remaining human half beautiful and cold, dark hair, black and silver cybernetic armour covering her body, slender but lethal build, expression mixing wounded beauty with ruthless technological vengeance",
  "Veronica Cale":   "Billionaire corporate villain woman, immaculate dark hair in a sharp executive style, cold calculating green eyes, pale skin, tailored dark power suit of extreme quality, slender commanding figure, expression of supreme intelligence combined with contemptuous ambition and absolute certainty she will win",
  "White Rabbit":    "Theatrical Gotham villainess, long platinum blonde hair with white bunny ears headband, bright mischievous blue eyes, white and blue Alice in Wonderland-inspired bodysuit with a fluffy rabbit tail, lean agile build, playing cards and white roses scattered around her, gleefully theatrical expression",
  "Phobia":          "Fear-manifesting villain woman, long dark hair, haunting pale eyes that shimmer with dark psychic energy, pale skin, dark purple and black ethereal outfit, slender haunting figure, dark energy tendrils emanating from her hands forming into half-glimpsed nightmare shapes, expression of predatory calm",
  "Stompa":          "Massive brutish Female Fury woman, short dark hair, small fierce eyes, grey skin, heavy spiked Apokolips battle armour with enormous iron boots, enormously muscular hulking build, expression of simple gleeful violence, one enormous boot raised mid-stomp cracking the ground beneath her",
  "Black Alice":     "Gothic magic-thieving villain girl-woman, long dark hair with streaks of colour, dark-ringed eyes, pale skin, torn dark gothic clothing, magical dark energy swirling around her hands as she steals another magic user's power, anguished yet defiant expression",
  "Tigress":         "Athletic martial arts villain woman, long dark blonde hair tied back, fierce amber eyes, orange and black tigress-striped bodysuit, lean powerfully-built athletic frame, crouching in a predatory martial arts stance, expression of focused ruthless hunter about to strike",
  "Mortalla":        "Dark queen of Apokolips, long dark crimson-black hair, deep red glowing eyes, grey skin, elaborate black and gold Apokolips queen armour with dramatic spiked crown, imposing queenly figure, expression of cold possessive power and lethal jealousy",
  "Shadow Thief":    "Dimensional thief villain woman, short dark hair, silver-grey eyes, entire body partially phased into shadow so she appears half-solid half-dark silhouette, dark grey and black bodysuit, lean dangerous athletic build, one hand reaching through solid matter as if it isn't there, expression of criminal confidence",
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
