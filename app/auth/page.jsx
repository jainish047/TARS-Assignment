"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/usercontext";

export default function AuthPage() {
    const router = useRouter();
    const { setUser } = useUser();
    const [isLogin, setIsLogin] = useState(true); // Toggle between Login & Sign-Up
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleAuth = async (e) => {
        e.preventDefault();
        const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";

        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (res.ok) {
            setUser({ email });
            router.push("/"); // Redirect to home page
        } else {
            setMessage(data.message);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
            <h2 className="text-2xl font-bold text-center">{isLogin ? "Login" : "Sign Up"}</h2>
            
            <form onSubmit={handleAuth} className="mt-4 flex flex-col gap-2">
                <input
                    type="email"
                    placeholder="Email"
                    className="border p-2 rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="border p-2 rounded"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                    {isLogin ? "Login" : "Sign Up"}
                </button>
            </form>
            
            <p className="text-center mt-2 text-red-500">{message}</p>
            
            <p className="text-center mt-2">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-blue-500 underline"
                >
                    {isLogin ? "Sign Up" : "Login"}
                </button>
            </p>
        </div>
    );
}
