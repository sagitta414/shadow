import { useState, useEffect } from "react";
import {
  getArchive,
  updateArchiveStory,
  deleteArchiveStory,
  exportStoryAsTXT,
  exportStoryAsPDF,
  ArchivedStory,
} from "../lib/archive";

interface Props {
  onBack: () => void;
  onRemix?: (heroName: string) => void;
}

const UNIVERSE_COLORS: Record<string, string> = {
  MARVEL: "#FF6060",
  DC: "#60A0FF",
  CW: "#40E090",
  "The Boys": "#FF3D00",
  "Power Rangers": "#FF69B4",
  ANIMATED: "#C084FC",
  Celebrity: "#C8A84B",
  SW: "#4DC8FF",
  TV: "#FF9640",
  Daily: "#E8D08A",
};

function univColor(u: string): string {
  for (const [k, v] of Object.entries(UNIVERSE_COLORS)) {
    if (u.toUpperCase().includes(k.toUpperCase())) return v;
  }
  return "#888";
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function StoryArchive({ onBack, onRemix }: Props) {
  const [stories, setStories] = useState<ArchivedStory[]>([]);
  const [search, setSearch] = useState("");
  const [filterFav, setFilterFav] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "words" | "alpha">("newest");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [hoverRow, setHoverRow] = useState<string | null>(null);

  function reload() {
    setStories(getArchive());
  }
  useEffect(reload, []);

  function toggleFav(id: string, current: boolean) {
    updateArchiveStory(id, { favourite: !current });
    reload();
  }

  function addTag(id: string) {
    const val = (tagInput[id] ?? "").trim();
    if (!val) return;
    const story = stories.find((s) => s.id === id);
    if (!story) return;
    if (story.tags.includes(val)) return;
    updateArchiveStory(id, { tags: [...story.tags, val] });
    setTagInput((prev) => ({ ...prev, [id]: "" }));
    reload();
  }

  function removeTag(id: string, tag: string) {
    const story = stories.find((s) => s.id === id);
    if (!story) return;
    updateArchiveStory(id, { tags: story.tags.filter((t) => t !== tag) });
    reload();
  }

  function doDelete(id: string) {
    deleteArchiveStory(id);
    setConfirmDelete(null);
    if (expanded === id) setExpanded(null);
    reload();
  }

  const filtered = stories
    .filter((s) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.characters.some((c) => c.toLowerCase().includes(q)) ||
        s.tags.some((t) => t.toLowerCase().includes(q)) ||
        s.universe.toLowerCase().includes(q);
      const matchFav = !filterFav || s.favourite;
      return matchSearch && matchFav;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return b.createdAt - a.createdAt;
      if (sortBy === "oldest") return a.createdAt - b.createdAt;
      if (sortBy === "words") return b.wordCount - a.wordCount;
      return a.title.localeCompare(b.title);
    });

  const card = (s: ArchivedStory) => {
    const col = univColor(s.universe);
    const isOpen = expanded === s.id;
    return (
      <div
        key={s.id}
        onMouseEnter={() => setHoverRow(s.id)}
        onMouseLeave={() => setHoverRow(null)}
        style={{
          background: "rgba(10,8,16,0.85)",
          border: `1px solid ${isOpen ? col : "rgba(255,255,255,0.07)"}`,
          borderLeft: `3px solid ${col}`,
          borderRadius: "10px",
          overflow: "hidden",
          transition: "border-color 0.25s",
          marginBottom: "0.75rem",
          position: "relative",
        }}
      >
        <div
          onClick={() => setExpanded(isOpen ? null : s.id)}
          style={{
            padding: "1rem 1.25rem",
            cursor: "pointer",
            display: "flex",
            gap: "1rem",
            alignItems: "flex-start",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem", flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.95rem", color: "#E8E0D0", fontWeight: 600 }}>
                {s.title}
              </span>
              {s.favourite && <span style={{ color: "#FFB800", fontSize: "0.85rem" }}>★</span>}
            </div>
            <div style={{ fontSize: "0.72rem", color: "rgba(200,200,220,0.5)", letterSpacing: "1px", marginBottom: "0.5rem" }}>
              {s.characters.join(" · ")}
              <span style={{ margin: "0 0.5rem", opacity: 0.3 }}>|</span>
              <span style={{ color: col }}>{s.universe}</span>
              <span style={{ margin: "0 0.5rem", opacity: 0.3 }}>|</span>
              {s.wordCount.toLocaleString()} words
              <span style={{ margin: "0 0.5rem", opacity: 0.3 }}>|</span>
              {s.chapters.length > 1 ? `${s.chapters.length} chapters · ` : ""}{timeAgo(s.createdAt)}
            </div>
            {s.tags.length > 0 && (
              <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                {s.tags.map((t) => (
                  <span key={t} style={{
                    fontSize: "0.65rem", letterSpacing: "0.5px",
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "20px", padding: "0.15rem 0.55rem", color: "rgba(200,200,220,0.6)",
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0, marginTop: "0.15rem" }}>
            {/* Quick delete — visible on row hover when not expanded */}
            {!isOpen && hoverRow === s.id && (
              confirmDelete === s.id ? (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}
                >
                  <button onClick={() => doDelete(s.id)} style={{ padding: "0.2rem 0.55rem", borderRadius: "5px", background: "rgba(200,0,0,0.22)", border: "1px solid rgba(200,0,0,0.45)", color: "#FF6060", fontSize: "0.65rem", cursor: "pointer", fontFamily: "'Cinzel',serif" }}>Yes</button>
                  <button onClick={() => setConfirmDelete(null)} style={{ padding: "0.2rem 0.55rem", borderRadius: "5px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(200,200,220,0.4)", fontSize: "0.65rem", cursor: "pointer" }}>No</button>
                </div>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmDelete(s.id); }}
                  title="Delete story"
                  style={{ padding: "0.2rem 0.5rem", borderRadius: "5px", background: "rgba(200,0,0,0.06)", border: "1px solid rgba(200,0,0,0.18)", color: "rgba(200,100,100,0.45)", fontSize: "0.72rem", cursor: "pointer", transition: "all 0.18s", lineHeight: 1 }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(200,0,0,0.18)"; e.currentTarget.style.borderColor = "rgba(200,0,0,0.45)"; e.currentTarget.style.color = "#FF6060"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(200,0,0,0.06)"; e.currentTarget.style.borderColor = "rgba(200,0,0,0.18)"; e.currentTarget.style.color = "rgba(200,100,100,0.45)"; }}
                >
                  ✕
                </button>
              )
            )}
            <span style={{ color: isOpen ? col : "rgba(200,200,220,0.25)", fontSize: "0.8rem", transition: "all 0.2s" }}>
              {isOpen ? "▲" : "▼"}
            </span>
          </div>
        </div>

        {isOpen && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "1.25rem" }}>
            <div style={{
              background: "rgba(0,0,0,0.4)", borderRadius: "8px", padding: "1.25rem",
              maxHeight: "380px", overflowY: "auto", marginBottom: "1rem",
              fontFamily: "'EB Garamond', Georgia, serif", fontSize: "0.95rem",
              lineHeight: "1.85", color: "rgba(220,210,200,0.88)",
            }}>
              {s.chapters.map((ch, i) => (
                <div key={i}>
                  {s.chapters.length > 1 && (
                    <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "3px", color: col, marginBottom: "1rem", textAlign: "center" }}>
                      — CHAPTER {i + 1} —
                    </p>
                  )}
                  {ch.split("\n").filter(Boolean).map((para, j) => (
                    <p key={j} style={{ textIndent: "1.5em", marginBottom: "0.5em" }}>{para}</p>
                  ))}
                  {i < s.chapters.length - 1 && <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", margin: "1.5rem auto", width: "50%" }} />}
                </div>
              ))}
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.65rem", letterSpacing: "2px", color: "rgba(200,200,220,0.4)", marginBottom: "0.5rem" }}>TAGS</div>
              <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", alignItems: "center" }}>
                {s.tags.map((t) => (
                  <span key={t}
                    onClick={() => removeTag(s.id, t)}
                    title="Click to remove"
                    style={{
                      fontSize: "0.65rem", letterSpacing: "0.5px",
                      background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)",
                      borderRadius: "20px", padding: "0.2rem 0.6rem", color: "rgba(200,200,220,0.7)",
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,100,100,0.5)"; (e.currentTarget as HTMLElement).style.color = "#FF8080"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.14)"; (e.currentTarget as HTMLElement).style.color = "rgba(200,200,220,0.7)"; }}
                  >
                    {t} ✕
                  </span>
                ))}
                <form onSubmit={(e) => { e.preventDefault(); addTag(s.id); }} style={{ display: "flex", gap: "0.35rem" }}>
                  <input
                    value={tagInput[s.id] ?? ""}
                    onChange={(e) => setTagInput((prev) => ({ ...prev, [s.id]: e.target.value }))}
                    placeholder="+ add tag"
                    style={{
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "20px", padding: "0.2rem 0.6rem", fontSize: "0.65rem",
                      color: "rgba(200,200,220,0.7)", outline: "none", width: "80px",
                    }}
                  />
                </form>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => toggleFav(s.id, s.favourite)}
                  style={{
                    padding: "0.5rem 0.9rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.72rem",
                    fontFamily: "'Cinzel', serif", letterSpacing: "1px", transition: "all 0.2s",
                    background: s.favourite ? "rgba(255,184,0,0.15)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${s.favourite ? "rgba(255,184,0,0.4)" : "rgba(255,255,255,0.1)"}`,
                    color: s.favourite ? "#FFB800" : "rgba(200,200,220,0.5)",
                  }}
                >
                  {s.favourite ? "★ Unfavourite" : "☆ Favourite"}
                </button>
                <button
                  onClick={() => exportStoryAsTXT(s)}
                  style={{
                    padding: "0.5rem 0.9rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.72rem",
                    fontFamily: "'Cinzel', serif", letterSpacing: "1px", transition: "all 0.2s",
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(200,200,220,0.6)",
                  }}
                >
                  ↓ TXT
                </button>
                <button
                  onClick={() => exportStoryAsPDF(s)}
                  style={{
                    padding: "0.5rem 0.9rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.72rem",
                    fontFamily: "'Cinzel', serif", letterSpacing: "1px", transition: "all 0.2s",
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(200,200,220,0.6)",
                  }}
                >
                  ↓ PDF
                </button>
                {onRemix && s.characters?.length > 0 && (
                  <button
                    onClick={() => onRemix(s.characters[0])}
                    style={{
                      padding: "0.5rem 0.9rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.72rem",
                      fontFamily: "'Cinzel', serif", letterSpacing: "1px", transition: "all 0.2s",
                      background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.35)",
                      color: "rgba(192,132,252,0.8)",
                    }}
                  >
                    ⟳ Reimagine
                  </button>
                )}
              </div>
              {confirmDelete === s.id ? (
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <span style={{ fontSize: "0.7rem", color: "rgba(200,200,220,0.5)" }}>Delete forever?</span>
                  <button onClick={() => doDelete(s.id)} style={{ padding: "0.4rem 0.8rem", borderRadius: "6px", background: "rgba(200,0,0,0.2)", border: "1px solid rgba(200,0,0,0.4)", color: "#FF6060", fontSize: "0.72rem", cursor: "pointer" }}>Yes</button>
                  <button onClick={() => setConfirmDelete(null)} style={{ padding: "0.4rem 0.8rem", borderRadius: "6px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(200,200,220,0.4)", fontSize: "0.72rem", cursor: "pointer" }}>No</button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(s.id)}
                  style={{
                    padding: "0.5rem 0.9rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.72rem",
                    fontFamily: "'Cinzel', serif", letterSpacing: "1px", transition: "all 0.2s",
                    background: "rgba(200,0,0,0.06)", border: "1px solid rgba(200,0,0,0.2)",
                    color: "rgba(200,100,100,0.5)",
                  }}
                >
                  ✕ Delete
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.25rem", minHeight: "100vh" }}>
      <button
        onClick={onBack}
        style={{
          background: "transparent", border: "none", color: "rgba(200,200,220,0.35)",
          fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px",
          cursor: "pointer", padding: "0.5rem 0", marginBottom: "2rem",
        }}
      >
        ← Back to Studio
      </button>

      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.65rem", letterSpacing: "4px", color: "rgba(200,168,75,0.6)", marginBottom: "0.5rem" }}>
          STORY ARCHIVE
        </div>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.8rem, 5vw, 2.5rem)", fontWeight: 700, color: "#E8E0D0", marginBottom: "0.35rem" }}>
          Narrative Library
        </h1>
        <p style={{ fontSize: "0.85rem", color: "rgba(200,200,220,0.45)", letterSpacing: "0.5px" }}>
          {stories.length} {stories.length === 1 ? "story" : "stories"} saved — browse, tag, export
        </p>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title, character, tag…"
          style={{
            flex: 1, minWidth: "200px", background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px",
            padding: "0.65rem 1rem", color: "#E8E0D0", fontSize: "0.85rem", outline: "none",
            fontFamily: "'Cinzel', serif",
          }}
        />
        <button
          onClick={() => setFilterFav(!filterFav)}
          style={{
            padding: "0.65rem 1rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.75rem",
            fontFamily: "'Cinzel', serif", letterSpacing: "1px", transition: "all 0.2s",
            background: filterFav ? "rgba(255,184,0,0.15)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${filterFav ? "rgba(255,184,0,0.4)" : "rgba(255,255,255,0.1)"}`,
            color: filterFav ? "#FFB800" : "rgba(200,200,220,0.5)",
          }}
        >
          ★ Favourites
        </button>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          style={{
            padding: "0.65rem 0.9rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.75rem",
            fontFamily: "'Cinzel', serif", letterSpacing: "1px",
            background: "rgba(10,8,16,0.9)", border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(200,200,220,0.6)", outline: "none",
          }}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="words">Most Words</option>
          <option value="alpha">A → Z</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem", opacity: 0.3 }}>◈</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "1rem", color: "rgba(200,200,220,0.3)", letterSpacing: "2px" }}>
            {stories.length === 0 ? "No stories archived yet" : "No results found"}
          </div>
          <div style={{ fontSize: "0.78rem", color: "rgba(200,200,220,0.2)", marginTop: "0.5rem" }}>
            {stories.length === 0 ? "Generate a story in any mode, then save it to your archive" : "Try a different search or filter"}
          </div>
        </div>
      ) : (
        <div>{filtered.map(card)}</div>
      )}
    </div>
  );
}
