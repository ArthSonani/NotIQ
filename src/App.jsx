import React, { useState } from "react";
import NoteList from "./Components/Notes/NoteList.jsx";
import TextEditor from "./Components/Editor/TextEditor.jsx";
import "./styles.css";
import useNotes from "./hooks/useNotes";

export default function App() {
  const {
    notes,
    selectedNote,
    selectNote,
    createNote,
    deleteNote,
    updateNote,
    pinNote,
    searchNotes,
    loading,
    asc,
    toggleAsc,
  } = useNotes();

  return (
    <div className="app-container">
      <aside className="sidebar">
        <button onClick={createNote} className="new-note-btn">+ New Note</button>
        <input
          placeholder="Search notes..."
          className="search-input"
          onChange={e => searchNotes(e.target.value)}
        />
        <div className="sort-controls">
          <button className="sort-toggle-btn" onClick={toggleAsc}>
            Sort: {asc ? "A → Z" : "Z → A"}
          </button>
        </div>
        <NoteList
          notes={notes}
          selectedNote={selectedNote}
          onSelect={selectNote}
          onDelete={deleteNote}
          onPin={pinNote}
        />
      </aside>
      
      <main className="editor-panel">
        {selectedNote ? (
          <TextEditor
            note={selectedNote}
            onSave={updateNote}
          />
        ) : (
          <div className="no-note-selected">Select or create a note to start editing.</div>
        )}
      </main>
    </div>
  );
}