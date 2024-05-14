import { createContext, useState, useEffect, Children } from "react";
import { auth, firestore } from "../firebase";
import React from 'react'
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, serverTimestamp, updateDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
// Provides context for protected routes

export const Context = createContext();

export default function AuthContext({children}) {
    const [currentUser, setCurrentUser] = useState(null)
    const [currentLevel, setCurrentLevel] = useState(0)
    const [loading, setLoading] = useState(true)

    const userRef = collection(firestore, "users")

    const timeSet = async (uid) => {
        const docRef = doc(userRef, uid);
        const userDoc = await getDoc(docRef);

        if(userDoc.exists() && userDoc.data().new === false){
            const docData = userDoc.data()
            setCurrentLevel(docData.level)
            const last = docData.last_logged.toDate()
            last.setHours(0, 0, 0, 0)

            const curDate = new Date()
            curDate.setHours(0, 0, 0, 0)
            
            if(curDate > last){
                await updateDoc(doc(firestore, "users", uid), {
                    last_logged: serverTimestamp(),
                    daily: false,
                    dailyquiz: false
                })
            }
            else
                await updateDoc(doc(firestore, "users", uid), {
                        last_logged: serverTimestamp()
                    })
        }
        else{
            const docData = userDoc.data()
            setCurrentLevel(docData.level)
            await updateDoc(doc(firestore, "users", uid), {
                last_logged: serverTimestamp(),
                daily: false,
                dailyquiz: false
            })
        }
    }

    useEffect(() => {
        let unsubscribe;
        unsubscribe = onAuthStateChanged(auth, (user) => {
            setLoading(false)
            if(user){
                timeSet(user.uid)

                setCurrentUser(user)
            }
            else
                setCurrentUser(null)
        })
    }, []);

    const values = {
        user: currentUser,
        level: currentLevel,
        setCurrentUser: setCurrentUser,
        setCurrentLevel: setCurrentLevel
    }

    return <Context.Provider value={values}>
        {!loading &&
        children
        }
    </Context.Provider>
}
