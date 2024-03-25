import { FC, useEffect, useState } from 'react';
import { auth, firestore } from "../../firebase";
import {
  getDocs,
  collection,
  query,
  orderBy,
  limit,
  FieldValue,
  doc,
  getDoc,
  where,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import ZHCards from './ZHCards';
import { useNavigate } from 'react-router-dom';

const MandarinWord: React.FC = () => {
  const ref = collection(firestore, "mandarin");
  const navigate = useNavigate()

  interface dbWord {
    word: string;
    pinyin: string;
    level: string;
    description: string[];
  }

  interface userData {
    uid: string;
    hsk: number;
    zhlast: string;
  }
  
  const [fireWord, setFireWord] = useState<dbWord[]>([]);
  const [curNum, setCurNum] = useState(0);
  const [max, setMax] = useState(0);
  const [userInfo, setUserInfo] = useState<userData>();
  const [lastIndex, setLastIndex] = useState('');

  const usersRef = collection(firestore, "users");

  const incrNum = () => {
    setCurNum(curNum + 1)
  }

  const decNum = () => {
    setCurNum(curNum - 1)
  }

  const getWords = async (level: number, lastWord: string) => {
    const q = query(ref, orderBy("word"), where("level", "==", level || 1), where("word", ">", lastWord), limit(5));
    const querySnapshot = await getDocs(q);

    let wordList: any[] = []

    if(!querySnapshot.empty){
      querySnapshot.forEach((doc) => {
        wordList.push(doc.data())
      })
      setMax(wordList.length)
      setCurNum(1)
      setLastIndex(wordList[wordList.length-1].word)
    }
    setFireWord(wordList)
  }

  const getUserInfo = async (uid: string) => {
    const docRef = doc(usersRef, uid);
    const userDoc = await getDoc(docRef);
    if (userDoc.exists()) {
      const docData = userDoc.data() as userData;
      setUserInfo(docData);
      getWords(docData.hsk, docData.zhlast);
    } else {
      console.log("No user data found!");
    }
  };

  const goToQuiz = async (e: any) => {
    if(userInfo){
      await updateDoc(doc(firestore, 'users', userInfo.uid), {
        zhlast: lastIndex
      })
      navigate('/home')
    }
    else{
      console.log("User info not loaded, cannot open quiz")
    }
  }
  
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        
        getUserInfo(uid);
      } else {
        console.log("user is logged out");
      }
    });
  }, []);

  return (
    <div className="flex flex-col items-center">
      <h1 className='text-center p-5 select-none'>{curNum}/{max}</h1>
      {fireWord.length > 0 ? (<ZHCards words={fireWord} decNum = {decNum} incrNum = {incrNum}/>) : 
      (<div className='flashcard transform transition-all duration-300 bg-white hover:bg-slate-50'>
        <p>Loading...</p>
      </div>)}
      <button onClick={goToQuiz} className='back-button w-20 mt-5 p-2 select-none transition-all inline-block text-black font-bold rounded cursor-pointer bg-gradient-to-r from-slate-50 to-slate-100 hover:text-white hover:from-purple-400 hover:to-purple-500 focus:bg-indigo-900 transform hover:-translate-y-0 hover:shadow-lg'>
        Finish studying
      </button>
    </div>
  );
  
};

export default MandarinWord;
