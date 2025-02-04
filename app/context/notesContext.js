"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface Note {
  _id: string;
  text: string;
}

interface NotesContextType {
  notes: Note[];
  addNote: (note: Note) => void;
  removeNote: (id: string) => void;
  setNotes: (notes: Note[]) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);

  const addNote = (note: Note) => {
    setNotes((prevNotes) => [...prevNotes, note]);
  };

  const removeNote = (id: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note._id !== id));
  };

  return (
    <NotesContext.Provider value={{ notes, addNote, removeNote, setNotes }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
}
