import fs from "fs";
import path from "path";

const API_KEY = process.env.VENICE_API_KEY;
const BASE_URL = "https://api.venice.ai/api/v1";
const OUT_DIR = path.resolve("public/heroes");
const VILLAIN_DIR = path.resolve("public/villains");

const NEG = "cartoon, anime, illustration, drawing, painting, CGI, digital art, render, 3D render, sketch, comic, watermark, blurry, low quality, deformed, extra limbs, ugly, disfigured, text, logo, signature, username";

const HEROES = [
  // ── TV UNIVERSE ──
  { slug: "lucy-chen",         prompt: "RAW DSLR photo 85mm f/1.8, breathtakingly beautiful East Asian woman mid 20s, almond dark eyes, flawless dewy skin, sleek dark hair in a practical bun, wearing a fitted dark navy police uniform, badge glinting, commanding confident posture, full lips slightly parted, precinct background beautifully bokeh'd, photorealistic skin pores, cinematic editorial lighting, 8k, hyperrealistic, sexy" },
  { slug: "nyla-harper",       prompt: "RAW DSLR photo 85mm, stunning Black woman early 30s, sharp intelligent eyes, natural hair, athletic body in fitted dark detective plainclothes, badge on belt, powerful fierce composure and raw magnetism, urban moody backdrop bokeh, hyperrealistic skin texture, 8k, cinematic editorial" },
  { slug: "angela-lopez",      prompt: "RAW DSLR portrait 85mm, gorgeous Latina woman early 30s, piercing dark eyes, high cheekbones, dark hair in sleek bun, fitted police sergeant uniform accentuating curves, absolute authority with smoldering undercurrent, precinct background blurred, hyperrealistic skin, 8k, photorealistic" },
  { slug: "tamara-collins",    prompt: "RAW DSLR photo 85mm, beautiful Black woman early 20s, large expressive eyes, natural hair, fitted civilian work attire that hugs her figure, smart street-smart expression with magnetic warmth, LA urban environment bokeh'd, hyperrealistic skin glow, 8k" },
  { slug: "elliot-reid",       prompt: "RAW DSLR photo 85mm f/1.8, gorgeous blonde woman late 20s, bright blue-green eyes, fair freckled skin, blonde hair in slightly messy ponytail, fitted teal scrubs that flatter her figure, stethoscope around neck, flustered brilliant expression with natural sensuality, hospital corridor bokeh, hyperrealistic skin pores, 8k" },
  { slug: "jordan-sullivan",   prompt: "RAW DSLR portrait 85mm, breathtakingly stunning brunette woman mid 30s, sharp piercing dark eyes, flawless olive skin, dark hair immaculately styled, wearing a fitted blazer that perfectly shapes her form, total command and smoldering authority in expression, hospital office bokeh, hyperrealistic skin, 8k" },
  { slug: "carla-espinosa",    prompt: "RAW DSLR photo 85mm, gorgeous Latina woman early 30s, warm brown eyes with natural lashes, dark curly hair, curvy figure in fitted scrubs, warm magnetic smile radiating confidence and sensuality, hospital background softly blurred, hyperrealistic skin texture, 8k" },
  { slug: "sarah-walker",      prompt: "RAW DSLR photo 85mm f/1.4, breathtakingly gorgeous tall brunette woman late 20s, intense green eyes, flawless skin, long dark hair loose, wearing a sleek dark blazer over form-fitting dark top, dangerous controlled expression suggesting lethal training beneath stunning beauty, moody dark backdrop rim-lit, hyperrealistic skin pores, 8k" },
  { slug: "ellie-bartowski",   prompt: "RAW DSLR photo 85mm, beautiful brunette woman late 20s, warm hazel eyes, natural glowing skin, dark hair flowing, wearing a fitted blouse, warm approachable yet quietly fierce expression, natural domestic warmth with underlying sensuality, soft interior light bokeh, hyperrealistic skin, 8k" },
  { slug: "sydney-bristow",    prompt: "RAW DSLR photo 85mm f/1.4, stunning dark brunette woman late 20s, deep brown eyes, fair skin, dark hair in glamorous waves, wearing an elegant deep-red satin dress with revealing neckline, spy-seductive expression suggesting multiple hidden identities, atmospheric moody interior, hyperrealistic skin texture, 8k" },
  { slug: "irina-derevko",     prompt: "RAW DSLR portrait 85mm, elegantly beautiful woman mid 40s, sharp dark eyes with controlled dangerous intelligence, dark hair with silver at temples, wearing a perfectly tailored power suit, cold calculated power and timeless beauty, luxury backdrop softly blurred, hyperrealistic skin showing graceful maturity, 8k" },
  { slug: "nadia-santos",      prompt: "RAW DSLR photo 85mm, gorgeous Latina woman mid 20s, warm brown eyes, dark hair, athletic lithe figure in dark tactical jacket, determined fearless expression with natural beauty, dramatic atmospheric backdrop, hyperrealistic skin texture, 8k" },
  { slug: "anna-espinosa",     prompt: "RAW DSLR photo 85mm f/1.8, striking dark-featured woman late 20s, sharp cold eyes with predator menace, dark hair, wearing sleek dark spy clothing that follows her figure, dangerous rival expression with chilling beauty, cold atmospheric backdrop, hyperrealistic skin, 8k" },
  { slug: "renee-walker",      prompt: "RAW DSLR photo 85mm, fierce beautiful auburn woman early 30s, intense blue-grey eyes, strong features, athletic figure in dark FBI jacket partially unzipped, recklessly determined warrior expression with raw sex appeal, urban environment bokeh, hyperrealistic skin pores, 8k" },
  { slug: "kate-morgan",       prompt: "RAW DSLR photo 85mm, gorgeous athletic woman early 30s, sharp grey-blue eyes, dark blonde hair, wearing CIA tactical clothing that shows her lean figure, coldly precise and controlled expression, dark tactical backdrop, hyperrealistic skin texture, 8k" },
  { slug: "chloe-obrian",      prompt: "RAW DSLR photo 85mm, beautiful woman early 30s, sharp dark eyes, dark hair, wearing a form-fitting dark top, intensely focused hacker genius expression, multiple monitor screens creating blue light against her face, hyperrealistic skin, 8k" },
  { slug: "nikita",            prompt: "RAW DSLR photo 85mm f/1.4, breathtakingly athletic beautiful woman late 20s, sharp dark eyes, dark hair loose past shoulders, lithe muscular figure in a sleek form-fitting black bodysuit, dangerous lethal grace in expression and posture, dramatic warehouse backdrop with rim lighting, hyperrealistic skin texture, 8k, assassin beauty" },
  { slug: "alex",              prompt: "RAW DSLR photo 85mm, gorgeous young woman early 20s, intense dark eyes, dark hair, slight Slavic bone structure, wearing minimal dark undercover clothing that reveals athletic form, nothing-left-to-lose fearless expression with raw beauty, shadowy atmospheric backdrop, hyperrealistic skin detail, 8k" },
  { slug: "sonya",             prompt: "RAW DSLR photo 85mm, beautiful young woman mid 20s, cool blue-grey eyes, dark hair, wearing a fitted dark operative outfit, systems-focused precision in expression with magnetic beauty, screens creating blue glow around her face, hyperrealistic skin, 8k" },
  { slug: "olivia-dunham",     prompt: "RAW DSLR photo 85mm f/1.8, strikingly beautiful blonde woman early 30s, intense blue eyes with haunted depth, fair skin, blonde hair loose, wearing a partially open FBI jacket over a fitted top, expression of someone who sees across universes, dramatic dark background, hyperrealistic skin texture, 8k" },
  { slug: "astrid-farnsworth", prompt: "RAW DSLR photo 85mm, beautiful Black woman late 20s, sharp warm dark eyes, natural hair, wearing fitted professional FBI attire, gentle brilliant analytical expression with warmth and hidden strength, laboratory environment bokeh, hyperrealistic skin texture, 8k" },
  { slug: "prue-halliwell",    prompt: "RAW DSLR photo 85mm f/1.4, strikingly beautiful woman late 20s, sharp dark eyes, long dark brunette hair, wearing an elegant dark blouse revealing graceful neckline with mystical jewelry, powerful slightly dangerous expression suggesting supernatural ability, dark moody atmospheric background, hyperrealistic skin, 8k" },
  { slug: "piper-halliwell",   prompt: "RAW DSLR photo 85mm f/1.8, gorgeous brunette woman late 20s, warm brown eyes, long dark hair, wearing a fitted cardigan over a camisole, warm approachable sensuality with quietly powerful expression, soft home interior warm lighting, hyperrealistic skin pores, 8k" },
  { slug: "phoebe-halliwell",  prompt: "RAW DSLR photo 85mm, beautiful dark-haired woman mid 20s, bright playful dark eyes, long wavy dark hair, wearing a form-fitting top with a bohemian flair, warm mischievous sensual expression, warm background blurred, hyperrealistic skin glow, 8k" },
  { slug: "paige-matthews",    prompt: "RAW DSLR photo 85mm, beautiful woman mid 20s, striking green eyes, dark auburn hair, wearing a fitted top with subtle mystical jewelry, independent fierce expression with natural allure, atmospheric background bokeh, hyperrealistic skin texture, 8k" },
  { slug: "zoe-washburne",     prompt: "RAW DSLR photo 85mm f/1.8, strikingly beautiful Black woman early 30s, sharp fearless dark eyes, natural afro hair, wearing a military vest over a fitted undershirt revealing strong arms, warrior expression with magnetic power, dusty spaceship-industrial backdrop bokeh, hyperrealistic skin texture, 8k" },
  { slug: "inara-serra",       prompt: "RAW DSLR photo 85mm f/1.4, exotic breathtakingly beautiful woman late 20s, dark almond-shaped eyes with elegant eye makeup, long dark hair with ornamental pins, wearing a luxurious silk kimono-style dress in jewel tones that accentuates every curve, graceful sensual composed poise, richly decorated room softly blurred behind, hyperrealistic skin texture, 8k" },
  { slug: "kaylee-frye",       prompt: "RAW DSLR photo 85mm, adorable beautiful young woman mid 20s, bright hazel eyes, brunette hair in pigtails, mechanic overalls that hug her figure with one strap down, engine grease smudge on cheek, warm beaming naturally gorgeous smile, engine parts bokeh behind her, hyperrealistic freckled skin, 8k" },
  { slug: "river-tam",         prompt: "RAW DSLR photo 85mm f/1.4, ethereally beautiful young woman early 20s, enormous dark eyes with otherworldly intensity, pale porcelain skin, long straight dark hair, wearing a flowing pale dress, expression caught between genius and madness with haunting beauty, misty atmospheric dark background, hyperrealistic skin texture, 8k" },
  { slug: "max-guevara",       prompt: "RAW DSLR photo 85mm, gorgeous mixed-race athletic woman early 20s, feline dark eyes with intense feral alertness, dark hair, lithe muscular physique in a low-cut dark leather jacket, predator grace and raw sensuality in expression, futuristic dystopian urban backdrop bokeh, hyperrealistic skin texture, 8k" },
  { slug: "kate-austen",       prompt: "RAW DSLR photo 85mm f/1.8, gorgeous brunette woman late 20s, sharp hazel eyes, sun-kissed tanned skin with freckles, dark hair slightly wild and loose, wearing torn jeans and a worn fitted tank top, survivalist fierce beauty, tropical environment bokeh, hyperrealistic skin texture, 8k" },
  { slug: "juliet-burke",      prompt: "RAW DSLR photo 85mm, strikingly beautiful blonde woman early 30s, piercing ice-blue eyes with calculated coldness, blonde hair, wearing a clean fitted clinical top that hugs her figure, dangerous intelligence concealing something lethal beneath cool beauty, muted background bokeh, hyperrealistic skin texture, 8k" },
  { slug: "ana-lucia-cortez",  prompt: "RAW DSLR photo 85mm, gorgeous Latina woman late 20s, sharp dark eyes with survivor intensity, dark hair, athletic figure in worn fitted clothing, raw tough beauty of someone who has fought to stay alive, tropical environment bokeh behind, hyperrealistic skin texture, 8k" },
  { slug: "sara-tancredi",     prompt: "RAW DSLR photo 85mm f/1.8, beautiful brunette woman late 20s, warm compassionate dark eyes, dark hair in a low ponytail, wearing fitted scrubs that complement her figure, intelligent empathetic expression with inner strength and natural beauty, clinical background bokeh, hyperrealistic skin, 8k" },
  { slug: "dr-lisa-cuddy",     prompt: "RAW DSLR photo 85mm f/1.4, breathtakingly beautiful brunette woman late 30s, dark eyes with absolute authority and underlying warmth, dark hair professionally styled, wearing a fitted blazer with a silk blouse with plunging neckline, expression of total command — most powerful woman in the building, executive office bokeh, hyperrealistic skin pores, 8k" },
  { slug: "thirteen",          prompt: "RAW DSLR photo 85mm, strikingly beautiful woman late 20s, striking grey-green eyes with intensity, dark hair, wearing fitted medical attire that shows her figure, expression of someone who has decided fear is irrelevant with smoldering underlying darkness, dramatic atmospheric lighting, hyperrealistic skin texture, 8k" },
  { slug: "allison-cameron",   prompt: "RAW DSLR photo 85mm f/1.8, beautiful blonde woman late 20s, compassionate bright blue eyes, natural blonde hair, wearing fitted medical scrubs, warm ethical idealist expression with genuine natural beauty and quiet sensuality, soft clinical background bokeh, hyperrealistic skin texture, 8k" },
  { slug: "fiona-glenanne",    prompt: "RAW DSLR photo 85mm f/1.4, gorgeous Irish-featured woman late 20s, bright green eyes, strawberry-blonde hair, athletic figure in a fitted dark jacket over a cropped top showing a toned midriff, expression radiating controlled dangerous energy and fearlessness, urban background bokeh, hyperrealistic freckled skin, 8k" },
  { slug: "carrie-mathison",   prompt: "RAW DSLR photo 85mm, beautiful blonde woman early 30s, intense sharp blue eyes with haunted quality, fair skin, blonde hair slightly disheveled, wearing a practical blouse partially unbuttoned, obsessive brilliant expression with raw magnetic energy, sparse background bokeh, hyperrealistic skin pores, 8k" },
  { slug: "olivia-pope",       prompt: "RAW DSLR photo 85mm f/1.4, strikingly beautiful Black woman early 40s, sharp powerful dark eyes, dark hair elegantly styled, wearing a perfectly structured white blazer that flatters her figure, absolute command and controlled power in every feature, minimalist DC office background bokeh, hyperrealistic skin texture, 8k" },
  { slug: "elizabeth-jennings", prompt: "RAW DSLR photo 85mm, gorgeous woman late 30s, sharp cold grey-green eyes, dark brunette hair, wearing a suburban casual blouse that conceals absolute danger beneath, KGB operative living two lives simultaneously — expression of someone beautiful and lethal, soft suburban background bokeh, hyperrealistic skin, 8k" },
  { slug: "root",              prompt: "RAW DSLR photo 85mm f/1.4, breathtakingly beautiful woman early 30s, dark hair cut sharp, cool grey eyes with machine-like precision and dangerous playfulness, wearing a fitted dark tactical outfit, expression suggesting she can predict everything about you, dark server-room backdrop bokeh, hyperrealistic skin texture, 8k" },
  { slug: "joss-carter",       prompt: "RAW DSLR photo 85mm, beautiful Black woman early 30s, warm determined dark eyes, natural hair, wearing NYPD detective clothing that fits her well, unwavering integrity and authority with natural magnetic beauty, urban New York backdrop bokeh, hyperrealistic skin texture, 8k" },
  { slug: "donna-paulsen",     prompt: "RAW DSLR photo 85mm f/1.4, breathtakingly beautiful redheaded woman early 30s, sharp knowing green eyes, long copper-red hair styled immaculately, wearing a designer blazer and silk blouse with a hint of cleavage, expression of someone who has read every person in the room and found them all wanting, luxury law office backdrop bokeh, hyperrealistic skin texture, 8k" },
  { slug: "jessica-pearson",   prompt: "RAW DSLR photo 85mm f/1.4, strikingly beautiful Black woman mid 40s, commanding dark eyes with absolute authority, dark hair elegantly styled, wearing a tailored power suit that perfectly frames her commanding figure, undisputed most powerful attorney in New York expression, premium office backdrop bokeh, hyperrealistic skin texture, 8k" },
  { slug: "lana-lang",         prompt: "RAW DSLR photo 85mm, gorgeous woman early 20s, large dark eyes, long dark hair, wearing a fitted casual top, natural vulnerability masking formidable inner strength, warm soft Kansas light bokeh behind her, hyperrealistic skin texture, 8k" },
  { slug: "lois-lane",         prompt: "RAW DSLR photo 85mm f/1.8, strikingly beautiful brunette woman early 20s, sharp dark eyes with fierce investigative intelligence, dark hair, wearing a fitted casual journalist outfit, expression of someone who breaks stories that change the world, newsroom bokeh behind, hyperrealistic skin texture, 8k" },
  { slug: "chloe-sullivan",    prompt: "RAW DSLR photo 85mm, beautiful blonde woman early 20s, bright sharp eyes, blonde hair, wearing fitted casual tech-meets-journalist attire, brilliant determined expression, warm interior environment bokeh, hyperrealistic skin texture, 8k" },
  { slug: "tess-mercer",       prompt: "RAW DSLR photo 85mm f/1.4, gorgeous woman late 20s, striking sharp eyes, auburn-red hair, wearing a sharp executive dress with clean lines that follows her figure, cold ambitious expression of someone ruthless and beautiful in equal measure, luxury corporate backdrop bokeh, hyperrealistic skin texture, 8k" },
  { slug: "kara-zor-el",       prompt: "RAW DSLR photo 85mm f/1.4, breathtakingly beautiful blonde woman early 20s, radiant blue eyes and warm glowing skin, long golden blonde hair, wearing a fitted red and blue athletic outfit, heroic confidence and natural warmth radiating from within, golden hour light creating a halo behind her, hyperrealistic skin texture, 8k" },
  { slug: "annie-walker",      prompt: "RAW DSLR photo 85mm f/1.8, gorgeous blonde woman late 20s, warm blue-green eyes, long blonde hair, wearing a fitted CIA fieldwork outfit that shows her athletic figure, bright natural charm concealing elite covert training, international cityscape bokeh behind, hyperrealistic skin texture, 8k" },

  // ── STAR WARS UNIVERSE ──
  { slug: "padm-amidala",      dir: "heroes", prompt: "RAW DSLR photo 85mm f/1.8, breathtakingly beautiful woman late 20s, dark olive skin, deep brown almond eyes, long dark hair in an elaborate updo with silver ornaments, wearing a structured deep crimson gown with gold embroidery revealing graceful neckline, regal posture with underlying sensuality, dramatic window light, skin pores visible, hyperrealistic, 8k, magazine editorial" },
  { slug: "leia-organa",       dir: "heroes", prompt: "RAW DSLR photo 85mm f/1.8, strikingly beautiful woman late 20s, warm skin tone, expressive brown eyes, dark brunette hair in twin braids coiled around her head, wearing a flowing white dress with draped neckline revealing graceful form, confident composed posture with natural sensuality, soft directional studio lighting, hyperrealistic skin texture, 8k" },
  { slug: "rey",               dir: "heroes", prompt: "RAW DSLR photo 85mm, gorgeous athletic woman mid 20s, sun-kissed tanned skin, hazel eyes, dark brunette hair in triple-bun style, wearing desert beige leather wrappings hugging her athletic figure, intense fierce expression with natural raw beauty, sand dunes bokeh, skin freckles visible, hyperrealistic, 8k" },
  { slug: "ahsoka-tano",       dir: "heroes", prompt: "RAW DSLR photo 85mm, breathtaking real woman with full theatrical stage makeup — matte pale orange skin foundation, intricate white geometric face tattoos, elegant cream prosthetic montrals and lekku, amber contacts, wearing sleek dark combat bodysuit, warrior confidence with exotic beauty, dramatic chiaroscuro studio lighting, hyperrealistic live-action quality, 8k" },
  { slug: "jyn-erso",          dir: "heroes", prompt: "RAW DSLR photo 85mm f/1.8, gorgeous British woman late 20s, fair skin with freckles, deep green eyes, messy brunette hair, wearing a worn olive military jacket over a fitted undershirt, gritty determined expression with raw beauty, ruined backdrop bokeh, hyperrealistic skin, 8k" },
  { slug: "sabine-wren",       dir: "heroes", prompt: "RAW DSLR photo 85mm, stunning East Asian woman early 20s, sharp dark eyes with smoky makeup, vibrant purple and teal dip-dyed short hair, wearing intricately hand-painted colorful armor pieces with a form-fitting underlayer showing her figure, fierce creative expression, neon-lit industrial backdrop bokeh, hyperrealistic skin, 8k" },
  { slug: "hera-syndulla",     dir: "heroes", prompt: "RAW DSLR photo 85mm, gorgeous woman with theatrical green body paint, warm amber contacts, long elegant prosthetic lekku, wearing an orange flight suit partially unzipped showing her curves, sensual commanding presence, sci-fi cockpit blurred behind, live-action practical effects quality, skin and body paint detail visible, hyperrealistic, 8k" },
  { slug: "bo-katan-kryze",    dir: "heroes", prompt: "RAW DSLR photo 85mm f/2, fierce gorgeous woman early 30s, striking auburn hair jaw-length, sharp blue eyes, wearing polished blue and gunmetal armor with mandalorian styling that follows her body, warrior queen bearing with smoldering intensity, dark dramatic backdrop with rim lighting, hyperrealistic skin and armor detail, 8k" },
  { slug: "asajj-ventress",    dir: "heroes", prompt: "RAW DSLR photo 85mm, menacing beautiful woman shaved head, pale porcelain skin, angular sharp features, cold silver-grey eyes with intense dark eye makeup, wearing a sleek black bodysuit with subtle armor, dangerous sensual expression, red atmospheric lighting, hyperrealistic flawless skin detail, 8k" },
  { slug: "aayla-secura",      dir: "heroes", prompt: "RAW DSLR photo 85mm, stunning woman with full electric blue theatrical body paint, violet contacts, long flowing blue prosthetic lekku draped over bare shoulders, wearing a minimal form-fitting warrior costume revealing toned figure, sensual fierce confident expression, electric blue rim lighting from behind, body paint and skin texture sharp, hyperrealistic, 8k" },
  { slug: "qira",              dir: "heroes", prompt: "RAW DSLR photo 85mm f/1.8, dangerously beautiful woman late 20s, flawless dark skin, smoldering dark eyes with subtle smoky makeup, wavy dark hair, wearing a sleek low-cut black satin dress revealing graceful curves, sophisticated and deadly expression, moody luxury interior bokeh, hyperrealistic skin pores, 8k" },
  { slug: "fennec-shand",      dir: "heroes", prompt: "RAW DSLR photo 85mm, stunning East Asian woman early 30s, sharp dark eyes, flawless skin, sleek black tactical bodysuit following her athletic figure, a small detailed cybernetic plate at her midriff, cool assassin expression with natural beauty, blue-silver rim lighting, dark industrial bokeh, hyperrealistic skin, 8k" },
  { slug: "mara-jade",         dir: "heroes", prompt: "RAW DSLR photo 85mm f/1.8, breathtakingly beautiful woman late 20s, striking auburn-copper waves past shoulders, fierce emerald eyes, fair skin, wearing a form-fitting dark bodysuit with minimal tactical accents, cold dangerous operative expression with smoldering beauty, chiaroscuro black background, hyperrealistic skin texture, 8k" },
];

async function generatePortrait(hero) {
  const dir = hero.dir === "villains" ? VILLAIN_DIR : OUT_DIR;
  const outPath = path.join(dir, `${hero.slug}.png`);

  const body = {
    model: "lustify-v7",
    prompt: hero.prompt,
    negative_prompt: NEG,
    width: 512,
    height: 680,
    steps: 20,
    safe_mode: false,
  };

  const res = await fetch(`${BASE_URL}/image/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status}: ${txt.slice(0, 200)}`);
  }

  const json = await res.json();
  const b64 = json.images?.[0];
  if (!b64) throw new Error(`No image returned for ${hero.slug}`);

  const buf = Buffer.from(b64, "base64");
  fs.writeFileSync(outPath, buf);
  return outPath;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generateWithRetry(hero, maxRetries = 6) {
  let delay = 8000;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await generatePortrait(hero);
    } catch (e) {
      if (e.message.includes("429") && attempt < maxRetries) {
        console.log(`  ⏳ ${hero.slug} rate-limited, waiting ${delay / 1000}s...`);
        await sleep(delay);
        delay = Math.min(delay * 1.5, 60000);
      } else {
        throw e;
      }
    }
  }
}

async function runBatch(heroes, concurrency = 2, delayBetween = 3000) {
  const results = { ok: [], fail: [] };
  let i = 0;

  async function worker() {
    while (i < heroes.length) {
      const hero = heroes[i++];
      try {
        const p = await generateWithRetry(hero);
        results.ok.push(hero.slug);
        console.log(`  ✓ ${hero.slug}`);
      } catch (e) {
        results.fail.push({ slug: hero.slug, err: e.message });
        console.error(`  ✗ ${hero.slug}: ${e.message}`);
      }
      await sleep(delayBetween);
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  return results;
}

console.log(`\n🎬 Venice AI Portrait Generator — lustify-v7 (uncensored)\n`);
console.log(`Generating ${HEROES.length} portraits...\n`);

const results = await runBatch(HEROES, 4);

console.log(`\n✅ Done: ${results.ok.length} succeeded, ${results.fail.length} failed`);
if (results.fail.length > 0) {
  console.log("Failed:", results.fail.map((f) => `${f.slug}: ${f.err}`).join("\n"));
}
