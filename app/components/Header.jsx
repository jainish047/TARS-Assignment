"use client";
import { useUser } from "../context/usercontext";

export default function Header() {
  const { user, setUser } = useUser();
  
  return (
    <header className="flex justify-between items-center p-4 bg-blue-500 text-white">
      {/* Left side: Logo/Name */}
      <div className="text-xl font-bold">My Note App</div>

      {/* Right side: Profile button */}
      <div className="relative">
        <button
          onClick={() => setIsModalOpen(!isModalOpen)}
          className="flex items-center space-x-2 bg-gray-800 p-2 rounded-full"
        >
          <span className="material-icons">account_circle</span>{" "}
          {/* Profile Icon */}
        </button>
      </div>
    </header>
  );
}
