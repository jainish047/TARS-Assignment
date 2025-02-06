import {connectDB} from "@/lib/db";
import User from "@/models/User";
import { verifyPassword, generateToken } from "@/lib/auth";
import { serialize } from "cookie";

export async function POST(req) {
    console.log("login")
    await connectDB();
    const { userName, password } = await req.json();

    const user = await User.findOne({ userName });
    if (!user) {
        return new Response(JSON.stringify({ message: "Invalid credentials" }), { status: 401 });
    }
    console.log("user->", user)

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
        return new Response(JSON.stringify({ message: "Invalid credentials" }), { status: 401 });
    }

    // Generate JWT Token
    const token = generateToken({ userName: user.userName });
    const cookie = serialize("token", token, { httpOnly: true, secure: true, path: "/" });

    return new Response(JSON.stringify({ message: "Login successful", user:{userName} }), { status: 200, headers: { "Set-Cookie": cookie } });
}
