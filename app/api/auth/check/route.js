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
        console.log("decoded-->", decoded)
        return new Response(JSON.stringify({ authenticated: true, user: { userName: decoded.userName } }), { status: 200 });
    } catch (error) {
        if(error==="TokenExpiredError")
            return new Response(JSON.stringify({ authenticated: false, message:"token expired, login again" }), { status: 401 });
        console.log(error)
        return new Response(JSON.stringify({ authenticated: false }), { status: 401 });
    }
}