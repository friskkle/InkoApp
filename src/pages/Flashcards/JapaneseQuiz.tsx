import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Context } from '../../context/AuthContext'
import { Timestamp, collection, doc, getDoc, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { firestore } from '../../firebase'
import CircularProgress from '@mui/material/CircularProgress'
import JPQuizCards from '../../components/Quiz/JPQuiz'
import QuizDone from './QuizDone'


interface walletWord {
    freq: number;
    last_studied: Timestamp;
    mastery: number;
    pronunciation: string;
}

interface userData {
    name: string;
    exp: number;
    level: number;
    uid: string;
    quiz_num: number;
  }

export default function JPQuiz() {
    const { user } = useContext(Context)
    const navigate = useNavigate()
    const usersRef = collection(firestore, "users")

    const [userWords, setUserWords] = useState<walletWord[]>([])
    const [userInfo, setUserInfo] = useState<userData>();
    const [score, setScore] = useState(0)
    const [exp, setExp] = useState(0)
    const [done, setDone] = useState(false)

    const goBack = async (e: any) => {
        navigate('/home')
    }

    const getUserInfo = async (uid: string) => {
        const docRef = doc(usersRef, uid);
        const userDoc = await getDoc(docRef);
        if (userDoc.exists()) {
          const docData = userDoc.data() as userData;
          setUserInfo(docData);
          getWords(user.uid, docData.quiz_num);
        } else {
          console.log("No user data found!");
        }
      };

    const getWords = async (uid: string, num: number = 20) => {
        const userRef = collection(firestore, `users/${uid}/JPwallet`)
        const q = query(userRef, orderBy("mastery"), orderBy("last_studied"), limit(num))
        const querySnapshot = await getDocs(q)

        let wordList: any[] = [];

        if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
                const data = doc.data() as walletWord;
                const match = doc.id.match(/([\p{L}\p{N}]+)\s*\(([\p{L}\p{N}]+)\)/u);
                if(match)
                  data.pronunciation = match[2];
                wordList.push(data);
            })
        }

        setUserWords(wordList)
    }

    useEffect(() => {
        getUserInfo(user.uid)
    }, []);
    
    return (
    <div className='p-10 bg-indigo-100 min-h-screen relative'>
        <button onClick={goBack} className='back-button w-20 p-2 select-none transition-all inline-block text-black font-bold rounded cursor-pointer bg-gradient-to-r from-slate-50 to-slate-100 hover:text-white hover:from-slate-400 hover:to-slate-500 focus:bg-indigo-900 transform hover:-translate-y-0 hover:shadow-lg'>
                    Go Home
        </button>
        <div className='mt-5 w-full flex justify-center'>
            {userWords.length > 0 ? (<JPQuizCards words={userWords} uid={user.uid} setDone={setDone} setScore={setScore} setExp={setExp}/>) : <CircularProgress />}
        </div>
        {userInfo && done && <QuizDone score={score} curExp={userInfo.exp} exp={exp}/>}
    </div>
  )
}
