import { useState } from "react";
import VillainMemoryPanel from "../components/VillainMemoryPanel";
import StoryIntro from "../components/StoryIntro";
import CinematicReader from "../components/CinematicReader";
import StoryChoices from "../components/StoryChoices";
import MoodDial from "../components/MoodDial";
import StoryDebrief from "../components/StoryDebrief";
import PromptPreview from "../components/PromptPreview";
import VillainDossier from "../components/VillainDossier";
import { saveToArchive } from "../lib/archive";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const COLOR = "#7C3AED";

const HEROINES = ["Wonder Woman","Black Widow","Scarlet Witch","Supergirl","Storm","Rogue","Psylocke","Jean Grey","Zatanna","Power Girl","She-Hulk","Tigra","Invisible Woman","Wasp","Silk","Spider-Gwen","Mary Jane Watson","Starfire","Raven","Batgirl"];
const VILLAINS = ["Loki","Ra's al Ghul","Baron Zemo","Mysterio","The Joker","Bane","Magneto","Kingpin","Green Goblin","Doctor Doom","Deathstroke","Red Skull","Ultron","Thanos","The Riddler","Gorilla Grodd","Prometheus","Black Manta","Cheetah","Circe"];
const SETTINGS = ["A private estate hidden in the Alps","An island fortress in international waters","An underground laboratory","A gothic mansion on the moors","A penthouse above a city skyline","A baroque castle in Eastern Europe","An arctic research station","A decommissioned submarine base","A remote mountain lodge","A palazzo in Venice — sealed off from the outside world"];
const DURATIONS = ["3 Days","5 Days","One Week","Two Weeks","One Month"];

interface DossierData {
  weaknessesDiscovered: string[];
  leverageGained: string[];
  resistanceLevel: "High"|"Moderate"|"Low"|"Broken";
  psychologicalProfile: string;
  physicalNotes: string;
  handlingRecommendations: string;
  fieldNote: string;
}

export default function SlowBurnMode() {
  const [step, setStep] = useState<"setup"|"intro"|"reading"|"done">("setup");
  const [heroine, setHeroine] = useState(HEROINES[0]);
  const [villain, setVillain] = useState(VILLAINS[0]);
  const [setting, setSetting] = useState(SETTINGS[0]);
  const [duration, setDuration] = useState(DURATIONS[1]);
  const [moodLevel, setMoodLevel] = useState(40);
  const [story, setStory] = useState("");
  const [chapters, setChapters] = useState<string[]>([]);
  const [dayNumber, setDayNumber] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [showChoices, setShowChoices] = useState(false);
  const [choices, setChoices] = useState<Array<{label:string;description:string}>|null>(null);
  const [loadingChoices, setLoadingChoices] = useState(false);
  const [showDebrief, setShowDebrief] = useState(false);
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [coverImg, setCoverImg] = useState<string|null>(null);
  const [genningImg, setGenningImg] = useState(false);
  const [dossier, setDossier] = useState<DossierData|null>(null);
  const [dossierLoading, setDossierLoading] = useState(false);

  const selectStyle = { width:"100%", padding:"0.65rem 0.9rem", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"8px", color:"rgba(220,215,235,0.85)", fontFamily:"'Raleway',sans-serif", fontSize:"0.65rem", outline:"none", cursor:"pointer", appearance:"none" as const };

  function buildUserPrompt(isContinue = false, direction?: string) {
    if (!isContinue) return `HEROINE: ${heroine}\nVILLAIN: ${villain}\nSETTING: ${setting}\nDURATION ARC: ${duration}\nINTENSITY: ${moodLevel < 30 ? "Psychological, restrained" : moodLevel > 70 ? "Fully explicit" : "Tense, building"}\n\nWrite DAY 1 — the first day of captivity.`;
    const moodNote = `\nMOOD CALIBRATION: ${moodLevel}/100. ${moodLevel < 30 ? "Keep it psychological and atmospheric." : moodLevel > 70 ? "Be fully explicit." : "Balance psychological intimacy with physical tension."}`;
    const dirLine = direction?.trim() ? `\nSTEER DAY ${dayNumber}: ${direction}` : "";
    return `HEROINE: ${heroine}\nVILLAIN: ${villain}\nSETTING: ${setting}\n\nSTORY SO FAR:\n${story}\n\nWrite DAY ${dayNumber} — the next day of captivity.${moodNote}${dirLine}`;
  }

  async function startGenerate() {
    setGenerating(true); setError(""); setStory(""); setChapters([]); setDayNumber(1); setDossier(null);
    try {
      const resp = await fetch(`${BASE}/api/story/slow-burn`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ heroine, villain, setting, duration, intensity: moodLevel < 30 ? "Psychological" : moodLevel > 70 ? "Explicit" : "Tense", moodLevel }),
      });
      await streamResponse(resp, true);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); setGenerating(false); }
  }

  async function continueStory(direction?: string) {
    setGenerating(true); setError(""); setShowChoices(false);
    const nextDay = dayNumber + 1;
    setDayNumber(nextDay);
    try {
      const resp = await fetch(`${BASE}/api/story/slow-burn-continue`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ heroine, villain, setting, previousStory: story, dayNumber: nextDay, continueDirection: direction, moodLevel }),
      });
      await streamResponse(resp, false);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); setGenerating(false); }
  }

  async function streamResponse(resp: Response, isFirst: boolean) {
    const reader = resp.body!.getReader();
    const dec = new TextDecoder();
    let full = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = dec.decode(value, { stream: true });
      for (const line of chunk.split("\n")) {
        if (!line.startsWith("data:")) continue;
        try {
          const payload = JSON.parse(line.slice(5).trim());
          if (payload.error) { setError(payload.error); break; }
          if (payload.done) {
            full = payload.story ?? full;
            setStory(prev => {
              const updated = isFirst ? full : prev + "\n\n---\n\n" + full;
              return updated;
            });
            setChapters(prev => [...prev, full]);
            setGenerating(false);
            setStep("reading");
            setShowChoices(true);
            fetchChoices(full.slice(-1200));
            updateDossier(full);
          } else if (payload.chunk) {
            full += payload.chunk;
            setStory(prev => isFirst ? full : prev);
          }
        } catch {}
      }
    }
  }

  async function updateDossier(chapterText: string) {
    setDossierLoading(true);
    try {
      const resp = await fetch(`${BASE}/api/story/dossier-update`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ heroine, villain, chapterText, previousDossier: dossier }),
      });
      const json = await resp.json();
      if (json.dossier) setDossier(json.dossier);
    } finally { setDossierLoading(false); }
  }

  async function generateCoverArt() {
    setGenningImg(true);
    try {
      const resp = await fetch(`${BASE}/api/story/generate-scene-image`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ heroine, sceneDescription: `${heroine} held captive by ${villain} in ${setting}. Intimate, slow-burn, atmospheric.`, shotLabel:"Medium Shot", mood:"Intimate dark", styleLabel:"Cinematic portrait", width:768, height:512 }),
      });
      const json = await resp.json();
      if (json.imageBase64) setCoverImg(json.imageBase64);
    } finally { setGenningImg(false); }
  }

  async function fetchChoices(excerpt?: string) {
    setLoadingChoices(true); setChoices(null);
    try {
      const text = excerpt ?? chapters[chapters.length-1]?.slice(-1200) ?? story.slice(-1200);
      const resp = await fetch(`${BASE}/api/story/branch-choices`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ heroine, villain, setting, storyExcerpt: text }) });
      const json = await resp.json();
      if (json.choices) setChoices(json.choices);
    } catch { setChoices([]) } finally { setLoadingChoices(false); }
  }

  function saveStory() {
    saveToArchive({ title: `Slow Burn: ${heroine} × ${villain}`, universe: "Slow Burn", tool:"Slow Burn Mode", characters:[heroine, villain], chapters });
  }

  const allText = chapters.join("\n\n---\n\n");

  return (
    <div style={{ minHeight:"100vh", background:"#07050F", color:"rgba(220,215,235,0.9)", padding:"2rem" }}>
      <style>{`
        @keyframes sb-float { 0%,100%{transform:translateY(0);}50%{transform:translateY(-6px);} }
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:${COLOR}33;border-radius:4px;}
      `}</style>

      {step === "intro" && <StoryIntro title="Slow Burn" heroineName={heroine} heroineColor={COLOR} villain={villain} setting={setting} universe="Slow Burn" onComplete={() => { setStep("setup"); startGenerate(); }} />}
      {showDebrief && <StoryDebrief heroine={heroine} villain={villain} setting={setting} storyText={allText} heroineColor={COLOR} onClose={() => setShowDebrief(false)} />}
      {showPromptPreview && <PromptPreview userPrompt={buildUserPrompt(chapters.length > 0, undefined)} heroineColor={COLOR} onGenerate={() => { setShowPromptPreview(false); if (chapters.length === 0) { setStep("intro"); } else { continueStory(); } }} onClose={() => setShowPromptPreview(false)} />}

      {/* Page header */}
      <div style={{ maxWidth:"900px", margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:"2rem" }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"2.5rem", fontWeight:700, color:COLOR, letterSpacing:"6px", textShadow:`0 0 40px ${COLOR}66`, animation:"sb-float 4s ease-in-out infinite" }}>SLOW BURN</div>
          <div style={{ fontFamily:"'Raleway',sans-serif", fontSize:"0.55rem", letterSpacing:"4px", color:"rgba(200,195,215,0.35)", marginTop:"0.5rem", textTransform:"uppercase" }}>Week by week · Day by day · Nothing is rushed</div>
        </div>

        {step === "setup" && (
          <div style={{ maxWidth:"600px", margin:"0 auto" }}>
            {/* Heroine */}
            <div style={{ marginBottom:"1.25rem" }}>
              <label style={{ display:"block", fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"3px", color:`${COLOR}bb`, textTransform:"uppercase", marginBottom:"0.45rem" }}>TARGET</label>
              <div style={{ position:"relative" }}>
                <select value={heroine} onChange={e => setHeroine(e.target.value)} style={selectStyle}>
                  {HEROINES.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>

            {/* Villain */}
            <div style={{ marginBottom:"1.25rem" }}>
              <label style={{ display:"block", fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"3px", color:`${COLOR}bb`, textTransform:"uppercase", marginBottom:"0.45rem" }}>CAPTOR</label>
              <select value={villain} onChange={e => setVillain(e.target.value)} style={selectStyle}>
                {VILLAINS.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            {/* Setting */}
            <div style={{ marginBottom:"1.25rem" }}>
              <label style={{ display:"block", fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"3px", color:`${COLOR}bb`, textTransform:"uppercase", marginBottom:"0.45rem" }}>LOCATION</label>
              <select value={setting} onChange={e => setSetting(e.target.value)} style={selectStyle}>
                {SETTINGS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Duration */}
            <div style={{ marginBottom:"1.25rem" }}>
              <label style={{ display:"block", fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"3px", color:`${COLOR}bb`, textTransform:"uppercase", marginBottom:"0.45rem" }}>DURATION ARC</label>
              <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
                {DURATIONS.map(d => (
                  <button key={d} onClick={() => setDuration(d)} style={{ padding:"0.4rem 0.85rem", background: duration === d ? `${COLOR}25` : "rgba(255,255,255,0.03)", border:`1px solid ${duration === d ? `${COLOR}66` : "rgba(255,255,255,0.06)"}`, borderRadius:"8px", color: duration === d ? COLOR : "rgba(200,195,215,0.4)", fontFamily:"'Raleway',sans-serif", fontSize:"0.55rem", cursor:"pointer", transition:"all 0.2s" }}>{d}</button>
                ))}
              </div>
            </div>

            {/* Villain Memory */}
            <VillainMemoryPanel villain={villain} heroineColor={COLOR} />

            {/* Mood Dial */}
            <div style={{ marginBottom:"1.75rem" }}>
              <MoodDial value={moodLevel} onChange={setMoodLevel} heroineColor={COLOR} />
            </div>

            {/* Buttons */}
            <div style={{ display:"flex", gap:"0.75rem" }}>
              <button onClick={() => setShowPromptPreview(true)} style={{ flex:1, padding:"0.65rem", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"10px", color:"rgba(200,195,215,0.35)", fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"2px", cursor:"pointer" }}>👁 PREVIEW PROMPT</button>
              <button onClick={() => setStep("intro")} style={{ flex:2, padding:"0.75rem", background:`linear-gradient(135deg, ${COLOR}25, ${COLOR}10)`, border:`1px solid ${COLOR}44`, borderRadius:"10px", color:COLOR, fontFamily:"'Cinzel',serif", fontSize:"0.72rem", letterSpacing:"3px", cursor:"pointer", fontWeight:700, boxShadow:`0 4px 24px ${COLOR}18` }}>BEGIN DAY 1</button>
            </div>
          </div>
        )}

        {(step === "reading" || step === "done") && (
          <div>
            {/* Cover Art */}
            {coverImg && (
              <div style={{ marginBottom:"1.5rem", textAlign:"center" }}>
                <img src={`data:image/jpeg;base64,${coverImg}`} alt="Scene" style={{ maxWidth:"500px", width:"100%", borderRadius:"8px", border:`1px solid ${COLOR}22`, boxShadow:`0 0 40px ${COLOR}22` }} />
              </div>
            )}

            {/* Day tracker */}
            <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"1.25rem", justifyContent:"center" }}>
              {Array.from({ length: dayNumber }, (_, i) => (
                <div key={i} style={{ width:"28px", height:"4px", borderRadius:"2px", background: i < dayNumber - 1 ? `${COLOR}88` : COLOR, boxShadow: i === dayNumber - 1 ? `0 0 8px ${COLOR}` : "none" }} />
              ))}
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", color:`${COLOR}99`, letterSpacing:"3px" }}>DAY {dayNumber}</span>
            </div>

            {/* Story */}
            <div style={{ background:"rgba(255,255,255,0.015)", border:`1px solid ${COLOR}15`, borderRadius:"12px", padding:"2rem", marginBottom:"1.25rem", minHeight:"300px" }}>
              <div style={{ fontFamily:"'Crimson Text',Georgia,serif", fontSize:"1rem", lineHeight:2.0, color:"rgba(220,215,235,0.85)", whiteSpace:"pre-wrap" }}>{story}</div>
              {generating && <div style={{ display:"inline-block", width:"2px", height:"1.1em", background:COLOR, animation:"sb-float 0.8s ease-in-out infinite", marginLeft:"2px", verticalAlign:"middle" }} />}
            </div>

            {/* Villain Dossier */}
            <VillainDossier heroine={heroine} villain={villain} heroineColor={COLOR} dossier={dossier} chapterCount={chapters.length} loading={dossierLoading} />

            {/* Mood Dial in reading mode */}
            <div style={{ marginBottom:"1rem" }}>
              <MoodDial value={moodLevel} onChange={setMoodLevel} heroineColor={COLOR} />
            </div>

            {/* Actions */}
            {!generating && (
              <div style={{ display:"flex", gap:"0.75rem", flexWrap:"wrap" }}>
                <button onClick={() => { const next = !showChoices; setShowChoices(next); if (next && !choices && !loadingChoices) fetchChoices(); }} style={{ flex:1, padding:"0.6rem", background: showChoices ? `${COLOR}18` : "rgba(255,255,255,0.02)", border: showChoices ? `1px solid ${COLOR}55` : "1px solid rgba(255,255,255,0.06)", borderRadius:"10px", color: showChoices ? COLOR : "rgba(200,195,215,0.4)", fontFamily:"'Cinzel',serif", fontSize:"0.5rem", cursor:"pointer", letterSpacing:"1px", transition:"all 0.2s" }}>⟁ {showChoices ? "HIDE CHOICES" : "CHOICES"}</button>
                <button onClick={() => continueStory()} style={{ flex:2, padding:"0.7rem", background:`linear-gradient(135deg, ${COLOR}22, ${COLOR}0a)`, border:`1px solid ${COLOR}44`, borderRadius:"10px", color:COLOR, fontFamily:"'Cinzel',serif", fontSize:"0.65rem", letterSpacing:"3px", cursor:"pointer", fontWeight:700 }}>▶ DAY {dayNumber + 1}</button>
                <button onClick={generateCoverArt} disabled={genningImg} style={{ flex:1, padding:"0.6rem", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"10px", color:"rgba(200,195,215,0.35)", fontFamily:"'Cinzel',serif", fontSize:"0.48rem", cursor:"pointer" }}>{genningImg ? "…" : "🎨 ART"}</button>
                <button onClick={() => setShowDebrief(true)} style={{ flex:1, padding:"0.6rem", background:"rgba(255,0,0,0.04)", border:"1px solid rgba(200,0,0,0.2)", borderRadius:"10px", color:"rgba(200,80,80,0.7)", fontFamily:"'Cinzel',serif", fontSize:"0.48rem", cursor:"pointer", letterSpacing:"1px" }}>📂 DEBRIEF</button>
                <button onClick={saveStory} style={{ flex:1, padding:"0.6rem", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"10px", color:"rgba(200,195,215,0.3)", fontFamily:"'Cinzel',serif", fontSize:"0.48rem", cursor:"pointer" }}>💾 SAVE</button>
              </div>
            )}

            {showChoices && (
              <div style={{ marginTop:"1rem" }}>
                <StoryChoices choices={choices ?? []} loading={loadingChoices} heroineColor={COLOR} onChoose={c => { setShowChoices(false); setChoices(null); continueStory(c.description); }} onSkip={() => { setShowChoices(false); setChoices(null); }} />
              </div>
            )}

            {error && <div style={{ marginTop:"1rem", padding:"0.75rem", background:"rgba(200,0,0,0.08)", border:"1px solid rgba(200,0,0,0.2)", borderRadius:"8px", color:"#EF4444", fontFamily:"'Raleway',sans-serif", fontSize:"0.55rem" }}>{error}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
