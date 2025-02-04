"use client";
import { useEffect } from "react";
import { useUser } from "../context/usercontext";

export default function Header() {
  const { user } = useUser();

  // useEffect(()=>{
  //   const getUserDetails = async ()=>{
  //     const responce = await fetch("/api/auth/user");
  //     if(!responce.ok){
  //       console.log("unable to get user info in header")
  //       setUser({userName:"unknown"})
  //     }
  //     // setUser((await responce.json()).user)
  //     setUser(await responce.json())
  //     console.log(user)
  //   }
  //   getUserDetails()
  // }, [])

  console.log("user->", user)
  
  return (
    <header className="flex justify-between items-center p-4 bg-blue-500 text-white">
      {/* Left side: Logo/Name */}
      <div className="text-2xl font-bold">My Note App</div>

      {/* Right side: Profile button */}
      <div className="relative">
        <button
          // onClick={() => setIsModalOpen(!isModalOpen)}
          className="flex items-center space-x-2 bg-gray-800 p-2 rounded-full"
        >
          <span className="material-icons">{user?.userName}</span>{" "}
          {/* Profile Icon */}
        </button>
      </div>
    </header>
  );
}
