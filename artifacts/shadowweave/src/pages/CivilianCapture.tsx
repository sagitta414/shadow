import { useState, useRef, useEffect } from "react";
import MoodDial from "../components/MoodDial";
import StoryChoices from "../components/StoryChoices";
import PsycheMeter, { type PsycheEvent } from "../components/PsycheMeter";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Props { onBack: () => void; }

type Step = 1 | 2 | 3 | 4 | 5;

interface Profile {
  name: string; age: string;
  build: string; height: string; hairColor: string; hairStyle: string;
  eyeColor: string; skinTone: string; extraFeatures: string;
  appearanceDescription: string;
  outfit: string; outfitCondition: string;
  occupation: string; personality: string; whyTaken: string;
  greatestFear: string; relationship: string; extraDetails: string;
}

interface CaptorProfile {
  name: string; type: string; motivation: string;
  method: string; location: string; appearance: string;
}

const ACCENT = "#C084FC";
const RED    = "#DC2626";

function Pill({ label, active, color = ACCENT, onClick }: { label: string; active: boolean; color?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ padding: "0.4rem 0.9rem", background: active ? `${color}22` : "rgba(0,0,0,0.35)", border: `1px solid ${active ? `${color}88` : "rgba(255,255,255,0.07)"}`, borderRadius: "20px", color: active ? color : "rgba(200,195,215,0.4)", fontFamily: "'Raleway',sans-serif", fontSize: "0.72rem", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}>
      {label}
    </button>
  );
}

function SectionLabel({ children, color = ACCENT }: { children: React.ReactNode; color?: string }) {
  return <div style={{ fontSize: "0.56rem", fontFamily: "'Cinzel',serif", color, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "0.65rem" }}>{children}</div>;
}

function Card({ children, accent = ACCENT }: { children: React.ReactNode; accent?: string }) {
  return <div style={{ background: "rgba(0,0,0,0.45)", border: `1px solid ${accent}18`, borderRadius: "14px", padding: "1.25rem 1.5rem", marginBottom: "1rem" }}>{children}</div>;
}

function TextArea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "0.75rem 1rem", color: "#E8E8F5", fontFamily: "'Raleway',sans-serif", fontSize: "0.82rem", outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.55 }}
      onFocus={e => e.currentTarget.style.borderColor = `${ACCENT}55`}
      onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"} />
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "0.7rem 1rem", color: "#E8E8F5", fontFamily: "'Raleway',sans-serif", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }}
      onFocus={e => e.currentTarget.style.borderColor = `${ACCENT}55`}
      onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"} />
  );
}

const AGE_OPTIONS = ["18–22","23–27","28–32","33–38","39–45","46–52"];
const BUILD_OPTIONS = ["Petite","Slim","Athletic","Curvy","Tall & lean","Full-figured"];
const HEIGHT_OPTIONS = ["Short (5'0\"–5'3\")","Average (5'4\"–5'6\")","Tall (5'7\"+)"];
const HAIR_COLORS = ["Black","Dark brown","Light brown","Blonde","Platinum blonde","Red","Auburn","Grey/Silver"];
const HAIR_STYLES = ["Long & straight","Long & wavy","Long & curly","Medium length","Short bob","Pixie cut","Up / tied back","Thick & voluminous"];
const EYE_COLORS = ["Dark brown","Light brown","Blue","Green","Hazel","Grey","Amber"];
const SKIN_TONES = ["Fair / pale","Light","Medium / olive","Tan","Brown","Dark"];

const OUTFIT_OCCASIONS = ["Work / office","Casual / daytime","Night out","Sleeping / nightwear","Working out","Formal / dressed up","Running errands","On a date"];
const OUTFIT_BY_OCCASION: Record<string, string[]> = {
  "Work / office": ["Business suit","Smart blouse & skirt","Office dress","Smart trousers & blazer","Fitted sheath dress"],
  "Casual / daytime": ["Jeans & fitted top","Sundress","Leggings & hoodie","Shorts & tank","Casual midi dress"],
  "Night out": ["Short cocktail dress","Tight bodycon dress","Crop top & miniskirt","Wrap dress & heels","Satin slip dress"],
  "Sleeping / nightwear": ["Silk slip nightgown","Oversized t-shirt & underwear","Lace lingerie set","Pyjama shorts & top","Just underwear"],
  "Working out": ["Sports bra & leggings","Running shorts & top","Yoga pants & fitted top","Gym kit","Swimwear"],
  "Formal / dressed up": ["Evening gown","Formal midi dress","Cocktail dress","Tailored two-piece","Elegant jumpsuit"],
  "Running errands": ["Jeans & casual top","Yoga pants & jacket","Tracksuit","Sundress","Casual trousers & blouse"],
  "On a date": ["Fitted dress","Silk blouse & trousers","Wrap dress","Off-shoulder top & skirt","Smart-casual ensemble"],
};
const OUTFIT_CONDITIONS = ["Pristine — exactly as she wore it","Slightly disheveled from the struggle","Torn / damaged during capture","Partially removed"];

const OCCUPATIONS = ["Nurse / healthcare","Teacher","Lawyer","Journalist","Student","Waitress / hospitality","Office worker","Artist / designer","Police officer","Social worker","Personal trainer","Businesswoman","Doctor","Receptionist","Therapist / counsellor","Writer","Retail worker","Real estate agent","Flight attendant"];
const PERSONALITIES = ["Shy and quiet — easy to intimidate","Feisty and defiant — fights back","Intelligent and calculating — always thinking","Warm and trusting — her kindness is a weakness","Cold and guarded — hard to reach","Anxious and fragile — breaks under pressure","Composed and strong — hides her fear well","Sweet and naive — unprepared for this"];
const WHY_TAKEN = ["Wrong place, wrong time — random victim","She witnessed something she shouldn't have","He's been obsessed with her for a long time","Revenge — she hurt him, or someone he cared about","She has something he wants: information, access, leverage","Someone who knows her arranged this","She rejected him — this is his response","She owes him, or someone sent her as payment","She stumbled into his operation and knows too much"];
const FEARS = ["Physical pain — she can't handle it","Public humiliation and exposure","Losing someone she loves because of this","Being completely powerless and helpless","The psychological breaking — losing herself","Isolation and not being found","What he'll do to her body","Never getting out","Being forced to comply and hating that she did"];
const RELATIONSHIPS = ["Single, no one will miss her quickly","In a relationship — someone will notice","Married","Has children who need her","Close family who will search","Alone in the city, no one nearby","Just moved here — doesn't know many people"];

const CAPTOR_TYPES = ["Complete stranger / opportunist","Obsessive stalker — has watched her for months","Ex-partner who couldn't let go","Professional — this is what he does","Connected to someone she knows","Debt enforcer sent by someone above","A man of means with no one to answer to","Part of an organisation"];
const CAPTOR_MOTIVATIONS = ["Power and control — he needs this","To possess her specifically — obsession","Financial — ransom, or she has value","Revenge for something real or imagined","To break her spirit completely","She owes him and he's collecting","Sadistic pleasure in her fear","To make her need him eventually"];
const CAPTOR_METHODS = ["Cold and methodical — planned this precisely","Psychologically sophisticated — words are his tools","Brutal directness — he doesn't pretend","Seductive and manipulative — almost gentle until he isn't","Unpredictable — she never knows what comes next","Controlled and patient — he has all the time in the world"];
const CAPTOR_LOCATIONS = ["His private property — isolated, soundproofed","An abandoned industrial space","A vehicle — moving, no fixed point","Her own home — the most disorienting place","A purpose-built facility","A rented property with no neighbours","His office or workplace after hours","Multiple locations — she's moved regularly"];

async function trackComplete(base: string, wordCount: number, mode: string, isFirst: boolean) {
  try {
    await fetch(`${base}/api/story/track-complete`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ wordCount, mode, isFirst }) });
  } catch {}
}

async function streamRequest(endpoint: string, body: object, onChunk: (c: string) => void): Promise<string> {
  const res = await fetch(`${BASE}${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
  const reader = res.body.getReader(); const dec = new TextDecoder();
  let full = ""; let buf = "";
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n"); buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      try { const ev = JSON.parse(line.slice(5).trim()); if (ev.chunk) { full += ev.chunk; onChunk(ev.chunk); } if (ev.error) throw new Error(ev.error); } catch {}
    }
  }
  return full;
}

const EMPTY_PROFILE: Profile = {
  name: "", age: "", build: "", height: "", hairColor: "", hairStyle: "", eyeColor: "", skinTone: "", extraFeatures: "", appearanceDescription: "",
  outfit: "", outfitCondition: "",
  occupation: "", personality: "", whyTaken: "", greatestFear: "", relationship: "", extraDetails: "",
};
const EMPTY_CAPTOR: CaptorProfile = { name: "", type: "", motivation: "", method: "", location: "", appearance: "" };

export default function CivilianCapture({ onBack }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [captor, setCaptor] = useState<CaptorProfile>(EMPTY_CAPTOR);
  const [outfitOccasion, setOutfitOccasion] = useState("");
  const [outfitStyle, setOutfitStyle] = useState("");
  const [generatingAppearance, setGeneratingAppearance] = useState(false);
  const [appearanceError, setAppearanceError] = useState("");
  const [portrait, setPortrait] = useState<string | null>(null);
  const [generatingPortrait, setGeneratingPortrait] = useState(false);
  const [portraitError, setPortraitError] = useState("");
  const [storyLength, setStoryLength] = useState<"Quick Strike" | "Standard" | "Epic">("Standard");

  const [chapters, setChapters] = useState<string[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState("");
  const [moodLevel, setMoodLevel] = useState(50);
  const [continueDir, setContinueDir] = useState("");
  const [continuing, setContinuing] = useState(false);
  const [choices, setChoices] = useState<Array<{label: string; description: string}> | null>(null);
  const [loadingChoices, setLoadingChoices] = useState(false);
  const [psycheLog, setPsycheLog] = useState<PsycheEvent[]>([]);
  const psycheLogRef = useRef<PsycheEvent[]>([]);
  const psycheChapRef = useRef(0);
  useEffect(() => { psycheLogRef.current = psycheLog; }, [psycheLog]);
  useEffect(() => {
    if (chapters.length === 0) { psycheChapRef.current = 0; setPsycheLog([]); return; }
    if (chapters.length <= psycheChapRef.current) return;
    psycheChapRef.current = chapters.length;
    const ch = chapters[chapters.length - 1]; if (!ch?.trim()) return;
    const log = psycheLogRef.current;
    const s = Math.max(0, 100 + log.reduce((a, e) => a + e.sanityDelta, 0));
    const r = Math.max(0, 100 + log.reduce((a, e) => a + (e.resistanceDelta ?? 0), 0));
    fetch(`${BASE}/api/story/psyche-update`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chapterText: ch.slice(0, 2500), heroineName: profile.name || "her", currentSanity: s, currentResistance: r }) })
      .then(r => r.ok ? r.json() : null).then((d: PsycheEvent | null) => { if (d) setPsycheLog(p => [...p, d]); }).catch(() => {});
  }, [chapters]);
  const psycheSanity = Math.max(0, 100 + psycheLog.reduce((s, e) => s + e.sanityDelta, 0));
  const psycheResistance = Math.max(0, 100 + psycheLog.reduce((s, e) => s + (e.resistanceDelta ?? 0), 0));

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [streamText, chapters]);

  // LocalStorage persistence — save and restore draft
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cc_draft");
      if (saved) {
        const { p, c, oc, os, sl } = JSON.parse(saved);
        if (p) setProfile(p);
        if (c) setCaptor(c);
        if (oc) setOutfitOccasion(oc);
        if (os) setOutfitStyle(os);
        if (sl) setStoryLength(sl);
      }
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("cc_draft", JSON.stringify({ p: profile, c: captor, oc: outfitOccasion, os: outfitStyle, sl: storyLength })); } catch {}
  }, [profile, captor, outfitOccasion, outfitStyle, storyLength]);

  function setP<K extends keyof Profile>(k: K, v: Profile[K]) { setProfile(p => ({ ...p, [k]: v })); }
  function setC<K extends keyof CaptorProfile>(k: K, v: CaptorProfile[K]) { setCaptor(c => ({ ...c, [k]: v })); }

  function quickFill() {
    const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
    setProfile({
      name: "", age: pick(AGE_OPTIONS), build: pick(BUILD_OPTIONS), height: pick(HEIGHT_OPTIONS),
      hairColor: pick(HAIR_COLORS), hairStyle: pick(HAIR_STYLES), eyeColor: pick(EYE_COLORS), skinTone: pick(SKIN_TONES),
      extraFeatures: "", appearanceDescription: "",
      outfit: "", outfitCondition: pick(OUTFIT_CONDITIONS),
      occupation: pick(OCCUPATIONS), personality: pick(PERSONALITIES),
      whyTaken: pick(WHY_TAKEN), greatestFear: pick(FEARS),
      relationship: pick(RELATIONSHIPS), extraDetails: "",
    });
    const occ = pick(OUTFIT_OCCASIONS);
    setOutfitOccasion(occ);
    setOutfitStyle(pick(OUTFIT_BY_OCCASION[occ] ?? []));
    setCaptor({
      name: "", type: pick(CAPTOR_TYPES), motivation: pick(CAPTOR_MOTIVATIONS),
      method: pick(CAPTOR_METHODS), location: pick(CAPTOR_LOCATIONS), appearance: "",
    });
    setPortrait(null);
  }

  async function generatePortrait() {
    if (!profile.appearanceDescription.trim()) return;
    setGeneratingPortrait(true); setPortraitError("");
    try {
      const res = await fetch(`${BASE}/api/story/civilian-portrait`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appearanceDescription: profile.appearanceDescription, name: profile.name }),
      });
      const data = await res.json();
      if (data.imageBase64) setPortrait(data.imageBase64);
      else throw new Error(data.error || "No image");
    } catch (e) { setPortraitError(e instanceof Error ? e.message : "Portrait failed"); }
    finally { setGeneratingPortrait(false); }
  }

  async function generateAppearance() {
    setGeneratingAppearance(true); setAppearanceError("");
    try {
      const res = await fetch(`${BASE}/api/story/generate-appearance`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ build: profile.build, height: profile.height, hairColor: profile.hairColor, hairStyle: profile.hairStyle, eyeColor: profile.eyeColor, skinTone: profile.skinTone, age: profile.age, extras: profile.extraFeatures }),
      });
      const data = await res.json();
      if (data.description) setP("appearanceDescription", data.description);
      else throw new Error("No description returned");
    } catch (e) {
      setAppearanceError(e instanceof Error ? e.message : "Generation failed");
    } finally { setGeneratingAppearance(false); }
  }

  async function generateStory() {
    setStep(5); setStreaming(true); setStreamText(""); setChapters([]); setError(""); setPsycheLog([]);
    try {
      const outfitFull = [outfitStyle || profile.outfit, profile.outfitCondition].filter(Boolean).join(" — ");
      const full = await streamRequest("/api/story/civilian-capture", {
        profile: { ...profile, outfit: outfitFull },
        captor,
        storyLength,
      }, c => setStreamText(p => p + c));
      setChapters([full]); setStreamText("");
      void trackComplete(BASE, full.split(/\s+/).filter(Boolean).length, "civilian-capture", true);
      await fetchChoices(full);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setStreaming(false); }
  }

  async function continueStory() {
    setContinuing(true); setStreamText(""); setChoices(null);
    try {
      const outfitFull = [outfitStyle || profile.outfit, profile.outfitCondition].filter(Boolean).join(" — ");
      const full = await streamRequest("/api/story/civilian-continue", {
        profile: { ...profile, outfit: outfitFull },
        captor, previousChapters: chapters.join("\n\n---\n\n"),
        direction: continueDir.trim() || undefined,
        chapterNumber: chapters.length + 1,
        moodLevel,
      }, c => setStreamText(p => p + c));
      setChapters(p => [...p, full]); setStreamText(""); setContinueDir("");
      void trackComplete(BASE, full.split(/\s+/).filter(Boolean).length, "civilian-continue", false);
      await fetchChoices(full);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setContinuing(false); }
  }

  async function fetchChoices(excerpt?: string) {
    setLoadingChoices(true); setChoices(null);
    try {
      const res = await fetch(`${BASE}/api/story/choices`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroine: profile.name || "her", villain: captor.name || "him", storyExcerpt: excerpt || chapters[chapters.length - 1] || "" }),
      });
      const data = await res.json();
      if (Array.isArray(data.choices)) setChoices(data.choices);
    } catch {}
    finally { setLoadingChoices(false); }
  }

  const canProceed1 = profile.appearanceDescription.trim().length > 20;
  const canProceed2 = (outfitStyle || profile.outfit).trim().length > 0;
  const canProceed3 = profile.occupation.trim().length > 0 && profile.personality.length > 0 && profile.whyTaken.length > 0;
  const canProceed4 = captor.type.length > 0 && captor.motivation.length > 0;

  const STEP_LABELS = ["HER APPEARANCE","HER OUTFIT","HER BACKGROUND","THE CAPTOR","THE STORY"];

  return (
    <div style={{ minHeight: "100vh", background: "rgba(4,0,10,0.98)", padding: step === 5 ? 0 : "1.5rem 1rem" }}>
      <style>{`@keyframes cc-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} @keyframes cc-pulse{0%,100%{opacity:0.6}50%{opacity:1}} @keyframes cc-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {/* STEP 1–4: setup wizard */}
      {step < 5 && (
        <div style={{ maxWidth: "780px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(200,195,215,0.3)", cursor: "pointer", fontFamily: "'Montserrat',sans-serif", fontSize: "0.7rem", letterSpacing: "1.5px", padding: 0 }}>← BACK</button>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <button onClick={quickFill} style={{ padding: "0.4rem 1rem", background: `${ACCENT}14`, border: `1px solid ${ACCENT}33`, borderRadius: "20px", color: ACCENT, fontFamily: "'Montserrat',sans-serif", fontSize: "0.58rem", fontWeight: 700, letterSpacing: "2px", cursor: "pointer", transition: "all 0.2s" }} title="Randomly fill all fields">⚡ QUICK BUILD</button>
              <button onClick={() => { setProfile(EMPTY_PROFILE); setCaptor(EMPTY_CAPTOR); setOutfitOccasion(""); setOutfitStyle(""); setPortrait(null); try { localStorage.removeItem("cc_draft"); } catch {} }} style={{ padding: "0.4rem 0.8rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", color: "rgba(200,195,215,0.25)", fontFamily: "'Montserrat',sans-serif", fontSize: "0.55rem", letterSpacing: "1.5px", cursor: "pointer" }}>↺ RESET</button>
            </div>
          </div>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ fontSize: "0.5rem", color: `${ACCENT}55`, letterSpacing: "5px", fontFamily: "'Montserrat',sans-serif", textTransform: "uppercase", marginBottom: "0.4rem" }}>CUSTOM SCENARIO</div>
            <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: "1.9rem", color: ACCENT, fontWeight: 900, letterSpacing: "4px", textTransform: "uppercase", margin: "0 0 0.5rem" }}>Civilian Capture</h1>
            <p style={{ fontSize: "0.72rem", color: "rgba(200,195,215,0.35)", fontFamily: "'Raleway',sans-serif" }}>Build her from scratch. A real person — no powers. Pure human vulnerability.</p>
          </div>

          {/* Step indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: "2rem", justifyContent: "center" }}>
            {STEP_LABELS.slice(0, 4).map((label, i) => {
              const n = (i + 1) as Step;
              const done = step > n;
              const active = step === n;
              return (
                <div key={n} style={{ display: "flex", alignItems: "center" }}>
                  <button onClick={() => { if (done) setStep(n); }} disabled={!done && !active} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem", background: "none", border: "none", cursor: done ? "pointer" : "default", padding: "0 0.5rem" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: done ? `${ACCENT}33` : active ? `${ACCENT}22` : "rgba(0,0,0,0.4)", border: `2px solid ${done || active ? ACCENT : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}>
                      <span style={{ fontSize: "0.6rem", fontFamily: "'Cinzel',serif", color: done || active ? ACCENT : "rgba(200,195,215,0.2)", fontWeight: 700 }}>{done ? "✓" : n}</span>
                    </div>
                    <span style={{ fontSize: "0.38rem", fontFamily: "'Montserrat',sans-serif", letterSpacing: "1px", color: active ? ACCENT : done ? `${ACCENT}88` : "rgba(200,195,215,0.15)", textTransform: "uppercase", whiteSpace: "nowrap" }}>{label}</span>
                  </button>
                  {i < 3 && <div style={{ width: "30px", height: "1px", background: step > n ? `${ACCENT}44` : "rgba(255,255,255,0.05)", marginBottom: "18px" }} />}
                </div>
              );
            })}
          </div>

          {/* ── STEP 1: APPEARANCE ── */}
          {step === 1 && (
            <div style={{ animation: "cc-rise 0.4s ease both" }}>
              <Card>
                <SectionLabel>Name & Age</SectionLabel>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                  <div>
                    <div style={{ fontSize: "0.56rem", color: "rgba(200,195,215,0.3)", fontFamily: "'Montserrat',sans-serif", letterSpacing: "1.5px", marginBottom: "0.4rem" }}>HER NAME (optional)</div>
                    <TextInput value={profile.name} onChange={v => setP("name", v)} placeholder="Leave blank for 'she'…" />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.56rem", color: "rgba(200,195,215,0.3)", fontFamily: "'Montserrat',sans-serif", letterSpacing: "1.5px", marginBottom: "0.4rem" }}>AGE</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                      {AGE_OPTIONS.map(a => <Pill key={a} label={a} active={profile.age === a} onClick={() => setP("age", a)} />)}
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <SectionLabel>Physical Build</SectionLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.75rem" }}>
                  {BUILD_OPTIONS.map(b => <Pill key={b} label={b} active={profile.build === b} onClick={() => setP("build", b)} />)}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                  {HEIGHT_OPTIONS.map(h => <Pill key={h} label={h} active={profile.height === h} onClick={() => setP("height", h)} />)}
                </div>
              </Card>

              <Card>
                <SectionLabel>Hair</SectionLabel>
                <div style={{ marginBottom: "0.6rem" }}>
                  <div style={{ fontSize: "0.5rem", color: "rgba(200,195,215,0.25)", fontFamily: "'Montserrat',sans-serif", letterSpacing: "1px", marginBottom: "0.3rem" }}>COLOR</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                    {HAIR_COLORS.map(c => <Pill key={c} label={c} active={profile.hairColor === c} onClick={() => setP("hairColor", c)} />)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.5rem", color: "rgba(200,195,215,0.25)", fontFamily: "'Montserrat',sans-serif", letterSpacing: "1px", marginBottom: "0.3rem" }}>STYLE</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                    {HAIR_STYLES.map(s => <Pill key={s} label={s} active={profile.hairStyle === s} onClick={() => setP("hairStyle", s)} />)}
                  </div>
                </div>
              </Card>

              <Card>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <SectionLabel>Eyes</SectionLabel>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                      {EYE_COLORS.map(e => <Pill key={e} label={e} active={profile.eyeColor === e} onClick={() => setP("eyeColor", e)} />)}
                    </div>
                  </div>
                  <div>
                    <SectionLabel>Skin Tone</SectionLabel>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                      {SKIN_TONES.map(s => <Pill key={s} label={s} active={profile.skinTone === s} onClick={() => setP("skinTone", s)} />)}
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <SectionLabel>Notable Features (optional)</SectionLabel>
                <TextInput value={profile.extraFeatures} onChange={v => setP("extraFeatures", v)} placeholder="Tattoos, scars, dimples, freckles, distinctive features…" />
              </Card>

              {/* AI generate button */}
              <div style={{ marginBottom: "1rem", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                <button onClick={generateAppearance} disabled={generatingAppearance} style={{ padding: "0.65rem 1.4rem", background: `${ACCENT}22`, border: `1px solid ${ACCENT}55`, borderRadius: "10px", color: ACCENT, fontFamily: "'Cinzel',serif", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "2px", cursor: "pointer", flexShrink: 0, opacity: generatingAppearance ? 0.6 : 1, transition: "all 0.2s" }}>
                  {generatingAppearance ? "GENERATING…" : "✦ GENERATE WITH AI"}
                </button>
                <div style={{ fontSize: "0.6rem", color: "rgba(200,195,215,0.25)", fontFamily: "'Raleway',sans-serif", lineHeight: 1.5, paddingTop: "0.2rem" }}>
                  Select your attributes above, then let the AI write a rich prose description — or write your own below.
                </div>
              </div>
              {appearanceError && <div style={{ color: "#F87171", fontSize: "0.65rem", marginBottom: "0.6rem" }}>{appearanceError}</div>}

              <Card>
                <SectionLabel>Her Appearance — Description</SectionLabel>
                <TextArea value={profile.appearanceDescription} onChange={v => { setP("appearanceDescription", v); setPortrait(null); }} placeholder="Write or edit her appearance here… The AI will use this throughout the story to make her feel completely real." rows={5} />
                {profile.appearanceDescription.trim().length > 0 && <div style={{ marginTop: "0.5rem", fontSize: "0.58rem", color: `${ACCENT}88`, fontFamily: "'Raleway',sans-serif" }}>✓ Description ready — {profile.appearanceDescription.trim().length} characters</div>}
              </Card>

              {/* Portrait */}
              {profile.appearanceDescription.trim().length > 20 && (
                <Card>
                  <SectionLabel>AI Portrait (optional)</SectionLabel>
                  <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
                    {portrait ? (
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <img src={`data:image/png;base64,${portrait}`} alt="Character portrait" style={{ width: "120px", height: "160px", objectFit: "cover", borderRadius: "10px", border: `1px solid ${ACCENT}33` }} />
                        <button onClick={() => setPortrait(null)} style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.7)", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: "0.55rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                      </div>
                    ) : (
                      <div style={{ width: "120px", height: "160px", borderRadius: "10px", border: `1px dashed ${ACCENT}22`, background: "rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.4rem", flexShrink: 0 }}>
                        {generatingPortrait ? (
                          <>
                            <div style={{ width: "28px", height: "28px", borderRadius: "50%", border: `2px solid ${ACCENT}44`, borderTop: `2px solid ${ACCENT}`, animation: "cc-spin 1s linear infinite" }} />
                            <span style={{ fontSize: "0.5rem", color: `${ACCENT}66`, fontFamily: "'Montserrat',sans-serif" }}>generating…</span>
                          </>
                        ) : (
                          <span style={{ fontSize: "1.5rem", opacity: 0.2 }}>👤</span>
                        )}
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "0.65rem", color: "rgba(200,195,215,0.35)", fontFamily: "'Raleway',sans-serif", lineHeight: 1.55, margin: "0 0 0.75rem" }}>
                        Generate an AI portrait from her appearance description. Used in the story header and dossier. Takes ~15 seconds.
                      </p>
                      <button onClick={generatePortrait} disabled={generatingPortrait || !profile.appearanceDescription.trim()} style={{ padding: "0.55rem 1.2rem", background: portrait ? "rgba(0,0,0,0.3)" : `${ACCENT}18`, border: `1px solid ${portrait ? "rgba(255,255,255,0.08)" : `${ACCENT}44`}`, borderRadius: "10px", color: portrait ? "rgba(200,195,215,0.3)" : ACCENT, fontFamily: "'Cinzel',serif", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "2px", cursor: "pointer", opacity: generatingPortrait ? 0.6 : 1 }}>
                        {generatingPortrait ? "GENERATING…" : portrait ? "✓ REGENERATE" : "GENERATE PORTRAIT"}
                      </button>
                      {portraitError && <div style={{ marginTop: "0.5rem", fontSize: "0.6rem", color: "#F87171", fontFamily: "'Raleway',sans-serif" }}>{portraitError}</div>}
                    </div>
                  </div>
                </Card>
              )}

              <button onClick={() => setStep(2)} disabled={!canProceed1} style={{ width: "100%", padding: "0.9rem", background: canProceed1 ? `${ACCENT}22` : "rgba(0,0,0,0.3)", border: `1px solid ${canProceed1 ? `${ACCENT}55` : "rgba(255,255,255,0.06)"}`, borderRadius: "12px", color: canProceed1 ? ACCENT : "rgba(200,195,215,0.2)", fontFamily: "'Cinzel',serif", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "3px", cursor: canProceed1 ? "pointer" : "not-allowed", transition: "all 0.2s" }}>
                CONTINUE — HER OUTFIT →
              </button>
            </div>
          )}

          {/* ── STEP 2: OUTFIT ── */}
          {step === 2 && (
            <div style={{ animation: "cc-rise 0.4s ease both" }}>
              <Card>
                <SectionLabel>What was she doing when taken?</SectionLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "1rem" }}>
                  {OUTFIT_OCCASIONS.map(o => <Pill key={o} label={o} active={outfitOccasion === o} onClick={() => { setOutfitOccasion(o); setOutfitStyle(""); }} />)}
                </div>
                {outfitOccasion && (
                  <>
                    <SectionLabel color="rgba(200,195,215,0.4)">What was she wearing?</SectionLabel>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.75rem" }}>
                      {(OUTFIT_BY_OCCASION[outfitOccasion] || []).map(o => <Pill key={o} label={o} active={outfitStyle === o} onClick={() => setOutfitStyle(o)} />)}
                    </div>
                  </>
                )}
                <div style={{ marginTop: "0.75rem" }}>
                  <div style={{ fontSize: "0.5rem", color: "rgba(200,195,215,0.25)", fontFamily: "'Montserrat',sans-serif", letterSpacing: "1.5px", marginBottom: "0.4rem" }}>OR DESCRIBE EXACTLY</div>
                  <TextInput value={profile.outfit} onChange={v => setP("outfit", v)} placeholder="e.g. Dark jeans, a white silk blouse, nude heels. Office-appropriate but fitted." />
                </div>
              </Card>

              <Card>
                <SectionLabel>Condition of her clothing</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  {OUTFIT_CONDITIONS.map(c => <Pill key={c} label={c} active={profile.outfitCondition === c} onClick={() => setP("outfitCondition", c)} />)}
                </div>
              </Card>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button onClick={() => setStep(1)} style={{ flex: "0 0 auto", padding: "0.9rem 1.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", color: "rgba(200,195,215,0.3)", fontFamily: "'Cinzel',serif", fontSize: "0.72rem", cursor: "pointer" }}>← BACK</button>
                <button onClick={() => setStep(3)} disabled={!canProceed2} style={{ flex: 1, padding: "0.9rem", background: canProceed2 ? `${ACCENT}22` : "rgba(0,0,0,0.3)", border: `1px solid ${canProceed2 ? `${ACCENT}55` : "rgba(255,255,255,0.06)"}`, borderRadius: "12px", color: canProceed2 ? ACCENT : "rgba(200,195,215,0.2)", fontFamily: "'Cinzel',serif", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "3px", cursor: canProceed2 ? "pointer" : "not-allowed", transition: "all 0.2s" }}>
                  CONTINUE — HER BACKGROUND →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: BACKGROUND ── */}
          {step === 3 && (
            <div style={{ animation: "cc-rise 0.4s ease both" }}>
              <Card>
                <SectionLabel>Her Occupation</SectionLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.75rem" }}>
                  {OCCUPATIONS.map(o => <Pill key={o} label={o} active={profile.occupation === o} onClick={() => setP("occupation", o)} />)}
                </div>
                <TextInput value={profile.occupation} onChange={v => setP("occupation", v)} placeholder="Or type a custom occupation…" />
              </Card>

              <Card>
                <SectionLabel>Her Personality</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  {PERSONALITIES.map(p => <Pill key={p} label={p} active={profile.personality === p} onClick={() => setP("personality", p)} />)}
                </div>
              </Card>

              <Card>
                <SectionLabel>Why Was She Taken?</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  {WHY_TAKEN.map(w => <Pill key={w} label={w} active={profile.whyTaken === w} onClick={() => setP("whyTaken", w)} />)}
                </div>
              </Card>

              <Card>
                <SectionLabel>Her Greatest Fear</SectionLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.75rem" }}>
                  {FEARS.map(f => <Pill key={f} label={f} active={profile.greatestFear === f} onClick={() => setP("greatestFear", f)} />)}
                </div>
              </Card>

              <Card>
                <SectionLabel>Relationship Status</SectionLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                  {RELATIONSHIPS.map(r => <Pill key={r} label={r} active={profile.relationship === r} onClick={() => setP("relationship", r)} />)}
                </div>
              </Card>

              <Card>
                <SectionLabel>Extra details that make her real (optional)</SectionLabel>
                <TextArea value={profile.extraDetails} onChange={v => setP("extraDetails", v)} placeholder="Anything else: what she was doing when taken, a specific habit, something about her life, a detail that matters to you…" rows={3} />
              </Card>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button onClick={() => setStep(2)} style={{ flex: "0 0 auto", padding: "0.9rem 1.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", color: "rgba(200,195,215,0.3)", fontFamily: "'Cinzel',serif", fontSize: "0.72rem", cursor: "pointer" }}>← BACK</button>
                <button onClick={() => setStep(4)} disabled={!canProceed3} style={{ flex: 1, padding: "0.9rem", background: canProceed3 ? `${ACCENT}22` : "rgba(0,0,0,0.3)", border: `1px solid ${canProceed3 ? `${ACCENT}55` : "rgba(255,255,255,0.06)"}`, borderRadius: "12px", color: canProceed3 ? ACCENT : "rgba(200,195,215,0.2)", fontFamily: "'Cinzel',serif", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "3px", cursor: canProceed3 ? "pointer" : "not-allowed", transition: "all 0.2s" }}>
                  CONTINUE — THE CAPTOR →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: CAPTOR ── */}
          {step === 4 && (
            <div style={{ animation: "cc-rise 0.4s ease both" }}>

              {/* Her dossier review card */}
              <div style={{ background: "rgba(0,0,0,0.55)", border: `1px solid ${ACCENT}20`, borderRadius: "14px", padding: "1.1rem 1.4rem", marginBottom: "1rem", display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
                {portrait && <img src={`data:image/png;base64,${portrait}`} alt="Portrait" style={{ width: "72px", height: "96px", objectFit: "cover", borderRadius: "8px", border: `1px solid ${ACCENT}33`, flexShrink: 0 }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.48rem", fontFamily: "'Cinzel',serif", color: ACCENT, letterSpacing: "3px", textTransform: "uppercase", marginBottom: "0.6rem" }}>Her Profile — Review</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.35rem 1.5rem" }}>
                    {[
                      { label: "Name", value: profile.name || "Unnamed" },
                      { label: "Age", value: profile.age || "—" },
                      { label: "Build", value: [profile.build, profile.height].filter(Boolean).join(", ") || "—" },
                      { label: "Hair", value: [profile.hairColor, profile.hairStyle].filter(Boolean).join(", ") || "—" },
                      { label: "Eyes", value: profile.eyeColor || "—" },
                      { label: "Skin", value: profile.skinTone || "—" },
                      { label: "Occupation", value: profile.occupation || "—" },
                      { label: "Personality", value: profile.personality ? profile.personality.split("—")[0].trim() : "—" },
                      { label: "Why taken", value: profile.whyTaken ? profile.whyTaken.split("—")[0].slice(0, 38) + "…" : "—" },
                      { label: "Greatest fear", value: profile.greatestFear ? profile.greatestFear.split("—")[0].slice(0, 38) : "—" },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ display: "flex", gap: "0.4rem", alignItems: "baseline" }}>
                        <span style={{ fontSize: "0.45rem", fontFamily: "'Montserrat',sans-serif", fontWeight: 700, letterSpacing: "1.5px", color: `${ACCENT}55`, textTransform: "uppercase", whiteSpace: "nowrap" }}>{label}</span>
                        <span style={{ fontSize: "0.62rem", fontFamily: "'Raleway',sans-serif", color: "rgba(200,195,215,0.55)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setStep(1)} style={{ marginTop: "0.75rem", padding: "0.25rem 0.75rem", background: "none", border: `1px solid ${ACCENT}22`, borderRadius: "20px", color: `${ACCENT}66`, fontFamily: "'Montserrat',sans-serif", fontSize: "0.5rem", letterSpacing: "1.5px", cursor: "pointer" }}>EDIT PROFILE</button>
                </div>
              </div>

              <Card accent={RED}>
                <SectionLabel color={RED}>His Name (optional)</SectionLabel>
                <TextInput value={captor.name} onChange={v => setC("name", v)} placeholder="Leave blank for 'he'…" />
              </Card>

              <Card accent={RED}>
                <SectionLabel color={RED}>What Kind of Man Is He?</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  {CAPTOR_TYPES.map(t => <Pill key={t} label={t} active={captor.type === t} color={RED} onClick={() => setC("type", t)} />)}
                </div>
              </Card>

              <Card accent={RED}>
                <SectionLabel color={RED}>What Does He Want From Her?</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  {CAPTOR_MOTIVATIONS.map(m => <Pill key={m} label={m} active={captor.motivation === m} color={RED} onClick={() => setC("motivation", m)} />)}
                </div>
              </Card>

              <Card accent={RED}>
                <SectionLabel color={RED}>His Approach</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  {CAPTOR_METHODS.map(m => <Pill key={m} label={m} active={captor.method === m} color={RED} onClick={() => setC("method", m)} />)}
                </div>
              </Card>

              <Card accent={RED}>
                <SectionLabel color={RED}>Where Does He Have Her?</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  {CAPTOR_LOCATIONS.map(l => <Pill key={l} label={l} active={captor.location === l} color={RED} onClick={() => setC("location", l)} />)}
                </div>
              </Card>

              <Card accent={RED}>
                <SectionLabel color={RED}>What Does He Look Like? (optional)</SectionLabel>
                <TextArea value={captor.appearance} onChange={v => setC("appearance", v)} placeholder="Physical description, how he carries himself, what she notices first about him…" rows={2} />
              </Card>

              {/* Story length selector */}
              <div style={{ marginBottom: "1rem", padding: "1rem 1.4rem", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px" }}>
                <div style={{ fontSize: "0.48rem", fontFamily: "'Cinzel',serif", color: "rgba(200,195,215,0.35)", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "0.75rem" }}>Story Length</div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {(["Quick Strike","Standard","Epic"] as const).map(l => (
                    <button key={l} onClick={() => setStoryLength(l)} style={{ flex: 1, padding: "0.65rem 0.5rem", background: storyLength === l ? "rgba(220,38,38,0.15)" : "rgba(0,0,0,0.35)", border: `1px solid ${storyLength === l ? RED+"66" : "rgba(255,255,255,0.06)"}`, borderRadius: "10px", color: storyLength === l ? "#FCA5A5" : "rgba(200,195,215,0.3)", fontFamily: "'Cinzel',serif", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "1.5px", cursor: "pointer", transition: "all 0.2s" }}>
                      {l === "Quick Strike" ? "⚡ Quick Strike" : l === "Standard" ? "◆ Standard" : "★ Epic"}
                      <div style={{ fontSize: "0.42rem", fontFamily: "'Raleway',sans-serif", fontWeight: 400, marginTop: "0.2rem", color: storyLength === l ? "#FCA5A555" : "rgba(200,195,215,0.15)", letterSpacing: "0.5px" }}>
                        {l === "Quick Strike" ? "3–4 paragraphs" : l === "Standard" ? "5–7 paragraphs" : "9–10 paragraphs"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button onClick={() => setStep(3)} style={{ flex: "0 0 auto", padding: "0.9rem 1.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", color: "rgba(200,195,215,0.3)", fontFamily: "'Cinzel',serif", fontSize: "0.72rem", cursor: "pointer" }}>← BACK</button>
                <button onClick={generateStory} disabled={!canProceed4} style={{ flex: 1, padding: "0.9rem", background: canProceed4 ? `linear-gradient(135deg, ${RED}cc, #7f1d1d)` : "rgba(0,0,0,0.3)", border: `1px solid ${canProceed4 ? RED : "rgba(255,255,255,0.06)"}`, borderRadius: "12px", color: canProceed4 ? "#FFF5F5" : "rgba(200,195,215,0.2)", fontFamily: "'Cinzel',serif", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "3px", cursor: canProceed4 ? "pointer" : "not-allowed", transition: "all 0.2s", boxShadow: canProceed4 ? `0 8px 32px ${RED}33` : "none" }}>
                  BEGIN THE STORY →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 5: STORY ── */}
      {step === 5 && (
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "1.5rem 1rem 4rem" }}>
          {/* Story header */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.75rem" }}>
            <button onClick={() => setStep(4)} style={{ background: "none", border: "none", color: "rgba(200,195,215,0.3)", cursor: "pointer", fontFamily: "'Montserrat',sans-serif", fontSize: "0.65rem", letterSpacing: "1.5px", padding: 0, flexShrink: 0 }}>← EDIT</button>
            {portrait && <img src={`data:image/png;base64,${portrait}`} alt={profile.name || "Heroine"} style={{ width: "44px", height: "58px", objectFit: "cover", borderRadius: "7px", border: `1px solid ${ACCENT}33`, flexShrink: 0 }} />}
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.8rem", color: ACCENT, letterSpacing: "3px", textTransform: "uppercase" }}>
                {profile.name || "Her"} — {captor.name || "The Captor"}
              </div>
              <div style={{ fontSize: "0.55rem", color: "rgba(200,195,215,0.2)", fontFamily: "'Raleway',sans-serif", marginTop: "0.2rem" }}>{[captor.location, storyLength !== "Standard" ? storyLength : ""].filter(Boolean).join(" · ")}</div>
            </div>
            <div style={{ padding: "0.2rem 0.6rem", borderRadius: "6px", background: "rgba(192,132,252,0.1)", border: `1px solid ${ACCENT}33`, fontSize: "0.48rem", fontFamily: "'Montserrat',sans-serif", color: ACCENT, letterSpacing: "1.5px" }}>CH. {chapters.length + (streaming ? 1 : 0)}</div>
          </div>

          {/* PsycheMeter */}
          {psycheLog.length > 0 && <PsycheMeter sanity={psycheSanity} resistance={psycheResistance} log={psycheLog} heroineName={profile.name || "Her"} />}

          {/* Chapters */}
          {chapters.map((ch, i) => (
            <div key={i} style={{ marginBottom: "2rem" }}>
              {i > 0 && <div style={{ textAlign: "center", fontSize: "0.45rem", color: "rgba(200,195,215,0.1)", fontFamily: "'Cinzel',serif", letterSpacing: "4px", margin: "1.5rem 0" }}>— CHAPTER {i + 1} —</div>}
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.95rem", color: "rgba(220,215,245,0.75)", lineHeight: 1.85, whiteSpace: "pre-wrap" }}>{ch}</div>
            </div>
          ))}

          {/* Streaming text */}
          {(streaming || continuing) && (
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.95rem", color: "rgba(220,215,245,0.75)", lineHeight: 1.85, whiteSpace: "pre-wrap" }}>
              {streamText}
              <span style={{ animation: "cc-pulse 0.9s infinite", color: ACCENT }}>▌</span>
            </div>
          )}

          {error && <div style={{ padding: "0.75rem 1rem", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.25)", borderRadius: "10px", color: "#F87171", fontSize: "0.75rem", fontFamily: "'Raleway',sans-serif", marginTop: "1rem" }}>⚠ {error}</div>}

          {/* Choices */}
          {!streaming && !continuing && choices && choices.length > 0 && (
            <div style={{ marginTop: "1.5rem" }}>
              <StoryChoices
                choices={choices} loading={loadingChoices}
                heroineColor={ACCENT}
                onChoose={c => { setContinueDir(c.description || c.label); setChoices(null); continueStory(); }}
                onSkip={() => setChoices(null)}
              />
            </div>
          )}

          {/* Continue controls */}
          {!streaming && chapters.length > 0 && (
            <div style={{ marginTop: "2rem", padding: "1.25rem 1.5rem", background: "rgba(0,0,0,0.45)", border: `1px solid ${ACCENT}18`, borderRadius: "16px" }}>
              <div style={{ fontSize: "0.52rem", fontFamily: "'Cinzel',serif", color: ACCENT, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "0.75rem" }}>Continue The Story</div>
              <MoodDial value={moodLevel} onChange={setMoodLevel} />
              <div style={{ marginTop: "0.75rem" }}>
                <TextArea value={continueDir} onChange={setContinueDir} placeholder="Direction for the next chapter (optional)…" rows={2} />
              </div>
              <button onClick={continueStory} disabled={continuing} style={{ marginTop: "0.75rem", width: "100%", padding: "0.85rem", background: `${ACCENT}22`, border: `1px solid ${ACCENT}55`, borderRadius: "10px", color: ACCENT, fontFamily: "'Cinzel',serif", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "2.5px", cursor: "pointer", transition: "all 0.2s", opacity: continuing ? 0.6 : 1 }}>
                {continuing ? "WRITING…" : "CONTINUE →"}
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
