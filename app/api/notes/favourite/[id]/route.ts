import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Note } from "@/models/Note";
import { cookies } from "next/headers";
import { TokenPayload } from "@/utils/type";
import jwt from "jsonwebtoken";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } } // ✅ Fix: Destructure params here
) {
  try {
    await connectDB();

    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { message: "Secret key not defined" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
    if (!decoded.userName) {
      return NextResponse.json({ message: "No user defined" }, { status: 401 });
    }

    const { id } = params; // ✅ params is properly accessed
    console.log("updating for->", id)

    const note = await Note.findById(id);
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    note.favourite = true;
    const newNote = await note.save();
    console.log(newNote)

    return NextResponse.json(
      { message: "Note marked as favourite", note },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to mark favourite", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } } // ✅ Fix: Destructure params here
) {
  try {
    await connectDB();

    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { message: "Secret key not defined" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
    if (!decoded.userName) {
      return NextResponse.json({ message: "No user defined" }, { status: 401 });
    }

    const { id } = params; // ✅ params is properly accessed
    console.log("deleting for->", id)
    const note = await Note.findById(id);
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    note.favourite = false;
    await note.save();
    const newNote = await note.save();
    console.log(newNote)

    return NextResponse.json(
      { message: "Note removed from favourites", note },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to remove favourite", details: error.message },
      { status: 500 }
    );
  }
}
