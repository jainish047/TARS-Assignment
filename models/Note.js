import mongoose, { Schema, model, models } from "mongoose";

const NoteSchema = new Schema(
  {
    userName: { type: String, required: true },
    title: { type: String, required: true },
    text: { type: String },
    transcript: { type: String },
    audioUrl: { type: String }, // Store Cloudinary URL
    imageUrls: { type: [String] }, // Corrected array syntax
    favourite: { type: Boolean, default: false }, // Add default value here
  },
  { timestamps: true }
); // Mongoose handles createdAt/updatedAt

export const Note = models.Note || model("Note", NoteSchema);
