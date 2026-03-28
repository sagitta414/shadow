import { useState, useMemo } from "react";
import { getArchive } from "../lib/archive";
import { heroImgSrc } from "../components/HeroinePicker";

interface Props { onBack: () => void; }

const NOTES_KEY = "sw_dossier_notes_v1";
function getNotes(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(NOTES_KEY) ?? "{}"); } catch { return {}; }
}
function saveNote(heroine: string, note: string) {
  const n = getNotes(); n[heroine] = note;
  localStorage.setItem(NOTES_KEY, JSON.stringify(n));
}

interface HeroineStats {
  name: string;
  storyCount: number;
  totalWords: number;
  villains: string[];
  firstSeen: number;
  lastSeen: number;
  modes: string[];
}

export default function HeroineDossier({ onBack }: Props) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"stories" | "words" | "alpha" | "recent">("stories");
  const [selected, setSelected] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>(getNotes);
  const [editNote, setEditNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  const dossiers = useMemo<HeroineStats[]>(() => {
    const archive = getArchive();
    const map = new Map<string, HeroineStats>();
    archive.forEach(story => {
      story.characters.forEach(name => {
        if (!name?.trim()) return;
        const key = name.trim();
        const ex = map.get(key) ?? { name: key, storyCount: 0, totalWords: 0, villains: [], firstSeen: story.createdAt, lastSeen: story.createdAt, modes: [] };
        ex.storyCount++;
        ex.totalWords += story.wordCount ?? 0;
        if (story.createdAt < ex.firstSeen) ex.firstSeen = story.createdAt;
        if (story.createdAt > ex.lastSeen) ex.lastSeen = story.createdAt;
        // Grab villain from title/characters — second character slot if present
        if (story.characters.length > 1) {
          story.characters.slice(1).forEach(v => { if (v && !ex.villains.includes(v)) ex.villains.push(v); });
        }
        if (story.tool && !ex.modes.includes(story.tool)) ex.modes.push(story.tool);
        map.set(key, ex);
      });
    });
    return Array.from(map.values());
  }, []);

  const filtered = useMemo(() => {
    let list = dossiers.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
    if (sort === "stories") list = [...list].sort((a, b) => b.storyCount - a.storyCount);
    else if (sort === "words") list = [...list].sort((a, b) => b.totalWords - a.totalWords);
    else if (sort === "alpha") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "recent") list = [...list].sort((a, b) => b.lastSeen - a.lastSeen);
    return list;
  }, [dossiers, search, sort]);

  const selData = selected ? dossiers.find(d => d.name === selected) : null;

  function openDossier(name: string) {
    setSelected(name);
    setEditNote(notes[name] ?? "");
  }

  function handleSaveNote() {
    if (!selected) return;
    saveNote(selected, editNote);
    setNotes(prev => ({ ...prev, [selected]: editNote }));
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 1800);
  }

  const fmtDate = (ts: number) => new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "2rem 1.25rem", minHeight: "100vh" }}>
      <button onClick={selected ? () => setSelected(null) : onBack} style={{ background: "transparent", border: "none", color: "rgba(200,200,220,0.35)", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px", cursor: "pointer", padding: "0.5rem 0", marginBottom: "2rem" }}>
        ← {selected ? "ALL HEROINES" : "BACK"}
      </button>

      {!selected ? (
        <>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.5rem", letterSpacing: "7px", color: "rgba(168,85,247,0.5)", textTransform: "uppercase", marginBottom: "0.6rem" }}>Archive Intelligence</div>
            <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.6rem, 3vw, 2.4rem)", color: "#E9D5FF", margin: "0 0 0.5rem", fontWeight: 700, letterSpacing: "2px" }}>Heroine Dossier</h1>
            <p style={{ color: "rgba(200,195,240,0.35)", fontSize: "0.85rem", fontFamily: "'Raleway', sans-serif" }}>{dossiers.length} heroine{dossiers.length !== 1 ? "s" : ""} in your story archive</p>
          </div>

          {dossiers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "5rem 2rem", color: "rgba(200,200,220,0.2)", fontFamily: "'Cinzel', serif", fontSize: "0.9rem", letterSpacing: "2px" }}>
              No stories archived yet.<br /><span style={{ fontSize: "0.7rem", opacity: 0.6 }}>Generate and save stories to build your dossier.</span>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search heroines…" style={{ flex: 1, minWidth: "160px", padding: "0.6rem 1rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: "10px", color: "#F0EFF8", fontFamily: "'Raleway', sans-serif", fontSize: "0.85rem", outline: "none" }} />
                {(["stories", "words", "recent", "alpha"] as const).map(s => (
                  <button key={s} onClick={() => setSort(s)} style={{ padding: "0.6rem 1rem", borderRadius: "10px", cursor: "pointer", fontSize: "0.65rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px", textTransform: "uppercase", background: sort === s ? "rgba(168,85,247,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${sort === s ? "rgba(168,85,247,0.5)" : "rgba(255,255,255,0.1)"}`, color: sort === s ? "#C084FC" : "rgba(200,200,220,0.5)" }}>
                    {s === "stories" ? "Stories" : s === "words" ? "Words" : s === "recent" ? "Recent" : "A–Z"}
                  </button>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "0.85rem" }}>
                {filtered.map(d => (
                  <div
                    key={d.name}
                    onClick={() => openDossier(d.name)}
                    style={{ background: "rgba(0,0,0,0.55)", border: `1px solid ${notes[d.name] ? "rgba(168,85,247,0.35)" : "rgba(255,255,255,0.08)"}`, borderRadius: "16px", overflow: "hidden", cursor: "pointer", transition: "border-color 0.2s, box-shadow 0.2s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(168,85,247,0.45)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 16px rgba(168,85,247,0.12)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = notes[d.name] ? "rgba(168,85,247,0.35)" : "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
                  >
                    {/* Portrait */}
                    <div style={{ height: "130px", overflow: "hidden", background: "rgba(15,8,25,0.8)", position: "relative" }}>
                      {!imgErrors.has(d.name) ? (
                        <img
                          src={heroImgSrc(d.name)}
                          alt={d.name}
                          onError={() => setImgErrors(prev => new Set([...prev, d.name]))}
                          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
                        />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3.5rem", color: "rgba(168,85,247,0.3)" }}>◈</div>
                      )}
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(transparent, rgba(0,0,0,0.92))" }} />
                      {notes[d.name] && (
                        <div style={{ position: "absolute", top: "0.5rem", right: "0.5rem", fontSize: "0.65rem", color: "rgba(168,85,247,0.8)", background: "rgba(0,0,0,0.7)", borderRadius: "4px", padding: "0.1rem 0.3rem" }}>✎</div>
                      )}
                    </div>
                    {/* Info */}
                    <div style={{ padding: "0.75rem 0.9rem 0.9rem" }}>
                      <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.85rem", color: "#E9D5FF", fontWeight: 700, marginBottom: "0.4rem", letterSpacing: "0.5px" }}>{d.name}</div>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.6rem", color: "#C084FC", fontFamily: "'Cinzel', serif" }}>{d.storyCount} {d.storyCount === 1 ? "story" : "stories"}</span>
                        <span style={{ fontSize: "0.6rem", color: "rgba(200,200,220,0.3)", fontFamily: "'Raleway', sans-serif" }}>·</span>
                        <span style={{ fontSize: "0.6rem", color: "rgba(200,200,220,0.35)", fontFamily: "'Raleway', sans-serif" }}>{d.totalWords.toLocaleString()} words</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      ) : selData ? (
        <div>
          <div style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: "20px", overflow: "hidden", marginBottom: "1.5rem" }}>
            {/* Portrait header */}
            <div style={{ height: "280px", position: "relative", overflow: "hidden", background: "rgba(10,5,20,0.9)" }}>
              {!imgErrors.has(selData.name) ? (
                <img
                  src={heroImgSrc(selData.name)}
                  alt={selData.name}
                  onError={() => setImgErrors(prev => new Set([...prev, selData.name]))}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8rem", color: "rgba(168,85,247,0.25)" }}>◈</div>
              )}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "65%", background: "linear-gradient(transparent, rgba(0,0,0,0.95))" }} />
              <div style={{ position: "absolute", bottom: "1.5rem", left: "2rem", right: "2rem" }}>
                <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.8rem", color: "#F4F0FF", margin: "0 0 0.2rem", fontWeight: 700, letterSpacing: "2px", textShadow: "0 2px 16px rgba(0,0,0,0.8)" }}>{selData.name}</h2>
                <div style={{ fontSize: "0.68rem", color: "rgba(200,200,220,0.35)", fontFamily: "'Raleway', sans-serif" }}>
                  First seen {fmtDate(selData.firstSeen)} · Last seen {fmtDate(selData.lastSeen)}
                </div>
              </div>
            </div>

            <div style={{ padding: "1.75rem 2rem 2rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
              {[
                { label: "Stories", value: selData.storyCount.toString(), color: "#A855F7" },
                { label: "Words Written", value: selData.totalWords.toLocaleString(), color: "#3B82F6" },
                { label: "Villains Faced", value: selData.villains.length.toString(), color: "#EF4444" },
                { label: "Modes Used", value: selData.modes.length.toString(), color: "#10B981" },
              ].map(s => (
                <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "0.85rem", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: "1.4rem", color: s.color, fontWeight: 700, marginBottom: "0.2rem" }}>{s.value}</div>
                  <div style={{ fontSize: "0.58rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Cinzel', serif", letterSpacing: "1.5px", textTransform: "uppercase" }}>{s.label}</div>
                </div>
              ))}
            </div>
            {selData.villains.length > 0 && (
              <div style={{ marginBottom: "1.25rem" }}>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.55rem", letterSpacing: "3px", color: "rgba(239,68,68,0.55)", textTransform: "uppercase", marginBottom: "0.6rem" }}>Villains Encountered</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {selData.villains.map(v => (
                    <span key={v} style={{ fontSize: "0.7rem", padding: "0.25rem 0.75rem", borderRadius: "12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "rgba(252,165,165,0.8)", fontFamily: "'Cinzel', serif" }}>{v}</span>
                  ))}
                </div>
              </div>
            )}
            {selData.modes.length > 0 && (
              <div>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.55rem", letterSpacing: "3px", color: "rgba(168,85,247,0.55)", textTransform: "uppercase", marginBottom: "0.6rem" }}>Modes Appeared In</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {selData.modes.map(m => (
                    <span key={m} style={{ fontSize: "0.7rem", padding: "0.25rem 0.75rem", borderRadius: "12px", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)", color: "rgba(192,132,252,0.8)", fontFamily: "'Cinzel', serif" }}>{m}</span>
                  ))}
                </div>
              </div>
            )}
            </div>
          </div>

          <div style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(168,85,247,0.15)", borderRadius: "16px", padding: "1.5rem" }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.55rem", letterSpacing: "3px", color: "rgba(168,85,247,0.55)", textTransform: "uppercase", marginBottom: "0.75rem" }}>Personal Notes</div>
            <textarea
              value={editNote}
              onChange={e => setEditNote(e.target.value)}
              placeholder={`Your private notes about ${selData.name} — favourite moments, story ideas, character observations…`}
              style={{ width: "100%", minHeight: "130px", padding: "0.85rem 1rem", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: "10px", color: "#F0EFF8", fontFamily: "'Raleway', sans-serif", fontSize: "0.88rem", outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.65 }}
            />
            <button onClick={handleSaveNote} style={{ marginTop: "0.75rem", padding: "0.65rem 1.8rem", borderRadius: "10px", cursor: "pointer", background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.4)", color: "#C084FC", fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "2px", textTransform: "uppercase", transition: "all 0.2s" }}>
              {noteSaved ? "✓ Saved" : "Save Notes"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
