import { createContext, useState, useEffect, Children } from "react";
import { auth } from "../firebase";
import React from 'react'
import { onAuthStateChanged } from "firebase/auth";
// Provides context for protected routes

export const Context = createContext();

export default function AuthContext({children}) {
    const [currentUser, setCurrentUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let unsubscribe;
        unsubscribe = onAuthStateChanged(auth, (user) => {
            setLoading(false)
            if(user)
                setCurrentUser(user)
            else
                setCurrentUser(null)
        })
    }, []);

    const values = {
        user: currentUser,
        setCurrentUser: setCurrentUser
    }

    return <Context.Provider value={values}>
        {!loading &&
        children
        }
    </Context.Provider>
}
