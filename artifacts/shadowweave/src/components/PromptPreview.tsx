import { useState } from "react";

interface Props {
  systemPrompt?: string;
  userPrompt: string;
  heroineColor?: string;
  onGenerate: () => void;
  onClose: () => void;
  generating?: boolean;
}

export default function PromptPreview({ systemPrompt, userPrompt, heroineColor = "#C8A830", onGenerate, onClose, generating }: Props) {
  const [showSystem, setShowSystem] = useState(false);
  const [copied, setCopied] = useState(false);

  function copy() {
    const text = `SYSTEM:\n${systemPrompt ?? ""}\n\nUSER:\n${userPrompt}`;
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9995, background: "rgba(0,0,0,0.88)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", backdropFilter: "blur(4px)" }}>
      <div style={{ maxWidth: "720px", width: "100%", maxHeight: "88vh", display: "flex", flexDirection: "column", background: "#07050F", border: `1px solid ${heroineColor}22`, borderRadius: "12px", overflow: "hidden", boxShadow: `0 0 60px rgba(0,0,0,0.8)` }}>

        {/* Header */}
        <div style={{ padding: "0.875rem 1.25rem", background: "rgba(255,255,255,0.02)", borderBottom: `1px solid ${heroineColor}15`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.65rem", color: heroineColor, letterSpacing: "3px", fontWeight: 700 }}>PROMPT PREVIEW</div>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.42rem", color: "rgba(200,195,215,0.35)", letterSpacing: "1px", marginTop: "0.15rem" }}>Review what will be sent to Venice AI before generating</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "0.3rem 0.75rem", color: "rgba(200,195,215,0.4)", fontFamily: "'Cinzel',serif", fontSize: "0.48rem", cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s" }}>✕ Close</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>
          {/* System prompt toggle */}
          {systemPrompt && (
            <div style={{ marginBottom: "1rem" }}>
              <button onClick={() => setShowSystem(!showSystem)} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "0.5rem 0.85rem", color: "rgba(200,195,215,0.4)", fontFamily: "'Cinzel',serif", fontSize: "0.48rem", cursor: "pointer", letterSpacing: "1px", width: "100%" }}>
                <span>{showSystem ? "▼" : "▶"}</span>
                <span>SYSTEM PROMPT (engine instructions — read-only)</span>
              </button>
              {showSystem && (
                <div style={{ marginTop: "0.4rem", padding: "0.875rem", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", maxHeight: "180px", overflowY: "auto" }}>
                  <pre style={{ fontFamily: "'Courier New',monospace", fontSize: "0.48rem", color: "rgba(200,195,215,0.35)", lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{systemPrompt}</pre>
                </div>
              )}
            </div>
          )}

          {/* User prompt */}
          <div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.48rem", letterSpacing: "3px", color: heroineColor, textTransform: "uppercase", marginBottom: "0.5rem" }}>USER MESSAGE (sent to AI)</div>
            <div style={{ padding: "0.875rem", background: `${heroineColor}06`, border: `1px solid ${heroineColor}18`, borderRadius: "8px", maxHeight: "300px", overflowY: "auto" }}>
              <pre style={{ fontFamily: "'Courier New',monospace", fontSize: "0.52rem", color: "rgba(220,215,235,0.8)", lineHeight: 1.9, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{userPrompt}</pre>
            </div>
          </div>

          {/* Token estimate */}
          <div style={{ marginTop: "0.75rem", fontFamily: "'Raleway',sans-serif", fontSize: "0.42rem", color: "rgba(200,195,215,0.25)", letterSpacing: "1px" }}>
            ~{Math.round(((systemPrompt?.length ?? 0) + userPrompt.length) / 4)} tokens estimated · Venice AI · venice-uncensored-role-play
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: "0.875rem 1.25rem", background: "rgba(255,255,255,0.015)", borderTop: `1px solid ${heroineColor}10`, display: "flex", gap: "0.75rem", flexShrink: 0 }}>
          <button onClick={copy} style={{ padding: "0.55rem 1rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", color: copied ? "#34D399" : "rgba(200,195,215,0.45)", fontFamily: "'Cinzel',serif", fontSize: "0.52rem", cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s" }}>
            {copied ? "✓ Copied" : "📋 Copy"}
          </button>
          <button onClick={onGenerate} disabled={generating} style={{ flex: 1, padding: "0.65rem 2rem", background: generating ? "rgba(200,168,75,0.05)" : `linear-gradient(135deg, ${heroineColor}30, ${heroineColor}15)`, border: `1px solid ${heroineColor}${generating ? "22" : "55"}`, borderRadius: "8px", color: generating ? "rgba(200,168,75,0.3)" : heroineColor, fontFamily: "'Cinzel',serif", fontSize: "0.65rem", letterSpacing: "3px", cursor: generating ? "not-allowed" : "pointer", fontWeight: 700, transition: "all 0.2s", boxShadow: generating ? "none" : `0 4px 20px ${heroineColor}18` }}>
            {generating ? "GENERATING…" : "▶ GENERATE NOW"}
          </button>
        </div>
      </div>
    </div>
  );
}
