"use client";
import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

// Provider component to wrap the application
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Fetch user info when the page is loaded (on first render)
    useEffect(() => {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='));
        if (token) {
            fetch("/api/auth/user")
                .then((res) => res.json())
                .then((data) => {
                    if (data.user) {
                        setUser(data.user); // Set user if they are authenticated
                    }
                });
        }
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
