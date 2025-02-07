"use client";
import React, { useState, useEffect } from "react";
import { useNotes } from "@/app/context/NotesContext";
import { uploadToCloudinary } from "@/utils/cloudinary";
import { X } from "lucide-react";
import SpeechToText from "./SpeechToText.jsx";
import { Note } from "@/app/context/NotesContext";
import { Loader2 } from "lucide-react";

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null | undefined;
}

const AddNoteModal: React.FC<AddNoteModalProps> = ({
  isOpen,
  onClose,
  note,
}) => {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [transcript, setTranscript] = useState("");
  const [audioBlob, setAudioBlob] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"audio" | "image">("audio");
  const [favourite, setFavourite] = useState<boolean>(false);
  const [submiting, setSubmiting] = useState<Boolean>(false);
  const { addNote, updateNote } = useNotes();

  console.log("note editing->", note, note?.title);
  useEffect(() => {
    setTitle(note?.title || "");
    setText(note?.text || "");
    setTranscript(note?.transcript || "");
    setAudioUrl(note?.audioUrl || null);
    setImageUrls(note?.imageUrls || []);
    setFavourite(note?.favourite || false);
  }, [note]); // Runs every time `note` changes

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...files]);

      for (const file of files) {
        const imageUrl = await uploadToCloudinary(file);
        setImageUrls((prev) => [...prev, imageUrl]);
      }
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }
    setSubmiting(true);

    if (!note) {
      await addNote(
        title,
        text,
        false,
        transcript,
        audioUrl || undefined,
        imageUrls
      ); // Pass imageFiles directly
    } else {
      await updateNote(
        note._id,
        title,
        text,
        transcript,
        audioUrl || undefined,
        imageUrls
      );
    }
    setTitle("");
    setText("");
    setTranscript("");
    setAudioBlob(null);
    setImageFiles([]);
    setImageUrls([]); // Clear image files and URLs after submission
    onClose();
    setSubmiting(false);
  };

  return isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="max-h-[90vh] bg-white p-6 rounded-lg shadow-lg w-full md:w-2/3 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Note</h2>
          <X className="cursor-pointer" onClick={onClose} />
        </div>

        <input
          type="text"
          placeholder="Title"
          className="w-full p-2 border rounded mb-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          rows={8}
          placeholder="Type your note here..."
          className="w-full p-2 border rounded mb-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="flex mb-4 border-b">
          <button
            className={`w-1/2 p-2 ${
              activeTab === "audio"
                ? "border-b-2 border-blue-500 text-blue-500 font-semibold"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("audio")}
          >
            Audio{" / "}Transcribe
          </button>
          <button
            className={`w-1/2 p-2 ${
              activeTab === "image"
                ? "border-b-2 border-blue-500 text-blue-500 font-semibold"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("image")}
          >
            Image Upload
          </button>
        </div>

        <div className={activeTab === "audio" ? "block" : "hidden"}>
          <SpeechToText
            transcript={transcript}
            setTranscript={setTranscript}
            audioBlob={audioBlob}
            setAudioBlob={setAudioBlob}
            audioUrl={audioUrl}
            setAudioUrl={setAudioUrl}
          />
        </div>
        <div className={activeTab === "image" ? "block" : "hidden"}>
          <input
            type="file"
            accept="image/*"
            multiple
            className="w-full p-2 border rounded mb-2"
            onChange={handleImageUpload}
          />
          <div className="flex flex-wrap gap-2">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative w-16 h-16">
                <img
                  src={url}
                  alt="Uploaded"
                  className="w-full h-full object-cover rounded"
                />
                <button
                  onClick={() => {
                    setImageUrls(imageUrls.filter((_, i) => i !== index));
                    setImageFiles(imageFiles.filter((_, i) => i !== index));
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white p-2 rounded mt-2 flex justify-center"
        >
          {submiting ? <Loader2 className="animate-spin w-5 h-5" /> : "Submit"}
        </button>
      </div>
    </div>
  ) : null;
};

export default AddNoteModal;
