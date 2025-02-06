"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const UserContext = createContext();

// Provider component to wrap the application
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Fetch user info when the page is loaded (on first render)
  useEffect(() => {
    const token = Cookies.get("token");
    console.log("cookies->", document.cookie)
    console.log("cookies->", Cookies.get())

    // HTTP-only cookies (cannot be accessed on the client side). *****
    // it will send to backend automatically but cant access on front

    // if (token) {
      
    // } else {
    //   console.log("from userprovider, no token")
    //   router.push("/auth");
    // }
    async function getUser(){
      const res= await fetch("/api/auth/user")
      const data = await res.json()
      if(!res.ok){
        console.log("in userprovider, invalid token", data.message)
        router.push("/auth")
      }
      setUser(data.user)
      console.log("in userprovider, user->", user)
    }
    getUser()
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to access the user context
export const useUser = () => {
  return useContext(UserContext);
};
