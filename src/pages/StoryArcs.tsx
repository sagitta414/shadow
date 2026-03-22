import { useState, useMemo } from "react";
import { getArcs, saveArc, deleteArc, addStoryToArc, removeStoryFromArc, ARC_COLORS, StoryArc } from "../lib/arcs";
import { getArchive, ArchivedStory } from "../lib/archive";

interface Props { onBack: () => void; }

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }

export default function StoryArcs({ onBack }: Props) {
  const [arcs, setArcs] = useState<StoryArc[]>(getArcs);
  const [stories] = useState<ArchivedStory[]>(getArchive);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState(ARC_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [addingStory, setAddingStory] = useState<string | null>(null);

  function refresh() { setArcs(getArcs()); }

  function handleCreate() {
    if (!newName.trim()) return;
    const arc: StoryArc = { id: genId(), name: newName.trim(), description: newDesc.trim(), storyIds: [], createdAt: Date.now(), color: newColor };
    saveArc(arc);
    refresh();
    setCreating(false);
    setNewName(""); setNewDesc(""); setNewColor(ARC_COLORS[0]);
    setExpanded(arc.id);
  }

  function handleUpdateArc(arc: StoryArc) {
    saveArc({ ...arc, name: newName.trim() || arc.name, description: newDesc, color: newColor });
    refresh();
    setEditingId(null);
  }

  function startEdit(arc: StoryArc) {
    setNewName(arc.name); setNewDesc(arc.description); setNewColor(arc.color);
    setEditingId(arc.id); setCreating(false);
  }

  function handleAddStory(arcId: string, storyId: string) {
    addStoryToArc(arcId, storyId);
    refresh();
  }

  function handleRemoveStory(arcId: string, storyId: string) {
    removeStoryFromArc(arcId, storyId);
    refresh();
  }

  const storyMap = useMemo(() => {
    const m = new Map<string, ArchivedStory>();
    stories.forEach(s => m.set(s.id, s));
    return m;
  }, [stories]);

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.65rem 1rem", background: "rgba(0,0,0,0.5)",
    border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", color: "#F0EFF8",
    fontFamily: "'Raleway', sans-serif", fontSize: "0.88rem", outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.25rem", minHeight: "100vh" }}>
      <button onClick={onBack} style={{ background: "transparent", border: "none", color: "rgba(200,200,220,0.35)", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px", cursor: "pointer", padding: "0.5rem 0", marginBottom: "2rem" }}>
        ← BACK
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "2.5rem", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.5rem", letterSpacing: "7px", color: "rgba(168,85,247,0.5)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Narrative Structure</div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.6rem, 3vw, 2.4rem)", color: "#E9D5FF", margin: 0, fontWeight: 700, letterSpacing: "2px" }}>Story Arcs</h1>
          <p style={{ color: "rgba(200,195,240,0.35)", fontSize: "0.82rem", fontFamily: "'Raleway', sans-serif", marginTop: "0.4rem" }}>Group your stories into named arcs and series</p>
        </div>
        {!creating && !editingId && (
          <button onClick={() => { setCreating(true); setEditingId(null); setNewName(""); setNewDesc(""); setNewColor(ARC_COLORS[0]); }}
            style={{ padding: "0.75rem 1.5rem", borderRadius: "12px", cursor: "pointer", background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.4)", color: "#C084FC", fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "2px", textTransform: "uppercase", whiteSpace: "nowrap" }}>
            + New Arc
          </button>
        )}
      </div>

      {/* Create / Edit Form */}
      {(creating || editingId) && (
        <div style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(168,85,247,0.25)", borderRadius: "18px", padding: "1.5rem", marginBottom: "2rem" }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", letterSpacing: "3px", color: "rgba(168,85,247,0.6)", textTransform: "uppercase", marginBottom: "1rem" }}>
            {editingId ? "Edit Arc" : "New Arc"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.75rem", alignItems: "center", marginBottom: "0.75rem" }}>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Arc name (e.g. Black Widow Saga)" style={inputStyle} />
            <div style={{ display: "flex", gap: "0.4rem" }}>
              {ARC_COLORS.map(c => (
                <div key={c} onClick={() => setNewColor(c)} style={{ width: "22px", height: "22px", borderRadius: "50%", background: c, cursor: "pointer", border: newColor === c ? "2px solid white" : "2px solid transparent", opacity: newColor === c ? 1 : 0.5, transition: "all 0.2s" }} />
              ))}
            </div>
          </div>
          <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Describe this arc — theme, trajectory, central conflict…" style={{ ...inputStyle, minHeight: "80px", resize: "vertical", marginBottom: "1rem" }} />
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <button onClick={() => editingId ? handleUpdateArc(arcs.find(a => a.id === editingId)!) : handleCreate()}
              style={{ padding: "0.65rem 1.5rem", borderRadius: "10px", cursor: "pointer", background: "rgba(168,85,247,0.2)", border: "1px solid rgba(168,85,247,0.5)", color: "#C084FC", fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "2px" }}>
              {editingId ? "Save Changes" : "Create Arc"}
            </button>
            <button onClick={() => { setCreating(false); setEditingId(null); }}
              style={{ padding: "0.65rem 1.2rem", borderRadius: "10px", cursor: "pointer", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(200,200,220,0.4)", fontFamily: "'Cinzel', serif", fontSize: "0.65rem" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {arcs.length === 0 && !creating && (
        <div style={{ textAlign: "center", padding: "5rem 2rem", color: "rgba(200,200,220,0.2)", fontFamily: "'Cinzel', serif", fontSize: "0.85rem", letterSpacing: "2px" }}>
          No arcs yet<br /><span style={{ fontSize: "0.7rem", opacity: 0.7 }}>Create one above to start linking your stories into a series</span>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {arcs.map(arc => {
          const arcStories = arc.storyIds.map(id => storyMap.get(id)).filter(Boolean) as ArchivedStory[];
          const isExpanded = expanded === arc.id;
          const unlinked = stories.filter(s => !arc.storyIds.includes(s.id));

          return (
            <div key={arc.id} style={{ background: "rgba(0,0,0,0.45)", border: `1px solid ${arc.color}33`, borderRadius: "18px", overflow: "hidden" }}>
              {/* Arc header */}
              <div style={{ padding: "1.25rem 1.5rem", borderLeft: `3px solid ${arc.color}`, display: "flex", gap: "1rem", alignItems: "center", cursor: "pointer" }} onClick={() => setExpanded(isExpanded ? null : arc.id)}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.2rem" }}>
                    <span style={{ fontFamily: "'Cinzel', serif", fontSize: "1rem", color: arc.color, fontWeight: 700, letterSpacing: "1px" }}>{arc.name}</span>
                    <span style={{ fontSize: "0.6rem", padding: "0.15rem 0.6rem", borderRadius: "10px", background: `${arc.color}18`, border: `1px solid ${arc.color}33`, color: arc.color, fontFamily: "'Cinzel', serif" }}>{arc.storyIds.length} {arc.storyIds.length === 1 ? "story" : "stories"}</span>
                  </div>
                  {arc.description && <div style={{ fontSize: "0.75rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Raleway', sans-serif", fontStyle: "italic" }}>{arc.description}</div>}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                  <button onClick={e => { e.stopPropagation(); startEdit(arc); }} style={{ padding: "0.3rem 0.75rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.6rem", fontFamily: "'Cinzel', serif", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(200,200,220,0.5)" }}>Edit</button>
                  {confirmDelete === arc.id ? (
                    <>
                      <button onClick={e => { e.stopPropagation(); deleteArc(arc.id); refresh(); setConfirmDelete(null); }} style={{ padding: "0.3rem 0.75rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.6rem", background: "rgba(200,0,0,0.2)", border: "1px solid rgba(200,0,0,0.4)", color: "#FF6060" }}>Delete</button>
                      <button onClick={e => { e.stopPropagation(); setConfirmDelete(null); }} style={{ padding: "0.3rem 0.75rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.6rem", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(200,200,220,0.4)" }}>No</button>
                    </>
                  ) : (
                    <button onClick={e => { e.stopPropagation(); setConfirmDelete(arc.id); }} style={{ padding: "0.3rem 0.75rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.6rem", background: "rgba(200,0,0,0.06)", border: "1px solid rgba(200,0,0,0.2)", color: "rgba(200,100,100,0.5)" }}>✕</button>
                  )}
                  <span style={{ color: "rgba(200,200,220,0.3)", fontSize: "0.9rem" }}>{isExpanded ? "▲" : "▼"}</span>
                </div>
              </div>

              {isExpanded && (
                <div style={{ padding: "0 1.5rem 1.25rem" }}>
                  {/* Stories in arc */}
                  {arcStories.length === 0 ? (
                    <div style={{ padding: "1rem 0", color: "rgba(200,200,220,0.25)", fontSize: "0.75rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px" }}>No stories linked yet — add one below</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
                      {arcStories.map((s, idx) => (
                        <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0.85rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px" }}>
                          <span style={{ fontSize: "0.6rem", fontFamily: "'Cinzel', serif", color: arc.color, opacity: 0.7, minWidth: "1.5rem" }}>#{idx + 1}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "0.8rem", color: "#E9D5FF", fontFamily: "'Cinzel', serif", fontWeight: 600 }}>{s.title || "Untitled Story"}</div>
                            <div style={{ fontSize: "0.62rem", color: "rgba(200,200,220,0.35)", fontFamily: "'Raleway', sans-serif" }}>{s.characters?.[0]} · {s.wordCount?.toLocaleString()} words</div>
                          </div>
                          <button onClick={() => handleRemoveStory(arc.id, s.id)} style={{ padding: "0.2rem 0.6rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.6rem", background: "rgba(200,0,0,0.08)", border: "1px solid rgba(200,0,0,0.2)", color: "rgba(200,100,100,0.6)" }}>Remove</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add story */}
                  {addingStory === arc.id ? (
                    <div>
                      <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.55rem", letterSpacing: "2px", color: `${arc.color}88`, textTransform: "uppercase", marginBottom: "0.5rem" }}>Add a story to this arc</div>
                      {unlinked.length === 0 ? (
                        <div style={{ fontSize: "0.72rem", color: "rgba(200,200,220,0.3)", fontFamily: "'Raleway', sans-serif" }}>All archived stories are already in this arc</div>
                      ) : (
                        <div style={{ maxHeight: "260px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                          {unlinked.map(s => (
                            <div key={s.id} onClick={() => handleAddStory(arc.id, s.id)} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.55rem 0.85rem", background: "rgba(255,255,255,0.03)", border: `1px solid ${arc.color}22`, borderRadius: "10px", cursor: "pointer", transition: "all 0.2s" }}
                              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = `${arc.color}12`; (e.currentTarget as HTMLDivElement).style.borderColor = `${arc.color}44`; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)"; (e.currentTarget as HTMLDivElement).style.borderColor = `${arc.color}22`; }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "0.78rem", color: "#E9D5FF", fontFamily: "'Cinzel', serif" }}>{s.title || "Untitled"}</div>
                                <div style={{ fontSize: "0.6rem", color: "rgba(200,200,220,0.35)", fontFamily: "'Raleway', sans-serif" }}>{s.characters?.[0]} · {new Date(s.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</div>
                              </div>
                              <span style={{ fontSize: "0.7rem", color: arc.color, opacity: 0.7 }}>+ Add</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <button onClick={() => setAddingStory(null)} style={{ marginTop: "0.6rem", padding: "0.4rem 1rem", borderRadius: "8px", cursor: "pointer", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(200,200,220,0.4)", fontFamily: "'Cinzel', serif", fontSize: "0.62rem" }}>Done</button>
                    </div>
                  ) : (
                    <button onClick={() => setAddingStory(arc.id)} style={{ padding: "0.5rem 1.25rem", borderRadius: "10px", cursor: "pointer", background: `${arc.color}12`, border: `1px solid ${arc.color}33`, color: arc.color, fontFamily: "'Cinzel', serif", fontSize: "0.62rem", letterSpacing: "2px", textTransform: "uppercase" }}>
                      + Link Story
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
