import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Note } from "@/models/Note";
import cloudinary from "cloudinary";
import { uploadToCloudinary } from "@/utils/cloudinary";
import jwt from "jsonwebtoken";
import { TokenPayload } from "@/utils/type";
import { cookies } from "next/headers";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  await connectDB();

  const { id } = context.params; // Use context.params instead of params

  const note = await Note.findById(id);
  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  // Delete from Cloudinary
  if (note.audioUrl) {
    const publicId = note.audioUrl.split("/").pop()?.split(".")[0]; // Extract Cloudinary ID
    await cloudinary.v2.uploader.destroy(publicId, { resource_type: "video" });
  }

  await Note.findByIdAndDelete(id);
  return NextResponse.json({ message: "Note deleted" });
}


export const config = {
  api: {
    bodyParser: false, // Disable default body parser to handle multipart form data
  },
};

export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    console.log("in notes-put");
    await connectDB();
    console.log("db connected");

    // Ensure params are awaited correctly
    const id = await context.params.id; // Await before using

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const text = formData.get("text") as string;
    const transcript = formData.get("transcript") as string | null;
    const audioUrl = formData.get("audioUrl") as string | null;
    const imageUrlsString = formData.get("imageUrls") as string | null;
    const uploadedImageUrls = imageUrlsString ? JSON.parse(imageUrlsString) : [];

    // Get the token from cookies for authentication
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    if (!decoded.userName) {
      return NextResponse.json({ message: "No user defined" }, { status: 401 });
    }

    console.log("decoded in notes-put->", decoded);

    // Find the note by ID and check if it belongs to the current user
    const existingNote = await Note.findOne({ _id: id });
    if (!existingNote) {
      return NextResponse.json({ message: "Note not found" }, { status: 404 });
    }

    if (existingNote.userName !== decoded.userName) {
      return NextResponse.json({ message: "Unauthorized to update this note" }, { status: 403 });
    }

    // Update the note in the database
    const updatedNote = await Note.findByIdAndUpdate(
      id,
      {
        title,
        text,
        transcript,
        audioUrl,
        imageUrls: uploadedImageUrls,
      },
      { new: true } // Return the updated document
    );

    console.log("updatedNote in notes-put->", updatedNote);

    return NextResponse.json({ updatedNote }, { status: 200 });
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json({ message: "Failed to update note" }, { status: 500 });
  }
}