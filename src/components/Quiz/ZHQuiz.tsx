import React, { useContext, useEffect, useState } from 'react';
import { Timestamp, collection, doc, getDoc, getDocs, limit, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { firestore } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../context/AuthContext';
import { CircularProgress } from '@mui/material';

interface walletWord {
    word: string;
    last_studied: Timestamp;
    mastery: number;
}

interface quizWord {
    word: string;
    pinyin: string;
    level: string;
    description: string;
    descriptions: string[];
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

const ZHQuizCards = (props: cardProps) => {
    const { user } = useContext(Context);
    const ref = collection(firestore, "mandarin");
    const meaningRef = collection(firestore, "mandarin_meaning_bank");
    const usersRef = collection(firestore, "users");
    const navigate = useNavigate();

    const [curIndex, setCurIndex] = useState(0);
    const [currentWord, setCurrentWord] = useState<quizWord>();
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [choices, setChoices] = useState<string[]>([]);
    const [wrong, setWrong] = useState(0);
    const [userInfo, setUserInfo] = useState<userData>();
    const [score, setScore] = useState(props.words.length);
    const [skip, setSkip] = useState(false);

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
        if (currentWord) {
            const title = currentWord.word
            const wordRef = doc(firestore, `users/${props.uid}/ZHwallet`, title)

            await updateDoc(wordRef, {
                mastery: props.words[curIndex].mastery + 10,
                last_studied: serverTimestamp()
        })}
    }

    const shuffle = (array: string[]) => {
        let currentIndex = array.length;
      
        // While there remain elements to shuffle...
        while (currentIndex != 0) {
      
          // Pick a remaining element...
          let randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
      
          // And swap it with the current element.
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
      }

    const getRandomMeanings = async (word: string, meaning: string) => {
        const randomQuery = query(meaningRef, where("meaning", ">", meaning), limit(10))
        const randomSnapshot = await getDocs(randomQuery);

        let meaningList: any = []

        if(!randomSnapshot.empty){
            randomSnapshot.forEach((doc) => {
                const data = doc.data()
                meaningList.push(data.meaning)
            })
        }

        //remove duplicate meanings first
        meaningList = meaningList.filter((value: any, index: any, self: any) => self.indexOf(value) === index);

        const choicesList = meaningList.slice(0,3);
        choicesList.push(meaning)
        shuffle(choicesList);
        setChoices(choicesList);
    }

    const getWord = async (word: string) => {
        const wordQuery = query(ref, where("word", "==", word), limit(1));
        const querySnapshot = await getDocs(wordQuery);

        if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
                const data = doc.data() as quizWord;
                const meaningsString = data.description

                // extracting the first meaning for the correct multiple choice answer
                const mandarinIndex = meaningsString.indexOf('②');

                const mandarinMatch = meaningsString.match(/^[^\u4e00-\u9fa5]+/);
                let finalDefinition = ""
                if(mandarinMatch){
                    if(mandarinIndex > 0 && mandarinIndex < mandarinMatch[0].length){
                        const parsedDefinition = meaningsString.slice(0, mandarinIndex);
                        // If the definition contains '①' or an apostrophe, remove it
                        finalDefinition = parsedDefinition.replace(/[①'"]/g, '');
                        setCorrectAnswer(finalDefinition);
                    }
                    else {
                        finalDefinition = mandarinMatch[0].replace(/[①'"]/g, '');
                        setCorrectAnswer(finalDefinition)
                    }
                }
                else {
                    finalDefinition = meaningsString.replace(/[①'"]/g, '');
                    setCorrectAnswer(finalDefinition)
                }
                setCurrentWord(data);
                getRandomMeanings(data.word, finalDefinition);
            })
        }

    }

    const onSubmit = async (answer: string) => {
        if(answer == correctAnswer) {
            setWrong(0);
            setSkip(false)
            await updateWord();
            if(curIndex + 1 < props.words.length)
                setCurIndex(curIndex + 1);
            else {
                const finalScore = (score/props.words.length) * 100
                const expGained = finalScore/10
                if(userInfo) {
                    await updateDoc(doc(firestore, 'users', user.uid), {
                        exp: userInfo?.exp + expGained
                    })
                    props.setExp(expGained)
                    props.setScore(finalScore)
                }
                props.setDone(true)
            }
        }
        else {
            if(wrong < 2)
                setWrong(wrong+1);
            else {
                setWrong(0);
                setSkip(true)
                setScore(score-1)
            }
        }
    }

    useEffect(() => {
        const word = props.words[curIndex].word
        getWord(word)
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
                                {wrong > 0 && <p className='text-red-600'>The answer is wrong, you have {3-wrong} more guesses</p>}
                                {!skip ? (<ul className='mt-5'>
                                    {choices.map((choice, index) => (
                                        <li
                                            key={index}
                                            className='mt-3 transition-all block py-3 px-4 w-full text-white font-bold rounded cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-400 hover:from-indigo-700 hover:to-purple-500 focus:bg-indigo-900 transform hover:-translate-y-1 hover:shadow-lg'
                                            onClick={() => {onSubmit(choice)}}
                                            >
                                            {choice}
                                        </li>
                                    ))}
                                </ul>) : (
                                    <div>
                                        The right answer is: {correctAnswer}
                                        <button
                                            className='mt-3 transition-all block py-3 px-4 w-full text-white font-bold rounded cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-400 hover:from-indigo-700 hover:to-purple-500 focus:bg-indigo-900 transform hover:-translate-y-1 hover:shadow-lg'
                                            onClick={() => {onSubmit(correctAnswer)}}>
                                            Next
                                        </button>
                                    </div>
                                )}
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

export default ZHQuizCards;