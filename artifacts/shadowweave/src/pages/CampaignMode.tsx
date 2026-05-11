import { useState, useEffect } from "react";
import CinematicReader from "../components/CinematicReader";
import { saveToArchive } from "../lib/archive";
import {
  getCampaigns, saveCampaign, deleteCampaign, getCampaign,
  addChapterToCampaign, buildContextSummary,
  CAMPAIGN_ARCS, CAMPAIGN_COLORS,
  type Campaign, type CampaignChapter,
} from "../lib/campaign";
import { buildVoiceInstruction } from "../lib/voiceProfiles";
import { buildDegradationInstruction } from "../lib/degradation";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const COLOR = "#C084FC";

const HEROINES = ["Black Canary","Supergirl","Wonder Woman","Black Widow","Scarlet Witch","Sara Lance","Nyssa al Ghul","Dinah Drake","Kara Danvers","Alex Danvers","Lena Luthor","Zari Tomaz","Nora West-Allen","Jesse Quick","Batwoman","Sophie Moore","Storm","Rogue","Psylocke","Jean Grey","Zatanna","Power Girl","Starfire","Raven","Batgirl","Tigra","Silk","Spider-Gwen","Iris West","Caitlin Snow","Nora Darhk","Cecile Horton","Felicity Smoak","Thea Queen","Evelyn Sharp","Tatsu Yamashiro","Shado"];
const VILLAINS = ["The Joker","Talia al Ghul","Nyssa al Ghul","Lena Luthor","Deathstroke","Ra's al Ghul","Damien Darhk","Lex Luthor","Malcolm Merlyn","Prometheus","Bane","Circe","Cheetah","Morgaine le Fey","The Red Room Director","HIVE Commander","Baron Zemo","Red Skull","Magneto","Doctor Doom","Thanos","Black Manta","The Penguin","Two-Face","Harley Quinn (villain)","Poison Ivy","Lady Shiva","Lexa kom Trikru"];

const ss: React.CSSProperties = { width:"100%", padding:"0.65rem 0.9rem", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"8px", color:"rgba(220,215,235,0.85)", fontFamily:"'Raleway',sans-serif", fontSize:"0.65rem", outline:"none", cursor:"pointer", appearance:"none" };

interface Props { onBack: () => void; }

type View = "list" | "create" | "detail" | "reading";

export default function CampaignMode({ onBack }: Props) {
  const [view, setView] = useState<View>("list");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [readingChapter, setReadingChapter] = useState<CampaignChapter | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newHeroine, setNewHeroine] = useState(HEROINES[0]);
  const [newVillain, setNewVillain] = useState(VILLAINS[0]);
  const [newArc, setNewArc] = useState(CAMPAIGN_ARCS[0]);
  const [newColor, setNewColor] = useState(CAMPAIGN_COLORS[0]);

  const [generating, setGenerating] = useState(false);
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterDirection, setChapterDirection] = useState("");
  const [chapterSetting, setChapterSetting] = useState("A remote facility — no outside contact possible");
  const [error, setError] = useState("");
  const [streamText, setStreamText] = useState("");

  useEffect(() => { reload(); }, []);
  function reload() { setCampaigns(getCampaigns()); }

  function createCampaign() {
    if (!newTitle.trim()) { setError("Campaign needs a title"); return; }
    const c: Campaign = {
      id: `camp_${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim(),
      heroine: newHeroine,
      villain: newVillain,
      arc: newArc,
      chapters: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      coverColor: newColor,
      status: "active",
    };
    saveCampaign(c);
    reload();
    setActiveCampaign(c);
    setView("detail");
    setNewTitle(""); setNewDesc("");
  }

  async function generateChapter() {
    if (!activeCampaign) return;
    setGenerating(true); setError(""); setStreamText("");
    const contextSummary = buildContextSummary(activeCampaign.chapters);
    const voice = buildVoiceInstruction(activeCampaign.heroine);
    const degradation = buildDegradationInstruction(activeCampaign.heroine, activeCampaign.villain);
    try {
      const resp = await fetch(`${BASE}/api/story/campaign-chapter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: activeCampaign.title,
          heroine: activeCampaign.heroine,
          villain: activeCampaign.villain,
          arc: activeCampaign.arc,
          chapterNumber: activeCampaign.chapters.length + 1,
          chapterTitle: chapterTitle.trim() || `Chapter ${activeCampaign.chapters.length + 1}`,
          setting: chapterSetting,
          direction: chapterDirection.trim(),
          contextSummary,
          voiceInstruction: voice,
          degradationInstruction: degradation,
        }),
      });
      if (!resp.ok || !resp.body) { setError("Failed to connect"); setGenerating(false); return; }
      const reader = resp.body.getReader();
      const dec = new TextDecoder();
      let full = "";
      let summary = "";
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
              summary = payload.summary ?? full.slice(0, 500) + "...";
            } else if (payload.chunk) {
              full += payload.chunk;
              setStreamText(full);
            }
          } catch {}
        }
      }
      if (full) {
        const ch: CampaignChapter = {
          id: `ch_${Date.now()}`,
          title: chapterTitle.trim() || `Chapter ${activeCampaign.chapters.length + 1}`,
          story: full,
          heroine: activeCampaign.heroine,
          villain: activeCampaign.villain,
          setting: chapterSetting,
          createdAt: new Date().toISOString(),
          wordCount: full.split(/\s+/).length,
          summary,
          chapterNumber: activeCampaign.chapters.length + 1,
        };
        const updated = addChapterToCampaign(activeCampaign.id, ch);
        if (updated) { setActiveCampaign(updated); reload(); }
        saveToArchive({ title: `${activeCampaign.title} — ${chapterTitle.trim() || `Chapter ${activeCampaign.chapters.length + 1}`}`, universe: "Campaign", tool: "campaign-chapter", characters: [activeCampaign.heroine, activeCampaign.villain], chapters: [full] });
        setChapterTitle(""); setChapterDirection("");
      }
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setGenerating(false); setStreamText(""); }
  }

  const totalWords = activeCampaign?.chapters.reduce((t, c) => t + c.wordCount, 0) ?? 0;

  if (view === "reading" && readingChapter) {
    return (
      <CinematicReader
        story={readingChapter.story}
        title={readingChapter.title}
        heroineName={readingChapter.heroine}
        heroineColor={activeCampaign?.coverColor ?? COLOR}
        villain={readingChapter.villain}
        onExit={() => setView("detail")}
      />
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"#020008", color:"rgba(220,215,235,0.9)", fontFamily:"'Raleway',sans-serif", padding:"2rem 1rem", maxWidth:"860px", margin:"0 auto" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>

      <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"2.5rem" }}>
        <button onClick={view === "list" ? onBack : () => setView("list")} style={{ background:"none", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", color:"rgba(200,180,240,0.6)", padding:"0.5rem 1rem", cursor:"pointer", fontSize:"0.6rem", letterSpacing:"2px", fontFamily:"'Cinzel',serif" }}>
          {view === "list" ? "← BACK" : "← CAMPAIGNS"}
        </button>
        <div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.45rem", letterSpacing:"6px", color:`${COLOR}99`, textTransform:"uppercase", marginBottom:"0.2rem" }}>SHADOWWEAVE</div>
          <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(1.2rem,4vw,1.8rem)", fontWeight:900, color:COLOR, margin:0, letterSpacing:"3px" }}>
            {view === "list" ? "CAMPAIGN SAGAS" : view === "create" ? "NEW SAGA" : activeCampaign?.title ?? "CAMPAIGN"}
          </h1>
        </div>
      </div>

      {view === "list" && (
        <div style={{ animation:"fadeUp 0.4s ease" }}>
          <button onClick={() => setView("create")} style={{ display:"block", width:"100%", padding:"1rem", background:`linear-gradient(135deg, ${COLOR}22, ${COLOR}11)`, border:`1px solid ${COLOR}44`, borderRadius:"12px", color:COLOR, fontFamily:"'Cinzel',serif", fontSize:"0.7rem", letterSpacing:"3px", cursor:"pointer", marginBottom:"2rem", transition:"all 0.2s" }}>
            + CREATE NEW SAGA
          </button>
          {campaigns.length === 0 && (
            <div style={{ textAlign:"center", padding:"4rem 2rem", color:"rgba(255,255,255,0.2)", fontFamily:"'Cinzel',serif", fontSize:"0.6rem", letterSpacing:"3px" }}>
              NO SAGAS YET<br /><span style={{ fontSize:"0.5rem", marginTop:"0.5rem", display:"block" }}>Create your first linked multi-chapter saga above</span>
            </div>
          )}
          {campaigns.map(c => (
            <div key={c.id} onClick={() => { setActiveCampaign(getCampaign(c.id) ?? c); setView("detail"); }} style={{ background:"rgba(255,255,255,0.02)", border:`1px solid ${c.coverColor}33`, borderRadius:"12px", padding:"1.2rem 1.5rem", marginBottom:"1rem", cursor:"pointer", transition:"all 0.2s", display:"flex", alignItems:"center", gap:"1.2rem" }}>
              <div style={{ width:"42px", height:"42px", borderRadius:"10px", background:`linear-gradient(135deg, ${c.coverColor}66, ${c.coverColor}33)`, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Cinzel',serif", fontSize:"1rem" }}>📖</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.75rem", color:c.coverColor, fontWeight:700, marginBottom:"0.2rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.title}</div>
                <div style={{ fontSize:"0.58rem", color:"rgba(255,255,255,0.4)", marginBottom:"0.3rem" }}>{c.heroine} · {c.villain} · {c.chapters.length} chapter{c.chapters.length !== 1 ? "s" : ""}</div>
                <div style={{ fontSize:"0.55rem", color:"rgba(255,255,255,0.25)" }}>{c.arc}</div>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <div style={{ fontSize:"0.6rem", color:c.coverColor }}>{c.chapters.reduce((t,ch)=>t+ch.wordCount,0).toLocaleString()} words</div>
                <div style={{ fontSize:"0.5rem", color:"rgba(255,255,255,0.2)", marginTop:"0.2rem" }}>{new Date(c.updatedAt).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "create" && (
        <div style={{ animation:"fadeUp 0.4s ease" }}>
          {[
            { label:"SAGA TITLE", el: <input value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="e.g. The Molding of the Canaries" style={{ ...ss }} /> },
            { label:"DESCRIPTION (OPTIONAL)", el: <textarea value={newDesc} onChange={e=>setNewDesc(e.target.value)} placeholder="The overarching premise of this saga..." rows={3} style={{ ...ss, resize:"vertical" }} /> },
            { label:"HEROINE", el: <select value={newHeroine} onChange={e=>setNewHeroine(e.target.value)} style={ss}>{HEROINES.map(h=><option key={h}>{h}</option>)}</select> },
            { label:"VILLAIN", el: <select value={newVillain} onChange={e=>setNewVillain(e.target.value)} style={ss}>{VILLAINS.map(v=><option key={v}>{v}</option>)}</select> },
            { label:"ARC TYPE", el: <select value={newArc} onChange={e=>setNewArc(e.target.value)} style={ss}>{CAMPAIGN_ARCS.map(a=><option key={a}>{a}</option>)}</select> },
          ].map(({ label, el }) => (
            <div key={label} style={{ marginBottom:"1.2rem" }}>
              <div style={{ fontSize:"0.48rem", letterSpacing:"3px", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", fontFamily:"'Cinzel',serif", marginBottom:"0.5rem" }}>{label}</div>
              {el}
            </div>
          ))}
          <div style={{ marginBottom:"1.5rem" }}>
            <div style={{ fontSize:"0.48rem", letterSpacing:"3px", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", fontFamily:"'Cinzel',serif", marginBottom:"0.5rem" }}>SAGA COLOR</div>
            <div style={{ display:"flex", gap:"0.6rem", flexWrap:"wrap" }}>
              {CAMPAIGN_COLORS.map(c => <div key={c} onClick={()=>setNewColor(c)} style={{ width:"28px", height:"28px", borderRadius:"50%", background:c, cursor:"pointer", border: newColor===c ? `3px solid white` : "3px solid transparent", transition:"all 0.15s" }} />)}
            </div>
          </div>
          {error && <div style={{ color:"#EF4444", fontSize:"0.6rem", marginBottom:"1rem" }}>{error}</div>}
          <button onClick={createCampaign} style={{ width:"100%", padding:"1rem", background:`linear-gradient(135deg, ${newColor}88, ${newColor}55)`, border:"none", borderRadius:"10px", color:"#fff", fontFamily:"'Cinzel',serif", fontSize:"0.65rem", letterSpacing:"3px", cursor:"pointer" }}>
            BEGIN THE SAGA
          </button>
        </div>
      )}

      {view === "detail" && activeCampaign && (
        <div style={{ animation:"fadeUp 0.4s ease" }}>
          <div style={{ background:"rgba(255,255,255,0.02)", border:`1px solid ${activeCampaign.coverColor}33`, borderRadius:"12px", padding:"1.2rem 1.5rem", marginBottom:"2rem" }}>
            <div style={{ display:"flex", gap:"1.5rem", flexWrap:"wrap", marginBottom:"0.8rem" }}>
              {[["HEROINE",activeCampaign.heroine],["VILLAIN",activeCampaign.villain],["CHAPTERS",String(activeCampaign.chapters.length)],["TOTAL WORDS",totalWords.toLocaleString()]].map(([k,v])=>(
                <div key={k}><div style={{ fontSize:"0.42rem", letterSpacing:"3px", color:"rgba(255,255,255,0.3)", fontFamily:"'Cinzel',serif" }}>{k}</div><div style={{ fontSize:"0.65rem", color:activeCampaign.coverColor, fontWeight:700, fontFamily:"'Cinzel',serif" }}>{v}</div></div>
              ))}
            </div>
            {activeCampaign.description && <div style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.4)", fontStyle:"italic" }}>{activeCampaign.description}</div>}
            <div style={{ fontSize:"0.55rem", color:"rgba(255,255,255,0.25)", marginTop:"0.4rem" }}>{activeCampaign.arc}</div>
          </div>

          <div style={{ marginBottom:"2.5rem" }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"4px", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", marginBottom:"1rem" }}>CHAPTERS</div>
            {activeCampaign.chapters.length === 0 && (
              <div style={{ textAlign:"center", padding:"2rem", color:"rgba(255,255,255,0.15)", fontSize:"0.58rem" }}>No chapters yet. Write the first one below.</div>
            )}
            {activeCampaign.chapters.map((ch, i) => (
              <div key={ch.id} onClick={() => { setReadingChapter(ch); setView("reading"); }} style={{ display:"flex", alignItems:"center", gap:"1rem", padding:"0.9rem 1.2rem", background:"rgba(255,255,255,0.02)", border:`1px solid ${activeCampaign.coverColor}22`, borderRadius:"10px", marginBottom:"0.6rem", cursor:"pointer", transition:"all 0.2s" }}>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.6rem", color:`${activeCampaign.coverColor}88`, minWidth:"24px" }}>{i + 1}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"0.65rem", color:"rgba(220,215,235,0.85)", fontWeight:600 }}>{ch.title}</div>
                  <div style={{ fontSize:"0.52rem", color:"rgba(255,255,255,0.3)", marginTop:"0.15rem" }}>{ch.wordCount.toLocaleString()} words · {ch.setting}</div>
                </div>
                <div style={{ fontSize:"0.5rem", color:`${activeCampaign.coverColor}77`, fontFamily:"'Cinzel',serif" }}>READ →</div>
              </div>
            ))}
          </div>

          <div style={{ background:"rgba(255,255,255,0.02)", border:`1px solid ${activeCampaign.coverColor}33`, borderRadius:"12px", padding:"1.5rem" }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"4px", color:activeCampaign.coverColor, textTransform:"uppercase", marginBottom:"1.2rem" }}>
              ADD CHAPTER {activeCampaign.chapters.length + 1}
            </div>
            {[
              { label:"CHAPTER TITLE (OPTIONAL)", el: <input value={chapterTitle} onChange={e=>setChapterTitle(e.target.value)} placeholder={`Chapter ${activeCampaign.chapters.length + 1}`} style={{ ...ss }} /> },
              { label:"SETTING", el: <input value={chapterSetting} onChange={e=>setChapterSetting(e.target.value)} style={{ ...ss }} /> },
              { label:"DIRECTION / BEATS TO HIT (OPTIONAL)", el: <textarea value={chapterDirection} onChange={e=>setChapterDirection(e.target.value)} placeholder="What should happen in this chapter? What tone, what turning point..." rows={3} style={{ ...ss, resize:"vertical" }} /> },
            ].map(({ label, el }) => (
              <div key={label} style={{ marginBottom:"1rem" }}>
                <div style={{ fontSize:"0.45rem", letterSpacing:"3px", color:"rgba(255,255,255,0.25)", fontFamily:"'Cinzel',serif", marginBottom:"0.4rem" }}>{label}</div>
                {el}
              </div>
            ))}
            {error && <div style={{ color:"#EF4444", fontSize:"0.6rem", marginBottom:"0.8rem" }}>{error}</div>}
            {streamText && !generating && null}
            {generating && (
              <div style={{ padding:"1rem", background:"rgba(0,0,0,0.3)", borderRadius:"8px", marginBottom:"1rem", fontSize:"0.58rem", color:"rgba(200,180,240,0.7)", lineHeight:1.7, maxHeight:"200px", overflowY:"auto" }}>
                <span style={{ animation:"pulse 1s infinite" }}>●</span> {streamText.slice(-600) || "Generating chapter..."}
              </div>
            )}
            <button onClick={generateChapter} disabled={generating} style={{ width:"100%", padding:"0.9rem", background: generating ? "rgba(255,255,255,0.05)" : `linear-gradient(135deg, ${activeCampaign.coverColor}88, ${activeCampaign.coverColor}55)`, border:"none", borderRadius:"10px", color: generating ? "rgba(255,255,255,0.3)" : "#fff", fontFamily:"'Cinzel',serif", fontSize:"0.65rem", letterSpacing:"3px", cursor: generating ? "not-allowed" : "pointer", transition:"all 0.2s" }}>
              {generating ? "GENERATING CHAPTER..." : "GENERATE CHAPTER"}
            </button>
          </div>

          <button onClick={() => { if (confirm("Delete this entire saga?")) { deleteCampaign(activeCampaign.id); reload(); setActiveCampaign(null); setView("list"); } }} style={{ marginTop:"1.5rem", background:"none", border:"1px solid rgba(239,68,68,0.2)", borderRadius:"8px", color:"rgba(239,68,68,0.4)", padding:"0.5rem 1rem", cursor:"pointer", fontSize:"0.5rem", letterSpacing:"2px", fontFamily:"'Cinzel',serif" }}>
            DELETE SAGA
          </button>
        </div>
      )}
    </div>
  );
}
