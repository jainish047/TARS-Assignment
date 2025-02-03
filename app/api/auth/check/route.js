import connectDB from "@/lib/db";
import jwt from "jsonwebtoken";

export async function GET(req) {
    console.log("checking user")
    await connectDB();

    const token = req.cookies.get("token")?.value;
    console.log("token:", token)
    if (!token) {
        return new Response(JSON.stringify({ authenticated: false }), { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return new Response(JSON.stringify({ authenticated: true, user: { email: decoded.email } }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ authenticated: false }), { status: 200 });
    }
}