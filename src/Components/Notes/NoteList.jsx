import React from "react";
import NoteItem from "./NoteItem";

export default function NoteList({ notes, selectedNote, onSelect, onDelete, onPin }) {
  return (
    <div className="note-list">
      {notes.map(note => (
        <NoteItem
          key={note.id}
          note={note}
          selected={selectedNote && note.id === selectedNote.id}
          onSelect={() => onSelect(note)}
          onDelete={() => onDelete(note.id)}
          onPin={() => onPin(note.id)}
        />
      ))}
    </div>
  );
}