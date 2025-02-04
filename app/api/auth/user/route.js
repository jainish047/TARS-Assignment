import connectDB from "@/lib/db";
import User from "@/models/User";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function GET(req) {
  console.log("getting user info");

  const token = req.cookies.get("token")?.value;
  if (!token) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // const user = await User.findById(decoded.id);
    const user = await User.findOne({ userName });
    console.log(user);
    return new Response(JSON.stringify({ user }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Invalid Token" }), {
      status: 401,
    });
  }
}
