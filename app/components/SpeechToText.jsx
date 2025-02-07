"use client";

import React, { useState, useRef } from "react";

const SpeechToText = ({
  transcript,
  setTranscript,
  audioBlob,
  setAudioBlob,
  audioUrl,
  setAudioUrl,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  // const [audioBlob, setAudioBlob] = useState(null);
  // const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);
  const [responded, setResponded] = useState(false);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timeoutRef = useRef(null);
  const audioChunksRef = useRef([]); // Store audio chunks

  const maxDuration = 60000; // 1 minute

  const startRecording = async () => {
    console.log("Starting recording...");
    setResponded(false);
    setTranscript("");
    setAudioBlob(null);
    setError(null);
    setAudioUrl(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log("Data available event fired:", event.data.size);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      timeoutRef.current = setTimeout(() => {
        stopRecording();
      }, maxDuration);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Error accessing microphone");
    }
  };

  const stopRecording = () => {
    console.log("Stopping recording...");
    return new Promise((resolve) => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.onstop = () => {
          console.log("Recorder stopped. Resolving promise.");
          if (audioChunksRef.current.length > 0) {
            const blob = new Blob(audioChunksRef.current, {
              type: "audio/wav",
            });
            console.log("Audio Blob Created:", blob);
            setAudioBlob(blob);
            resolve(blob); // Ensure the Promise resolves with the blob
          } else {
            console.error("No audio chunks available! Blob is empty.");
            setError("No audio recorded.");
            resolve(null);
          }

          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
          }
        };
        mediaRecorderRef.current.stop();
      } else {
        console.log("No active recorder found.");
        resolve(null);
      }

      setIsRecording(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    });
  };

  const transcribeAudio = async (blob) => {
    console.log("Transcribing audio...");
    if (!blob) {
      console.error("Audio blob is empty!");
      setError("No audio recorded.");
      return;
    }

    console.log("Audio blob:", blob);
    const formData = new FormData();
    formData.append("file", blob, "recording.wav");

    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      const data = await response.json();
      console.log("Transcription response:", data);
      setAudioUrl(data.cloudinaryUrl);
      setTranscript(data.transcript);
      setResponded(true);
    } catch (err) {
      console.error("Error transcribing audio:", err);
      setError("Error transcribing audio");
    }
  };

  const handleStopAndTranscribe = async () => {
    console.log("Stopping recording and transcribing...");
    const blob = await stopRecording();
    if (blob) {
      setTimeout(() => {
        transcribeAudio(blob);
      }, 500);
    }
  };

  const handleCancelRecording = async () => {
    console.log("Canceling recording...");
    await stopRecording(); // Ensure recording stops
    audioChunksRef.current = []; // Clear recorded audio chunks
    setAudioBlob(null);
    setTranscript("");
    setError(null);
  };

  return (
    <div className="p-4 border rounded-lg shadow-md">
      <div className="flex gap-4">
        <div className="flex items-center">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="bg-blue-500 text-white p-2 rounded"
            >
              Start Recording
            </button>
          ) : (
            <>
              <button
                onClick={handleStopAndTranscribe}
                className="bg-red-500 text-white p-2 rounded"
              >
                Stop Recording & Transcribe
              </button>
              <button
                onClick={handleCancelRecording}
                className="bg-gray-500 text-white p-2 rounded ml-2"
              >
                Cancel
              </button>
            </>
          )}
        </div>

        {audioBlob && (
          <div className="">
            <h3>Recorded Audio:</h3>
            <audio
              controls
              src={audioUrl || URL.createObjectURL(audioBlob)}
            ></audio>
          </div>
        )}
      </div>

      {audioBlob &&
        (responded ? (
          transcript ? (
            <div className="mt-4">
              <h3>Transcript:</h3>
              <p>{transcript}</p>
            </div>
          ) : (
            <h3 className="mt-4">No transcript</h3>
          )
        ) : (
          <h3 className="mt-4">Generating Transcript...</h3>
        ))}

      {error && (
        <div className="mt-4 text-red-500">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default SpeechToText;
