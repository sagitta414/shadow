import { useState, useEffect, useRef } from "react";
import type { FollowupField } from "../data/questionsData";

interface FollowupSectionProps {
  fields: FollowupField[];
  onChange?: (values: Record<string, string>) => void;
}

export default function FollowupSection({ fields, onChange }: FollowupSectionProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setValues({});
  }, [fields]);

  function handleChange(index: number, value: string) {
    const updated = { ...values, [`field_${index}`]: value };
    setValues(updated);
    onChange?.(updated);
  }

  return (
    <div
      ref={containerRef}
      className="slide-in"
      style={{
        marginTop: "1.5rem",
        paddingLeft: "1.5rem",
        borderLeft: "3px solid #800000",
      }}
    >
      {fields.map((field, i) => (
        <div
          key={i}
          style={{
            background: "rgba(45,27,105,0.2)",
            border: "2px solid rgba(45,27,105,0.5)",
            borderRadius: "12px",
            padding: "1.25rem",
            marginBottom: "1rem",
          }}
        >
          <div
            className="font-cinzel"
            style={{ fontSize: "1.1rem", color: "#B8860B", marginBottom: "0.75rem" }}
          >
            {field.title}
          </div>
          {field.type === "input" ? (
            <input
              type="text"
              className="followup-input"
              placeholder={field.placeholder}
              value={values[`field_${i}`] || ""}
              onChange={(e) => handleChange(i, e.target.value)}
            />
          ) : (
            <textarea
              className="followup-textarea"
              placeholder={field.placeholder}
              rows={3}
              value={values[`field_${i}`] || ""}
              onChange={(e) => handleChange(i, e.target.value)}
              style={{ minHeight: "80px" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
