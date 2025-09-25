import React, { useEffect, useState } from "react";
import { getGlossary } from "../../utils/aiService";

export default function GlossaryHighlight({ content }) {
  const [highlightedContent, setHighlightedContent] = useState(content);

  useEffect(() => {
    if (!content?.trim()) return setHighlightedContent(content);

    getGlossary(content).then((glossary) => {
      let updated = content;
      glossary.forEach(({ term, definition }) => {
        const regex = new RegExp(`\\b${term}\\b`, "gi");
        updated = updated.replace(
          regex,
          `<span class="highlighted-term" title="${definition}">${term}</span>`
        );
      });
      setHighlightedContent(updated);
    });
  }, [content]);

  return (
    <div
      className="glossary-highlight"
      dangerouslySetInnerHTML={{ __html: highlightedContent }}
    />
  );
}
