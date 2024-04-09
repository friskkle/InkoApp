import { createContext, useState, useEffect, Children } from "react";
import { auth, firestore } from "../firebase";
import React from 'react'
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, serverTimestamp, updateDoc, getDoc } from "firebase/firestore";
// Provides context for protected routes

export const Context = createContext();

export default function AuthContext({children}) {
    const [currentUser, setCurrentUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const userRef = collection(firestore, "users")

    const timeSet = async (uid) => {
        const docRef = doc(userRef, uid);
        const userDoc = await getDoc(docRef);

        if(userDoc.last_logged){
            const docData = userDoc.data()
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
        else
            await updateDoc(doc(firestore, "users", uid), {
                last_logged: serverTimestamp(),
                daily: false,
                dailyquiz: false
            })
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
        setCurrentUser: setCurrentUser
    }

    return <Context.Provider value={values}>
        {!loading &&
        children
        }
    </Context.Provider>
}
