"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/usercontext";
import SpeechToText from "@/app/components/SpeechToText";
import LoginSignupModal from "./components/LoginSignupModal";
import Header from "./components/Header";

interface Note {
  _id: string;
  text: string;
}

export default function HomePage() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(true); // ✅ Open modal initially

  console.log("notes->", notes);

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch("/api/auth/check");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setIsAuthenticated(true);
        setIsModalOpen(false); // ✅ Close modal if authenticated
        fetchNotes(); // ✅ Fetch notes after login
      }
    };
    checkAuth();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch("/api/notes");
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

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

  return (
    <main className="max-w-2xl mx-auto p-4">
      {isModalOpen && (
        <LoginSignupModal setUser={setUser} setIsOpen={setIsModalOpen} />
      )}{" "}
      {/* ✅ Control modal */}
      <Header/>
      <h1 className="text-2xl font-bold">Welcome, {user?.email}</h1>
      {/* User Notes Cards */}
      <div className="my-4">
        <h2 className="text-xl font-semibold">Your Notes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {notes.map((note) => (
            <div key={note._id} className="border p-4 rounded-lg shadow-md">
              <p>{note.text}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Speech-to-Text Input */}
      <div className="my-6">
        <h2 className="text-xl font-semibold">Add a Note via Speech</h2>
        <SpeechToText setText={setText} />
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
    </main>
  );
}
