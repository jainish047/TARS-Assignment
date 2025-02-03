import { IncomingForm } from "formidable";
import fs from "fs/promises"; // Using promises API for convenience
import { NextResponse } from "next/server";
import { Readable } from "stream";

// Disable Next.js's built-in body parser.
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Converts a Web Request (from Next.js API) into a Node.js Readable stream.
 * Ensures headers (like content-length) are correctly set for formidable.
 */
async function requestToStream(req) {
  const contentType = req.headers.get("content-type");
  const buffer = await req.arrayBuffer();
  const stream = Readable.from(Buffer.from(buffer));

  // Mimic the required headers for formidable to correctly parse the stream
  stream.headers = {
    "content-type": contentType,
    "content-length": buffer.byteLength.toString(),
  };

  return stream;
}

/**
 * Parses the multipart form-data request using formidable.
 */
async function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({ multiples: false, keepExtensions: true });

    const stream = requestToStream(req); // Convert request to stream

    // Ensuring the stream is asynchronous and works properly
    stream
      .then((resolvedStream) => {
        form.parse(resolvedStream, (err, fields, files) => {
          if (err) {
            reject(err);
          } else {
            resolve({ fields, files });
          }
        });
      })
      .catch((error) => reject(error));
  });
}

/**
 * Uploads the file to AssemblyAI and returns the file's upload URL.
 */
async function uploadFile(file) {
  if (!file || !file.filepath) {
    throw new Error("Invalid file received");
  }

  const fileData = await fs.readFile(file.filepath);
  const response = await fetch("https://api.assemblyai.com/v2/upload", {
    method: "POST",
    headers: {
      authorization: process.env.ASSEMBLYAI_API_KEY,
    },
    body: fileData,
  });

  const data = await response.json();
  if (!data.upload_url) {
    throw new Error("Failed to upload file to AssemblyAI.");
  }
  return data.upload_url;
}

/**
 * Requests a transcription from AssemblyAI for the given audio URL.
 */
async function requestTranscription(audioUrl) {
  const response = await fetch("https://api.assemblyai.com/v2/transcript", {
    method: "POST",
    headers: {
      authorization: process.env.ASSEMBLYAI_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ audio_url: audioUrl }),
  });

  const data = await response.json();
  if (!data.id) {
    throw new Error("Failed to start transcription.");
  }
  return data.id;
}

/**
 * Polls AssemblyAI until the transcription is completed.
 */
async function pollTranscription(transcriptId) {
  const pollingUrl = `https://api.assemblyai.com/v2/transcript/${transcriptId}`;
  while (true) {
    const response = await fetch(pollingUrl, {
      headers: { authorization: process.env.ASSEMBLYAI_API_KEY },
    });

    const data = await response.json();
    if (data.status === "completed") {
      return data.text;
    }
    if (data.status === "error") {
      throw new Error(data.error);
    }
    // Wait 5 seconds before the next poll.
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

/**
 * POST handler: Receives an audio file upload, sends it to AssemblyAI,
 * waits for the transcription to complete, and returns the transcript.
 */
export async function POST(request) {
  console.log("🔹 Transcribe API called");

  try {
    // Step 1: Parse the uploaded file
    const { files } = await parseForm(request);
    console.log("Received files:", files); // Add this line to log the files object

    // Access the first file in the array (since 'files.file' is an array)
    const uploadedFile = files.file ? files.file[0] : null;

    if (!uploadedFile) {
      console.log("❌ No file uploaded");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log("✅ File received:", uploadedFile.filepath);

    // Step 2: Upload the file to AssemblyAI.
    const uploadUrl = await uploadFile(uploadedFile);
    console.log("✅ Uploaded file URL:", uploadUrl);

    // Step 3: Request a transcription.
    const transcriptId = await requestTranscription(uploadUrl);
    console.log("✅ Transcription requested, ID:", transcriptId);

    // Step 4: Poll AssemblyAI until transcription is complete.
    const transcript = await pollTranscription(transcriptId);
    console.log("✅ Transcription completed.");

    // Delete the temporary file.
    try {
      await fs.unlink(uploadedFile.filepath);
    } catch (err) {
      console.log("⚠️ Error deleting temp file:", err);
    }

    return NextResponse.json({ transcript });
  } catch (error) {
    console.log("❌ Error during transcription:", error);
    return NextResponse.json(
      { error: "Error during transcription." },
      { status: 500 }
    );
  }
}
