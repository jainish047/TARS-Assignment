"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { uploadToCloudinary } from "@/utils/cloudinary";
import { useUser } from "./UserContext";

export interface Note {
  _id: string;
  title: string;
  text: string;
  transcript?: string;
  audioUrl: string | null | undefined; // Allow null as well
  imageUrls?: string[];
  createdAt?: string;
  favourite: boolean;
}

interface NotesContextType {
  notes: Note[];
  addNote: (
    title: string,
    text: string,
    favourite: boolean,
    transcript?: string,
    audioFile?: string | null,
    images?: string[] | null
  ) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  updateNote: (
    id: string,
    title: string,
    text: string,
    transcript?: string,
    audioUrl?: string | null,
    imageUrls?: string[] | null
  ) => Promise<void>;
  addFavourite: (id: string) => void;
  removeFavourite: (id: string) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider = ({ children }: { children: React.ReactNode }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const { user } = useUser();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch("/api/notes");
        const data = await response.json();
        if (response.ok) {
          setNotes(data.notes);
          console.log("notes->", data.notes);
        } else {
          console.error("Failed to fetch notes.", data);
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    };
    fetchNotes();
  }, [user]);

  const addNote = async (
    title: string,
    text: string,
    favourite: boolean,
    transcript?: string,
    audioUrl?: string | null,
    imageUrls?: string[] | null
  ) => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("text", text);

      if (transcript) formData.append("transcript", transcript);
      if (audioUrl) formData.append("audioUrl", audioUrl);
      if (imageUrls && imageUrls.length > 0) {
        formData.append("imageUrls", JSON.stringify(imageUrls));
      }

      const response = await fetch("/api/notes", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        console.log("getting note post api response-> ", data?.newNote);
        setNotes((prev) => [...prev, data?.newNote]);
      } else {
        console.error("Failed to add note.", data);
      }
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const response = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (response.ok) {
        setNotes((prev) => prev.filter((note) => note._id !== id));
      } else {
        console.error("Failed to delete note.");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  // Update Note function
  const updateNote = async (
    id: string,
    title: string,
    text: string,
    transcript?: string,
    audioUrl?: string | null,
    imageUrls?: string[] | null
  ) => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("text", text);

      if (transcript) formData.append("transcript", transcript);
      if (audioUrl) formData.append("audioUrl", audioUrl);
      if (imageUrls && imageUrls.length > 0) {
        formData.append("imageUrls", JSON.stringify(imageUrls));
      }

      const response = await fetch(`/api/notes/${id}`, {
        method: "PUT", // Use PUT method for update
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        // Update the notes state with the updated note
        setNotes((prev) =>
          prev.map((note) =>
            note._id === id
              ? {
                  ...note,
                  title,
                  text,
                  transcript,
                  audioUrl: audioUrl ?? undefined, // Replace null with undefined
                  imageUrls: imageUrls || undefined, // Convert null to undefined
                }
              : note
          )
        );
      } else {
        console.error("Failed to update note.", data);
      }
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const addFavourite = async (id: string) => {
    const responce = await fetch(`/api/notes/favourite/${id}`, {
      method: "POST",
    });
    const data = await responce.json()
    if (responce.ok) {
      console.log(id, " added to favourite");
      setNotes((prev) =>
        prev.map((note) => note._id === id ? {...note, favourite:true} : note)
      );
    } else {
      console.log(id, " adding to favourite failed");
    }
  };

  const removeFavourite = async (id: string) => {
    const responce = await fetch(`/api/notes/favourite/${id}`, {
      method: "DELETE",
    });
    const data=await responce.json()
    if (responce.ok) {
      console.log(id, " added to favourite");
      setNotes((prev) =>
        prev.map((note) => note._id === id ? {...note, favourite:false} : note)
      );
    } else {
      console.log(id, " adding to favourite failed");
    }
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        addNote,
        deleteNote,
        updateNote,
        addFavourite,
        removeFavourite,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) throw new Error("useNotes must be used within NotesProvider");
  return context;
};
