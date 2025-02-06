import { connectDB } from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { NextApiRequest } from "next";
import { NextResponse } from "next/server";
import { TokenPayload } from "@/utils/type";
import { cookies, headers } from "next/headers";

export async function GET(req:NextApiRequest) {
  console.log("getting user info");

  await connectDB();
  console.log("connected to db")
  // const cookieHeader = (await headers()).get("cookie");
  // console.log("cookieHeader->", cookieHeader);
  // const token = req.cookies.token;
  const token = (await cookies()).get("token")?.value; // No need to await
  console.log("token->", token)
  if (!token) {
    return NextResponse.json({ message:"Unauthorised" }, { status: 401 });

  }
  console.log("token in user->", token);

  try {
    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ message:"no secret key" }, { status: 500 });
        }
    
        // ✅ Verify JWT & Ensure TypeScript Knows It's TokenPayload
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
        console.log("Decoded in notes->", decoded);

    const user = await User.findOne({ userName: decoded.userName });
    console.log(user);
    return NextResponse.json({ user:{userName:user.userName} }, { status: 200 });
  } catch (error) {
    if ((error instanceof Error) && error.name === "TokenExpiredError") {
      return new Response(JSON.stringify({ message: "Token expired" }), {
        status: 401,
      });
    }
    return new Response(JSON.stringify({ message: "Invalid Token" }), {
      status: 401,
    });
  }
}
