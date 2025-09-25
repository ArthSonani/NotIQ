import React, { useEffect, useState } from "react";
import { getGrammarErrors } from "../../utils/aiService";
import { markGrammarErrors } from "../../utils/grammarUtils";

export default function GrammarCheck({ content }) {
  const [markedContent, setMarkedContent] = useState(content);

  useEffect(() => {
    if (!content?.trim()) return setMarkedContent(content);

    getGrammarErrors(content)
      .then((errors) => {
        setMarkedContent(markGrammarErrors(content, errors));
      })
      .catch(() => setMarkedContent(content));
  }, [content]);

  if (!content?.trim()) return null;

  return (
    <div
      className="grammar-check"
      dangerouslySetInnerHTML={{ __html: markedContent }}
    />
  );
}
