import { useState } from "react";
import { questions, followupsData } from "../data/questionsData";
import FollowupSection from "../components/FollowupSection";

interface CharacterParametersProps {
  onBack: () => void;
  onProceed: (answers: Record<number, string>) => void;
}

export default function CharacterParameters({ onBack, onProceed }: CharacterParametersProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQ, setCurrentQ] = useState(1);
  const total = questions.length;

  function selectOption(qId: number, value: string) {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  }

  function next() { if (currentQ < total) setCurrentQ((q) => q + 1); }
  function prev() { if (currentQ > 1)    setCurrentQ((q) => q - 1); }

  const currentAnswer  = answers[currentQ];
  const question       = questions[currentQ - 1];
  const followupFields = currentAnswer
    ? followupsData[question.followupKey]?.[currentAnswer]
    : undefined;
  const allAnswered    = Object.keys(answers).length === total;
  const pct            = Math.round((Object.keys(answers).length / total) * 100);

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem", minHeight: "100vh" }}>

      <div className="fade-in" style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <span className="badge badge-crimson" style={{ marginBottom: "1rem" }}>Character Configuration</span>
        <h1
          className="font-cinzel"
          style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: "#D4AF37", marginBottom: "0.5rem", fontWeight: 700 }}
        >
          Victim Profile Builder
        </h1>
        <p style={{ color: "rgba(200,200,220,0.65)", fontSize: "1rem" }}>
          Craft your character's psychological landscape
        </p>
      </div>

      <div
        className="glass-card"
        style={{ marginBottom: "2rem", padding: "1.5rem", cursor: "default" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <span className="font-cinzel" style={{ fontSize: "0.85rem", color: "#B8860B", letterSpacing: "2px", textTransform: "uppercase" }}>
            Progress
          </span>
          <span style={{ fontSize: "0.85rem", color: "rgba(200,200,220,0.6)" }}>
            {pct}% Complete
          </span>
        </div>

        <div
          style={{
            height: "4px",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "4px",
            overflow: "hidden",
            marginBottom: "1.25rem",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: "linear-gradient(90deg, #8B0000, #B8860B)",
              borderRadius: "4px",
              boxShadow: "0 0 10px rgba(184,134,11,0.6)",
              transition: "width 0.5s cubic-bezier(0.23,1,0.32,1)",
            }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          {Array.from({ length: total }, (_, i) => i + 1).map((n) => {
            const done   = n < currentQ || !!answers[n];
            const active = n === currentQ;
            return (
              <div
                key={n}
                onClick={() => setCurrentQ(n)}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: done
                    ? "rgba(184,134,11,0.25)"
                    : active
                    ? "rgba(139,0,0,0.35)"
                    : "rgba(255,255,255,0.04)",
                  border: done
                    ? "1.5px solid rgba(184,134,11,0.7)"
                    : active
                    ? "1.5px solid rgba(139,0,0,0.7)"
                    : "1.5px solid rgba(255,255,255,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  color: done ? "#D4AF37" : active ? "#FF6666" : "rgba(200,200,220,0.4)",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  boxShadow: active ? "0 0 16px rgba(139,0,0,0.5), 0 0 30px rgba(139,0,0,0.2)" : "none",
                  transition: "all 0.3s cubic-bezier(0.23,1,0.32,1)",
                  fontFamily: "'Cinzel', serif",
                }}
              >
                {done && !active ? "✓" : n}
              </div>
            );
          })}
        </div>
      </div>

      <div
        key={currentQ}
        className="slide-in glass-card"
        style={{
          marginBottom: "2rem",
          padding: "2.5rem",
          cursor: "default",
          borderColor: currentAnswer ? "rgba(184,134,11,0.45)" : "rgba(139,0,0,0.3)",
          boxShadow: currentAnswer ? "0 0 50px rgba(184,134,11,0.1), 0 20px 40px rgba(0,0,0,0.5)" : "0 20px 40px rgba(0,0,0,0.4)",
        }}
      >
        <div className="progress-bar-gradient" style={{ position: "absolute", top: 0, left: 0, right: 0, borderRadius: "20px 20px 0 0" }} />

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap" }}>
          <span
            className="font-montserrat"
            style={{
              fontSize: "0.7rem",
              color: "#00FF41",
              letterSpacing: "3px",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            {question.label}
          </span>
          <span
            style={{
              fontSize: "0.7rem",
              color: "rgba(200,200,220,0.35)",
              letterSpacing: "1px",
            }}
          >
            Question {currentQ} of {total}
          </span>
        </div>

        <h2
          className="font-cinzel"
          style={{
            fontSize: "clamp(1.2rem, 2.5vw, 1.7rem)",
            color: "#F0F0FF",
            marginBottom: "0.75rem",
            lineHeight: 1.4,
            fontWeight: 600,
          }}
        >
          {question.title}
        </h2>
        <p style={{ fontSize: "0.95rem", color: "rgba(200,200,220,0.65)", marginBottom: "2rem", lineHeight: 1.7 }}>
          {question.description}
        </p>

        <div style={{ display: "grid", gap: "0.75rem" }}>
          {question.options.map((opt) => (
            <div
              key={opt.value}
              className={`question-option${answers[currentQ] === opt.value ? " selected" : ""}`}
              onClick={() => selectOption(currentQ, opt.value)}
            >
              <input
                type="radio"
                name={`q${currentQ}`}
                checked={answers[currentQ] === opt.value}
                onChange={() => selectOption(currentQ, opt.value)}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: "#F0F0FF", marginBottom: "0.3rem", fontSize: "0.95rem" }}>
                  {opt.title}
                </div>
                <div style={{ fontSize: "0.82rem", color: "rgba(200,200,220,0.6)", lineHeight: 1.5 }}>
                  {opt.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {followupFields && followupFields.length > 0 && (
          <FollowupSection fields={followupFields} />
        )}
      </div>

      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
        <button className="action-button secondary" onClick={prev} disabled={currentQ === 1}>
          ← Previous
        </button>
        {currentQ < total ? (
          <button className="action-button" onClick={next} disabled={!currentAnswer}>
            Next Question →
          </button>
        ) : (
          <button className="action-button" onClick={() => onProceed(answers)} disabled={!allAnswered}>
            Begin Story Creation ✦
          </button>
        )}
        <button className="action-button secondary" onClick={onBack}>
          ← Portal
        </button>
      </div>
    </div>
  );
}
