import { useState } from "react";
import CinematicReader from "../components/CinematicReader";
import { saveToArchive } from "../lib/archive";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const COLOR = "#EF4444";

const HEROINES = ["Black Canary","Supergirl","Wonder Woman","Black Widow","Scarlet Witch","Sara Lance","Dinah Drake","Kara Danvers","Alex Danvers","Zatanna","Jean Grey","Storm","Rogue","Psylocke","Batgirl","Starfire","Raven","Silk","Spider-Gwen","Iris West","Nora West-Allen","Jesse Quick","Batwoman","Sophie Moore","Felicity Smoak","Thea Queen","Shado","Tatsu Yamashiro","Evelyn Sharp","Cecile Horton"];
const DESIGNERS = ["The Joker","Talia al Ghul","Nyssa al Ghul","Deathstroke","Ra's al Ghul","Damien Darhk","Lex Luthor","Malcolm Merlyn","Prometheus","Lady Shiva","Unknown Architect — the rules arrived without a sender"];
const ARENA_TYPES = ["A sealed chamber — one door, two competitors","A flooded sub-level with rising water","A gladiatorial pit with a watching audience","A collapsing structure — compete or be buried","A psychological gauntlet — the arena is the mind","An ornate hall — the designer's private theatre","A forest compound at midnight","A zero-gravity module — rules of physics suspended"];
const STAKES_OPTIONS = ["Winner faces lighter treatment — loser faces the full protocol","Winner earns a single choice; loser earns none","Winner is released — loser becomes a permanent asset","Winner must condition the loser — no exceptions","Winner chooses what happens to the loser. No limits.","Neither wins. The designer wins. They both lose.","The loser faces something the winner will spend years trying to forget."];

const ss: React.CSSProperties = { width:"100%", padding:"0.65rem 0.9rem", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"8px", color:"rgba(220,215,235,0.85)", fontFamily:"'Raleway',sans-serif", fontSize:"0.65rem", outline:"none", cursor:"pointer", appearance:"none" };

interface Props { onBack: () => void; }

export default function GladiatorProtocolMode({ onBack }: Props) {
  const [step, setStep] = useState<"setup"|"reading">("setup");
  const [heroine1, setHeroine1] = useState(HEROINES[0]);
  const [heroine2, setHeroine2] = useState(HEROINES[2]);
  const [relationship, setRelationship] = useState("Former allies who trust each other completely");
  const [designer, setDesigner] = useState(DESIGNERS[0]);
  const [arena, setArena] = useState(ARENA_TYPES[0]);
  const [stakes, setStakes] = useState(STAKES_OPTIONS[0]);
  const [additionalContext, setAdditionalContext] = useState("");
  const [generating, setGenerating] = useState(false);
  const [story, setStory] = useState("");
  const [error, setError] = useState("");

  async function generate() {
    if (heroine1 === heroine2) { setError("Select two different heroines"); return; }
    setGenerating(true); setError(""); setStory("");
    try {
      const resp = await fetch(`${BASE}/api/story/gladiator-protocol`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ heroine1, heroine2, relationship, designer, arena, stakes, additionalContext }),
      });
      if (!resp.ok || !resp.body) { setError("Connection failed"); setGenerating(false); return; }
      const reader = resp.body.getReader();
      const dec = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of dec.decode(value, { stream: true }).split("\n")) {
          if (!line.startsWith("data:")) continue;
          try {
            const p = JSON.parse(line.slice(5).trim());
            if (p.error) { setError(p.error); break; }
            if (p.done) { full = p.story ?? full; setStory(full); setStep("reading"); }
            else if (p.chunk) { full += p.chunk; setStory(full); }
          } catch {}
        }
      }
      if (full) saveToArchive({ title: `Gladiator Protocol — ${heroine1} vs ${heroine2}`, universe: "Gladiator Protocol", tool: "gladiator-protocol", characters: [heroine1, heroine2, designer], chapters: [full] });
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setGenerating(false); }
  }

  if (step === "reading" && story) {
    return <CinematicReader story={story} title={`${heroine1} vs ${heroine2}`} heroineName={`${heroine1} / ${heroine2}`} heroineColor={COLOR} villain={designer} onExit={() => setStep("setup")} />;
  }

  return (
    <div style={{ minHeight:"100vh", background:"#020008", color:"rgba(220,215,235,0.9)", fontFamily:"'Raleway',sans-serif", padding:"2rem 1rem", maxWidth:"700px", margin:"0 auto" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"2.5rem" }}>
        <button onClick={onBack} style={{ background:"none", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", color:"rgba(200,180,240,0.6)", padding:"0.5rem 1rem", cursor:"pointer", fontSize:"0.6rem", letterSpacing:"2px", fontFamily:"'Cinzel',serif" }}>← BACK</button>
        <div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.42rem", letterSpacing:"6px", color:`${COLOR}77`, textTransform:"uppercase", marginBottom:"0.2rem" }}>SHADOWWEAVE</div>
          <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(1rem,4vw,1.6rem)", fontWeight:900, color:COLOR, margin:0, letterSpacing:"3px" }}>GLADIATOR PROTOCOL</h1>
        </div>
      </div>
      <p style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.3)", marginBottom:"2rem", lineHeight:1.7 }}>Two captured heroines are made to compete. The AI writes both perspectives alternating by paragraph — her defiance, her calculation, her horror at what she's doing to someone she knows. The designer watches. The stakes are real.</p>

      <div style={{ animation:"fadeUp 0.4s ease" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1.5rem" }}>
          {[["COMPETITOR ONE", heroine1, setHeroine1],["COMPETITOR TWO", heroine2, setHeroine2]].map(([label, val, setter]) => (
            <div key={String(label)}>
              <div style={{ fontSize:"0.45rem", letterSpacing:"3px", color:`${COLOR}88`, textTransform:"uppercase", fontFamily:"'Cinzel',serif", marginBottom:"0.5rem" }}>{String(label)}</div>
              <select value={String(val)} onChange={e=>(setter as (v:string)=>void)(e.target.value)} style={ss}>{HEROINES.map(h=><option key={h}>{h}</option>)}</select>
            </div>
          ))}
        </div>
        {heroine1 === heroine2 && <div style={{ color:"#F97316", fontSize:"0.55rem", marginBottom:"1rem" }}>⚠ Select two different heroines</div>}

        {[
          { label:"THEIR RELATIONSHIP", el: <input value={relationship} onChange={e=>setRelationship(e.target.value)} style={ss} /> },
          { label:"ARENA DESIGNER", el: <select value={designer} onChange={e=>setDesigner(e.target.value)} style={ss}>{DESIGNERS.map(d=><option key={d}>{d}</option>)}</select> },
          { label:"ARENA TYPE", el: <select value={arena} onChange={e=>setArena(e.target.value)} style={ss}>{ARENA_TYPES.map(a=><option key={a}>{a}</option>)}</select> },
          { label:"STAKES", el: <select value={stakes} onChange={e=>setStakes(e.target.value)} style={ss}>{STAKES_OPTIONS.map(s=><option key={s}>{s}</option>)}</select> },
          { label:"ADDITIONAL CONTEXT (OPTIONAL)", el: <textarea value={additionalContext} onChange={e=>setAdditionalContext(e.target.value)} placeholder="Prior history between them, specific physical or psychological elements to include..." rows={3} style={{ ...ss, resize:"vertical" }} /> },
        ].map(({ label, el }) => (
          <div key={label} style={{ marginBottom:"1.2rem" }}>
            <div style={{ fontSize:"0.45rem", letterSpacing:"3px", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", fontFamily:"'Cinzel',serif", marginBottom:"0.5rem" }}>{label}</div>
            {el}
          </div>
        ))}
        {error && <div style={{ color:"#EF4444", fontSize:"0.6rem", marginBottom:"1rem" }}>{error}</div>}
        {generating && <div style={{ color:`${COLOR}88`, fontSize:"0.6rem", marginBottom:"1rem", fontFamily:"'Cinzel',serif", letterSpacing:"2px" }}>PROTOCOL ACTIVE...</div>}
        <button onClick={generate} disabled={generating} style={{ width:"100%", padding:"1rem", background: generating ? "rgba(255,255,255,0.04)" : `linear-gradient(135deg, ${COLOR}88, ${COLOR}55)`, border:"none", borderRadius:"10px", color: generating ? "rgba(255,255,255,0.3)" : "#fff", fontFamily:"'Cinzel',serif", fontSize:"0.7rem", letterSpacing:"3px", cursor: generating ? "not-allowed" : "pointer", transition:"all 0.2s" }}>
          {generating ? "GENERATING..." : "BEGIN THE PROTOCOL"}
        </button>
      </div>
    </div>
  );
}
