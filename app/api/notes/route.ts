  import { NextResponse } from "next/server";
  import { connectDB } from "@/lib/db";
  import { Note } from "@/models/Note";
  import { uploadToCloudinary } from "@/utils/cloudinary";
  import jwt from "jsonwebtoken";
  import { TokenPayload } from "@/utils/type";
  import { cookies } from "next/headers";
  import formidable from "formidable"; // Import formidable
  import { IncomingForm } from "formidable"; // Import IncomingForm from formidable
  import type { Fields, Files } from "formidable"; // Import types Fields and Files from formidable

  export const config = {
    api: {
      bodyParser: false, // Disable default body parser to handle multipart form data
    },
  };

  export async function GET() {
    await connectDB();

    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
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

      const notes = await Note.find({ userName: decoded.userName });
      // console.log("get notes->", notes)
      return NextResponse.json({ notes });
    } catch (error) {
      console.error("JWT Verification Error:", error);
      return NextResponse.json({ message: "Invalid Token" }, { status: 401 });
    }
  }

  // export async function POST(req: Request) {
  //   try {
  //     console.log("in notes-post");

  //     await connectDB();
  //     console.log("db connected");

  //     // Create a new IncomingForm instance (now it's just formidable())
  //     const form = formidable();
  //     // Formidable's modern usage is as a function, not a class.

  //     // Explicitly define types for the callback parameters
  //     // accepting callback fxn
  //     form.parse(
  //       req,
  //       async (
  //         err: Error | null,
  //         fields: formidable.Fields,
  //         files: formidable.Files
  //       ) => {
  //         if (err) {
  //           console.error("Form parsing error:", err);
  //           return NextResponse.json(
  //             { message: "Error parsing form data" },
  //             { status: 500 }
  //           );
  //         }

  //         const { title, text, transcript } = fields;
  //         const audioUrl = fields.audioUrl ? fields.audioUrl : null;
  //         const imageUrls = fields.imageUrls ? JSON.parse(fields.imageUrls) : [];

  //         console.log(title, text, transcript, audioUrl, imageUrls);

  //         const token = (await cookies()).get("token")?.value;
  //         if (!token) {
  //           return NextResponse.json(
  //             { message: "Unauthorized" },
  //             { status: 401 }
  //           );
  //         }
  //         console.log("token in notes-post->", token);

  //         const decoded = jwt.verify(
  //           token,
  //           process.env.JWT_SECRET!
  //         ) as TokenPayload;
  //         if (!decoded.userName) {
  //           return NextResponse.json(
  //             { message: "No user defined" },
  //             { status: 401 }
  //           );
  //         }
  //         console.log("decoded in notes-post->", decoded);

  //         // If imageUrls are passed as files (optional, not using in this case), handle uploading to Cloudinary
  //         const uploadedImageUrls: string[] = [];
  //         for (const imageUrl of imageUrls) {
  //           // If imageUrls contains URLs (strings), we don't need to upload them. Otherwise, you can upload.
  //           uploadedImageUrls.push(imageUrl);
  //         }

  //         // Create a new note in the database with the audioUrl and imageUrls
  //         const newNote = await Note.create({
  //           userName: decoded.userName,
  //           title: title[0],
  //           text: text[0],
  //           transcript: transcript ? transcript[0] : undefined,
  //           audioUrl, // Store the audio URL as a string
  //           imageUrls: uploadedImageUrls, // Store the image URLs
  //         });
  //         console.log("newNote in notes-post->", newNote);

  //         return NextResponse.json(newNote, { status: 201 });
  //       }
  //     );
  //   } catch (error) {
  //     console.error("Error creating note:", error);
  //     return NextResponse.json(
  //       { message: "Error creating note" },
  //       { status: 500 }
  //     );
  //   }
  // }

  export async function POST(req: Request) {
    try {
      console.log("in notes-post");
      await connectDB();
      console.log("db connected");

      const formData = await req.formData();

      try {
        const title = formData.get("title") as string;
        const text = formData.get("text") as string;
        const transcript = formData.get("transcript") as string | null;
        const audioUrl = formData.get("audioUrl") as string | null;
        const imageUrlsString = formData.get("imageUrls") as string | null;

        const uploadedImageUrls = imageUrlsString ? JSON.parse(imageUrlsString) : [];

        const token = (await cookies()).get("token")?.value;
        if (!token) {
          return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
          );
        }
        console.log("token in notes-post->", token);

        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET!
        ) as TokenPayload;
        if (!decoded.userName) {
          return NextResponse.json(
            { message: "No user defined" },
            { status: 401 }
          );
        }
        console.log("decoded in notes-post->", decoded);
        
        const newNote = await Note.create({
          userName: decoded.userName,
          title,
          text,
          transcript,
          audioUrl,
          imageUrls: uploadedImageUrls
        });

        console.log("newNote in notes-post->", newNote);

        return NextResponse.json({newNote}, { status: 201 });
      } catch (createError) {
        console.error("Error creating note:", createError);
        return NextResponse.json(
          { message: "Error creating note" },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error("Outer error:", error);
      return NextResponse.json(
        { message: "A general error occurred" },
        { status: 500 }
      );
    }
  }


  // export async function POST(req: Request) {
  //   console.log("Request object:", req); // Inspect the request

  //   try {
  //       const form = formidable();

  //       form.parse(req, (err, fields, files) => {
  //         if (err) {
  //           console.error("Formidable error:", err);
  //           return NextResponse.json({ error: "Formidable parse error" }, { status: 500 });
  //         }
  //         console.log("Fields:", fields);
  //         console.log("Files:", files);
  //         return NextResponse.json({ message: "Test successful" }, { status: 200 });
  //       })
  //   } catch (error) {
  //       console.error("Error in POST handler:", error);
  //       return NextResponse.json({ error: "General error" }, { status: 500 });
  //   }
  // }

  // import { NextResponse } from "next/server";

  // export async function POST(req: Request) {
  //   try {
  //     const formData = await req.formData();

  //     // Extract fields
  //     const title = formData.get("title") as string;
  //     const text = formData.get("text") as string;
  //     const transcript = formData.get("transcript") as string | null;
  //     const audioUrl = formData.get("audioUrl") as string | null;
  //     const imageUrlsString = formData.get("imageUrls") as string | null;

  //     // Convert imageUrls from JSON string to array
  //     const imageUrls = imageUrlsString ? JSON.parse(imageUrlsString) : [];

  //     console.log("Title:", title);
  //     console.log("Text:", text);
  //     console.log("Transcript:", transcript);
  //     console.log("Audio URL:", audioUrl);
  //     console.log("Image URLs:", imageUrls);

  //     return NextResponse.json({ message: "Test successful", newNote: { title, text, transcript, audioUrl, imageUrls } }, { status: 200 });

  //   } catch (error) {
  //     console.error("Error in POST handler:", error);
  //     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  //   }
  // }
