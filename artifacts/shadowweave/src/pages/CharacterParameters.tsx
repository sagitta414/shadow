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

  function next() {
    if (currentQ < total) setCurrentQ((q) => q + 1);
  }

  function prev() {
    if (currentQ > 1) setCurrentQ((q) => q - 1);
  }

  const currentAnswer = answers[currentQ];
  const question = questions[currentQ - 1];
  const followupFields = currentAnswer
    ? followupsData[question.followupKey]?.[currentAnswer]
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
            fontSize: "clamp(2rem, 4vw, 3rem)",
            color: "#B8860B",
            marginBottom: "0.75rem",
            textShadow: "0 0 30px rgba(184,134,11,0.6)",
          }}
        >
          Character Configuration
        </h1>
        <p className="font-montserrat" style={{ fontSize: "1.2rem", color: "#F0F0FF", opacity: 0.9 }}>
          Build your character's psychological profile
        </p>
      </div>

      <div style={{ background: "rgba(0,0,0,0.5)", borderRadius: "20px", padding: "1.5rem", marginBottom: "2.5rem", textAlign: "center" }}>
        <div className="font-cinzel" style={{ fontSize: "1.2rem", color: "#B8860B", marginBottom: "1rem" }}>
          Configuration Progress
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
          {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
            <div
              key={n}
              onClick={() => setCurrentQ(n)}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: n < currentQ
                  ? "rgba(184,134,11,0.4)"
                  : n === currentQ
                  ? "rgba(139,0,0,0.6)"
                  : "rgba(139,0,0,0.3)",
                border: n <= currentQ ? "2px solid #B8860B" : "2px solid #800000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                color: n < currentQ ? "#B8860B" : "#C0C0C0",
                fontSize: "0.85rem",
                cursor: "pointer",
                boxShadow: n === currentQ ? "0 0 20px rgba(184,134,11,0.5)" : "none",
                transition: "all 0.3s ease",
              }}
            >
              {n < currentQ ? "✓" : n}
            </div>
          ))}
        </div>
        <div style={{ fontSize: "0.9rem", color: "#C0C0C0", opacity: 0.8 }}>
          Question {currentQ} of {total} — {Math.round((Object.keys(answers).length / total) * 100)}% Complete
        </div>
      </div>

      <div
        style={{
          background: "rgba(0,0,0,0.6)",
          border: `2px solid ${currentAnswer ? "#B8860B" : "#2D1B69"}`,
          borderRadius: "25px",
          padding: "2.5rem",
          marginBottom: "2rem",
          backdropFilter: "blur(15px)",
          position: "relative",
          overflow: "hidden",
          boxShadow: currentAnswer ? "0 0 40px rgba(184,134,11,0.3)" : "none",
          transition: "all 0.3s ease",
        }}
      >
        <div className="progress-bar-gradient" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />

        <div
          className="font-cinzel"
          style={{ fontSize: "1rem", color: "#00FF41", marginBottom: "1rem", fontWeight: 600, letterSpacing: "2px" }}
        >
          {question.label}
        </div>
        <div
          className="font-cinzel"
          style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)", color: "#F0F0FF", marginBottom: "1rem", lineHeight: 1.4 }}
        >
          {question.title}
        </div>
        <div style={{ fontSize: "1rem", color: "#C0C0C0", marginBottom: "2rem", lineHeight: 1.6, opacity: 0.8 }}>
          {question.description}
        </div>

        <div style={{ display: "grid", gap: "0.875rem" }}>
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
                <div style={{ fontWeight: 600, color: "#F0F0FF", marginBottom: "0.3rem" }}>{opt.title}</div>
                <div style={{ fontSize: "0.85rem", color: "#C0C0C0", opacity: 0.8 }}>{opt.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {followupFields && followupFields.length > 0 && (
          <FollowupSection fields={followupFields} />
        )}
      </div>

      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginTop: "2rem" }}>
        <button className="action-button secondary" onClick={prev} disabled={currentQ === 1}>
          Previous
        </button>
        {currentQ < total ? (
          <button
            className="action-button"
            onClick={next}
            disabled={!currentAnswer}
          >
            Next Question
          </button>
        ) : (
          <button
            className="action-button"
            onClick={() => onProceed(answers)}
            disabled={!allAnswered}
          >
            Begin Story Creation
          </button>
        )}
        <button className="action-button secondary" onClick={onBack}>
          Back to Portal
        </button>
      </div>
    </div>
  );
}
