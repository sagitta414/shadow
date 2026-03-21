import { useState } from "react";

interface ScenarioGeneratorProps {
  onBack: () => void;
}

const motiveOptions = [
  { value: "financial",     label: "Financial (Ransom)" },
  { value: "revenge",       label: "Revenge" },
  { value: "psychological", label: "Psychological (Torture / Control)" },
  { value: "ideological",   label: "Ideological (Making a Statement)" },
];

const gearOptions = [
  { value: "restraints",     label: "Restraints (Ropes, Chains, Cuffs)" },
  { value: "technological",  label: "Technological (Drones, Locks, Surveillance)" },
  { value: "psychological",  label: "Psychological (Drugs, Gas, Mind Games)" },
  { value: "brute_force",    label: "Brute Force (Overwhelming Physical Presence)" },
];

const violenceOptions = [
  { value: "non_lethal",       label: "Non-lethal (Intimidation, Restriction)" },
  { value: "calibrated_pain",  label: "Calibrated Pain (Inflicting pain for a purpose)" },
  { value: "unstable",         label: "Unstable (Erratic, unpredictable violence)" },
  { value: "lethal",           label: "Lethal (Willing to kill)" },
];

const psychologyOptions = [
  { value: "detached_professional", label: "Detached Professional (Cold, efficient)" },
  { value: "intimate_predator",     label: "Intimate Predator (Grooming, manipulation)" },
  { value: "sadist",                label: "Sadist (Enjoys suffering)" },
  { value: "desperate",             label: "Desperate (Panicked, prone to mistakes)" },
];

function generateQuestions(motive: string, gear: string, violence: string, psychology: string): string[] {
  const questions: string[] = [];

  if (motive === "financial") {
    questions.push("How much is the ransom, and who is expected to pay it?");
    questions.push("Is there a deadline, and what are the consequences of missing it?");
  } else if (motive === "revenge") {
    questions.push("What specific past event is this revenge for?");
    questions.push("Does the captor want the victim to understand why this is happening?");
  } else if (motive === "psychological") {
    questions.push("What is the captor trying to 'break' in the victim? Their will, their mind, or their spirit?");
    questions.push("Is there a specific 'end state' the captor wants to achieve?");
  } else if (motive === "ideological") {
    questions.push("What is the captor's ideology, and how does the victim represent the opposition?");
    questions.push("Does the captor plan to make a public statement, or is this a symbolic act?");
  }

  if (gear === "restraints") {
    questions.push("What specific materials are used for the restraints, and are there escape opportunities?");
    questions.push("Are the restraints a form of constant torment (e.g., too tight, abrasive)?");
  } else if (gear === "technological") {
    questions.push("What is the extent of the technological surveillance? Is privacy an illusion?");
    questions.push("Is there a flaw in the system the victim can exploit?");
  } else if (gear === "psychological") {
    questions.push("Are the substances used for sedation, hallucination, or memory alteration?");
    questions.push("How does the victim perceive reality under the influence?");
  } else if (gear === "brute_force") {
    questions.push("Does the captor's presence alone prevent escape, or is it a constant active threat?");
    questions.push("Are there moments of exhaustion or vulnerability in the captor?");
  }

  if (violence === "non_lethal") {
    questions.push("What is the line the captor will not cross with physical harm?");
    questions.push("Is the threat of violence more potent than its actual application?");
  } else if (violence === "calibrated_pain") {
    questions.push("Is the pain used for interrogation, punishment, or pleasure?");
    questions.push("Does the captor have medical knowledge to prevent accidental death?");
  } else if (violence === "unstable") {
    questions.push("What triggers the captor's violent outbursts?");
    questions.push("Can the victim learn to navigate the captor's moods to survive?");
  } else if (violence === "lethal") {
    questions.push("Is the victim's life already forfeit, or is it a bargaining chip?");
    questions.push("Under what specific circumstances would the captor end the victim's life?");
  }

  if (psychology === "detached_professional") {
    questions.push("Is there any flicker of humanity or empathy in the captor?");
    questions.push("Can the victim appeal to the captor's logic or sense of self-preservation?");
  } else if (psychology === "intimate_predator") {
    questions.push("Does the captor genuinely believe they care for the victim?");
    questions.push("What past traumas does the captor project onto the victim?");
  } else if (psychology === "sadist") {
    questions.push("What form of suffering pleases the captor most: physical, emotional, or psychological?");
    questions.push("Is there a point where the captor loses interest?");
  } else if (psychology === "desperate") {
    questions.push("What is the source of the captor's desperation (e.g., being hunted, time constraint)?");
    questions.push("Can the victim exploit the captor's panic to create an opportunity?");
  }

  return questions;
}

function SelectField({
  label,
  number,
  value,
  options,
  onChange,
}: {
  label: string;
  number: number;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div
      style={{
        background: "rgba(0,0,0,0.45)",
        border: "1px solid rgba(139,0,0,0.3)",
        borderRadius: "14px",
        padding: "1.5rem",
        backdropFilter: "blur(10px)",
        transition: "border-color 0.3s ease",
      }}
    >
      <label
        className="font-montserrat"
        style={{
          display: "block",
          fontSize: "0.75rem",
          color: "#00FF41",
          letterSpacing: "2px",
          textTransform: "uppercase",
          marginBottom: "0.5rem",
          fontWeight: 700,
        }}
      >
        {number.toString().padStart(2, "0")} — {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "0.875rem 1rem",
          background: "rgba(0,0,0,0.6)",
          border: "1px solid rgba(45,27,105,0.6)",
          borderRadius: "10px",
          color: value ? "#F0F0FF" : "rgba(200,200,220,0.4)",
          fontFamily: "'Raleway', sans-serif",
          fontSize: "0.95rem",
          outline: "none",
          cursor: "pointer",
          transition: "all 0.3s ease",
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23B8860B' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 1rem center",
          paddingRight: "2.5rem",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "#B8860B";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(184,134,11,0.15)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "rgba(45,27,105,0.6)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: "#0A0015" }}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function ScenarioGenerator({ onBack }: ScenarioGeneratorProps) {
  const [motive,     setMotive]     = useState(motiveOptions[0].value);
  const [gear,       setGear]       = useState(gearOptions[0].value);
  const [violence,   setViolence]   = useState(violenceOptions[0].value);
  const [psychology, setPsychology] = useState(psychologyOptions[0].value);
  const [questions,  setQuestions]  = useState<string[]>([]);
  const [generated,  setGenerated]  = useState(false);

  function handleGenerate() {
    const q = generateQuestions(motive, gear, violence, psychology);
    setQuestions(q);
    setGenerated(true);
  }

  function handleReset() {
    setMotive(motiveOptions[0].value);
    setGear(gearOptions[0].value);
    setViolence(violenceOptions[0].value);
    setPsychology(psychologyOptions[0].value);
    setQuestions([]);
    setGenerated(false);
  }

  function handleCopy() {
    const text = questions.map((q, i) => `${i + 1}. ${q}`).join("\n\n");
    navigator.clipboard.writeText(text).catch(() => {});
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem", minHeight: "100vh" }}>
      <div className="fade-in" style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <span className="badge badge-crimson" style={{ marginBottom: "1rem" }}>Scenario Engine</span>
        <h1
          className="font-cinzel"
          style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: "#D4AF37", marginBottom: "0.5rem", fontWeight: 700 }}
        >
          Scenario Question Generator
        </h1>
        <p style={{ color: "rgba(200,200,220,0.65)", fontSize: "1rem" }}>
          Configure the captor's traits to generate targeted narrative questions
        </p>
        <div className="divider" style={{ maxWidth: "350px", margin: "1rem auto 0" }}>
          <span className="divider-symbol">✦</span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2rem",
        }}
      >
        <SelectField label="Primary Motive"         number={1} value={motive}     options={motiveOptions}     onChange={setMotive} />
        <SelectField label="Method of Control"      number={2} value={gear}       options={gearOptions}       onChange={setGear} />
        <SelectField label="Baseline Violence"      number={3} value={violence}   options={violenceOptions}   onChange={setViolence} />
        <SelectField label="Psychological Approach" number={4} value={psychology} options={psychologyOptions} onChange={setPsychology} />
      </div>

      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginBottom: "2.5rem", flexWrap: "wrap" }}>
        <button className="enter-button" onClick={handleGenerate} style={{ fontSize: "1rem", padding: "1.1rem 2.5rem" }}>
          Generate Questions
        </button>
        <button className="action-button secondary" onClick={handleReset}>
          Reset
        </button>
      </div>

      {generated && questions.length > 0 && (
        <div
          className="slide-in"
          style={{
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(184,134,11,0.35)",
            borderRadius: "20px",
            padding: "2rem",
            marginBottom: "2rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className="progress-bar-gradient" style={{ position: "absolute", top: 0, left: 0, right: 0, borderRadius: "20px 20px 0 0" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
            <div className="section-header" style={{ margin: 0, border: "none", paddingBottom: 0 }}>
              Generated Questions
            </div>
            <button
              onClick={handleCopy}
              style={{
                background: "rgba(184,134,11,0.15)",
                border: "1px solid rgba(184,134,11,0.4)",
                borderRadius: "8px",
                padding: "0.5rem 1rem",
                color: "#D4AF37",
                fontFamily: "'Cinzel', serif",
                fontSize: "0.8rem",
                cursor: "pointer",
                letterSpacing: "1px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(184,134,11,0.3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(184,134,11,0.15)";
              }}
            >
              Copy All
            </button>
          </div>

          <div style={{ display: "grid", gap: "1rem" }}>
            {questions.map((q, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "1rem",
                  alignItems: "flex-start",
                  padding: "1rem 1.25rem",
                  background: "rgba(0,0,0,0.4)",
                  borderRadius: "12px",
                  border: "1px solid rgba(45,27,105,0.35)",
                  borderLeft: "3px solid rgba(184,134,11,0.6)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(184,134,11,0.06)";
                  (e.currentTarget as HTMLDivElement).style.borderLeftColor = "#B8860B";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.4)";
                  (e.currentTarget as HTMLDivElement).style.borderLeftColor = "rgba(184,134,11,0.6)";
                }}
              >
                <span
                  className="font-cinzel"
                  style={{
                    fontSize: "0.8rem",
                    color: "#B8860B",
                    fontWeight: 700,
                    minWidth: "28px",
                    paddingTop: "2px",
                    opacity: 0.9,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p
                  className="font-crimson"
                  style={{
                    fontSize: "1.05rem",
                    color: "#F0F0FF",
                    lineHeight: 1.65,
                    fontStyle: "italic",
                  }}
                >
                  {q}
                </p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "1.25rem", fontSize: "0.8rem", color: "rgba(200,200,220,0.4)", textAlign: "center" }}>
            {questions.length} questions generated from your configuration
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "center" }}>
        <button className="action-button secondary" onClick={onBack}>
          ← Back to Portal
        </button>
      </div>
    </div>
  );
}
