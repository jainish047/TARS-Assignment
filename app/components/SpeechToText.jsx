"use client";

import React, { useEffect, useState } from "react";

const SpeechToText = ({ setText }) => {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [recognition, setRecognition] = useState(null);
    const [interimText, setInterimText] = useState(""); // Real-time text
    const [audioBlob, setAudioBlob] = useState(null); // Stores recorded audio
    let mediaRecorder = null; // MediaRecorder instance
    let audioChunks = []; // Stores audio data

    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognitionInstance = new SpeechRecognition();
                recognitionInstance.lang = "en-US";
                recognitionInstance.continuous = true;
                recognitionInstance.interimResults = true;

                recognitionInstance.onresult = (event) => {
                    let finalTranscript = "";
                    let interimTranscript = "";

                    for (let i = 0; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            finalTranscript += transcript + " ";
                        } else {
                            interimTranscript += transcript;
                        }
                    }

                    if (finalTranscript) {
                        setText((prevText) => prevText + finalTranscript);
                    }
                    setInterimText(interimTranscript);
                };

                recognitionInstance.onend = () => {
                    if (isListening) {
                        setTimeout(() => recognitionInstance.start(), 500);
                    }
                };

                setRecognition(recognitionInstance);
                setIsSupported(true);
            } else {
                setIsSupported(false);
            }
        }
    }, [setText]);

    // Function to start recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
                setAudioBlob(audioBlob);
                audioChunks = []; // Reset chunks
            };

            mediaRecorder.start();
        } catch (error) {
            console.error("Error starting audio recording:", error);
        }
    };

    // Function to stop recording
    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
        }
    };

    // Start both transcription and recording
    const startListening = async () => {
        if (!recognition) return;
        setIsListening(true);
        recognition.start();
        await startRecording(); // Start audio recording
    };

    // Stop both transcription and recording
    const stopListening = () => {
        if (!recognition) return;
        setIsListening(false);
        recognition.stop();
        stopRecording(); // Stop audio recording
    };

    return (
        <div className="p-4 border rounded-lg shadow-md">
            <button
                onClick={isListening ? stopListening : startListening}
                className="bg-blue-500 text-white p-2 rounded border"
            >
                {isListening ? "Stop Listening & Recording" : "Start Speaking & Recording"}
            </button>
            <p className="mt-2 text-gray-600">{interimText}</p>

            {audioBlob && (
                <div className="mt-4">
                    <audio controls src={URL.createObjectURL(audioBlob)}></audio>
                    <a
                        href={URL.createObjectURL(audioBlob)}
                        download="recording.wav"
                        className="block mt-2 bg-green-500 text-white p-2 rounded"
                    >
                        Download Recording
                    </a>
                </div>
            )}
        </div>
    );
};

export default SpeechToText;
