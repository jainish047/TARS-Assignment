"use client";
import { useEffect } from "react";
import { useUser } from "../context/UserContext";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useNotes } from "../context/NotesContext";
import { deleteCookie } from "cookies-next";

export default function Header({ showfavourite, setShowFavourite }) {
  const { user, setUser } = useUser();
  const { setNotes } = useNotes();
  const router = useRouter();

  console.log("user->", user);
  async function handleLogout() {
    setUser(null);
    setNotes([]);
    try {
      await fetch("/api/auth/logout", { method: "GET" }); // ✅ Call the logout API
      console.log("Logged out successfully");
      router.push("/auth"); // Redirect to login page
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <header className="flex justify-between items-center p-4 bg-blue-500 text-white rounded">
      {/* Left side: Logo/Name */}
      <div className="text-2xl font-bold">My Note App</div>

      <div className="flex gap-4 justify-between items-center">
        <Star
          className={`cursor-pointer stroke-current ${
            showfavourite
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-400 fill-none"
          }`}
          onClick={() => {
            setShowFavourite(!showfavourite);
          }}
        />
        {/* Right side: Profile button */}
        {user ? (
          <div className="relative">
            <button
              className="relative flex items-center space-x-2 bg-gray-800 py-2 px-3 rounded-full group"
              onClick={handleLogout}
            >
              <span className="material-icons">{user?.userName}</span>
              {/* Tooltip */}
              <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-auto px-2 py-1 text-sm text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                Logout
              </span>
            </button>
          </div>
        ) : (
          <button
            className="flex items-center space-x-2 bg-gray-800 py-2 px-3 rounded-full"
            onClick={() => router.push("/auth")}
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}
