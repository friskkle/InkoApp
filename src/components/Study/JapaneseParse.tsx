import { FC, useEffect, useState } from "react";
//import wordDict from '../dictionaries/JMdict_e.json';
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
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import JPCards from "./JPCards";
import { useNavigate } from "react-router-dom";

interface dbWord {
  word: string;
  example_sentences?: string[];
  freq: number;
  jlpt?: number;
  meanings: string[];
  pronunciation: string;
  type: string;
  wordId: string;
}

interface userData {
  name: string;
  exp: number;
  uid: string;
  hsk: number;
  jlpt: number;
  jwlevel: number;
  zhlast: string;
  lesson_num: number;
}

interface userExample {
  uid: string;
  docId: string;
  photoUrl: string;
  example: string;
  meaning: string;
  likes: string[];
  likeCount: number;
  timestamp: Timestamp;
}

const JapaneseWord = (props: any) => {
  const ref = collection(firestore, "japanese");

  const navigate = useNavigate();

  /* interface Word {
    ent_seq: string[];
    k_ele?: { keb: string[] }[];
    r_ele: { reb: string[] }[];
    sense: {
      pos?: string[];
      xref?: string[];
      misc?: string[];
      s_inf?: string[];
      gloss?: { _: string[]; $: { g_type: string[] } }[];
    }[];
  }
  const jsonDict = JSON.stringify(wordDict);
  
  const words: Word[] = JSON.parse(jsonDict); */
  const [fireWord, setFireWord] = useState<dbWord[]>([]);
  const [curNum, setCurNum] = useState(0);
  const [max, setMax] = useState(0);
  const [userInfo, setUserInfo] = useState<userData>();
  const [lastIndex, setLastIndex] = useState(0);
  const [userExamples, setUserExamples] = useState<any>([])

  const usersRef = collection(firestore, "users");

  const incrNum = () => {
    setCurNum(curNum + 1);
  };

  const decNum = () => {
    setCurNum(curNum - 1);
  };

  const getWords = async (level: number = 0, num: number = 10) => {
    const q = query(ref, orderBy("freq"), where("freq", ">", level), limit(num));
    const querySnapshot = await getDocs(q);
    let exQuery: any = "";

    let wordList: any[] = [];

    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        const data = doc.data() as dbWord;
        data.wordId = doc.id
        wordList.push(data);
        // get the user submitted examples query
        const exRef = collection(
          firestore,
          `japanese/${doc.id}/userexamples`
        );
        exQuery = query(
            exRef,
            orderBy("timestamp", "desc"),
            orderBy("likes_count", "desc")
        );
      });
      setMax(wordList.length);
      setCurNum(1);
      setLastIndex(wordList[wordList.length-1].freq)

      // get user examples
      const exSnapshot = await getDocs(exQuery);
      if (!exSnapshot.empty) {
          const exContainer: any = [];
          exSnapshot.forEach((doc) => {
              const data = doc.data() as userExample;
              data.docId = doc.id;
              exContainer.push({ id: doc.id, data: data });
          });

          setUserExamples(exContainer);
      }
    }

    setFireWord(wordList);
  };

  const getUserInfo = async (uid: string) => {
    const docRef = doc(usersRef, uid);
    const userDoc = await getDoc(docRef);
    if (userDoc.exists()) {
      const docData = userDoc.data() as userData;
      setUserInfo(docData);
      getWords(docData.jwlevel, docData.lesson_num);
    } else {
      console.log("No user data found!");
    }
  };

  // save the studied words into the wallet, update the last word studied for the user, and open a quiz
  const goToQuiz = async (e: any) => {
    if(userInfo){
      await updateDoc(doc(firestore, 'users', userInfo.uid), {
        jwlevel: lastIndex,
        exp: userInfo.exp + 5
      })
      fireWord.forEach(async (word) => {
        const wordTitle = word.word + "(" + word.pronunciation + ")"

        await setDoc(doc(firestore, `users/${userInfo.uid}/JPwallet`, wordTitle), {
          freq: word.freq,
          mastery: 0,
          last_studied: serverTimestamp()
        })
      })
      navigate('/jpquiz')
    }
    else{
      console.error("User info not loaded, cannot open quiz")
    }
  }

  // obtain the words from the database according to the user's level
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        
        getUserInfo(uid);
      } else {
        console.log("user is logged out");
      }
    });
  }, []);

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-center p-5 select-none">
        {curNum}/{max}
      </h1>
      {fireWord.length > 0 ? (<JPCards words={fireWord} userExamples={userExamples} decNum={decNum} incrNum={incrNum} />) : 
      (<div className='flashcard transform transition-all duration-300 bg-white hover:bg-slate-50'>
        <p>Loading...</p>
      </div>)}
      <button onClick={goToQuiz} className='back-button w-20 mt-5 p-2 select-none transition-all inline-block text-black font-bold rounded cursor-pointer bg-gradient-to-r from-slate-50 to-slate-100 hover:text-white hover:from-purple-400 hover:to-purple-500 focus:bg-indigo-900 transform hover:-translate-y-0 hover:shadow-lg'>
        Finish studying
      </button>
    </div>
  );
};

export default JapaneseWord;
