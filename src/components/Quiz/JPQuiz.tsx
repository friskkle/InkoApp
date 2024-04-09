import React, { useContext, useEffect, useState } from 'react';
import { Timestamp, collection, doc, getDoc, getDocs, limit, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { firestore } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../context/AuthContext';
import { CircularProgress } from '@mui/material';

interface walletWord {
    freq: number;
    last_studied: Timestamp;
    mastery: number;
}

/* function DataToDomainWalletWord(
    data: Partial<walletWord>
): walletWordDomain {
    return {
        freq: data.freq ?? 0
        
    }
}
interface walletWordDomain {
    freq: number;
    last_studied: Timestamp;
    mastery: number;
}

*/


interface quizWord {
    word: string;
    example_sentences?: string[];
    freq: number;
    jlpt?: number;
    meanings: string[];
    pronunciation: string;
    type: string;
}

type cardProps = {
    words: walletWord[];
    uid: string;
    setDone: React.Dispatch<React.SetStateAction<boolean>>;
    setScore: React.Dispatch<React.SetStateAction<number>>;
    setExp: React.Dispatch<React.SetStateAction<number>>;
}

interface userData {
    name: string;
    exp: number;
    uid: string;
  }

const JPQuizCards = (props: cardProps) => {
    const { user } = useContext(Context);
    const ref = collection(firestore, "japanese");
    const usersRef = collection(firestore, "users")
    const navigate = useNavigate();

    const [curIndex, setCurIndex] = useState(0);
    const [currentWord, setCurrentWord] = useState<quizWord>();
    const [answer, setAnswer] = useState("");
    const [wrong, setWrong] = useState(false);
    const [userInfo, setUserInfo] = useState<userData>();
    const [score, setScore] = useState(100);

    const getUserInfo = async (uid: string) => {
        const docRef = doc(usersRef, uid);
        const userDoc = await getDoc(docRef);
        if (userDoc.exists()) {
          const docData = userDoc.data() as userData;
          setUserInfo(docData);
        } else {
          console.log("No user data found!");
        }
      };

    const updateWord = async () => {
        const title = currentWord?.word + "(" + currentWord?.pronunciation + ")"
        const wordRef = doc(firestore, `users/${props.uid}/JPwallet`, title)

        await updateDoc(wordRef, {
            mastery: props.words[curIndex].mastery + 10,
            last_studied: serverTimestamp()
        })
    }

    function similarity(s1: string, s2: string) {
        var longer = s1;
        var shorter = s2;
        if (s1.length < s2.length) {
          longer = s2;
          shorter = s1;
        }
        var longerLength = longer.length;
        if (longerLength == 0) {
          return 1.0;
        }
        return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength.toString());
    }

    function editDistance(s1: string, s2: string) {
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();
      
        var costs = new Array();
        for (var i = 0; i <= s1.length; i++) {
          var lastValue = i;
          for (var j = 0; j <= s2.length; j++) {
            if (i == 0)
              costs[j] = j;
            else {
              if (j > 0) {
                var newValue = costs[j - 1];
                if (s1.charAt(i - 1) != s2.charAt(j - 1))
                  newValue = Math.min(Math.min(newValue, lastValue),
                    costs[j]) + 1;
                costs[j - 1] = lastValue;
                lastValue = newValue;
              }
            }
          }
          if (i > 0)
            costs[s2.length] = lastValue;
        }
        return costs[s2.length];
      }

    const getWord = async (freq: number) => {
        const wordQuery = query(ref, where("freq", "==", freq), limit(1));
        const querySnapshot = await getDocs(wordQuery);

        if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
                const data = doc.data() as quizWord;
                setCurrentWord(data);
            })
        }
    }

    const onSubmit = async (e: any) => {
        e.preventDefault()

        if(currentWord){
            const closeness = similarity(answer, currentWord.pronunciation)
            if(closeness >= 0.95){
                setWrong(false)
                setAnswer("")
                await updateWord()
                if(curIndex + 1 < props.words.length)
                    setCurIndex(curIndex + 1)
                else{
                    if(userInfo){
                        await updateDoc(doc(firestore, 'users', user.uid), {
                            exp: userInfo?.exp + score/10
                        })
                        props.setExp(score/10)
                        props.setScore(score)
                    }
                    props.setDone(true)
                }
            }
            else{
                if(score>=10){
                    setScore(score - 10)
                }
                setWrong(true)
            }
        }
    }

    useEffect(() => {
        const currentFreq = props.words[curIndex].freq
        getWord(currentFreq)
        getUserInfo(user.uid)
    }, [curIndex])

    return(
        <div className="w-[100%] h-[100%] relative z-0 flex">
            <div className="w-[100%] h-[100%] flex overflow-hidden mx-20 items-center">
                <div className='img-transition flex justify-center min-w-full transform transition-all duration-300'>
                    <div className="transform transition-all duration-300">
                    {currentWord ? (
                        <div className='flashcard transform transition-all duration-300 bg-white hover:bg-slate-50'>
                            <div className='front select-none'>
                                <p className='font-bold text-5xl'>{currentWord.word}</p>
                                {wrong && <p className='text-red-600'>The answer is wrong</p>}
                                <form>
                                    <div>
                                        <label className='text-gray-500 block mt-3'>
                                            Input hiragana
                                        <input
                                            type="answer"
                                            value={answer}
                                            onChange={(e) => setAnswer(e.target.value)}
                                            required
                                            placeholder="こたえ"
                                            className='rounded px-4 py-3 w-full mt-1 bg-white text-gray-900 border border-gray-200 focus:border-indigo-400 focus:outline-none focus:ring focus:ring-indigo-100'
                                        />
                                        </label>
                                    </div>
                                    <button
                                        className='mt-6 transition-all block py-3 px-4 w-full text-white font-bold rounded cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-400 hover:from-indigo-700 hover:to-purple-500 focus:bg-indigo-900 transform hover:-translate-y-1 hover:shadow-lg'
                                        type="submit" 
                                        onClick={onSubmit}>
                                        Answer                               
                                    </button>
                                </form>
                            </div>
                            <p className='mt-4 font-semibold'>{curIndex + 1}/{props.words.length}</p>
                        </div>
                    ) : (
                    <div className='flashcard transform transition-all duration-300 bg-white hover:bg-slate-50'>
                        <CircularProgress />
                    </div>
                    )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default JPQuizCards;