import { useState } from "react";
import CinematicReader from "../components/CinematicReader";
import { saveToArchive } from "../lib/archive";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const COLOR = "#FCA311";

const ALL_HEROINES = ["Black Canary","Supergirl","Wonder Woman","Black Widow","Scarlet Witch","Sara Lance","Dinah Drake","Kara Danvers","Alex Danvers","Zatanna","Jean Grey","Storm","Rogue","Psylocke","Batgirl","Starfire","Raven","Silk","Spider-Gwen","Iris West","Nora West-Allen","Jesse Quick","Batwoman","Sophie Moore","Felicity Smoak","Thea Queen","Shado","Tatsu Yamashiro","Evelyn Sharp","Caitlin Snow","Nora Darhk","Cecile Horton","Shayera Hol","Vixen","Hawkgirl","Artemis (YJ)","M'gann M'orzz"];
const ALL_BIDDERS = ["The Joker — chaos and performance","Talia al Ghul — conditioning and transformation","Nyssa al Ghul — ritual and devotion","Lex Luthor — asset acquisition, institutional use","Deathstroke — professional assignment","Damien Darhk — dark magic and entertainment","Ra's al Ghul — League initiation","Baron Zemo — HYDRA's trophy programme","The Red Room — conversion to operative","Malcolm Merlyn — Undertaking leverage","Anonymous — no disclosed methodology","The Penguin — Gotham's premier collector","Vandal Savage — centuries of patience","Gorilla Grodd — psychological dominance","Lady Shiva — personal mentorship, her own kind"];
const AUCTIONEERS = ["A masked figure — voice distorted, identity unknown","Oswald Cobblepot — The Penguin, hosting in Gotham","A neutral broker — purely professional, emotionless","The Joker himself, in a tuxedo, genuinely enjoying the evening","A disembodied voice over a PA system — no one knows the room","Two Sisters — they co-host, they finish each other's sentences, they enjoy their work"];
const VENUES = ["A sealed underground theatre — Gotham's oldest","A luxury yacht in international waters — utterly untouchable","A decommissioned opera house — perfect acoustics","A private island — no extraction possible","A Gotham penthouse — the city visible through floor-to-ceiling glass","A digital auction — all bidders appear as encrypted feeds on screens"];

const ss: React.CSSProperties = { width:"100%", padding:"0.65rem 0.9rem", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"8px", color:"rgba(220,215,235,0.85)", fontFamily:"'Raleway',sans-serif", fontSize:"0.65rem", outline:"none", cursor:"pointer", appearance:"none" };

interface Props { onBack: () => void; }

export default function AuctionBlockMode({ onBack }: Props) {
  const [step, setStep] = useState<"setup"|"bidders"|"reading">("setup");
  const [selected, setSelected] = useState<string[]>([ALL_HEROINES[0], ALL_HEROINES[2], ALL_HEROINES[3]]);
  const [bidders, setBidders] = useState<string[]>([ALL_BIDDERS[0], ALL_BIDDERS[1], ALL_BIDDERS[3], ALL_BIDDERS[4]]);
  const [auctioneer, setAuctioneer] = useState(AUCTIONEERS[0]);
  const [venue, setVenue] = useState(VENUES[0]);
  const [tone, setTone] = useState("Theatrical and dark — the auctioneer narrates everything, the audience murmurs and bids, nothing is left to imagination");
  const [generating, setGenerating] = useState(false);
  const [story, setStory] = useState("");
  const [error, setError] = useState("");

  function toggleHeroine(h: string) {
    setSelected(prev => prev.includes(h) ? (prev.length > 2 ? prev.filter(x => x !== h) : prev) : prev.length < 5 ? [...prev, h] : prev);
  }
  function toggleBidder(b: string) {
    setBidders(prev => prev.includes(b) ? (prev.length > 2 ? prev.filter(x => x !== b) : prev) : prev.length < 6 ? [...prev, b] : prev);
  }

  async function generate() {
    setGenerating(true); setError(""); setStory("");
    setStep("reading");
    try {
      const resp = await fetch(`${BASE}/api/story/auction-block`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ heroines: selected, bidders, auctioneer, venue, tone }),
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
            if (p.done) { full = p.story ?? full; setStory(full); }
            else if (p.chunk) { full += p.chunk; setStory(full); }
          } catch {}
        }
      }
      if (full) saveToArchive({ title: `The Auction Block — ${selected.slice(0,2).join(", ")}${selected.length > 2 ? ` +${selected.length-2}` : ""}`, universe: "Auction Block", tool: "auction-block", characters: [...selected, auctioneer], chapters: [full] });
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setGenerating(false); }
  }

  if (step === "reading") {
    if (generating && !story) {
      return (
        <div style={{ minHeight:"100vh", background:"#020008", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"1rem" }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.6rem", color:COLOR, letterSpacing:"4px", animation:"pulse 1.5s ease-in-out infinite" }}>THE AUCTION IS BEING PREPARED</div>
          <div style={{ fontSize:"0.5rem", color:"rgba(255,255,255,0.3)", fontFamily:"'Cinzel',serif" }}>The house fills. The lots are brought in. The evening begins.</div>
          <style>{`@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}`}</style>
        </div>
      );
    }
    if (story) {
      return <CinematicReader story={story} title="THE AUCTION BLOCK" heroineName={selected[0]} heroineColor={COLOR} villain={auctioneer} onExit={() => { setStep("setup"); setStory(""); }} />;
    }
  }

  return (
    <div style={{ minHeight:"100vh", background:"#020008", color:"rgba(220,215,235,0.9)", fontFamily:"'Raleway',sans-serif", padding:"2rem 1rem", maxWidth:"800px", margin:"0 auto" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} .hcard:hover{border-color:${COLOR}66 !important;} .bcard:hover{border-color:${COLOR}66 !important;}`}</style>
      <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"2.5rem" }}>
        <button onClick={onBack} style={{ background:"none", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", color:"rgba(200,180,240,0.6)", padding:"0.5rem 1rem", cursor:"pointer", fontSize:"0.6rem", letterSpacing:"2px", fontFamily:"'Cinzel',serif" }}>← BACK</button>
        <div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.42rem", letterSpacing:"6px", color:`${COLOR}77`, textTransform:"uppercase", marginBottom:"0.2rem" }}>SHADOWWEAVE</div>
          <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(1rem,4vw,1.6rem)", fontWeight:900, color:COLOR, margin:0, letterSpacing:"3px" }}>THE AUCTION BLOCK</h1>
        </div>
      </div>
      <p style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.3)", marginBottom:"2rem", lineHeight:1.7 }}>Select your lots and your bidders. Each heroine is presented, described, demonstrated, and sold. The auctioneer narrates everything. The bidders compete. The story follows every moment — the display, the bidding, the outcome, and what happens immediately after the gavel falls.</p>

      <div style={{ animation:"fadeUp 0.4s ease" }}>
        <div style={{ marginBottom:"1.5rem" }}>
          <div style={{ fontSize:"0.48rem", letterSpacing:"3px", color:`${COLOR}88`, textTransform:"uppercase", fontFamily:"'Cinzel',serif", marginBottom:"0.6rem" }}>SELECT LOTS — {selected.length}/5 SELECTED (min 2)</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem" }}>
            {ALL_HEROINES.map(h => (
              <div key={h} className="hcard" onClick={() => toggleHeroine(h)} style={{ padding:"0.35rem 0.7rem", borderRadius:"6px", border: selected.includes(h) ? `1px solid ${COLOR}` : "1px solid rgba(255,255,255,0.08)", background: selected.includes(h) ? `${COLOR}22` : "rgba(255,255,255,0.02)", color: selected.includes(h) ? COLOR : "rgba(255,255,255,0.4)", fontSize:"0.55rem", cursor:"pointer", transition:"all 0.15s" }}>
                {selected.includes(h) && "✓ "}{h}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom:"1.5rem" }}>
          <div style={{ fontSize:"0.48rem", letterSpacing:"3px", color:`${COLOR}88`, textTransform:"uppercase", fontFamily:"'Cinzel',serif", marginBottom:"0.6rem" }}>SELECT BIDDERS — {bidders.length}/6 SELECTED (min 2)</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem" }}>
            {ALL_BIDDERS.map(b => (
              <div key={b} className="bcard" onClick={() => toggleBidder(b)} style={{ padding:"0.35rem 0.7rem", borderRadius:"6px", border: bidders.includes(b) ? `1px solid ${COLOR}` : "1px solid rgba(255,255,255,0.08)", background: bidders.includes(b) ? `${COLOR}22` : "rgba(255,255,255,0.02)", color: bidders.includes(b) ? COLOR : "rgba(255,255,255,0.4)", fontSize:"0.55rem", cursor:"pointer", transition:"all 0.15s" }}>
                {bidders.includes(b) && "✓ "}{b.split(" — ")[0]}
              </div>
            ))}
          </div>
        </div>

        {[
          { label:"AUCTIONEER", el: <select value={auctioneer} onChange={e=>setAuctioneer(e.target.value)} style={ss}>{AUCTIONEERS.map(a=><option key={a}>{a}</option>)}</select> },
          { label:"VENUE", el: <select value={venue} onChange={e=>setVenue(e.target.value)} style={ss}>{VENUES.map(v=><option key={v}>{v}</option>)}</select> },
          { label:"TONE & ATMOSPHERE", el: <input value={tone} onChange={e=>setTone(e.target.value)} style={ss} /> },
        ].map(({ label, el }) => (
          <div key={label} style={{ marginBottom:"1.2rem" }}>
            <div style={{ fontSize:"0.45rem", letterSpacing:"3px", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", fontFamily:"'Cinzel',serif", marginBottom:"0.5rem" }}>{label}</div>
            {el}
          </div>
        ))}

        {error && <div style={{ color:"#EF4444", fontSize:"0.6rem", marginBottom:"1rem" }}>{error}</div>}
        <button onClick={generate} disabled={generating || selected.length < 2 || bidders.length < 2} style={{ width:"100%", padding:"1rem", background: (generating || selected.length < 2 || bidders.length < 2) ? "rgba(255,255,255,0.04)" : `linear-gradient(135deg, ${COLOR}99, ${COLOR}66)`, border:"none", borderRadius:"10px", color: (generating || selected.length < 2 || bidders.length < 2) ? "rgba(255,255,255,0.3)" : "#020008", fontFamily:"'Cinzel',serif", fontSize:"0.7rem", fontWeight:900, letterSpacing:"3px", cursor: (generating || selected.length < 2 || bidders.length < 2) ? "not-allowed" : "pointer", transition:"all 0.2s" }}>
          {generating ? "PREPARING THE EVENING..." : "OPEN THE AUCTION"}
        </button>
      </div>
    </div>
  );
}
