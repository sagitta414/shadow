import { useState } from "react";
import VillainMemoryPanel from "../components/VillainMemoryPanel";
import StoryIntro from "../components/StoryIntro";
import StoryChoices from "../components/StoryChoices";
import MoodDial from "../components/MoodDial";
import StoryDebrief from "../components/StoryDebrief";
import PromptPreview from "../components/PromptPreview";
import VillainDossier from "../components/VillainDossier";
import { saveToArchive } from "../lib/archive";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const COLOR = "#0EA5E9";

const HEROINES = ["Wonder Woman","Black Widow","Scarlet Witch","Supergirl","Storm","Rogue","Psylocke","Jean Grey","Zatanna","Power Girl","She-Hulk","Batgirl","Starfire","Raven","Mary Jane Watson","Silk","Spider-Gwen","Tigra","Invisible Woman","Wasp"];
const VILLAINS = ["Loki","Ra's al Ghul","Baron Zemo","Bane","The Joker","Green Goblin","Kingpin","Doctor Doom","Red Skull","Deathstroke","Magneto","Mysterio","The Riddler","Cheetah","Circe","Black Manta","Gorilla Grodd","Prometheus","Ultron","Thanos"];
const ROOMS = ["A stone cell beneath a castle","A penthouse suite — locked from outside","A luxurious cabin on a private yacht","A velvet-draped chamber in an underground lair","A glass room at the top of an abandoned skyscraper","A sealed, climate-controlled suite","A richly furnished basement vault","A private car of a moving train — no stops until morning","A reinforced room in a mountain fortress","A gilded cage in a private estate"];
const TIMES = ["Midnight","Late Evening","Dusk","3 A.M.","Dawn"];

interface DossierData {
  weaknessesDiscovered: string[];
  leverageGained: string[];
  resistanceLevel: "High"|"Moderate"|"Low"|"Broken";
  psychologicalProfile: string;
  physicalNotes: string;
  handlingRecommendations: string;
  fieldNote: string;
}

export default function ConfinedSpaceMode() {
  const [step, setStep] = useState<"setup"|"intro"|"reading">("setup");
  const [heroine, setHeroine] = useState(HEROINES[0]);
  const [villain, setVillain] = useState(VILLAINS[0]);
  const [room, setRoom] = useState(ROOMS[0]);
  const [timeOfDay, setTimeOfDay] = useState(TIMES[0]);
  const [moodLevel, setMoodLevel] = useState(50);
  const [story, setStory] = useState("");
  const [chapters, setChapters] = useState<string[]>([]);
  const [chapterNum, setChapterNum] = useState(1);
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
    const moodNote = `\nMOOD: ${moodLevel}/100 (0=pure psych, 100=explicit)`;
    if (!isContinue) return `HEROINE: ${heroine}\nVILLAIN: ${villain}\nROOM: ${room}\nTIME: ${timeOfDay}\nINTENSITY: ${moodLevel < 30 ? "Psychological" : moodLevel > 70 ? "Fully explicit" : "Building"}${moodNote}\n\nWrite the opening of tonight.`;
    const dirLine = direction?.trim() ? `\nDIRECTION: ${direction}` : "\nLet the night deepen.";
    return `HEROINE: ${heroine}\nVILLAIN: ${villain}\nROOM: ${room}\n\nSO FAR:\n${story}\n\nContinue — still in the room.${moodNote}${dirLine}`;
  }

  async function startGenerate() {
    setGenerating(true); setError(""); setStory(""); setChapters([]); setChapterNum(1); setDossier(null);
    try {
      const resp = await fetch(`${BASE}/api/story/confined-space`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ heroine, villain, room, timeOfDay, intensity: moodLevel < 30 ? "Psychological" : moodLevel > 70 ? "Fully explicit" : "Building tension", moodLevel }),
      });
      await streamResponse(resp, true);
    } catch(e) { setError(e instanceof Error ? e.message : "Failed"); setGenerating(false); }
  }

  async function continueStory(direction?: string) {
    setGenerating(true); setError(""); setShowChoices(false);
    const next = chapterNum + 1; setChapterNum(next);
    try {
      const resp = await fetch(`${BASE}/api/story/confined-space-continue`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ heroine, villain, room, previousStory: story, chapterNumber: next, continueDirection: direction, moodLevel }),
      });
      await streamResponse(resp, false);
    } catch(e) { setError(e instanceof Error ? e.message : "Failed"); setGenerating(false); }
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
            setStory(prev => isFirst ? full : prev + "\n\n─────\n\n" + full);
            setChapters(prev => [...prev, full]);
            setGenerating(false);
            setStep("reading");
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
        body: JSON.stringify({ heroine, sceneDescription: `${heroine} trapped with ${villain} in ${room} at ${timeOfDay}. Claustrophobic, atmospheric, intimate.`, shotLabel:"Close Shot", mood:"Claustrophobic noir", styleLabel:"Cinematic dark", width:768, height:512 }),
      });
      const json = await resp.json();
      if (json.imageBase64) setCoverImg(json.imageBase64);
    } finally { setGenningImg(false); }
  }

  async function fetchChoices() {
    setLoadingChoices(true); setChoices(null);
    try {
      const resp = await fetch(`${BASE}/api/story/branch-choices`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ heroine, villain, setting: room, storyExcerpt: chapters[chapters.length-1]?.slice(-1200) ?? story.slice(-1200) }) });
      const json = await resp.json();
      if (json.choices) setChoices(json.choices);
    } catch { setChoices([]) } finally { setLoadingChoices(false); }
  }

  function saveStory() {
    saveToArchive({ title: `Confined: ${heroine} × ${villain}`, universe: "Confined Space", tool:"Confined Space Mode", characters:[heroine, villain], chapters });
  }

  const allText = chapters.join("\n\n─────\n\n");

  return (
    <div style={{ minHeight:"100vh", background:"#06060E", color:"rgba(220,215,235,0.9)", padding:"2rem" }}>
      <style>{`
        @keyframes cs-breathe { 0%,100%{opacity:0.9;}50%{opacity:0.5;} }
        @keyframes cs-pulse { 0%,100%{box-shadow:0 0 8px ${COLOR}33;}50%{box-shadow:0 0 24px ${COLOR}66;} }
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:${COLOR}22;border-radius:4px;}
      `}</style>

      {step === "intro" && <StoryIntro title="CONFINED" heroineName={heroine} heroineColor={COLOR} villain={villain} setting={room} universe="Confined Space" onComplete={() => { setStep("setup"); startGenerate(); }} />}
      {showDebrief && <StoryDebrief heroine={heroine} villain={villain} setting={room} storyText={allText} heroineColor={COLOR} onClose={() => setShowDebrief(false)} />}
      {showPromptPreview && <PromptPreview userPrompt={buildUserPrompt(chapters.length > 0)} heroineColor={COLOR} onGenerate={() => { setShowPromptPreview(false); if (chapters.length === 0) setStep("intro"); else continueStory(); }} onClose={() => setShowPromptPreview(false)} />}

      <div style={{ maxWidth:"900px", margin:"0 auto" }}>
        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:"2.5rem" }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"2.5rem", fontWeight:700, color:COLOR, letterSpacing:"8px", textShadow:`0 0 40px ${COLOR}55`, animation:"cs-pulse 3s ease-in-out infinite" }}>CONFINED</div>
          <div style={{ fontFamily:"'Raleway',sans-serif", fontSize:"0.5rem", letterSpacing:"5px", color:"rgba(200,195,215,0.3)", marginTop:"0.5rem" }}>ONE ROOM · ONE NIGHT · NO ESCAPE</div>
        </div>

        {step === "setup" && (
          <div style={{ maxWidth:"580px", margin:"0 auto" }}>
            <div style={{ marginBottom:"1.25rem" }}>
              <label style={{ display:"block", fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"3px", color:`${COLOR}99`, textTransform:"uppercase", marginBottom:"0.45rem" }}>TARGET</label>
              <select value={heroine} onChange={e => setHeroine(e.target.value)} style={selectStyle}>
                {HEROINES.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div style={{ marginBottom:"1.25rem" }}>
              <label style={{ display:"block", fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"3px", color:`${COLOR}99`, textTransform:"uppercase", marginBottom:"0.45rem" }}>CAPTOR</label>
              <select value={villain} onChange={e => setVillain(e.target.value)} style={selectStyle}>
                {VILLAINS.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div style={{ marginBottom:"1.25rem" }}>
              <label style={{ display:"block", fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"3px", color:`${COLOR}99`, textTransform:"uppercase", marginBottom:"0.45rem" }}>THE ROOM</label>
              <select value={room} onChange={e => setRoom(e.target.value)} style={selectStyle}>
                {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div style={{ marginBottom:"1.25rem" }}>
              <label style={{ display:"block", fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"3px", color:`${COLOR}99`, textTransform:"uppercase", marginBottom:"0.45rem" }}>TIME OF NIGHT</label>
              <div style={{ display:"flex", gap:"0.5rem" }}>
                {TIMES.map(t => (
                  <button key={t} onClick={() => setTimeOfDay(t)} style={{ flex:1, padding:"0.4rem 0.5rem", background: timeOfDay === t ? `${COLOR}20` : "rgba(255,255,255,0.02)", border:`1px solid ${timeOfDay === t ? `${COLOR}55` : "rgba(255,255,255,0.05)"}`, borderRadius:"8px", color: timeOfDay === t ? COLOR : "rgba(200,195,215,0.35)", fontFamily:"'Raleway',sans-serif", fontSize:"0.5rem", cursor:"pointer", transition:"all 0.2s" }}>{t}</button>
                ))}
              </div>
            </div>

            {/* Villain Memory */}
            <VillainMemoryPanel villain={villain} heroineColor={COLOR} />

            <div style={{ marginBottom:"1.75rem" }}>
              <MoodDial value={moodLevel} onChange={setMoodLevel} heroineColor={COLOR} />
            </div>

            <div style={{ display:"flex", gap:"0.75rem" }}>
              <button onClick={() => setShowPromptPreview(true)} style={{ flex:1, padding:"0.65rem", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"10px", color:"rgba(200,195,215,0.3)", fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"2px", cursor:"pointer" }}>👁 PREVIEW</button>
              <button onClick={() => setStep("intro")} style={{ flex:2, padding:"0.75rem", background:`linear-gradient(135deg, ${COLOR}22, ${COLOR}08)`, border:`1px solid ${COLOR}44`, borderRadius:"10px", color:COLOR, fontFamily:"'Cinzel',serif", fontSize:"0.72rem", letterSpacing:"3px", cursor:"pointer", fontWeight:700, boxShadow:`0 4px 24px ${COLOR}15` }}>ENTER THE ROOM</button>
            </div>
          </div>
        )}

        {step === "reading" && (
          <div>
            {coverImg && (
              <div style={{ marginBottom:"1.5rem", textAlign:"center" }}>
                <img src={`data:image/jpeg;base64,${coverImg}`} alt="Scene" style={{ maxWidth:"540px", width:"100%", borderRadius:"8px", border:`1px solid ${COLOR}18`, boxShadow:`0 0 60px ${COLOR}18` }} />
              </div>
            )}

            {/* Room atmosphere bar */}
            <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"1.25rem", justifyContent:"center" }}>
              <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:COLOR, animation:"cs-breathe 3s ease-in-out infinite" }} />
              <span style={{ fontFamily:"'Courier New',monospace", fontSize:"0.42rem", color:`${COLOR}66`, letterSpacing:"3px" }}>{room.split("—")[0].trim().toUpperCase()} · {timeOfDay.toUpperCase()} · CHAPTER {chapterNum}</span>
              <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:COLOR, animation:"cs-breathe 3s ease-in-out infinite", animationDelay:"1.5s" }} />
            </div>

            {/* Story */}
            <div style={{ background:"rgba(255,255,255,0.01)", border:`1px solid ${COLOR}12`, borderRadius:"12px", padding:"2rem", marginBottom:"1.25rem" }}>
              <div style={{ fontFamily:"'Crimson Text',Georgia,serif", fontSize:"1rem", lineHeight:2.1, color:"rgba(220,215,235,0.88)", whiteSpace:"pre-wrap" }}>{story}</div>
              {generating && <div style={{ display:"inline-block", width:"2px", height:"1.2em", background:COLOR, animation:"cs-breathe 0.8s ease-in-out infinite", marginLeft:"2px", verticalAlign:"middle" }} />}
            </div>

            {/* Villain Dossier */}
            <VillainDossier heroine={heroine} villain={villain} heroineColor={COLOR} dossier={dossier} chapterCount={chapters.length} loading={dossierLoading} />

            {/* Mood dial */}
            <div style={{ marginBottom:"1rem" }}>
              <MoodDial value={moodLevel} onChange={setMoodLevel} heroineColor={COLOR} />
            </div>

            {!generating && (
              <div style={{ display:"flex", gap:"0.75rem", flexWrap:"wrap" }}>
                <button onClick={() => { const next = !showChoices; setShowChoices(next); if (next && !choices && !loadingChoices) fetchChoices(); }} style={{ flex:1, padding:"0.6rem", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"10px", color:"rgba(200,195,215,0.35)", fontFamily:"'Cinzel',serif", fontSize:"0.5rem", cursor:"pointer", letterSpacing:"1px" }}>⟁ CHOICES</button>
                <button onClick={() => continueStory()} style={{ flex:2, padding:"0.7rem", background:`linear-gradient(135deg, ${COLOR}20, ${COLOR}08)`, border:`1px solid ${COLOR}44`, borderRadius:"10px", color:COLOR, fontFamily:"'Cinzel',serif", fontSize:"0.65rem", letterSpacing:"3px", cursor:"pointer", fontWeight:700 }}>▶ THE NIGHT DEEPENS</button>
                <button onClick={generateCoverArt} disabled={genningImg} style={{ flex:1, padding:"0.6rem", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:"10px", color:"rgba(200,195,215,0.3)", fontFamily:"'Cinzel',serif", fontSize:"0.48rem", cursor:"pointer" }}>{genningImg ? "…" : "🎨 ART"}</button>
                <button onClick={() => setShowDebrief(true)} style={{ flex:1, padding:"0.6rem", background:"rgba(255,0,0,0.03)", border:"1px solid rgba(200,0,0,0.15)", borderRadius:"10px", color:"rgba(200,80,80,0.6)", fontFamily:"'Cinzel',serif", fontSize:"0.48rem", cursor:"pointer", letterSpacing:"1px" }}>📂 DEBRIEF</button>
                <button onClick={saveStory} style={{ flex:1, padding:"0.6rem", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:"10px", color:"rgba(200,195,215,0.25)", fontFamily:"'Cinzel',serif", fontSize:"0.48rem", cursor:"pointer" }}>💾 SAVE</button>
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
