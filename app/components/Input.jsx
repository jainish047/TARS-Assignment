import React, { useState } from "react";
import SpeechToText from "./SpeechToText";
import { useNotes } from "@/app/context/NotesContext";

export default function Input() {
  const [title, setTitle] = useState(""); // ✅ New title field
  const [text, setText] = useState("");
  const [transcript, setTranscript] = useState("");
  const [audioBlob, setAudioBlob] = useState<File | null>(null);
  const { addNote } = useNotes();

  const addNoteToBackend = async () => {
    if (!title) {
      alert("Please enter a title for the note!");
      return;
    }

    if (!text && !transcript) {
      alert("Please enter text or use speech-to-text!");
      return;
    }

    try {
      await addNote(title, text, transcript, audioBlob); // ✅ Pass title
      setTitle("");
      setText("");
      setTranscript("");
      setAudioBlob(null);
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  return (
    <div className="w-full">
      <div className="my-6">
        <h2 className="text-xl font-semibold">Add a Note via Speech</h2>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          placeholder="Enter note title"
        />

        <SpeechToText setTranscript={setTranscript} setAudioBlob={setAudioBlob} />

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          placeholder="Type or speak to add a note"
        />

        <button
          onClick={addNoteToBackend}
          className="bg-green-500 text-white p-2 rounded border"
        >
          Submit Note
        </button>
      </div>
    </div>
  );
}
