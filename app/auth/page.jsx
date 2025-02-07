"use client";
import { useState } from "react";
import { useUser } from "../context/UserContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LoginSignUpModal() {
  const searchparams = useSearchParams();

  const [isLogin, setIsLogin] = useState(
    searchparams.get("option") === "login" ? true : false
  );
  const [userName, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const [messageColour, setMessageColour] = useState("");
  const [buttonDisable, setButtonDisable] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user, setUser } = useUser(); // Get setUser function from user context

  const handleAuth = async (e) => {
    setLoading(true);
    e.preventDefault();
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName, password }),
    });

    const data = await res.json();
    console.log("data in logsign->", data);
    if (res.ok) {
      console.log("in logsign verified");
      // On success, update the context with user data and set the cookie
      setMessageColour("text-green-500");
      setUser(data.user); // Set the user in context
      console.log("in loginsignup user->", user, data.user);
      document.cookie = `token=${data.token}; path=/; HttpOnly; SameSite=Strict`; // Set the token in the cookie

      // Optionally, you can redirect or refresh the page
      // If you want to refresh the page content
      router.push("/"); // Navigate to the home page
    } else {
      console.log("in logsign failed");
      // On failure, show an error message
      setMessageColour("text-red-500");
      setMessage(data.message || "An error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-4">
          {isLogin ? "Login" : "Sign Up"}
        </h2>
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
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : isLogin ? (
              "Login"
            ) : (
              "Sign Up"
            )}
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
              {isLogin ? ( "Sign Up" ) : ( "Login" )}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
