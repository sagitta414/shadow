import { useState } from "react";
import CinematicReader from "../components/CinematicReader";
import { saveToArchive } from "../lib/archive";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Villain {
  name: string;
  title: string;
  color: string;
  icon: string;
  methodology: string;
  signature: string;
  preferredMethods: string[];
  tone: string;
}

const VILLAINS: Villain[] = [
  {
    name: "The Joker",
    title: "The Clown Prince of Chaos",
    color: "#22C55E",
    icon: "🃏",
    methodology: "Pure chaos weaponised as methodology. He designs scenarios around the specific breaking point of each victim — not because he studied them, but because chaos finds every weakness eventually. Humiliation, performance, degradation as spectacle. The audience is always part of it.",
    signature: "He laughs. Genuinely. You haven't broken her — you've given him material.",
    preferredMethods: ["Public humiliation", "Forced performance", "Psychological destabilisation", "Audience mechanics", "The long game of anticipation"],
    tone: "Theatrical, chaotic, darkly comedic — the cruelty wears a smile",
  },
  {
    name: "Talia al Ghul",
    title: "Daughter of the Demon",
    color: "#EF4444",
    icon: "⚔️",
    methodology: "Systematic and methodical. Every session has a purpose, every act serves the long arc. She studied conditioning before it was a science — the League has been doing it for centuries. Cold, precise, utterly devoid of improvisation. She doesn't enjoy it. She completes it.",
    signature: "She explains exactly what she is doing and why. The transparency makes it worse.",
    preferredMethods: ["Structural conditioning", "Systematic breaking", "The Obedience Protocol", "Identity replacement", "Extended isolation"],
    tone: "Clinical precision with an undertone of genuine contempt",
  },
  {
    name: "Nyssa al Ghul",
    title: "The Heir of the Demon",
    color: "#F97316",
    icon: "🜲",
    methodology: "Ritual. Ancient. Where Talia breaks down and rebuilds, Nyssa transforms through ceremony. She uses the League's oldest traditions — binding rites, devotion protocols, sacred obligations. The captive becomes not a slave but an initiate, and somehow that is worse.",
    signature: "She speaks as if what is happening is an honour. Over time, part of the captive begins to agree.",
    preferredMethods: ["Ritual conditioning", "League initiation rites", "Devotion protocols", "Ceremonial submission", "The Pit's influence"],
    tone: "Ancient, reverent, formal — submission dressed as sacred transformation",
  },
  {
    name: "Lena Luthor",
    title: "The Scientist",
    color: "#06B6D4",
    icon: "⚗️",
    methodology: "Behavioral modification approached as a research problem. Hypotheses, procedures, results, notes. She doesn't hate her subjects — she's fascinated by them. The clinical distance is the cruelty. Every response is documented. Every failure is a data point. She is very, very patient.",
    signature: "She thanks her subjects for their cooperation. She means it.",
    preferredMethods: ["Stimulus-response conditioning", "Clinical documentation", "Behavioral modification", "Research protocols", "Technology-assisted control"],
    tone: "Cold, intellectual, fascinated — the horror of being someone's experiment",
  },
  {
    name: "Deathstroke",
    title: "The Terminator",
    color: "#F59E0B",
    icon: "🎯",
    methodology: "Military efficiency. No drama, no performance, no unnecessary action. He has a contract, a methodology, a timeline. He executes each step with professional precision. The lack of personal involvement is somehow more degrading than rage would be — she is a job, and he is very good at his job.",
    signature: "He never raises his voice. He never repeats an instruction.",
    preferredMethods: ["Physical conditioning", "Tactical restraint", "Professional detachment", "Systematic compliance training", "Pressure point methodology"],
    tone: "Cold professionalism — the horror of being treated as a target, not a person",
  },
  {
    name: "Damien Darhk",
    title: "HIVE Commander",
    color: "#8B5CF6",
    icon: "☠️",
    methodology: "Theatrical menace with genuine competence beneath. He enjoys himself thoroughly. Dark magic layered over boardroom authority. Alternates between absolute cruelty and genuine warmth, making neither safe. The unpredictability is calculated — she never knows which version walks through the door.",
    signature: "He brings wine. The conversation is lovely. Then it isn't.",
    preferredMethods: ["Dark magic binding", "Psychological unpredictability", "Theatrical cruelty", "Magic-assisted compliance", "Charm as a weapon"],
    tone: "Charming, lethal, occasionally genuinely funny — then not",
  },
  {
    name: "Ra's al Ghul",
    title: "The Demon's Head",
    color: "#84CC16",
    icon: "☽",
    methodology: "Centuries of accumulated knowledge about human submission. He has broken warriors, queens, champions. He views the current captive with the patience of someone who has seen ten thousand like her and knows exactly how each story ends. The condescension of total certainty is its own kind of horror.",
    signature: "He has already written the chapter that comes next. She just hasn't reached it yet.",
    preferredMethods: ["Legacy protocols", "Lazarus Pit leverage", "Historical conditioning methods", "Authority as absolute force", "The weight of inevitability"],
    tone: "Ancient authority and total certainty — she is merely the latest in a very long line",
  },
  {
    name: "Lex Luthor",
    title: "The Architect",
    color: "#EC4899",
    icon: "♟",
    methodology: "Everything is a transaction, and he always controls the terms. Intellectual, institutional, and utterly without mercy dressed as pragmatism. He doesn't need restraints when he controls every resource she depends on. The captivity is architectural — built into the situation before she arrived.",
    signature: "He offers choices. Every choice leads to the same place.",
    preferredMethods: ["Institutional control", "Resource leverage", "Psychological architecture", "The illusion of choice", "Long-term strategic conditioning"],
    tone: "Brilliant, reasonable-seeming, completely without mercy",
  },
];

const HEROINES = ["Black Canary","Supergirl","Wonder Woman","Black Widow","Scarlet Witch","Sara Lance","Dinah Drake","Kara Danvers","Alex Danvers","Zari Tomaz","Nora West-Allen","Jesse Quick","Batwoman","Storm","Rogue","Jean Grey","Zatanna","Starfire","Raven","Batgirl","Silk","Spider-Gwen","Iris West","Caitlin Snow","Nora Darhk","Cecile Horton","Felicity Smoak","Thea Queen","Tatsu Yamashiro","Shado","Evelyn Sharp"];

const ss: React.CSSProperties = { width:"100%", padding:"0.65rem 0.9rem", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"8px", color:"rgba(220,215,235,0.85)", fontFamily:"'Raleway',sans-serif", fontSize:"0.65rem", outline:"none", cursor:"pointer", appearance:"none" };

interface Props { onBack: () => void; }

export default function VillainHub({ onBack }: Props) {
  const [selected, setSelected] = useState<Villain | null>(null);
  const [heroine, setHeroine] = useState(HEROINES[0]);
  const [setting, setSetting] = useState("A secure facility — no outside contact possible");
  const [intensity, setIntensity] = useState(65);
  const [generating, setGenerating] = useState(false);
  const [story, setStory] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<"browse"|"config"|"reading">("browse");

  async function generate() {
    if (!selected) return;
    setGenerating(true); setError(""); setStory("");
    try {
      const resp = await fetch(`${BASE}/api/story/villain-hub`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ villain: selected.name, heroine, setting, intensity, methodology: selected.methodology }),
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
      if (full) saveToArchive({ title: `${selected.name} × ${heroine}`, universe: "Villain Hub", tool: "villain-hub", characters: [heroine, selected.name], chapters: [full] });
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setGenerating(false); }
  }

  if (step === "reading" && story && selected) {
    return <CinematicReader story={story} title={`${selected.name} × ${heroine}`} heroineName={heroine} heroineColor={selected.color} villain={selected.name} onExit={() => setStep("config")} />;
  }

  return (
    <div style={{ minHeight:"100vh", background:"#020008", color:"rgba(220,215,235,0.9)", fontFamily:"'Raleway',sans-serif", padding:"2rem 1rem", maxWidth:"960px", margin:"0 auto" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}} .vcard:hover{transform:translateY(-3px);}`}</style>

      <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"2.5rem" }}>
        <button onClick={step === "browse" ? onBack : () => setStep("browse")} style={{ background:"none", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", color:"rgba(200,180,240,0.6)", padding:"0.5rem 1rem", cursor:"pointer", fontSize:"0.6rem", letterSpacing:"2px", fontFamily:"'Cinzel',serif" }}>
          {step === "browse" ? "← BACK" : "← VILLAINS"}
        </button>
        <div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.42rem", letterSpacing:"6px", color:"rgba(255,50,50,0.5)", textTransform:"uppercase", marginBottom:"0.2rem" }}>SHADOWWEAVE</div>
          <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(1.2rem,4vw,1.8rem)", fontWeight:900, color:"#EF4444", margin:0, letterSpacing:"3px" }}>VILLAIN METHODOLOGY HUB</h1>
        </div>
      </div>
      <p style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.3)", marginBottom:"2rem", lineHeight:1.7 }}>Choose your villain first. Each villain has a distinct methodology — the story is shaped by who they are, not just who they captured.</p>

      {step === "browse" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"1rem", animation:"fadeUp 0.4s ease" }}>
          {VILLAINS.map(v => (
            <div key={v.name} className="vcard" onClick={() => { setSelected(v); setStep("config"); }} style={{ background:"rgba(255,255,255,0.02)", border:`1px solid ${v.color}33`, borderRadius:"14px", padding:"1.4rem", cursor:"pointer", transition:"all 0.25s", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:0, right:0, width:"120px", height:"120px", background:`radial-gradient(circle, ${v.color}11 0%, transparent 70%)`, borderRadius:"50%", transform:"translate(30%,-30%)" }} />
              <div style={{ fontSize:"1.8rem", marginBottom:"0.7rem" }}>{v.icon}</div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.75rem", color:v.color, fontWeight:700, marginBottom:"0.2rem" }}>{v.name}</div>
              <div style={{ fontSize:"0.5rem", color:`${v.color}99`, letterSpacing:"2px", textTransform:"uppercase", marginBottom:"0.8rem" }}>{v.title}</div>
              <div style={{ fontSize:"0.57rem", color:"rgba(255,255,255,0.4)", lineHeight:1.6, marginBottom:"1rem" }}>{v.methodology.slice(0, 130)}...</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"0.3rem" }}>
                {v.preferredMethods.slice(0, 3).map(m => <span key={m} style={{ fontSize:"0.42rem", background:`${v.color}18`, border:`1px solid ${v.color}33`, borderRadius:"4px", padding:"0.15rem 0.4rem", color:`${v.color}bb` }}>{m}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}

      {step === "config" && selected && (
        <div style={{ animation:"fadeUp 0.35s ease", maxWidth:"620px" }}>
          <div style={{ background:`linear-gradient(135deg, ${selected.color}18, ${selected.color}08)`, border:`1px solid ${selected.color}44`, borderRadius:"14px", padding:"1.5rem", marginBottom:"2rem" }}>
            <div style={{ display:"flex", gap:"1rem", alignItems:"flex-start" }}>
              <div style={{ fontSize:"2.2rem" }}>{selected.icon}</div>
              <div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.9rem", color:selected.color, fontWeight:900 }}>{selected.name}</div>
                <div style={{ fontSize:"0.5rem", color:`${selected.color}88`, letterSpacing:"2px", textTransform:"uppercase", marginBottom:"0.6rem" }}>{selected.title}</div>
                <div style={{ fontSize:"0.58rem", color:"rgba(255,255,255,0.5)", lineHeight:1.7 }}>{selected.methodology}</div>
                <div style={{ marginTop:"0.8rem", fontSize:"0.55rem", color:`${selected.color}99`, fontStyle:"italic" }}>"{selected.signature}"</div>
                <div style={{ marginTop:"0.6rem", fontSize:"0.5rem", color:"rgba(255,255,255,0.35)" }}>TONE: {selected.tone}</div>
              </div>
            </div>
          </div>

          {[
            { label:"TARGET HEROINE", el: <select value={heroine} onChange={e=>setHeroine(e.target.value)} style={ss}>{HEROINES.map(h=><option key={h}>{h}</option>)}</select> },
            { label:"SETTING", el: <input value={setting} onChange={e=>setSetting(e.target.value)} style={ss} /> },
          ].map(({ label, el }) => (
            <div key={label} style={{ marginBottom:"1.2rem" }}>
              <div style={{ fontSize:"0.45rem", letterSpacing:"3px", color:"rgba(255,255,255,0.3)", fontFamily:"'Cinzel',serif", marginBottom:"0.5rem" }}>{label}</div>
              {el}
            </div>
          ))}

          <div style={{ marginBottom:"1.8rem" }}>
            <div style={{ fontSize:"0.45rem", letterSpacing:"3px", color:"rgba(255,255,255,0.3)", fontFamily:"'Cinzel',serif", marginBottom:"0.5rem" }}>INTENSITY — {intensity}/100</div>
            <input type="range" min={10} max={100} value={intensity} onChange={e=>setIntensity(+e.target.value)} style={{ width:"100%", accentColor:selected.color }} />
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.45rem", color:"rgba(255,255,255,0.2)", marginTop:"0.3rem" }}><span>Psychological / Restrained</span><span>Explicit / Extreme</span></div>
          </div>

          {error && <div style={{ color:"#EF4444", fontSize:"0.6rem", marginBottom:"1rem" }}>{error}</div>}
          <button onClick={generate} disabled={generating} style={{ width:"100%", padding:"1rem", background: generating ? "rgba(255,255,255,0.05)" : `linear-gradient(135deg, ${selected.color}99, ${selected.color}66)`, border:"none", borderRadius:"10px", color: generating ? "rgba(255,255,255,0.3)" : "#000", fontFamily:"'Cinzel',serif", fontSize:"0.7rem", fontWeight:900, letterSpacing:"3px", cursor: generating ? "not-allowed" : "pointer", transition:"all 0.25s" }}>
            {generating ? "GENERATING..." : `DEPLOY ${selected.name.toUpperCase()}`}
          </button>
        </div>
      )}
    </div>
  );
}
