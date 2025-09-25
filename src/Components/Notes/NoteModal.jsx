import React, { useState } from "react";

// Can be used for note creation/edit in a modal if desired
export default function NoteModal({ initialTitle = "", initialContent = "", onSave, onCancel }) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  return (
    <div className="modal">
      <h3>{initialTitle ? "Edit Note" : "New Note"}</h3>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Title"
      />
      <textarea
        rows={10}
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Write your note..."
      />
      <div>
        <button onClick={() => onSave({ title, content })} disabled={!title && !content}>Save</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}