import { useState } from "react";
import { captorQuestions, captorFollowupsData } from "../data/captorData";
import CaptorFollowupSection from "../components/CaptorFollowupSection";

interface CaptorConfigProps {
  onBack: () => void;
  onProceed: (answers: Record<number, string>) => void;
}

export default function CaptorConfig({ onBack, onProceed }: CaptorConfigProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQ, setCurrentQ] = useState(1);
  const total = captorQuestions.length;

  function selectOption(qId: number, value: string) {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  }

  const question = captorQuestions[currentQ - 1];
  const currentAnswer = answers[currentQ];
  const followupFields = currentAnswer
    ? captorFollowupsData[question.followupKey]?.[currentAnswer]
    : undefined;

  const allAnswered = Object.keys(answers).length === total;

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "2rem",
        background: "rgba(10,0,21,0.9)",
        minHeight: "100vh",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <h1
          className="font-cinzel"
          style={{
            fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
            color: "#7F8C8D",
            marginBottom: "0.75rem",
            textShadow: "0 0 30px rgba(127,140,141,0.6)",
          }}
        >
          Captor Configuration System
        </h1>
        <p className="font-montserrat" style={{ fontSize: "1.1rem", color: "#C0C0C0", opacity: 0.9 }}>
          Define your antagonist's complete profile
        </p>
      </div>

      <div
        style={{
          background: "rgba(0,0,0,0.6)",
          border: "2px solid #2C3E50",
          borderRadius: "20px",
          padding: "1.5rem",
          marginBottom: "2rem",
          textAlign: "center",
        }}
      >
        <div className="font-cinzel" style={{ fontSize: "1.1rem", color: "#7F8C8D", marginBottom: "1rem" }}>
          Configuration Progress
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
          {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
            <div
              key={n}
              onClick={() => setCurrentQ(n)}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: n < currentQ
                  ? "rgba(139,0,0,0.4)"
                  : n === currentQ
                  ? "rgba(44,62,80,0.8)"
                  : "rgba(44,62,80,0.5)",
                border: n < currentQ ? "2px solid #8B0000" : "2px solid #7F8C8D",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                color: n < currentQ ? "#8B0000" : "#C0C0C0",
                fontSize: "0.8rem",
                cursor: "pointer",
                boxShadow: n === currentQ ? "0 0 20px rgba(127,140,141,0.4)" : "none",
                transition: "all 0.3s ease",
              }}
            >
              {n < currentQ ? "✓" : n}
            </div>
          ))}
        </div>
        <div style={{ fontSize: "0.85rem", color: "#C0C0C0", opacity: 0.8 }}>
          Config {currentQ} of {total} — {Math.round((Object.keys(answers).length / total) * 100)}% Complete
        </div>
      </div>

      <div
        style={{
          background: "rgba(0,0,0,0.7)",
          border: `2px solid ${currentAnswer ? "#7F8C8D" : "#2C3E50"}`,
          borderRadius: "20px",
          padding: "2rem",
          marginBottom: "2rem",
          backdropFilter: "blur(10px)",
          position: "relative",
          overflow: "hidden",
          boxShadow: currentAnswer ? "0 0 30px rgba(127,140,141,0.3)" : "none",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "linear-gradient(90deg, #8B0000, #7F8C8D, #2C3E50)",
            animation: "progressGlow 3s ease-in-out infinite",
          }}
        />

        <div
          className="font-cinzel"
          style={{ fontSize: "1rem", color: "#00FF41", marginBottom: "0.75rem", fontWeight: 600, letterSpacing: "2px" }}
        >
          {question.label}
        </div>
        <div
          className="font-cinzel"
          style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)", color: "#F0F0FF", marginBottom: "0.875rem", lineHeight: 1.3 }}
        >
          {question.title}
        </div>
        <div style={{ fontSize: "0.95rem", color: "#C0C0C0", marginBottom: "1.5rem", lineHeight: 1.5, opacity: 0.8 }}>
          {question.description}
        </div>

        <div style={{ display: "grid", gap: "0.75rem" }}>
          {question.options.map((opt) => (
            <div
              key={opt.value}
              className={`captor-option${answers[currentQ] === opt.value ? " selected" : ""}`}
              onClick={() => selectOption(currentQ, opt.value)}
            >
              <input
                type="radio"
                name={`captor-q${currentQ}`}
                checked={answers[currentQ] === opt.value}
                onChange={() => selectOption(currentQ, opt.value)}
                style={{ accentColor: "#7F8C8D" }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: "#F0F0FF", marginBottom: "0.25rem", fontSize: "0.95rem" }}>{opt.title}</div>
                <div style={{ fontSize: "0.8rem", color: "#C0C0C0", opacity: 0.8 }}>{opt.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {followupFields && followupFields.length > 0 && (
          <CaptorFollowupSection fields={followupFields} />
        )}
      </div>

      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
        <button className="captor-action-btn secondary" onClick={() => setCurrentQ((q) => Math.max(1, q - 1))} disabled={currentQ === 1}>
          Previous
        </button>
        {currentQ < total ? (
          <button
            className="captor-action-btn"
            onClick={() => setCurrentQ((q) => q + 1)}
            disabled={!currentAnswer}
          >
            Next Question
          </button>
        ) : (
          <button
            className="captor-action-btn"
            onClick={() => onProceed(answers)}
            disabled={!allAnswered}
          >
            View Configuration
          </button>
        )}
        <button className="captor-action-btn secondary" onClick={onBack}>
          Back to Portal
        </button>
      </div>
    </div>
  );
}
