import { useState, useRef, useEffect } from "react";
import { saveStoryToArchive, updateArchiveStory, exportStoryAsTXT, exportStoryAsPDF } from "../lib/archive";

interface Props { onBack: () => void; }

const HEROINES = [
  "Wonder Woman", "Black Widow", "Supergirl", "Scarlet Witch", "Captain Marvel", "Storm",
  "Black Canary", "Zatanna", "Batgirl", "Jean Grey", "Rogue", "Psylocke", "Emma Frost",
  "Starlight", "Kimiko", "Starfire", "Raven", "Huntress", "She-Hulk", "Invisible Woman",
  "Jessica Jones", "Leia Organa", "Ahsoka Tano", "Black Cat", "Spider-Woman",
  "Valkyrie", "Power Girl", "Catwoman", "Poison Ivy", "Silk Spectre", "Hawkgirl",
  "Silk", "Firestar", "Tigra", "Ms. Marvel", "Dazzler",
];

const AUCTIONEERS = [
  "Lex Luthor", "The Collector", "Kingpin", "Doctor Doom", "Ra's al Ghul",
  "Norman Osborn", "Magneto", "Mephisto", "The Grandmaster", "HYDRA Director",
];

const BIDDER_POOL = [
  "Joker", "Red Skull", "Baron Zemo", "Loki", "Deathstroke", "Sinister", "Gorilla Grodd",
  "Homelander", "Darkseid", "Trigon", "Ultron", "Green Goblin", "Enchantress",
  "Hela", "Apocalypse", "Carnage", "Maxwell Lord", "Black Noir", "Thanos", "Venom",
  "Tombstone", "Justin Hammer", "The Leader", "Crossbones", "Taskmaster",
  "Owl", "Bullseye", "Count Nefaria", "Purple Man", "MODOK",
];

const SETTINGS = [
  "An underground black-market vault beneath Metropolis",
  "The Collector's orbiting spacecraft — by invitation only",
  "A secretive billionaire's private island estate",
  "An abandoned HYDRA stronghold repurposed as an auction hall",
  "A darkweb event — participants' identities encrypted",
  "A villain syndicate penthouse with live encrypted bidding",
  "An interdimensional bazaar beyond any jurisdiction",
];

const AUCTION_TYPES = [
  { id: "ownership",   label: "Permanent Ownership",        icon: "⛓",  desc: "Full transfer — the winner owns her completely and permanently" },
  { id: "lease",       label: "Timed Lease",                icon: "🕐",  desc: "A defined period — returned to market after use" },
  { id: "powers",      label: "Power Extraction Rights",    icon: "⚡",  desc: "Winner gains access to her abilities for their own use" },
  { id: "identity",    label: "Identity Exposure Rights",   icon: "🎭",  desc: "Her secret identity goes to the highest bidder" },
  { id: "breaking",    label: "Breaking Rights",            icon: "💔",  desc: "The winner earns the right to break her — mind and body" },
  { id: "performance", label: "Command Performance",        icon: "🎪",  desc: "She performs on the winner's terms, in front of whoever they choose" },
];

const ROUND_LABELS = [
  "Opening Presentation",
  "The Bidding Opens",
  "The War Escalates",
  "Desperate Final Bids",
  "Sold — The Winner Claims Her",
];

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const acc = "#FCA311";
const accRgb = "252,163,17";

function renderAuctionContent(text: string) {
  return text.split("\n").filter(l => l.trim()).map((line, i) => {
    const match = line.match(/^\[([^\]]+)\]:\s*(.*)/s);
    if (match) {
      const speaker = match[1];
      const speech = match[2];
      const isAuctioneer = speaker.toUpperCase().includes("AUCTIONEER");
      return (
        <div key={i} style={{ marginBottom: "1rem", paddingLeft: isAuctioneer ? "0" : "1.25rem", borderLeft: isAuctioneer ? "none" : `2px solid rgba(${accRgb},0.22)` }}>
          <div style={{ fontSize: "0.6rem", color: isAuctioneer ? acc : `rgba(${accRgb},0.55)`, fontFamily: "'Cinzel', serif", letterSpacing: "1.5px", marginBottom: "0.25rem", textTransform: "uppercase" }}>
            {isAuctioneer ? "⚖ " : "💰 "}{speaker}
          </div>
          <p style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: "1.02rem", color: isAuctioneer ? "rgba(255,215,150,0.95)" : "rgba(220,210,255,0.88)", lineHeight: 1.85, margin: 0, fontStyle: isAuctioneer ? "normal" : "italic" }}>
            "{speech}"
          </p>
        </div>
      );
    }
    const isAction = line.startsWith("*") && line.endsWith("*");
    if (isAction) {
      return (
        <p key={i} style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: "0.92rem", color: "rgba(200,190,240,0.42)", lineHeight: 1.8, fontStyle: "italic", marginBottom: "0.75rem" }}>
          {line.replace(/^\*|\*$/g, "")}
        </p>
      );
    }
    return (
      <p key={i} style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: "1rem", color: "rgba(230,225,255,0.82)", lineHeight: 1.9, marginBottom: "0.875rem" }}>
        {line}
      </p>
    );
  });
}

export default function HeroAuctionMode({ onBack }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedHeroes, setSelectedHeroes] = useState<string[]>([]);
  const [customHero, setCustomHero] = useState("");
  const [auctioneer, setAuctioneer] = useState("");
  const [customAuctioneer, setCustomAuctioneer] = useState("");
  const [selectedBidders, setSelectedBidders] = useState<string[]>([]);
  const [setting, setSetting] = useState("");
  const [auctionType, setAuctionType] = useState("");
  const [chapters, setChapters] = useState<string[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [continueDir, setContinueDir] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const finalAuctioneer = customAuctioneer.trim() || auctioneer;
  const allHeroes = customHero.trim() ? [...selectedHeroes, customHero.trim()] : selectedHeroes;
  const canProceed1 = allHeroes.length > 0;
  const canGenerate = canProceed1 && finalAuctioneer && setting && auctionType;
  const roundNum = chapters.length + 1;
  const roundLabel = ROUND_LABELS[Math.min(chapters.length, ROUND_LABELS.length - 1)];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [streamingText, chapters]);

  function toggleHero(h: string) {
    setSelectedHeroes(prev =>
      prev.includes(h) ? prev.filter(x => x !== h) : prev.length < 4 ? [...prev, h] : prev
    );
  }
  function toggleBidder(b: string) {
    setSelectedBidders(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  }

  async function generate(isFirst: boolean) {
    if (isFirst) { setLoading(true); setChapters([]); setSavedId(null); }
    else setContinuing(true);
    setStreamingText(""); setError("");
    try {
      const resp = await fetch(`${BASE}/api/story/hero-auction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroes: allHeroes,
          auctioneer: finalAuctioneer,
          bidders: selectedBidders,
          setting,
          auctionType,
          chapters: isFirst ? [] : chapters,
          roundNumber: isFirst ? 1 : roundNum,
          continueDir,
        }),
      });
      const reader = resp.body!.getReader();
      const dec = new TextDecoder();
      let buf = ""; let final = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n"); buf = lines.pop()!;
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const d = JSON.parse(line.slice(5).trim());
          if (d.chunk) { final += d.chunk; setStreamingText(p => p + d.chunk); }
          if (d.done) final = d.text;
          if (d.error) setError(d.error);
        }
      }
      const newChapters = isFirst ? [final] : [...chapters, final];
      setChapters(newChapters); setStreamingText(""); setContinueDir("");
      const title = `${finalAuctioneer}'s Auction — ${allHeroes.join(", ")}`;
      if (isFirst) {
        const id = saveStoryToArchive({ title, universe: "Hero Auction", tool: "Hero Auction", characters: [...allHeroes, finalAuctioneer], chapters: newChapters });
        setSavedId(id);
      } else if (savedId) {
        updateArchiveStory(savedId, { chapters: newChapters, wordCount: newChapters.join(" ").split(/\s+/).filter(Boolean).length });
      }
    } catch (e) { setError(String(e)); }
    finally { setLoading(false); setContinuing(false); }
  }

  function buildExport() {
    return { id: savedId ?? "tmp", title: `${finalAuctioneer}'s Auction — ${allHeroes.join(", ")}`, createdAt: Date.now(), universe: "Hero Auction", tool: "Hero Auction", characters: [...allHeroes, finalAuctioneer], chapters, tags: [], favourite: false, wordCount: chapters.join(" ").split(/\s+/).filter(Boolean).length };
  }

  const pill = (label: string, active: boolean, onClick: () => void, disabled = false) => (
    <button key={label} onClick={onClick} disabled={disabled}
      style={{ padding: "0.4rem 0.85rem", borderRadius: "20px", border: `1px solid ${active ? acc : `rgba(${accRgb},0.2)`}`, background: active ? `rgba(${accRgb},0.18)` : "transparent", color: active ? acc : disabled ? "rgba(200,195,225,0.2)" : "rgba(200,195,225,0.5)", fontSize: "0.72rem", cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.2s", fontFamily: "'Raleway', sans-serif" }}>
      {label}
    </button>
  );

  if (step === 3) {
    if (loading && chapters.length === 0) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
          <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }`}</style>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.75rem", color: acc, letterSpacing: "4px", textTransform: "uppercase", animation: "pulse 2s ease-in-out infinite" }}>Preparing the auction floor…</div>
          <div style={{ fontSize: "0.65rem", color: `rgba(${accRgb},0.4)`, fontFamily: "'Raleway', sans-serif", letterSpacing: "2px" }}>Opening Presentation</div>
        </div>
      );
    }

    return (
      <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
          <button onClick={() => { setStep(1); setChapters([]); }} style={{ background: "transparent", border: `1px solid rgba(${accRgb},0.3)`, color: acc, borderRadius: "8px", padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.75rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px" }}>← NEW AUCTION</button>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.1rem", color: acc, letterSpacing: "3px", margin: 0, flex: 1 }}>HERO AUCTION</h1>
          <button onClick={() => exportStoryAsTXT(buildExport())} style={{ background: "transparent", border: `1px solid rgba(${accRgb},0.3)`, color: "rgba(200,195,225,0.6)", borderRadius: "6px", padding: "0.4rem 0.8rem", cursor: "pointer", fontSize: "0.65rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px" }}>TXT</button>
          <button onClick={() => exportStoryAsPDF(buildExport())} style={{ background: "transparent", border: `1px solid rgba(${accRgb},0.3)`, color: "rgba(200,195,225,0.6)", borderRadius: "6px", padding: "0.4rem 0.8rem", cursor: "pointer", fontSize: "0.65rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px" }}>PDF</button>
        </div>

        {/* Round progress */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {ROUND_LABELS.map((l, i) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: i < chapters.length ? acc : "rgba(255,255,255,0.1)", border: i === chapters.length - 1 ? `2px solid ${acc}` : "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }} />
              <span style={{ fontSize: "0.58rem", color: i < chapters.length ? `rgba(${accRgb},0.7)` : "rgba(200,195,225,0.25)", fontFamily: "'Cinzel', serif", letterSpacing: "1px", whiteSpace: "nowrap" }}>{l.toUpperCase()}</span>
            </div>
          ))}
        </div>

        {/* Auction metadata */}
        <div style={{ background: `rgba(${accRgb},0.05)`, border: `1px solid rgba(${accRgb},0.15)`, borderRadius: "12px", padding: "0.875rem 1.25rem", marginBottom: "2rem", display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "center" }}>
          <div><div style={{ fontSize: "0.5rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.2rem" }}>ON THE BLOCK</div><div style={{ fontSize: "0.82rem", color: "#EEE", fontFamily: "'Raleway', sans-serif" }}>{allHeroes.join(" & ")}</div></div>
          <div><div style={{ fontSize: "0.5rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.2rem" }}>AUCTIONEER</div><div style={{ fontSize: "0.82rem", color: "#EEE", fontFamily: "'Raleway', sans-serif" }}>{finalAuctioneer}</div></div>
          <div><div style={{ fontSize: "0.5rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.2rem" }}>AUCTION TYPE</div><div style={{ fontSize: "0.82rem", color: "#EEE", fontFamily: "'Raleway', sans-serif" }}>{AUCTION_TYPES.find(a => a.id === auctionType)?.label ?? auctionType}</div></div>
        </div>

        {/* Chapters */}
        {chapters.map((ch, i) => (
          <div key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "2rem 0 1.25rem" }}>
              <div style={{ flex: 1, height: "1px", background: `rgba(${accRgb},0.18)` }} />
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", color: `rgba(${accRgb},0.55)`, letterSpacing: "3px", whiteSpace: "nowrap" }}>
                ⚖ ROUND {i + 1}: {(ROUND_LABELS[i] ?? "FINAL ROUND").toUpperCase()} ⚖
              </span>
              <div style={{ flex: 1, height: "1px", background: `rgba(${accRgb},0.18)` }} />
            </div>
            {renderAuctionContent(ch)}
          </div>
        ))}

        {/* Streaming */}
        {streamingText && (
          <div style={{ opacity: 0.85 }}>
            {renderAuctionContent(streamingText)}
          </div>
        )}

        <div ref={bottomRef} />

        {/* Continue panel */}
        {!loading && !continuing && chapters.length < 5 && (
          <div style={{ marginTop: "2rem", background: "rgba(0,0,0,0.4)", border: `1px solid rgba(${accRgb},0.2)`, borderRadius: "12px", padding: "1.5rem" }}>
            <div style={{ fontSize: "0.6rem", color: `rgba(${accRgb},0.6)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.5rem" }}>
              ROUND {roundNum} — {roundLabel?.toUpperCase()}
            </div>
            <textarea
              value={continueDir}
              onChange={e => setContinueDir(e.target.value)}
              placeholder={`Steer Round ${roundNum}… (optional — e.g. "Joker outbids everyone with a disturbing demand", "bidders fight over her")`}
              rows={2}
              style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid rgba(${accRgb},0.2)`, borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.82rem", padding: "0.75rem", resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: "0.75rem" }}
            />
            <button
              onClick={() => generate(false)}
              disabled={continuing}
              style={{ width: "100%", padding: "0.85rem", background: `rgba(${accRgb},0.14)`, border: `1px solid rgba(${accRgb},0.45)`, color: acc, borderRadius: "8px", cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px" }}
            >
              {continuing ? "BIDDING..." : `⚖ NEXT ROUND — ${roundLabel?.toUpperCase()}`}
            </button>
          </div>
        )}

        {chapters.length >= 5 && (
          <div style={{ marginTop: "2rem", textAlign: "center", fontFamily: "'Cinzel', serif", color: `rgba(${accRgb},0.5)`, fontSize: "0.7rem", letterSpacing: "3px" }}>— SOLD. THE GAVEL HAS FALLEN. —</div>
        )}

        {continuing && (
          <div style={{ textAlign: "center", padding: "1.5rem", color: `rgba(${accRgb},0.5)`, fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px" }}>
            The bidding room stirs…
          </div>
        )}

        {error && <div style={{ color: "#FF6060", fontSize: "0.75rem", marginTop: "1rem", fontFamily: "'Raleway', sans-serif" }}>Error: {error}</div>}
      </div>
    );
  }

  if (step === 2) {
    return (
      <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "760px", margin: "0 auto" }}>
        <button onClick={() => setStep(1)} style={{ background: "transparent", border: `1px solid rgba(${accRgb},0.3)`, color: acc, borderRadius: "8px", padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.75rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px", marginBottom: "2rem" }}>← BACK</button>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.3rem", color: acc, letterSpacing: "3px", marginBottom: "2rem" }}>CONFIGURE THE AUCTION</h1>

        <AuctionSection title="AUCTIONEER" rgb={accRgb} acc={acc}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
            {AUCTIONEERS.map(v => pill(v, auctioneer === v, () => { setAuctioneer(v); setCustomAuctioneer(""); }))}
          </div>
          <input value={customAuctioneer} onChange={e => { setCustomAuctioneer(e.target.value); setAuctioneer(""); }} placeholder="Or type any villain as auctioneer…" style={inputStyle} />
        </AuctionSection>

        <AuctionSection title="VENUE" rgb={accRgb} acc={acc}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {SETTINGS.map(s => pill(s, setting === s, () => setSetting(s)))}
          </div>
        </AuctionSection>

        <AuctionSection title="AUCTION TYPE" rgb={accRgb} acc={acc}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.625rem" }}>
            {AUCTION_TYPES.map(at => {
              const isSel = auctionType === at.id;
              return (
                <button key={at.id} onClick={() => setAuctionType(at.id)}
                  style={{ background: isSel ? `rgba(${accRgb},0.16)` : "rgba(0,0,0,0.4)", border: `1px solid ${isSel ? `rgba(${accRgb},0.55)` : "rgba(255,255,255,0.06)"}`, borderRadius: "12px", padding: "0.875rem", cursor: "pointer", textAlign: "left", color: "inherit", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                    <span style={{ fontSize: "1.1rem" }}>{at.icon}</span>
                    <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.75rem", color: isSel ? acc : "#E8E8F0", fontWeight: 700 }}>{at.label}</span>
                  </div>
                  <div style={{ fontSize: "0.62rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Montserrat', sans-serif" }}>{at.desc}</div>
                </button>
              );
            })}
          </div>
        </AuctionSection>

        <AuctionSection title="BIDDERS IN THE ROOM" rgb={accRgb} acc={acc} subtitle="(optional — leave empty and AI will cast the room)">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {BIDDER_POOL.map(b => pill(b, selectedBidders.includes(b), () => toggleBidder(b)))}
          </div>
          {selectedBidders.length > 0 && (
            <div style={{ marginTop: "0.75rem", fontSize: "0.62rem", color: `rgba(${accRgb},0.5)`, fontFamily: "'Cinzel', serif", letterSpacing: "1.5px" }}>
              {selectedBidders.length} BIDDER{selectedBidders.length !== 1 ? "S" : ""} SELECTED
            </div>
          )}
        </AuctionSection>

        {error && <div style={{ color: "#FF6060", fontSize: "0.75rem", marginBottom: "1rem" }}>Error: {error}</div>}
        <button
          onClick={() => { if (canGenerate) { setStep(3); generate(true); } }}
          disabled={!canGenerate || loading}
          style={{ width: "100%", padding: "1rem", background: canGenerate ? `rgba(${accRgb},0.15)` : "rgba(255,255,255,0.03)", border: `1px solid ${canGenerate ? `rgba(${accRgb},0.5)` : "rgba(255,255,255,0.08)"}`, color: canGenerate ? acc : "rgba(200,195,225,0.3)", borderRadius: "10px", cursor: canGenerate ? "pointer" : "not-allowed", fontFamily: "'Cinzel', serif", fontSize: "0.85rem", letterSpacing: "3px", transition: "all 0.2s" }}
        >
          {loading ? "OPENING THE FLOOR…" : "⚖ OPEN THE AUCTION"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "860px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }}>
        <button onClick={onBack} style={{ background: "transparent", border: `1px solid rgba(${accRgb},0.3)`, color: acc, borderRadius: "8px", padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.75rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px" }}>← HOME</button>
        <div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.3rem,3vw,1.8rem)", color: acc, letterSpacing: "4px", margin: 0 }}>HERO AUCTION</h1>
          <div style={{ fontSize: "0.65rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "3px", fontFamily: "'Cinzel', serif", marginTop: "0.25rem" }}>VILLAIN BLACK MARKET — LIVE BIDDING</div>
        </div>
      </div>

      <AuctionSection title="SELECT HEROINES FOR THE BLOCK" rgb={accRgb} acc={acc} subtitle={`Multi-select up to 4 — ${selectedHeroes.length}/4 chosen`}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.875rem" }}>
          {HEROINES.map(h => {
            const sel = selectedHeroes.includes(h);
            const maxed = !sel && selectedHeroes.length >= 4;
            return pill(h, sel, () => toggleHero(h), maxed);
          })}
        </div>
        <input
          value={customHero}
          onChange={e => setCustomHero(e.target.value)}
          placeholder="Or add a custom heroine name…"
          style={inputStyle}
        />
      </AuctionSection>

      <button
        onClick={() => { if (canProceed1) setStep(2); }}
        disabled={!canProceed1}
        style={{ width: "100%", padding: "1rem", background: canProceed1 ? `rgba(${accRgb},0.15)` : "rgba(255,255,255,0.03)", border: `1px solid ${canProceed1 ? `rgba(${accRgb},0.5)` : "rgba(255,255,255,0.08)"}`, color: canProceed1 ? acc : "rgba(200,195,225,0.3)", borderRadius: "10px", cursor: canProceed1 ? "pointer" : "not-allowed", fontFamily: "'Cinzel', serif", fontSize: "0.85rem", letterSpacing: "3px", transition: "all 0.2s" }}
      >
        CONFIGURE THE AUCTION →
      </button>
    </div>
  );
}

function AuctionSection({ title, subtitle, children, rgb, acc }: { title: string; subtitle?: string; children: React.ReactNode; rgb: string; acc: string }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", borderBottom: `1px solid rgba(${rgb},0.12)`, paddingBottom: "0.5rem", marginBottom: "1rem" }}>
        <div style={{ fontSize: "0.55rem", color: `rgba(${rgb},0.6)`, letterSpacing: "3px", fontFamily: "'Cinzel', serif" }}>{title}</div>
        {subtitle && <div style={{ fontSize: "0.55rem", color: "rgba(200,195,225,0.3)", fontFamily: "'Raleway', sans-serif" }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(252,163,17,0.2)",
  borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif",
  fontSize: "0.8rem", padding: "0.6rem 0.85rem", outline: "none", boxSizing: "border-box",
};
