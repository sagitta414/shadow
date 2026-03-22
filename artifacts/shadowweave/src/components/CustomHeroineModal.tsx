import { useState } from "react";
import { saveCustomHeroine, deleteCustomHeroine, CustomHeroine } from "../lib/customHeroines";

interface Props {
  onClose: () => void;
  onCreated: (h: CustomHeroine) => void;
  existing: CustomHeroine[];
  onDeleted: (id: string) => void;
}

const acc = "#FFB800";
const border = "rgba(255,184,0,0.25)";

export default function CustomHeroineModal({ onClose, onCreated, existing, onDeleted }: Props) {
  const [tab, setTab] = useState<"create"|"manage">("create");
  const [name, setName] = useState("");
  const [appearance, setAppearance] = useState("");
  const [powers, setPowers] = useState("");
  const [weakness, setWeakness] = useState("");
  const [backstory, setBackstory] = useState("");
  const [saved, setSaved] = useState(false);

  function handleCreate() {
    if (!name.trim()) return;
    const h = saveCustomHeroine({ name: name.trim(), appearance, powers, weakness, backstory });
    onCreated(h);
    setSaved(true);
    setTimeout(() => {
      setName(""); setAppearance(""); setPowers(""); setWeakness(""); setBackstory(""); setSaved(false);
    }, 1200);
  }

  function handleDelete(id: string) {
    deleteCustomHeroine(id);
    onDeleted(id);
  }

  const canCreate = name.trim().length > 0;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }} onClick={onClose}>
      <div style={{ background: "rgba(8,4,18,0.98)", border: `1px solid ${border}`, borderRadius: "16px", padding: "2rem", maxWidth: "560px", width: "100%", maxHeight: "85vh", overflowY: "auto", position: "relative" }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: "absolute", top: "1rem", right: "1rem", background: "transparent", border: "none", color: "rgba(200,195,225,0.4)", cursor: "pointer", fontSize: "1.2rem", lineHeight: 1 }}>✕</button>

        <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "1rem", color: acc, letterSpacing: "3px", margin: "0 0 1.5rem" }}>CUSTOM HEROINES</h2>

        <div style={{ display: "flex", gap: "0", marginBottom: "1.5rem", border: `1px solid ${border}`, borderRadius: "8px", overflow: "hidden" }}>
          {(["create","manage"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "0.6rem", background: tab === t ? "rgba(255,184,0,0.15)" : "transparent", border: "none", color: tab === t ? acc : "rgba(200,195,225,0.4)", fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase" }}>
              {t === "create" ? "Create New" : `Manage (${existing.length})`}
            </button>
          ))}
        </div>

        {tab === "create" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Field label="HEROINE NAME *" value={name} onChange={setName} placeholder="e.g. Shadow Veil, Crimson Lotus…" />
            <Field label="APPEARANCE" value={appearance} onChange={setAppearance} placeholder="Height, build, hair, costume, distinctive features…" multiline />
            <Field label="POWERS & ABILITIES" value={powers} onChange={setPowers} placeholder="List her powers, skills, and fighting style…" multiline />
            <Field label="WEAKNESS" value={weakness} onChange={setWeakness} placeholder="Her exploitable vulnerability…" />
            <Field label="BACKSTORY / NOTES" value={backstory} onChange={setBackstory} placeholder="Origin, psychology, key relationships… (optional)" multiline />

            <button onClick={handleCreate} disabled={!canCreate} style={{ padding: "0.85rem", background: canCreate ? "rgba(255,184,0,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${canCreate ? "rgba(255,184,0,0.5)" : "rgba(255,255,255,0.08)"}`, borderRadius: "10px", color: canCreate ? (saved ? "#44D26E" : acc) : "rgba(200,195,225,0.3)", fontFamily: "'Cinzel', serif", fontSize: "0.8rem", letterSpacing: "2px", cursor: canCreate ? "pointer" : "not-allowed", transition: "all 0.2s" }}>
              {saved ? "✓ HEROINE CREATED" : "CREATE HEROINE"}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {existing.length === 0 && (
              <div style={{ textAlign: "center", padding: "2rem", color: "rgba(200,195,225,0.3)", fontFamily: "'Raleway', sans-serif", fontSize: "0.8rem" }}>
                No custom heroines yet. Create one in the Create tab.
              </div>
            )}
            {existing.map(h => (
              <div key={h.id} style={{ background: "rgba(255,184,0,0.04)", border: `1px solid rgba(255,184,0,0.15)`, borderRadius: "10px", padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                <div>
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.85rem", color: acc, marginBottom: "0.35rem" }}>{h.name}</div>
                  {h.powers && <div style={{ fontSize: "0.68rem", color: "rgba(200,195,225,0.4)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.4 }}>{h.powers.slice(0, 80)}{h.powers.length > 80 ? "…" : ""}</div>}
                  {h.weakness && <div style={{ fontSize: "0.62rem", color: "rgba(200,100,100,0.5)", fontFamily: "'Raleway', sans-serif", marginTop: "0.25rem" }}>Weakness: {h.weakness.slice(0, 60)}{h.weakness.length > 60 ? "…" : ""}</div>}
                </div>
                <button onClick={() => handleDelete(h.id)} style={{ background: "transparent", border: "1px solid rgba(200,50,50,0.3)", borderRadius: "6px", color: "rgba(200,50,50,0.6)", cursor: "pointer", padding: "0.3rem 0.6rem", fontSize: "0.65rem", fontFamily: "'Cinzel', serif", flexShrink: 0 }}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, multiline }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; multiline?: boolean;
}) {
  const base: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,184,0,0.2)", borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.8rem", padding: "0.6rem 0.85rem", outline: "none", boxSizing: "border-box", resize: "vertical" };
  return (
    <div>
      <div style={{ fontSize: "0.5rem", color: "rgba(255,184,0,0.5)", letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.4rem" }}>{label}</div>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} style={base} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={base} />
      )}
    </div>
  );
}
