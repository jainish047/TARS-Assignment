"use client";
import React, { useState, useEffect } from "react";
import { X, Edit, Maximize, Minimize } from "lucide-react";
import { Note, useNotes } from "../context/NotesContext";
import { Star } from "lucide-react";

interface NoteModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  editNote: () => void;
  addFavourite: () => void;
  removeFavourite: () => void;
}

const NoteModal: React.FC<NoteModalProps> = ({
  note,
  isOpen,
  onClose,
  editNote,
  addFavourite,
  removeFavourite,
}) => {
  if (!isOpen || !note) return null;
  const [tab, setTab] = useState<string>("text");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null); // Track clicked image
  const [localNote, setLocalNote] = useState<Note | null>(note); // Local state for modal
  const { notes } = useNotes();

  // Sync `localNote` with global `notes`
  useEffect(() => {
    if (note) {
      const updatedNote = notes.find((n) => n._id === note._id);
      if (updatedNote) {
        setLocalNote(updatedNote);
      }
    }
  }, [notes, note]); // Runs when `notes` update

  if (!isOpen || !localNote) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div
        className={`bg-white p-6 rounded-lg shadow-lg overflow-y-auto transition-all duration-300 ${
          isFullscreen ? "w-full h-full max-h-screen" : "max-h-[90vh] w-2/3"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{localNote.title}</h2>
          <div className="flex gap-4">
            {/* Favourite Button */}
            <Star
              className={`cursor-pointer stroke-current ${
                localNote.favourite
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-400 fill-none"
              }`}
              onClick={() => {
                if (localNote.favourite) {
                  removeFavourite();
                } else {
                  addFavourite();
                }
              }}
            />
            {/* Fullscreen Toggle Button */}
            {isFullscreen ? (
              <Minimize
                className="text-gray-500 cursor-pointer"
                onClick={() => setIsFullscreen(false)}
              />
            ) : (
              <Maximize
                className="text-gray-500 cursor-pointer"
                onClick={() => setIsFullscreen(true)}
              />
            )}
            <Edit
              className="text-gray-500 cursor-pointer"
              onClick={() => {
                editNote();
                onClose();
              }}
            />
            <X className="cursor-pointer" onClick={onClose} />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-300">
          <div className="flex gap-2 mb-2">
            <button
              className={`py-2 px-4 text-sm font-medium hover:bg-gray-100 rounded-md ${
                tab === "text" ? "text-black" : "text-gray-700"
              }`}
              onClick={() => setTab("text")}
            >
              Text
            </button>
            {localNote.audioUrl && (
              <button
                className={`py-2 px-4 text-sm font-medium hover:bg-gray-100 rounded-md ${
                  tab === "audio" ? "text-black" : "text-gray-700"
                }`}
                onClick={() => setTab("audio")}
              >
                Audio
              </button>
            )}
            {(localNote?.imageUrls?.length || 0) > 0 && (
              <button
                className={`py-2 px-4 text-sm font-medium hover:bg-gray-100 rounded-md ${
                  tab === "images" ? "text-black" : "text-gray-700"
                }`}
                onClick={() => setTab("images")}
              >
                Images
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div>
          {/* Text Tab */}
          <div
            className={`p-3 my-4 bg-gray-100 border rounded-md max-h-[300px] overflow-auto break-words ${
              tab === "text" ? "block" : "hidden"
            }`}
          >
            <p className="whitespace-pre-wrap">{localNote.text}</p>
          </div>

          {/* Audio Tab */}
          {localNote.audioUrl && (
            <div className={`p-3 mb-4 ${tab === "audio" ? "block" : "hidden"}`}>
              <audio controls className="w-full">
                <source src={localNote.audioUrl} type="audio/wav" />
              </audio>
              {localNote.transcript && (
                <div className="mt-2">
                  <h3 className="text-sm font-semibold">Transcript:</h3>
                  <p className="border p-3 rounded-md bg-gray-100">
                    {localNote.transcript}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Images Tab */}
          {(localNote?.imageUrls?.length || 0) > 0 && (
            <div
              className={`my-4 grid grid-cols-[repeat(auto-fit,_minmax(100px,_1fr))] gap-2 ${
                tab === "images" ? "block" : "hidden"
              }`}
            >
              {localNote.imageUrls?.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt="Note Image"
                  className="w-full aspect-square object-cover rounded cursor-pointer"
                  onClick={() => setExpandedImage(url)} // Set clicked image URL
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Image Preview */}
      {expandedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setExpandedImage(null)} // Close image preview
        >
          <img
            src={expandedImage}
            alt="Expanded"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default NoteModal;
