import { useState, useEffect } from "react";

function loadNotes() {
  try {
    const notes = JSON.parse(localStorage.getItem("notes") || "[]");
    return notes;
  } catch {
    return [];
  }
}

function saveNotes(notes) {
  localStorage.setItem("notes", JSON.stringify(notes));
}

function sortNotes(notes) {
  return [...notes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
}

export default function useNotes() {
  const [notes, setNotes] = useState(loadNotes());
  const [filteredNotes, setFilteredNotes] = useState(sortNotes(loadNotes()));
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => { saveNotes(notes); }, [notes]);

  const createNote = () => {
    const newNote = { id: Date.now(), title: "", content: "", pinned: false, encrypted: false };
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    setFilteredNotes(sortNotes(updatedNotes));
    setSelectedNote(newNote);
  };

  const updateNote = (updated) => {
    const updatedNotes = notes.map(n => n.id === updated.id ? { ...n, ...updated } : n);
    setNotes(updatedNotes);
    setFilteredNotes(sortNotes(updatedNotes));
    
    // Update selectedNote only if it's the same note being updated
    if (selectedNote && selectedNote.id === updated.id) {
      setSelectedNote({ ...selectedNote, ...updated });
    }
  };

  const deleteNote = (id) => {
    const updatedNotes = notes.filter(n => n.id !== id);
    setNotes(updatedNotes);
    setFilteredNotes(sortNotes(updatedNotes));
    if (selectedNote && selectedNote.id === id) setSelectedNote(null);
  };

  const pinNote = (id) => {
    const updatedNotes = notes.map(n => n.id === id ? {...n, pinned: !n.pinned} : n);
    setNotes(updatedNotes);
    setFilteredNotes(sortNotes(updatedNotes));
  };

  const selectNote = (note) => setSelectedNote(note);

  const searchNotes = (query) => {
    if (!query) {
      setFilteredNotes(sortNotes(notes));
      return;
    }
    const lower = query.toLowerCase();
    const filtered = notes.filter(n =>
      (n.title && n.title.toLowerCase().includes(lower)) ||
      (n.content && n.content.toLowerCase().includes(lower))
    );
    setFilteredNotes(sortNotes(filtered));
  };

  return { notes: filteredNotes, selectedNote, selectNote, createNote, deleteNote, updateNote, pinNote, searchNotes };
}