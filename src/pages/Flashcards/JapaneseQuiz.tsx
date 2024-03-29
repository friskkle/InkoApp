import React, { useContext, useEffect, useState } from 'react'
import JapaneseWord from '../../components/Study/JapaneseParse'
import { useNavigate } from 'react-router-dom'
import { Context } from '../../context/AuthContext'
import { Timestamp, collection, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { firestore } from '../../firebase'
import JPQuizCards from '../../components/Quiz/JPQuiz'


interface walletWord {
    freq: number;
    last_studied: Timestamp;
    mastery: number;
}

export default function JPQuiz() {
    const { user } = useContext(Context)
    const navigate = useNavigate()

    const [userWords, setUserWords] = useState<walletWord[]>([])

    const goBack = async (e: any) => {
        navigate('/home')
    }

    const getWords = async (uid: string) => {
        const userRef = collection(firestore, `users/${uid}/JPwallet`)
        const q = query(userRef, orderBy("mastery"), orderBy("last_studied"), limit(10))
        const querySnapshot = await getDocs(q)

        let wordList: any[] = [];

        if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
                wordList.push(doc.data());
            })
        }

        setUserWords(wordList)
    }

    useEffect(() => {
        getWords(user.uid)
    }, []);
    
    return (
    <div className='p-10 bg-indigo-100 min-h-screen'>
        <button onClick={goBack} className='back-button w-20 p-2 select-none transition-all inline-block text-black font-bold rounded cursor-pointer bg-gradient-to-r from-slate-50 to-slate-100 hover:text-white hover:from-slate-400 hover:to-slate-500 focus:bg-indigo-900 transform hover:-translate-y-0 hover:shadow-lg'>
                    Go Home
        </button>
        <div className='mt-5'>
            {userWords.length > 0 ? (<JPQuizCards words={userWords} uid={user.uid}/>) : <p>Loading...</p>}
        </div>
    </div>
  )
}
