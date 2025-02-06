"use client";
import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useUser } from "./context/UserContext";
import { Note, NotesProvider, useNotes } from "@/app/context/NotesContext";
import AddNoteModal from "@/app/components/AddNoteModal";
import NoteCard from "@/app/components/NoteCard";
import ViewNoteModal from "@/app/components/ViewNoteModal";
import Header from "./components/Header";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function HomePage() {
  const { user, setUser } = useUser(); // Get user from context
  const { notes, deleteNote, addFavourite, removeFavourite } = useNotes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editNote, setEditNote] = useState<Note | null>();
  const [showfavourite, setShowFavourite] = useState<boolean>(false)
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    async function getUser() {
      const res = await fetch("/api/auth/user");
      const data = await res.json();
      if (!res.ok) {
        console.log("token verification failed", data.message);
        router.push("/auth");
      }
      setUser(data.user);
    }
    getUser();
  }, []);

  return (
    <main className="mx-auto p-6 w-96 md:w-screen">
      {/* Header */}
      <Header showfavourite={showfavourite} setShowFavourite={(val:boolean)=>{setShowFavourite(!!val)}} />

      {/* Notes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {(notes || []).map((note: Note) => (
          (showfavourite===false || note.favourite===true) && <NoteCard
            key={note._id}
            note={note}
            onSelect={() => setSelectedNote(note)}
            onDelete={() => deleteNote(note._id)}
            editNote={() => setEditNote(note)}
            // addFavourite={()=> }
            // removefavourite={()=>}
          />
        ))}
      </div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed right-10 bottom-10 bg-blue-500 text-white p-3 rounded-full shadow-md hover:bg-blue-600"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* !! -> to convert to boolean */}
      {/* Modals */}
      <AddNoteModal
        isOpen={isModalOpen || !!editNote}
        onClose={() => {
          setIsModalOpen(false);
          setEditNote(null);
        }}
        note={editNote}
      />
      <ViewNoteModal
        note={selectedNote}
        isOpen={!!selectedNote}
        onClose={() => setSelectedNote(null)}
        editNote={()=>setEditNote(selectedNote)}
        addFavourite={()=>addFavourite(selectedNote?._id || "")}
        removeFavourite={()=>removeFavourite(selectedNote?._id || "")}
        // onUpdate={(updatedNote) => console.log("Updating note:", updatedNote)}
      />
    </main>
  );
}
