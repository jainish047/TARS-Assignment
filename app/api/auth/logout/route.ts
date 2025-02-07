import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.json({ message: "Logged out successfully" });

  response.cookies.set("token", "", {
    path: "/",
    maxAge: -1, // Expire immediately
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
