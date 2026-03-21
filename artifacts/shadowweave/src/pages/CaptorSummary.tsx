import { captorDescriptions, captorQuestions } from "../data/captorData";

interface CaptorSummaryProps {
  answers: Record<number, string>;
  onReset: () => void;
  onBack: () => void;
}

function getDesc(questionId: number, value: string): string {
  const question = captorQuestions.find((q) => q.id === questionId);
  if (!question) return value;
  const map = captorDescriptions[question.followupKey];
  return map?.[value] || value;
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <div style={{ fontWeight: 600, color: "#C0C0C0", marginBottom: "0.25rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px" }}>
        {label}
      </div>
      <div style={{ color: "#F0F0FF", lineHeight: 1.5, fontSize: "0.95rem" }}>{value}</div>
    </div>
  );
}

export default function CaptorSummary({ answers, onReset, onBack }: CaptorSummaryProps) {
  function exportConfig() {
    const data = {
      captorConfiguration: {
        structure: getDesc(1, answers[1]),
        motivation: getDesc(2, answers[2]),
        background: getDesc(3, answers[3]),
        equipment: getDesc(4, answers[4]),
        violence: getDesc(5, answers[5]),
        psychological: getDesc(6, answers[6]),
        risk: getDesc(7, answers[7]),
        endgame: getDesc(8, answers[8]),
      },
      exportDate: new Date().toISOString(),
      version: "1.0",
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `captor_configuration_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const sections = [
    {
      title: "Operational Profile",
      items: [
        { label: "Structure", qId: 1 },
        { label: "Background", qId: 3 },
        { label: "Risk Assessment", qId: 7 },
      ],
    },
    {
      title: "Psychological Profile",
      items: [
        { label: "Primary Motivation", qId: 2 },
        { label: "Psychological Approach", qId: 6 },
        { label: "Violence Threshold", qId: 5 },
      ],
    },
    {
      title: "Equipment & Methods",
      items: [
        { label: "Equipment Level", qId: 4 },
      ],
    },
    {
      title: "Risk & Strategy",
      items: [
        { label: "Endgame Strategy", qId: 8 },
      ],
    },
  ];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem", background: "rgba(10,0,21,0.9)", minHeight: "100vh" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1
          className="font-cinzel"
          style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", color: "#7F8C8D", marginBottom: "1rem", textShadow: "0 0 30px rgba(127,140,141,0.6)" }}
        >
          Captor Configuration Summary
        </h1>
        <p style={{ color: "#C0C0C0", opacity: 0.9 }}>Review your antagonist profile</p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2rem",
          marginBottom: "3rem",
        }}
      >
        {sections.map((section) => (
          <div
            key={section.title}
            style={{
              background: "rgba(0,0,0,0.6)",
              border: "2px solid #2C3E50",
              borderRadius: "15px",
              padding: "1.5rem",
            }}
          >
            <h3
              className="font-cinzel"
              style={{
                fontSize: "1.2rem",
                color: "#7F8C8D",
                marginBottom: "1rem",
                borderBottom: "2px solid #8B0000",
                paddingBottom: "0.5rem",
              }}
            >
              {section.title}
            </h3>
            {section.items.map((item) => (
              <SummaryItem
                key={item.qId}
                label={item.label}
                value={answers[item.qId] ? getDesc(item.qId, answers[item.qId]) : "Not configured"}
              />
            ))}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
        <button
          className="captor-action-btn"
          onClick={exportConfig}
          style={{ background: "linear-gradient(135deg, #2C3E50, #8B0000)" }}
        >
          Export Configuration
        </button>
        <button className="captor-action-btn secondary" onClick={onReset}>
          Create New Configuration
        </button>
        <button className="captor-action-btn secondary" onClick={onBack}>
          Return to Portal
        </button>
      </div>
    </div>
  );
}
