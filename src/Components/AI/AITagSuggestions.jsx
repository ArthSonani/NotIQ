import React, { useEffect, useState } from "react";
import { getTags } from "../../utils/aiService";

export default function AITagSuggestions({ content }) {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    if (!content?.trim()) {
      return setTags([]);
    }
    getTags(content)
      .then((result) => {
        setTags(result);
      })
      .catch((error) => {
        setTags([]);
      });
  }, [content]);

  if (!tags.length) return null;

  return (
    <div className="ai-tags">
      <strong>Suggested Tags:</strong>{" "}
      {tags.map((tag) => (
        <span className="tag" key={tag}>
          {tag}
        </span>
      ))}
    </div>
  );
}
