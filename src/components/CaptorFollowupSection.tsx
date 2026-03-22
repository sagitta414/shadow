import { useState, useEffect } from "react";
import type { CaptorFollowupField } from "../data/captorData";

interface CaptorFollowupSectionProps {
  fields: CaptorFollowupField[];
  onChange?: (values: Record<string, string>) => void;
}

export default function CaptorFollowupSection({ fields, onChange }: CaptorFollowupSectionProps) {
  const [values, setValues] = useState<Record<string, string>>({});

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
      className="slide-in"
      style={{
        marginTop: "1.25rem",
        paddingLeft: "1.25rem",
        borderLeft: "3px solid #800000",
      }}
    >
      {fields.map((field, i) => (
        <div
          key={i}
          style={{
            background: "rgba(44,62,80,0.2)",
            border: "2px solid rgba(44,62,80,0.4)",
            borderRadius: "10px",
            padding: "1rem",
            marginBottom: "0.75rem",
          }}
        >
          <div
            className="font-cinzel"
            style={{ fontSize: "1rem", color: "#7F8C8D", marginBottom: "0.6rem" }}
          >
            {field.title}
          </div>
          {field.type === "input" ? (
            <input
              type="text"
              className="captor-followup-input"
              placeholder={field.placeholder}
              value={values[`field_${i}`] || ""}
              onChange={(e) => handleChange(i, e.target.value)}
            />
          ) : (
            <textarea
              className="captor-followup-textarea"
              placeholder={field.placeholder}
              rows={3}
              value={values[`field_${i}`] || ""}
              onChange={(e) => handleChange(i, e.target.value)}
              style={{ minHeight: "70px" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
