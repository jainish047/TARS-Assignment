"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/usercontext";
import SpeechToText from "@/app/components/SpeechToText";
// import LoginSignupModal from "./components/LoginSignupModal";
import Header from "./components/Header";
import Link from "next/link";
import React from "react";
import Input from "./components/Input";

interface Note {
  _id: string;
  text: string;
}

export default function HomePage() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState<Boolean>(false);

  // const [isRecording, setIsRecording] = useState(false);
  // const [audioBlob, setAudioBlob] = useState(null);
  // const [transcript, setTranscript] = useState("");
  // const [error, setError] = useState(null);

  console.log("notes->", notes);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const res = await fetch("/api/auth/check");
      if (res.ok) {
        const data = await res.json();
        console.log("data->", data);
        setUser(data.user);
        setIsAuthenticated(true);
        fetchNotes(); // ✅ Fetch notes after login
      }
      setIsLoading(false);
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

  return isLoading ? (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
    </div>
  ) : isAuthenticated ? (
    <main className="h-screen mx-auto p-4">
      {/* ✅ Control modal */}
      <Header />
      <div className="p-4">
        <h1 className="text-2xl font-bold">Welcome, {user?.userName}</h1>
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
      </div>
      {/* Input */}
      {/* Input - Centered */}
      <div className="sticky bottom-0 bg-white p-4 shadow-lg flex justify-center max-w-5xl mx-auto">
        <Input />
      </div>
    </main>
  ) : (
    <div className="h-screen flex justify-center items-center">
      <h1>
        Please{" "}
        <Link
          href="/auth?option=login"
          className="text-blue-600 underline text-lg"
        >
          Login
        </Link>{" "}
        /{" "}
        <Link
          href="/auth?option=signin"
          className="text-blue-600 underline text-lg"
        >
          Signin
        </Link>
      </h1>
    </div>
  );
}
