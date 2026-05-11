import { useState } from "react";
import { saveToArchive } from "../lib/archive";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const COLOR = "#34D399";

const HEROINES = ["Black Canary","Supergirl","Wonder Woman","Black Widow","Scarlet Witch","Sara Lance","Dinah Drake","Kara Danvers","Alex Danvers","Zatanna","Jean Grey","Storm","Batgirl","Starfire","Raven","Silk","Spider-Gwen","Iris West","Nora West-Allen","Jesse Quick","Batwoman","Sophie Moore","Felicity Smoak","Thea Queen","Evelyn Sharp"];
const HANDLERS = ["Talia al Ghul","The Red Room Director","A.R.G.U.S. Black Ops — handler unidentified","Lex Luthor","Nyssa al Ghul","Malcolm Merlyn","HIVE — senior operative","Baron Zemo","The Hand — shadow coordinator","Unknown — the heroine does not know who conditioned her"];
const TEAMS = ["Team Arrow","The Legends","The Flash's Team","The D.E.O.","The Avengers","The Justice League","S.H.I.E.L.D.","The X-Men","Her own personal team — close friends who trust her completely"];
const TRIGGERS = ["A specific phrase spoken by any person","A song that plays on any radio","A color — the sight of it initiates the secondary persona","A time of day — she changes at the same hour every night","A specific name spoken aloud","Physical touch in a specific location","A news headline — once she reads it, the protocol activates","She doesn't know her trigger. Neither does the reader — it happens mid-scene."];
const DEPTHS = ["Recently conditioned — the real her is still close to the surface","Three months in — the two selves are starting to blur","Six months — she has begun doing things she cannot explain","One year — she occasionally cannot remember which version is real","Fully established — the public self is almost entirely a performance she no longer fully controls"];

const ss: React.CSSProperties = { width:"100%", padding:"0.65rem 0.9rem", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"8px", color:"rgba(220,215,235,0.85)", fontFamily:"'Raleway',sans-serif", fontSize:"0.65rem", outline:"none", cursor:"pointer", appearance:"none" };

interface Props { onBack: () => void; }

export default function SleeperProtocolMode({ onBack }: Props) {
  const [step, setStep] = useState<"setup"|"reading">("setup");
  const [heroine, setHeroine] = useState(HEROINES[0]);
  const [handler, setHandler] = useState(HANDLERS[0]);
  const [team, setTeam] = useState(TEAMS[0]);
  const [trigger, setTrigger] = useState(TRIGGERS[0]);
  const [depth, setDepth] = useState(DEPTHS[1]);
  const [mission, setMission] = useState("Extract classified intelligence from her team's base without detection");
  const [generating, setGenerating] = useState(false);
  const [story, setStory] = useState("");
  const [error, setError] = useState("");

  async function generate() {
    setGenerating(true); setError(""); setStory("");
    try {
      const resp = await fetch(`${BASE}/api/story/sleeper-protocol`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ heroine, handler, team, trigger, depth, mission }),
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
      if (full) saveToArchive({ title: `Sleeper Protocol — ${heroine}`, universe: "Sleeper Protocol", tool: "sleeper-protocol", characters: [heroine, handler], chapters: [full] });
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setGenerating(false); }
  }

  if (step === "reading" && story) {
    const paragraphs = story.split(/\n+/).filter(p => p.trim().length > 10);
    return (
      <div style={{ minHeight:"100vh", background:"#020008", color:"rgba(220,215,235,0.9)", fontFamily:"'Raleway',sans-serif", padding:"2rem 1rem", maxWidth:"780px", margin:"0 auto" }}>
        <style>{`
          @keyframes pub{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
          @keyframes priv{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:translateX(0)}}
          .pub-block{border-left:3px solid rgba(52,211,153,0.4);padding-left:1rem;}
          .priv-block{border-left:3px solid rgba(239,68,68,0.4);padding-left:1rem;}
        `}</style>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"2rem" }}>
          <div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.42rem", letterSpacing:"6px", color:`${COLOR}77`, marginBottom:"0.2rem" }}>SLEEPER PROTOCOL</div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.9rem", color:COLOR, fontWeight:900 }}>{heroine}</div>
          </div>
          <div style={{ display:"flex", gap:"1.5rem", fontSize:"0.5rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"0.4rem" }}><div style={{ width:"10px", height:"10px", borderRadius:"2px", background:`${COLOR}55`, border:`1px solid ${COLOR}66` }} /><span style={{ color:`${COLOR}88` }}>PUBLIC</span></div>
            <div style={{ display:"flex", alignItems:"center", gap:"0.4rem" }}><div style={{ width:"10px", height:"10px", borderRadius:"2px", background:"rgba(239,68,68,0.3)", border:"1px solid rgba(239,68,68,0.5)" }} /><span style={{ color:"rgba(239,68,68,0.6)" }}>PRIVATE</span></div>
          </div>
        </div>
        <div style={{ lineHeight:1.9, fontSize:"0.63rem" }}>
          {paragraphs.map((p, i) => {
            const isPrivate = p.startsWith("PRIVATE:") || p.startsWith("[PRIVATE]") || p.startsWith("▪");
            const isPublic = p.startsWith("PUBLIC:") || p.startsWith("[PUBLIC]") || p.startsWith("▸");
            return (
              <p key={i} className={isPrivate ? "priv-block" : isPublic ? "pub-block" : ""} style={{ marginBottom:"1.3rem", color: isPrivate ? "rgba(239,100,100,0.85)" : isPublic ? `${COLOR}` : "rgba(220,215,235,0.8)" }}>
                {p}
              </p>
            );
          })}
        </div>
        <div style={{ marginTop:"3rem", display:"flex", gap:"1rem" }}>
          <button onClick={() => setStep("setup")} style={{ background:"none", border:`1px solid ${COLOR}44`, borderRadius:"6px", color:`${COLOR}88`, padding:"0.6rem 1.2rem", cursor:"pointer", fontSize:"0.55rem", letterSpacing:"2px", fontFamily:"'Cinzel',serif" }}>← NEW PROTOCOL</button>
          <button onClick={onBack} style={{ background:"none", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"6px", color:"rgba(255,255,255,0.3)", padding:"0.6rem 1.2rem", cursor:"pointer", fontSize:"0.55rem", letterSpacing:"2px", fontFamily:"'Cinzel',serif" }}>EXIT</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"#020008", color:"rgba(220,215,235,0.9)", fontFamily:"'Raleway',sans-serif", padding:"2rem 1rem", maxWidth:"700px", margin:"0 auto" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"2.5rem" }}>
        <button onClick={onBack} style={{ background:"none", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", color:"rgba(200,180,240,0.6)", padding:"0.5rem 1rem", cursor:"pointer", fontSize:"0.6rem", letterSpacing:"2px", fontFamily:"'Cinzel',serif" }}>← BACK</button>
        <div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.42rem", letterSpacing:"6px", color:`${COLOR}77`, textTransform:"uppercase", marginBottom:"0.2rem" }}>SHADOWWEAVE</div>
          <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(1rem,4vw,1.6rem)", fontWeight:900, color:COLOR, margin:0, letterSpacing:"3px" }}>SLEEPER PROTOCOL</h1>
        </div>
      </div>
      <p style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.3)", marginBottom:"2rem", lineHeight:1.7 }}>She was conditioned and returned — undetected. The story alternates between her PUBLIC self (normal, trusted, at ease) and her PRIVATE self (suppressed resistance, involuntary compliance, the horror of what she does and cannot stop). Her team has no idea. The gap between who she is and what she does is everything.</p>

      <div style={{ animation:"fadeUp 0.4s ease" }}>
        {[
          { label:"THE SLEEPER", el: <select value={heroine} onChange={e=>setHeroine(e.target.value)} style={ss}>{HEROINES.map(h=><option key={h}>{h}</option>)}</select> },
          { label:"HER HANDLER", el: <select value={handler} onChange={e=>setHandler(e.target.value)} style={ss}>{HANDLERS.map(h=><option key={h}>{h}</option>)}</select> },
          { label:"HER TEAM — WHO TRUSTS HER", el: <select value={team} onChange={e=>setTeam(e.target.value)} style={ss}>{TEAMS.map(t=><option key={t}>{t}</option>)}</select> },
          { label:"ACTIVATION TRIGGER", el: <select value={trigger} onChange={e=>setTrigger(e.target.value)} style={ss}>{TRIGGERS.map(t=><option key={t}>{t}</option>)}</select> },
          { label:"DEPTH OF CONDITIONING", el: <select value={depth} onChange={e=>setDepth(e.target.value)} style={ss}>{DEPTHS.map(d=><option key={d}>{d}</option>)}</select> },
          { label:"CURRENT MISSION / DIRECTIVE", el: <input value={mission} onChange={e=>setMission(e.target.value)} style={ss} /> },
        ].map(({ label, el }) => (
          <div key={label} style={{ marginBottom:"1.2rem" }}>
            <div style={{ fontSize:"0.45rem", letterSpacing:"3px", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", fontFamily:"'Cinzel',serif", marginBottom:"0.5rem" }}>{label}</div>
            {el}
          </div>
        ))}
        {error && <div style={{ color:"#EF4444", fontSize:"0.6rem", marginBottom:"1rem" }}>{error}</div>}
        {generating && <div style={{ color:`${COLOR}88`, fontSize:"0.6rem", marginBottom:"1rem", fontFamily:"'Cinzel',serif", letterSpacing:"2px" }}>ACTIVATING PROTOCOL...</div>}
        <button onClick={generate} disabled={generating} style={{ width:"100%", padding:"1rem", background: generating ? "rgba(255,255,255,0.04)" : `linear-gradient(135deg, ${COLOR}88, ${COLOR}55)`, border:"none", borderRadius:"10px", color: generating ? "rgba(255,255,255,0.3)" : "#020008", fontFamily:"'Cinzel',serif", fontSize:"0.7rem", fontWeight:900, letterSpacing:"3px", cursor: generating ? "not-allowed" : "pointer", transition:"all 0.2s" }}>
          {generating ? "GENERATING..." : "ACTIVATE SLEEPER"}
        </button>
      </div>
    </div>
  );
}
