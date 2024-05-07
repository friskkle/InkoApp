import { FC, useEffect, useState } from 'react';
import { auth, firestore } from "../../firebase";
import {
  getDocs,
  collection,
  query,
  orderBy,
  limit,
  doc,
  getDoc,
  where,
  updateDoc,
  setDoc,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import ZHCards from './ZHCards';
import { useNavigate } from 'react-router-dom';
import Levelup from '../LevelupHandle';

const MandarinWord: React.FC = () => {
  const ref = collection(firestore, "mandarin");
  const navigate = useNavigate()

  interface dbWord {
    word: string;
    pinyin: string;
    level: string;
    description: string;
    descriptions: string[];
  }

  interface userData {
    uid: string;
    name: string;
    level: number;
    exp: number;
    daily: boolean;
    hsk: number;
    zhlast: string;
    lesson_num: number;
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

  const getWords = async (level: number, lastWord: string, num: number = 10) => {
    const q = query(ref, orderBy("word"), where("level", "==", level.toString() || "1"), where("word", ">", lastWord), limit(num));
    const querySnapshot = await getDocs(q);

    let wordList: any[] = []

    if(!querySnapshot.empty){
      querySnapshot.forEach((doc) => {
        const data = doc.data() as dbWord;
        const meaningsArray = data.description.split(/(?=①|②|③|④|⑤|⑥|⑦|⑧|⑨)/)
        data.descriptions = meaningsArray
        wordList.push(data)
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
      getWords(docData.hsk, docData.zhlast || '', docData.lesson_num);
    } else {
      console.log("No user data found!");
    }
  };

  const levelThreshold = (curLevel: number) => {
    return Math.floor(Math.pow(curLevel/0.5, 1.8));
  }

  const goToQuiz = async (e: any) => {
    if(userInfo){
      let exp = 10
      if(!userInfo.daily) exp += 10
      let level = await Levelup(userInfo.uid, userInfo.name, userInfo.level, userInfo.exp + exp)
      
      await updateDoc(doc(firestore, 'users', userInfo.uid), {
        zhlast: lastIndex,
        exp: userInfo.exp + exp,
        daily: true,
        level: level
      })
      fireWord.forEach(async (word) => {
        const wordTitle = word.word

        await setDoc(doc(firestore, `users/${userInfo.uid}/ZHwallet`, wordTitle), {
          word: word.word,
          mastery: 0,
          last_studied: serverTimestamp()
        })
      })
      navigate('/zhquiz')
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
