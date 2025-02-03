"use client";
import { useState } from "react";
import { useUser } from "../context/usercontext";
import { useRouter } from "next/navigation";

export default function LoginSignUpModal({ setUser, setIsOpen }) {
    const [isLogin, setIsLogin] = useState(true);
    const [userName, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const router = useRouter();
    const [messageColour, setMessageColour] = useState("");

    const handleAuth = async (e) => {
        e.preventDefault();
        const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";

        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userName, password }),
        });

        const data = await res.json();
        if (res.ok) {
            setMessageColour("text-green-500");
            setUser({ userName });
            document.cookie = `token=${data.token}; path=/`;
            setIsOpen(false); // ✅ Close modal
            router.refresh(); // ✅ Refresh page content
        } else {
            setMessageColour("text-red-500");
        }
        setMessage(data.message);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold text-center mb-4">{isLogin ? "Login" : "Sign Up"}</h2>
                <form onSubmit={handleAuth} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Username"
                        className="border p-2 rounded"
                        value={userName}
                        onChange={(e) => setUsername(e.target.value)}
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
                <p className={`text-center ${messageColour} mt-2`}>{message}</p>
                <div className="text-center mt-4">
                    <p>
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-blue-500 underline"
                        >
                            {isLogin ? "Sign Up" : "Login"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
