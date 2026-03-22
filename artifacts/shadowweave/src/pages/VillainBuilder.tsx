import { useState } from "react";
import {
  getCustomVillains, saveCustomVillain, deleteCustomVillain,
  VILLAIN_PERSONALITY_TRAITS, VILLAIN_FACTIONS, CustomVillain,
} from "../lib/customVillains";

interface Props { onBack: () => void; }

const EMPTY: Omit<CustomVillain, "id" | "createdAt"> = {
  name: "", alias: "", faction: VILLAIN_FACTIONS[0], powers: "", personality: [], backstory: "",
};

export default function VillainBuilder({ onBack }: Props) {
  const [villains, setVillains] = useState<CustomVillain[]>(getCustomVillains);
  const [form, setForm] = useState({ ...EMPTY });
  const [editing, setEditing] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function refresh() { setVillains(getCustomVillains()); }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.powers.trim()) e.powers = "Powers field is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const villain: CustomVillain = {
      ...form,
      id: editing ?? (Date.now().toString(36) + Math.random().toString(36).slice(2, 5)),
      createdAt: editing ? villains.find(v => v.id === editing)?.createdAt ?? Date.now() : Date.now(),
    };
    saveCustomVillain(villain);
    refresh();
    setForm({ ...EMPTY });
    setEditing(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleEdit(v: CustomVillain) {
    setForm({ name: v.name, alias: v.alias, faction: v.faction, powers: v.powers, personality: v.personality, backstory: v.backstory });
    setEditing(v.id);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(id: string) {
    deleteCustomVillain(id);
    refresh();
    setConfirmDelete(null);
    if (editing === id) { setEditing(null); setForm({ ...EMPTY }); }
  }

  function toggleTrait(t: string) {
    setForm(prev => ({
      ...prev,
      personality: prev.personality.includes(t)
        ? prev.personality.filter(x => x !== t)
        : prev.personality.length < 5 ? [...prev.personality, t] : prev.personality,
    }));
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.75rem 1rem", background: "rgba(0,0,0,0.5)",
    border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", color: "#F0EFF8",
    fontFamily: "'Raleway', sans-serif", fontSize: "0.9rem", outline: "none",
    boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: "'Cinzel', serif", fontSize: "0.55rem", letterSpacing: "3px",
    color: "rgba(239,68,68,0.7)", textTransform: "uppercase", marginBottom: "0.4rem", display: "block",
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.25rem", minHeight: "100vh" }}>
      <style>{`
        .vb-input:focus { border-color: rgba(239,68,68,0.55) !important; box-shadow: 0 0 0 3px rgba(239,68,68,0.08); }
      `}</style>

      <button onClick={onBack} style={{ background: "transparent", border: "none", color: "rgba(200,200,220,0.35)", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px", cursor: "pointer", padding: "0.5rem 0", marginBottom: "2rem" }}>
        ← BACK
      </button>

      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.5rem", letterSpacing: "7px", color: "rgba(239,68,68,0.5)", textTransform: "uppercase", marginBottom: "0.6rem" }}>Villain Roster</div>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.6rem, 3vw, 2.4rem)", color: "#FCA5A5", margin: "0 0 0.5rem", fontWeight: 700, letterSpacing: "2px" }}>Villain Builder</h1>
        <p style={{ color: "rgba(200,195,240,0.35)", fontSize: "0.85rem", fontFamily: "'Raleway', sans-serif" }}>Create custom antagonists that appear across all story modes</p>
      </div>

      {/* Form */}
      <div style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "20px", padding: "2rem", marginBottom: "2.5rem", backdropFilter: "blur(12px)" }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "4px", color: "rgba(239,68,68,0.6)", textTransform: "uppercase", marginBottom: "1.5rem" }}>
          {editing ? "Edit Villain" : "Create New Villain"}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label style={labelStyle}>Villain Name *</label>
            <input className="vb-input" style={{ ...inputStyle, borderColor: errors.name ? "rgba(239,68,68,0.7)" : "rgba(239,68,68,0.2)" }} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Director Harlow" />
            {errors.name && <div style={{ color: "#EF4444", fontSize: "0.7rem", marginTop: "0.25rem" }}>{errors.name}</div>}
          </div>
          <div>
            <label style={labelStyle}>Title / Alias</label>
            <input className="vb-input" style={inputStyle} value={form.alias} onChange={e => setForm(p => ({ ...p, alias: e.target.value }))} placeholder="e.g. The Architect" />
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Faction / Affiliation</label>
          <select className="vb-input" style={{ ...inputStyle, appearance: "none" }} value={form.faction} onChange={e => setForm(p => ({ ...p, faction: e.target.value }))}>
            {VILLAIN_FACTIONS.map(f => <option key={f} value={f} style={{ background: "#0A0015" }}>{f}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Powers / Capabilities *</label>
          <textarea className="vb-input" style={{ ...inputStyle, borderColor: errors.powers ? "rgba(239,68,68,0.7)" : "rgba(239,68,68,0.2)", minHeight: "90px", resize: "vertical" }} value={form.powers} onChange={e => setForm(p => ({ ...p, powers: e.target.value }))} placeholder="Describe what this villain can do — tech, combat, telepathy, resources…" />
          {errors.powers && <div style={{ color: "#EF4444", fontSize: "0.7rem", marginTop: "0.25rem" }}>{errors.powers}</div>}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ ...labelStyle, marginBottom: "0.6rem" }}>Personality Traits (select up to 5)</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {VILLAIN_PERSONALITY_TRAITS.map(t => {
              const sel = form.personality.includes(t);
              return (
                <button key={t} onClick={() => toggleTrait(t)} style={{ padding: "0.35rem 0.85rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.7rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px", transition: "all 0.2s", background: sel ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${sel ? "rgba(239,68,68,0.55)" : "rgba(255,255,255,0.1)"}`, color: sel ? "#FCA5A5" : "rgba(200,200,220,0.5)" }}>
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={labelStyle}>Backstory / Motivation</label>
          <textarea className="vb-input" style={{ ...inputStyle, minHeight: "110px", resize: "vertical" }} value={form.backstory} onChange={e => setForm(p => ({ ...p, backstory: e.target.value }))} placeholder="What drives them? What made them this? What do they want beyond this specific story?" />
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button onClick={handleSave} style={{ padding: "0.8rem 2rem", borderRadius: "10px", cursor: "pointer", background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.5)", color: "#FCA5A5", fontFamily: "'Cinzel', serif", fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase", transition: "all 0.2s" }}>
            {saved ? "✓ Saved" : editing ? "Update Villain" : "Add to Roster"}
          </button>
          {editing && (
            <button onClick={() => { setEditing(null); setForm({ ...EMPTY }); setErrors({}); }} style={{ padding: "0.8rem 1.5rem", borderRadius: "10px", cursor: "pointer", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(200,200,220,0.4)", fontFamily: "'Cinzel', serif", fontSize: "0.7rem", letterSpacing: "2px" }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Roster */}
      <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", letterSpacing: "4px", color: "rgba(239,68,68,0.5)", textTransform: "uppercase", marginBottom: "1rem" }}>
        Custom Roster — {villains.length} villain{villains.length !== 1 ? "s" : ""}
      </div>

      {villains.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem", color: "rgba(200,200,220,0.25)", fontFamily: "'Cinzel', serif", fontSize: "0.8rem", letterSpacing: "2px" }}>
          No custom villains yet — create your first above
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {villains.map(v => (
          <div key={v.id} style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "16px", padding: "1.25rem 1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "0.5rem" }}>
              <div>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: "1rem", color: "#FCA5A5", fontWeight: 700, letterSpacing: "1px" }}>{v.name}</div>
                {v.alias && <div style={{ fontSize: "0.72rem", color: "rgba(200,200,220,0.45)", fontFamily: "'Raleway', sans-serif", fontStyle: "italic" }}>{v.alias}</div>}
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                <button onClick={() => handleEdit(v)} style={{ padding: "0.35rem 0.85rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.65rem", fontFamily: "'Cinzel', serif", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "rgba(252,165,165,0.7)" }}>Edit</button>
                {confirmDelete === v.id ? (
                  <>
                    <button onClick={() => handleDelete(v.id)} style={{ padding: "0.35rem 0.85rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.65rem", background: "rgba(200,0,0,0.2)", border: "1px solid rgba(200,0,0,0.4)", color: "#FF6060" }}>Delete</button>
                    <button onClick={() => setConfirmDelete(null)} style={{ padding: "0.35rem 0.85rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.65rem", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(200,200,220,0.4)" }}>No</button>
                  </>
                ) : (
                  <button onClick={() => setConfirmDelete(v.id)} style={{ padding: "0.35rem 0.85rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.65rem", fontFamily: "'Cinzel', serif", background: "rgba(200,0,0,0.06)", border: "1px solid rgba(200,0,0,0.2)", color: "rgba(200,100,100,0.5)" }}>✕</button>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.62rem", padding: "0.2rem 0.65rem", borderRadius: "12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "rgba(252,165,165,0.7)", fontFamily: "'Cinzel', serif", letterSpacing: "1px" }}>{v.faction}</span>
              {v.personality.map(t => (
                <span key={t} style={{ fontSize: "0.6rem", padding: "0.2rem 0.55rem", borderRadius: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(200,200,220,0.5)", fontFamily: "'Cinzel', serif" }}>{t}</span>
              ))}
            </div>
            {v.powers && <div style={{ fontSize: "0.78rem", color: "rgba(220,215,245,0.6)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.5 }}>{v.powers}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
