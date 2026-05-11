import { useState } from "react";
import { saveToArchive } from "../lib/archive";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const COLOR = "#06B6D4";

const SUBJECTS = ["Black Canary","Supergirl","Wonder Woman","Black Widow","Scarlet Witch","Sara Lance","Dinah Drake","Kara Danvers","Alex Danvers","Zatanna","Jean Grey","Storm","Rogue","Psylocke","Batgirl","Starfire","Raven","Silk","Spider-Gwen","Iris West","Nora West-Allen","Jesse Quick","Cecile Horton","Felicity Smoak","Thea Queen","Shado","Tatsu Yamashiro"];
const RESEARCHERS = ["Dr. Lena Luthor","Dr. Valentina Vostok","The Red Room Director","Dr. Hugo Strange","Dr. T.O. Morrow","Dr. Harleen Quinzel","Professor Ivo","The Council","Unknown — identification classified"];
const FACILITIES = ["LexCorp Behavioral Research Wing — Sub-Level 4","A.R.G.U.S. Black Site Theta","Cadmus Project Underground","The Red Room Institute — Moscow","S.T.A.R. Labs — Restricted Division","Unknown — location withheld per Protocol 9","Vought International — Compound V Research","Arkham Institute — Extended Studies Ward"];
const EXPERIMENT_TYPES = ["Behavioral Compliance Mapping","Stimulus-Response Conditioning","Identity Replacement Protocol","Resistance Threshold Assessment","Neural Compliance Monitoring","Long-Term Behavioral Modification","Loyalty Inversion Study","Psychological Dependency Formation"];
const SESSION_NUMBERS = ["SESSION 001 — BASELINE","SESSION 002 — FIRST CONTACT","SESSION 005 — EARLY CONDITIONING","SESSION 010 — MID-PROTOCOL","SESSION 020 — ADVANCED STAGE","SESSION 050 — DEEP CONDITIONING","SESSION 100 — FINAL ASSESSMENT"];

const ss: React.CSSProperties = { width:"100%", padding:"0.65rem 0.9rem", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"8px", color:"rgba(220,215,235,0.85)", fontFamily:"'Raleway',sans-serif", fontSize:"0.65rem", outline:"none", cursor:"pointer", appearance:"none" };

interface Props { onBack: () => void; }

export default function ResearchFacilityMode({ onBack }: Props) {
  const [step, setStep] = useState<"setup"|"reading">("setup");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [subjectId, setSubjectId] = useState("SUBJECT-7714-ALPHA");
  const [researcher, setResearcher] = useState(RESEARCHERS[0]);
  const [facility, setFacility] = useState(FACILITIES[0]);
  const [experiment, setExperiment] = useState(EXPERIMENT_TYPES[0]);
  const [session, setSession] = useState(SESSION_NUMBERS[0]);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [story, setStory] = useState("");
  const [error, setError] = useState("");

  async function generate() {
    setGenerating(true); setError(""); setStory("");
    try {
      const resp = await fetch(`${BASE}/api/story/research-facility`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ subject, subjectId, researcher, facility, experiment, session, additionalNotes }),
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
      if (full) saveToArchive({ title: `${session} — ${subjectId}`, universe: "Research Facility", tool: "research-facility", characters: [subject, researcher], chapters: [full] });
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setGenerating(false); }
  }

  if (step === "reading" && story) {
    const paragraphs = story.split(/\n+/).filter(p => p.trim().length > 5);
    return (
      <div style={{ minHeight:"100vh", background:"#010810", color:"rgba(180,230,240,0.9)", fontFamily:"'Courier New',monospace", padding:"2rem 1rem", maxWidth:"780px", margin:"0 auto" }}>
        <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}} @keyframes scan{0%{top:0}100%{top:100%}}`}</style>
        <div style={{ position:"fixed", top:0, left:0, right:0, height:"2px", background:`linear-gradient(90deg, transparent, ${COLOR}, transparent)`, animation:"scan 4s linear infinite", opacity:0.3 }} />
        <div style={{ background:"rgba(0,0,0,0.6)", border:`1px solid ${COLOR}44`, borderRadius:"4px", padding:"1.5rem", marginBottom:"2rem", fontFamily:"'Courier New',monospace" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.5rem", marginBottom:"1rem" }}>
            {[
              ["FILE","CLASSIFIED // LEVEL OMEGA"],["FACILITY",facility.split(" — ")[0]],
              ["SUBJECT ID",subjectId],["RESEARCHER",researcher],
              ["EXPERIMENT",experiment],["SESSION",session],
            ].map(([k,v])=>(
              <div key={k}><span style={{ color:`${COLOR}66`, fontSize:"0.5rem" }}>{k}: </span><span style={{ color:COLOR, fontSize:"0.5rem" }}>{v}</span></div>
            ))}
          </div>
          <div style={{ borderTop:`1px solid ${COLOR}33`, paddingTop:"0.8rem", fontSize:"0.45rem", color:`${COLOR}44`, letterSpacing:"2px" }}>
            ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ DOCUMENT BEGINS ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
          </div>
        </div>
        <div style={{ lineHeight:2, fontSize:"0.65rem" }}>
          {paragraphs.map((p, i) => (
            <p key={i} style={{ marginBottom:"1.2rem", color: p.startsWith("RESEARCHER") || p.startsWith("NOTE") || p.startsWith("SESSION") || p.startsWith("HYPOTHESIS") || p.startsWith("PROCEDURE") || p.startsWith("OBSERVATION") || p.startsWith("RESULT") || p.startsWith("PRIVATE") ? COLOR : "rgba(180,230,240,0.75)", fontWeight: p.toUpperCase() === p && p.length < 60 ? 700 : 400, borderLeft: p.toUpperCase() === p && p.length < 60 ? `2px solid ${COLOR}55` : "none", paddingLeft: p.toUpperCase() === p && p.length < 60 ? "0.8rem" : "0" }}>
              {p}
            </p>
          ))}
        </div>
        <div style={{ marginTop:"3rem", display:"flex", gap:"1rem" }}>
          <button onClick={() => setStep("setup")} style={{ background:"none", border:`1px solid ${COLOR}44`, borderRadius:"6px", color:`${COLOR}88`, padding:"0.6rem 1.2rem", cursor:"pointer", fontSize:"0.55rem", letterSpacing:"2px", fontFamily:"'Cinzel',serif" }}>← NEW SESSION</button>
          <button onClick={generate} style={{ background:`${COLOR}22`, border:`1px solid ${COLOR}66`, borderRadius:"6px", color:COLOR, padding:"0.6rem 1.2rem", cursor:"pointer", fontSize:"0.55rem", letterSpacing:"2px", fontFamily:"'Cinzel',serif" }}>REPEAT PROTOCOL</button>
          <button onClick={onBack} style={{ background:"none", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"6px", color:"rgba(255,255,255,0.3)", padding:"0.6rem 1.2rem", cursor:"pointer", fontSize:"0.55rem", letterSpacing:"2px", fontFamily:"'Cinzel',serif" }}>EXIT FACILITY</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"#010810", color:"rgba(180,230,240,0.9)", fontFamily:"'Raleway',sans-serif", padding:"2rem 1rem", maxWidth:"700px", margin:"0 auto" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"2.5rem" }}>
        <button onClick={onBack} style={{ background:"none", border:`1px solid ${COLOR}33`, borderRadius:"8px", color:`${COLOR}66`, padding:"0.5rem 1rem", cursor:"pointer", fontSize:"0.6rem", letterSpacing:"2px", fontFamily:"'Cinzel',serif" }}>← BACK</button>
        <div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.42rem", letterSpacing:"6px", color:`${COLOR}55`, textTransform:"uppercase", marginBottom:"0.2rem" }}>CLASSIFIED RESEARCH</div>
          <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(1rem,4vw,1.6rem)", fontWeight:900, color:COLOR, margin:0, letterSpacing:"3px" }}>THE RESEARCH FACILITY</h1>
        </div>
      </div>
      <p style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.3)", marginBottom:"2rem", lineHeight:1.7 }}>Behavioral research. Clinical format. The subject is a designation, not a name. Each session generates a formal research log — hypothesis, procedure, observations, results, and the researcher's private note that breaks protocol.</p>

      <div style={{ animation:"fadeUp 0.4s ease" }}>
        {[
          { label:"SUBJECT", el: <select value={subject} onChange={e=>setSubject(e.target.value)} style={ss}>{SUBJECTS.map(s=><option key={s}>{s}</option>)}</select> },
          { label:"SUBJECT DESIGNATION / ID", el: <input value={subjectId} onChange={e=>setSubjectId(e.target.value)} style={ss} /> },
          { label:"LEAD RESEARCHER", el: <select value={researcher} onChange={e=>setResearcher(e.target.value)} style={ss}>{RESEARCHERS.map(r=><option key={r}>{r}</option>)}</select> },
          { label:"FACILITY", el: <select value={facility} onChange={e=>setFacility(e.target.value)} style={ss}>{FACILITIES.map(f=><option key={f}>{f}</option>)}</select> },
          { label:"EXPERIMENT TYPE", el: <select value={experiment} onChange={e=>setExperiment(e.target.value)} style={ss}>{EXPERIMENT_TYPES.map(e=><option key={e}>{e}</option>)}</select> },
          { label:"SESSION", el: <select value={session} onChange={e=>setSession(e.target.value)} style={ss}>{SESSION_NUMBERS.map(s=><option key={s}>{s}</option>)}</select> },
          { label:"ADDITIONAL NOTES FOR THIS SESSION (OPTIONAL)", el: <textarea value={additionalNotes} onChange={e=>setAdditionalNotes(e.target.value)} placeholder="Specific objectives, prior session outcomes, behavioral targets..." rows={3} style={{ ...ss, resize:"vertical" }} /> },
        ].map(({ label, el }) => (
          <div key={label} style={{ marginBottom:"1.2rem" }}>
            <div style={{ fontSize:"0.45rem", letterSpacing:"3px", color:`${COLOR}66`, textTransform:"uppercase", fontFamily:"'Courier New',monospace", marginBottom:"0.5rem" }}>{label}</div>
            {el}
          </div>
        ))}
        {error && <div style={{ color:"#EF4444", fontSize:"0.6rem", marginBottom:"1rem" }}>{error}</div>}
        {generating && <div style={{ color:COLOR, fontSize:"0.6rem", marginBottom:"1rem", fontFamily:"'Courier New',monospace" }}>▓ GENERATING SESSION LOG... ▓</div>}
        <button onClick={generate} disabled={generating} style={{ width:"100%", padding:"1rem", background: generating ? "rgba(255,255,255,0.03)" : `linear-gradient(135deg, ${COLOR}55, ${COLOR}33)`, border:`1px solid ${COLOR}44`, borderRadius:"8px", color: generating ? "rgba(255,255,255,0.3)" : COLOR, fontFamily:"'Cinzel',serif", fontSize:"0.65rem", letterSpacing:"4px", cursor: generating ? "not-allowed" : "pointer" }}>
          {generating ? "PROCESSING..." : "INITIATE SESSION"}
        </button>
      </div>
    </div>
  );
}
