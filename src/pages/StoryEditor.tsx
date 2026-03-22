import { useState, useEffect, useCallback } from "react";

interface StoryEditorProps {
  onBack: () => void;
}

const PROMPTS = [
  "The first rule is: there are no rules. Only their rules.",
  "Resistance is not just futile—it's part of the training.",
  "Every escape attempt teaches them more about you.",
  "The cage is both literal and metaphorical.",
  "She had stopped counting the days. Days were for people with futures.",
  "He spoke softly, which was worse than shouting.",
  "The silence between them held more threat than any weapon.",
  "There is a kind of freedom in having nothing left to lose.",
];

export default function StoryEditor({ onBack }: StoryEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("shadowweave_story");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setTitle(data.title || "");
        setContent(data.content || "");
      } catch {}
    }
  }, []);

  const wordCount = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = content.length;

  const saveStory = useCallback(() => {
    const data = { title, content, timestamp: new Date().toISOString() };
    localStorage.setItem("shadowweave_story", JSON.stringify(data));
    setSaveStatus("✓ Saved");
    setTimeout(() => setSaveStatus(""), 2000);
  }, [title, content]);

  function loadStory() {
    const saved = localStorage.getItem("shadowweave_story");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setTitle(data.title || "");
        setContent(data.content || "");
      } catch {}
    }
  }

  function exportStory() {
    const t = title || "Untitled Story";
    const data = {
      title: t,
      content,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${t.replace(/[^a-z0-9]/gi, "_")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function clearStory() {
    if (confirm("Clear the editor? This cannot be undone.")) {
      setTitle("");
      setContent("");
    }
  }

  function insertPrompt(prompt: string) {
    setContent((c) => c + (c ? "\n\n" : "") + prompt);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveStory();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [saveStory]);

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "1.5rem", background: "rgba(10,0,21,0.9)", minHeight: "100vh" }}>
      <div
        style={{
          background: "linear-gradient(135deg, #8B0000, #2D1B69)",
          padding: "1.75rem 2rem",
          borderRadius: "20px 20px 0 0",
          textAlign: "center",
        }}
      >
        <h1 className="font-cinzel" style={{ fontSize: "clamp(1.6rem, 3vw, 2.5rem)", color: "#C0C0C0", textShadow: "0 0 30px rgba(184,134,11,0.6)", marginBottom: "0.5rem" }}>
          Shadowweave Story Editor
        </h1>
        <p className="font-crimson" style={{ fontSize: "1.2rem", fontStyle: "italic", opacity: 0.9, color: "#C0C0C0" }}>
          Craft your dark narrative with precision
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 0,
          background: "rgba(0,0,0,0.5)",
          borderRadius: "0 0 20px 20px",
          overflow: "hidden",
        }}
        className="editor-grid"
      >
        <div style={{ padding: "2rem" }}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your story title..."
            style={{
              width: "100%",
              padding: "1.25rem",
              background: "rgba(0,0,0,0.7)",
              border: "2px solid #800000",
              borderRadius: "15px",
              color: "#C0C0C0",
              fontFamily: "'Crimson Text', serif",
              fontSize: "1.4rem",
              marginBottom: "1.5rem",
              outline: "none",
              transition: "all 0.3s ease",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#B8860B"; e.currentTarget.style.boxShadow = "0 0 20px rgba(184,134,11,0.4)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "#800000"; e.currentTarget.style.boxShadow = "none"; }}
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Begin your dark narrative here..."
            style={{
              width: "100%",
              minHeight: "580px",
              padding: "1.5rem",
              background: "rgba(0,0,0,0.7)",
              border: "2px solid #2D1B69",
              borderRadius: "15px",
              color: "#C0C0C0",
              fontFamily: "'Crimson Text', serif",
              fontSize: "1.15rem",
              lineHeight: "1.8",
              resize: "vertical",
              outline: "none",
              transition: "all 0.3s ease",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#B8860B"; e.currentTarget.style.boxShadow = "0 0 20px rgba(184,134,11,0.4)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "#2D1B69"; e.currentTarget.style.boxShadow = "none"; }}
          />
        </div>

        <div style={{ background: "rgba(0,0,0,0.3)", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem", borderLeft: "1px solid rgba(45,27,105,0.5)" }}>
          <div style={{ background: "rgba(0,0,0,0.5)", borderRadius: "15px", padding: "1.5rem" }}>
            <div className="font-cinzel" style={{ fontSize: "1.2rem", color: "#B8860B", marginBottom: "1rem" }}>Story Tools</div>
            <button
              className="tool-button"
              onClick={saveStory}
              style={saveStatus ? { background: "linear-gradient(135deg, #1B5E20, #2E7D32)" } : undefined}
            >
              {saveStatus || "Save Story"}
            </button>
            <button className="tool-button secondary" onClick={loadStory}>Load Story</button>
            <button className="tool-button" onClick={exportStory}>Export Story</button>
            <button className="tool-button secondary" onClick={clearStory}>Clear Editor</button>
            <div
              style={{
                background: "rgba(0,0,0,0.7)",
                padding: "0.875rem",
                borderRadius: "10px",
                textAlign: "center",
                fontFamily: "monospace",
                color: "#00FF41",
                border: "2px solid #2D1B69",
                fontSize: "0.85rem",
              }}
            >
              Words: {wordCount} | Characters: {charCount}
            </div>
            <div style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "#C0C0C0", opacity: 0.6, textAlign: "center" }}>
              Ctrl+S to save
            </div>
          </div>

          <div style={{ background: "rgba(0,0,0,0.5)", borderRadius: "15px", padding: "1.5rem", flex: 1 }}>
            <div className="font-cinzel" style={{ fontSize: "1.2rem", color: "#B8860B", marginBottom: "1rem" }}>Story Prompts</div>
            {PROMPTS.map((p) => (
              <div key={p} className="prompt-item" onClick={() => insertPrompt(p)}>
                <p style={{ fontStyle: "italic", lineHeight: 1.5, fontSize: "0.85rem" }}>"{p}"</p>
              </div>
            ))}
          </div>

          <button className="action-button secondary" onClick={onBack} style={{ fontSize: "0.9rem", padding: "0.875rem 1.5rem" }}>
            ← Back to Portal
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .editor-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
