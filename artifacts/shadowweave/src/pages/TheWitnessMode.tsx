import { useState } from "react";
import CinematicReader from "../components/CinematicReader";
import { saveToArchive } from "../lib/archive";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const COLOR = "#A78BFA";

const HEROINES = ["Black Canary","Supergirl","Wonder Woman","Black Widow","Scarlet Witch","Sara Lance","Dinah Drake","Kara Danvers","Alex Danvers","Zatanna","Jean Grey","Storm","Rogue","Psylocke","Batgirl","Starfire","Raven","Silk","Spider-Gwen","Iris West","Nora West-Allen","Jesse Quick","Batwoman","Sophie Moore","Felicity Smoak","Thea Queen","Shado","Tatsu Yamashiro","Evelyn Sharp"];
const CAPTORS = ["The Joker","Talia al Ghul","Nyssa al Ghul","Lena Luthor","Deathstroke","Ra's al Ghul","Damien Darhk","Lex Luthor","Malcolm Merlyn","Prometheus","Lady Shiva","The Red Room Director","Unknown Handler"];
const RELATIONSHIPS = ["Closest allies — they have fought side by side for years","Sisters — blood, not just by bond","Mentor and protégé — the witness trained the subject","Rivals who would never admit they care","Former enemies turned trusted friends","Strangers who only know each other by reputation","Partners who have never discussed what they mean to each other","The witness is in love with the subject, has never said so"];
const SETTINGS = ["A one-way glass chamber — she watches but cannot intervene","A sealed gallery above the conditioning room","Restrained in a chair, positioned to observe without looking away","A screen feed — she sees everything in real time from her own cell","The same room — restrained separately, close enough to speak","Behind a wall of glass — her screams don't carry","In the corridor outside — the sounds reach her clearly"];
const CAPTOR_METHODS = ["Systematic psychological breaking","Ritual conditioning — ceremonial, ancient","Clinical behavioral modification — documented","Humiliation and performance-based","Isolation then overwhelm — silence then everything at once","Surgical precision — finding every specific weakness","Physical and psychological combined — thorough and unhurried"];

const ss: React.CSSProperties = { width:"100%", padding:"0.65rem 0.9rem", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"8px", color:"rgba(220,215,235,0.85)", fontFamily:"'Raleway',sans-serif", fontSize:"0.65rem", outline:"none", cursor:"pointer", appearance:"none" };

interface Props { onBack: () => void; }

export default function TheWitnessMode({ onBack }: Props) {
  const [step, setStep] = useState<"setup"|"reading">("setup");
  const [witness, setWitness] = useState(HEROINES[0]);
  const [subject, setSubject] = useState(HEROINES[2]);
  const [relationship, setRelationship] = useState(RELATIONSHIPS[0]);
  const [captor, setCaptor] = useState(CAPTORS[0]);
  const [captorMethod, setCaptorMethod] = useState(CAPTOR_METHODS[0]);
  const [observationPoint, setObservationPoint] = useState(SETTINGS[0]);
  const [witnessKnows, setWitnessKnows] = useState("She knows she is next. The captor has told her explicitly.");
  const [generating, setGenerating] = useState(false);
  const [story, setStory] = useState("");
  const [error, setError] = useState("");

  async function generate() {
    if (witness === subject) { setError("Witness and subject must be different heroines"); return; }
    setGenerating(true); setError(""); setStory("");
    try {
      const resp = await fetch(`${BASE}/api/story/the-witness`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ witness, subject, relationship, captor, captorMethod, observationPoint, witnessKnows }),
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
      if (full) saveToArchive({ title: `The Witness — ${witness} observes ${subject}`, universe: "The Witness", tool: "the-witness", characters: [witness, subject, captor], chapters: [full] });
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setGenerating(false); }
  }

  if (step === "reading" && story) {
    return <CinematicReader story={story} title={`The Witness — ${witness} watches`} heroineName={witness} heroineColor={COLOR} villain={captor} onExit={() => setStep("setup")} />;
  }

  return (
    <div style={{ minHeight:"100vh", background:"#020008", color:"rgba(220,215,235,0.9)", fontFamily:"'Raleway',sans-serif", padding:"2rem 1rem", maxWidth:"700px", margin:"0 auto" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"2.5rem" }}>
        <button onClick={onBack} style={{ background:"none", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", color:"rgba(200,180,240,0.6)", padding:"0.5rem 1rem", cursor:"pointer", fontSize:"0.6rem", letterSpacing:"2px", fontFamily:"'Cinzel',serif" }}>← BACK</button>
        <div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.42rem", letterSpacing:"6px", color:`${COLOR}77`, textTransform:"uppercase", marginBottom:"0.2rem" }}>SHADOWWEAVE</div>
          <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(1rem,4vw,1.6rem)", fontWeight:900, color:COLOR, margin:0, letterSpacing:"3px" }}>THE WITNESS</h1>
        </div>
      </div>
      <p style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.3)", marginBottom:"2rem", lineHeight:1.7 }}>Pure psychological horror. The witness cannot intervene — she can only watch. Written entirely from her perspective: her helplessness, her dread, the way watching someone she knows break does things to her that no direct experience could. No physical action. The violence is entirely internal.</p>

      <div style={{ animation:"fadeUp 0.4s ease" }}>
        <div style={{ background:"rgba(167,139,250,0.05)", border:`1px solid ${COLOR}22`, borderRadius:"10px", padding:"1rem", marginBottom:"1.5rem", fontSize:"0.57rem", color:`${COLOR}99`, lineHeight:1.7 }}>
          The story is told from <strong style={{ color:COLOR }}>the witness's</strong> perspective exclusively. She observes. She cannot stop it. The captor may or may not acknowledge her presence.
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1.2rem" }}>
          {[["THE WITNESS — POV CHARACTER", witness, setWitness],["THE SUBJECT — BEING CONDITIONED", subject, setSubject]].map(([label, val, setter]) => (
            <div key={String(label)}>
              <div style={{ fontSize:"0.45rem", letterSpacing:"3px", color:`${COLOR}88`, textTransform:"uppercase", fontFamily:"'Cinzel',serif", marginBottom:"0.5rem" }}>{String(label)}</div>
              <select value={String(val)} onChange={e=>(setter as (v:string)=>void)(e.target.value)} style={ss}>{HEROINES.map(h=><option key={h}>{h}</option>)}</select>
            </div>
          ))}
        </div>
        {witness === subject && <div style={{ color:"#F97316", fontSize:"0.55rem", marginBottom:"1rem" }}>⚠ Select two different heroines</div>}

        {[
          { label:"RELATIONSHIP BETWEEN THEM", el: <select value={relationship} onChange={e=>setRelationship(e.target.value)} style={ss}>{RELATIONSHIPS.map(r=><option key={r}>{r}</option>)}</select> },
          { label:"CAPTOR", el: <select value={captor} onChange={e=>setCaptor(e.target.value)} style={ss}>{CAPTORS.map(c=><option key={c}>{c}</option>)}</select> },
          { label:"CAPTOR'S METHOD", el: <select value={captorMethod} onChange={e=>setCaptorMethod(e.target.value)} style={ss}>{CAPTOR_METHODS.map(m=><option key={m}>{m}</option>)}</select> },
          { label:"WHERE THE WITNESS IS POSITIONED", el: <select value={observationPoint} onChange={e=>setObservationPoint(e.target.value)} style={ss}>{SETTINGS.map(s=><option key={s}>{s}</option>)}</select> },
          { label:"WHAT THE WITNESS KNOWS ABOUT HER OWN FATE", el: <input value={witnessKnows} onChange={e=>setWitnessKnows(e.target.value)} style={ss} /> },
        ].map(({ label, el }) => (
          <div key={label} style={{ marginBottom:"1.2rem" }}>
            <div style={{ fontSize:"0.45rem", letterSpacing:"3px", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", fontFamily:"'Cinzel',serif", marginBottom:"0.5rem" }}>{label}</div>
            {el}
          </div>
        ))}
        {error && <div style={{ color:"#EF4444", fontSize:"0.6rem", marginBottom:"1rem" }}>{error}</div>}
        {generating && <div style={{ color:`${COLOR}88`, fontSize:"0.6rem", marginBottom:"1rem", fontFamily:"'Cinzel',serif", letterSpacing:"2px" }}>GENERATING...</div>}
        <button onClick={generate} disabled={generating} style={{ width:"100%", padding:"1rem", background: generating ? "rgba(255,255,255,0.04)" : `linear-gradient(135deg, ${COLOR}88, ${COLOR}55)`, border:"none", borderRadius:"10px", color: generating ? "rgba(255,255,255,0.3)" : "#fff", fontFamily:"'Cinzel',serif", fontSize:"0.7rem", letterSpacing:"3px", cursor: generating ? "not-allowed" : "pointer", transition:"all 0.2s" }}>
          {generating ? "GENERATING..." : "BEGIN THE OBSERVATION"}
        </button>
      </div>
    </div>
  );
}
