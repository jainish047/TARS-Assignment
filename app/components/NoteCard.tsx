// components/NoteCard.tsx
"use client";
import React from "react";
import { Copy, Trash, Edit, Volume2, Star } from "lucide-react";
import { Note, useNotes } from "@/app/context/NotesContext";

interface NoteCardProps {
  note: Note;
  onSelect: () => void;
  onDelete: () => void;
  editNote: () => void;
  // addFavourite: () => void;
  // removefavourite: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onSelect,
  onDelete,
  editNote,
  // addFavourite,
  // removefavourite,
}) => {
  const {addFavourite, removeFavourite} = useNotes()

  return (
    <div
      className="border rounded-lg p-4 shadow-md bg-white cursor-pointer hover:shadow-lg transition"
      onClick={onSelect} // Opens modal on click
    >
      <div className="text-gray-500 text-sm mb-2">
        {note.createdAt
          ? new Date(note.createdAt).toLocaleDateString()
          : "Unknown Date"}
      </div>
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
        <h3 className="font-semibold text-lg mb-2">{note.title}</h3>
        {note.audioUrl && <Volume2 className="text-blue-500 mb-2" />}{" "}
        </div>
        {/* Audio icon if available */}
        <Star
          className={`cursor-pointer stroke-current ${
            note.favourite
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-400 fill-none"
          }`}
          onClick={() => {
            if(!note.favourite) addFavourite(note._id)
            else                removeFavourite(note._id)
          }}
        />
      </div>
      <p className="text-gray-600 truncate">{note.text || note.transcript}</p>
      <div className="flex justify-between mt-3">
        <Copy
          className="w-5 h-5 text-gray-500 hover:text-gray-700 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(note.text || note.transcript || "");
          }}
        />
        <Edit
          className="w-5 h-5 text-yellow-500 hover:text-yellow-700 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            editNote();
          }}
        />
        <Trash
          className="w-5 h-5 text-red-500 hover:text-red-700 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        />
      </div>
    </div>
  );
};

export default NoteCard;
