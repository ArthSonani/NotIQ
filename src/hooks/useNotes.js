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

function sortNotes(notesInput, ascending = true) {
  // Ensure we don't mutate caller array
  const list = [...(notesInput || [])];

  // sort by title according to ascending flag
  list.sort((a, b) => {
    const ta = (a.title || "").toLowerCase();
    const tb = (b.title || "").toLowerCase();
    if (ta < tb) return ascending ? -1 : 1;
    if (ta > tb) return ascending ? 1 : -1;
    return 0;
  });

  // Put pinned notes first. We want pinned to appear before unpinned.
  list.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return list;
}


export default function useNotes() {

  const [asc, setAsc] = useState(true);
  const [notes, setNotes] = useState(loadNotes());
  const [filteredNotes, setFilteredNotes] = useState(() => sortNotes(loadNotes(), true));
  const [selectedNote, setSelectedNote] = useState(null);



  useEffect(() => { saveNotes(notes); }, [notes]);
  // keep filteredNotes in sync when notes or sort order changes
  useEffect(() => {
    setFilteredNotes(sortNotes(notes, asc));
  }, [notes, asc]);

  
  // return [...notes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const createNote = () => {
    const newNote = { id: Date.now(), title: "", content: "", pinned: false, encrypted: false };
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    // filteredNotes will update via effect
    setSelectedNote(newNote);
  };

  const updateNote = (updated) => {
    const updatedNotes = notes.map(n => n.id === updated.id ? { ...n, ...updated } : n);
    setNotes(updatedNotes);
    // filteredNotes will update via effect
    
    // Update selectedNote only if it's the same note being updated
    if (selectedNote && selectedNote.id === updated.id) {
      setSelectedNote({ ...selectedNote, ...updated });
    }
  };

  const deleteNote = (id) => {
    // Find note first
    const noteToDelete = notes.find(n => n.id === id);
    // If note is encrypted and currently locked (not tempUnlocked), prevent deletion
    if (noteToDelete && noteToDelete.encrypted && !noteToDelete.tempUnlocked) {
      // Show a popup instructing user to unlock first
      alert('This note is encrypted and locked. Please unlock the note before deleting.');
      return;
    }

    const updatedNotes = notes.filter(n => n.id !== id);
    setNotes(updatedNotes);
    // filteredNotes will update via effect
    if (selectedNote && selectedNote.id === id) setSelectedNote(null);
  };

  const pinNote = (id) => {
    const updatedNotes = notes.map(n => n.id === id ? {...n, pinned: !n.pinned} : n);
    setNotes(updatedNotes);
    // filteredNotes will update via effect
  };

  const selectNote = (note) => setSelectedNote(note);

  const searchNotes = (query) => {
    if (!query) {
      setFilteredNotes(sortNotes(notes, asc));
      return;
    }
    const lower = query.toLowerCase();
    const filtered = notes.filter(n =>
      (n.title && n.title.toLowerCase().includes(lower)) ||
      (n.content && n.content.toLowerCase().includes(lower))
    );
    setFilteredNotes(sortNotes(filtered, asc));
  };

  const toggleAsc = () => setAsc(a => !a);

  return { notes: filteredNotes, selectedNote, selectNote, createNote, deleteNote, updateNote, pinNote, searchNotes, asc, toggleAsc };
}