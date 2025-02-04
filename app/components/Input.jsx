import React, { useState } from "react";
import Header from "./Header";
import SpeechToText from "./SpeechToText";

export default function Input (){
    
  const [text, setText] = useState("");

  const addNoteToBackend = async () => {
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      setNotes((prevNotes) => [...prevNotes, data.note]);
      setText("");
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

    return <div className="w-full">
        <div className="my-6">
        <h2 className="text-xl font-semibold">Add a Note via Speech</h2>
        <SpeechToText/>
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
}