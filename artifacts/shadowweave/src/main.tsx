import { Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          position: "fixed", inset: 0, background: "#020008",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "2rem", fontFamily: "'Cinzel', serif", textAlign: "center", gap: "1.5rem",
        }}>
          <div style={{ fontSize: "2rem" }}>⚠</div>
          <div style={{ fontSize: "0.9rem", color: "#A855F7", letterSpacing: "3px" }}>STUDIO ERROR</div>
          <div style={{ fontSize: "0.7rem", color: "rgba(200,195,240,0.4)", fontFamily: "'Raleway', sans-serif", maxWidth: "320px", lineHeight: 1.6 }}>
            Something went wrong loading the studio. Try refreshing the page.
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "0.5rem", padding: "0.85rem 2rem",
              background: "linear-gradient(135deg, #6D28D9, #9333EA)",
              border: "1px solid rgba(168,85,247,0.6)", borderRadius: "12px",
              color: "#F5F0FF", fontSize: "0.75rem", letterSpacing: "3px",
              cursor: "pointer", fontFamily: "'Cinzel', serif",
            }}
          >
            RELOAD
          </button>
          <div style={{ fontSize: "0.5rem", color: "rgba(200,195,240,0.15)", fontFamily: "'Raleway', sans-serif", maxWidth: "300px" }}>
            {this.state.error?.message}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
