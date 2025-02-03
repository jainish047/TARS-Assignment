import connectDB from "@/lib/db";
import Note from "@/models/Note";
import jwt from "jsonwebtoken";

export async function POST(req) {
    console.log("getting notes")

    await connectDB();
    const { text } = await req.json();

    const token = req.cookies.get("token")?.value;
    if (!token) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
        const newNote = new Note({ userId: decoded.id, text });
        await newNote.save();

        return new Response(JSON.stringify({ message: "Note created", note: newNote }), { status: 201 });
    } catch (error) {
        return new Response(JSON.stringify({ message: "Invalid token" }), { status: 401 });
    }
}

export async function GET(req) {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
        const notes = await Note.find({ userId: decoded.id });

        return new Response(JSON.stringify({ notes }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ message: "Invalid token" }), { status: 401 });
    }
}

export async function DELETE(req) {
    await connectDB();
    const { noteId } = await req.json();

    const token = req.cookies.get("token")?.value;
    if (!token) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
        const note = await Note.findOneAndDelete({ _id: noteId, userId: decoded.id });
        if (!note) {
            return new Response(JSON.stringify({ message: "Note not found" }), { status: 404 });
        }

        return new Response(JSON.stringify({ message: "Note deleted" }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ message: "Invalid token" }), { status: 401 });
    }
}