import React, { useEffect, useState } from "react";
import { getSummary } from "../../utils/aiService";

export default function AISummary({ content }) {
  const [summary, setSummary] = useState("");

  useEffect(() => {
    if (!content?.trim()) {
      return setSummary("");
    }
    getSummary(content)
      .then((result) => {
        setSummary(result);
      })
      .catch((error) => {
        setSummary("");
      });
  }, [content]);

  if (!summary) return null;

  return (
    <div className="ai-summary">
      <strong>Summary:</strong> {summary}
    </div>
  );
}
