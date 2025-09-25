import React from "react";

export default function NoteItem({ note, selected, onSelect, onDelete, onPin }) {
  // Get preview text from content
  const getPreviewText = (content) => {
    if (!content) return "No content";
    // Remove HTML tags and get first 60 characters
    const text = content.replace(/<[^>]*>/g, '').trim();
    return text.length > 60 ? text.substring(0, 60) + "..." : text;
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`note-item ${selected ? "selected" : ""}`} onClick={onSelect}>
      <div className="note-content">
        <div className="note-header">
          <div className="note-title-container">
            {note.encrypted && <span className="lock-icon">🔒</span>}
            {note.pinned && <span className="pin-icon">📌</span>}
            <span className="note-title">
              {note.title || "Untitled"}
            </span>
          </div>
          <div className="note-actions">
            <button 
              className="action-btn pin-btn"
              onClick={e => {e.stopPropagation(); onPin();}}
              title={note.pinned ? "Unpin note" : "Pin note"}
            >
              {note.pinned ? "📌" : "📍"}
            </button>
            <button 
              className="action-btn delete-btn"
              onClick={e => {e.stopPropagation(); onDelete();}}
              title="Delete note"
            >
              🗑️
            </button>
          </div>
        </div>
        <div className="note-preview">
          {getPreviewText(note.content)}
        </div>
        <div className="note-meta">
          {formatDate(note.id)}
        </div>
      </div>
    </div>
  );
}