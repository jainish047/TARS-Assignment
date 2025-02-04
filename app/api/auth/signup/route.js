import connectDB from "@/lib/db";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth";
import { generateToken } from "@/lib/auth";
import { serialize } from "cookie";

export async function POST(req) {
  console.log("signin")

  await connectDB();
  const { userName, password } = await req.json();

  // Check if user already exists
  const existingUser = await User.findOne({ userName });
  if (existingUser) {
    return new Response(JSON.stringify({ message: "User already exists" }), {
      status: 400,
    });
  }

  // Hash password and store new user
  const hashedPassword = await hashPassword(password);
  const newUser = new User({ userName, password: hashedPassword });
  await newUser.save();

  // Generate JWT Token
  const token = generateToken(userName);
  const cookie = serialize("token", token, {
    httpOnly: true,
    secure: true,
    path: "/",
  });

  return new Response(JSON.stringify({ message: "Login successful", user:{userName:userName} }), {
    status: 200,
    headers: { "Set-Cookie": cookie },
  });
}
