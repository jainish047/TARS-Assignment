"use client";
import { useEffect } from "react";
import { useUser } from "../context/UserContext";
import { Star } from "lucide-react";

export default function Header({showfavourite, setShowFavourite}) {
  const { user } = useUser();

  console.log("user->", user);

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
          onClick={() => {setShowFavourite(!showfavourite)}}
        />
        {/* Right side: Profile button */}
        {user && (
          <div className="relative">
            <button
              // onClick={() => setIsModalOpen(!isModalOpen)}
              className="flex items-center space-x-2 bg-gray-800 py-2 px-3 rounded-full"
            >
              <span className="material-icons">{user?.userName}</span>{" "}
              {/* Profile Icon */}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
