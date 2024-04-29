import React, { useContext, useEffect, useState } from "react";
import {
    Timestamp,
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { firestore } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { Context } from "../../context/AuthContext";
import { CircularProgress } from "@mui/material";

interface walletWord {
    freq: number;
    last_studied: Timestamp;
    mastery: number;
    pronunciation: string;
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
};

interface userData {
    name: string;
    exp: number;
    uid: string;
}

const JPQuizCards = (props: cardProps) => {
    const { user } = useContext(Context);
    const ref = collection(firestore, "japanese");
    const meaningRef = collection(firestore, "japanese_meaning_bank");
    const usersRef = collection(firestore, "users");
    const navigate = useNavigate();

    const [curIndex, setCurIndex] = useState(0);
    const [currentWord, setCurrentWord] = useState<quizWord>();
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [answer, setAnswer] = useState("");
    const [choices, setChoices] = useState<string[]>([]);
    const [wrong, setWrong] = useState(0);
    const [questionType, setQuestionType] = useState(0);
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
        const title =
            currentWord?.word + "(" + currentWord?.pronunciation + ")";
        const wordRef = doc(firestore, `users/${props.uid}/JPwallet`, title);

        await updateDoc(wordRef, {
            mastery: props.words[curIndex].mastery + 10,
            last_studied: serverTimestamp(),
        });
    };

    //shuffle the array for the choices
    const shuffle = (array: string[]) => {
        let currentIndex = array.length;

        // While there remain elements to shuffle...
        while (currentIndex != 0) {
            // Pick a remaining element...
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex],
                array[currentIndex],
            ];
        }
    };

    const getRandomMeanings = async (word: string, meaning: string) => {
        const randomQuery = query(
            meaningRef,
            where("meaning", ">", meaning),
            limit(10)
        );
        const randomSnapshot = await getDocs(randomQuery);

        let meaningList: any = [];

        if (!randomSnapshot.empty) {
            randomSnapshot.forEach((doc) => {
                const data = doc.data();
                meaningList.push(data.meaning);
            });
        }

        //remove duplicate meanings first
        meaningList = meaningList.filter(
            (value: any, index: any, self: any) => self.indexOf(value) === index
        );

        const choicesList = meaningList.slice(0, 3);
        choicesList.push(meaning);
        shuffle(choicesList);
        console.log(choicesList);
        setChoices(choicesList);
    };

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
        return (
            (longerLength - editDistance(longer, shorter)) /
            parseFloat(longerLength.toString())
        );
    }

    function editDistance(s1: string, s2: string) {
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();

        var costs = new Array();
        for (var i = 0; i <= s1.length; i++) {
            var lastValue = i;
            for (var j = 0; j <= s2.length; j++) {
                if (i == 0) costs[j] = j;
                else {
                    if (j > 0) {
                        var newValue = costs[j - 1];
                        if (s1.charAt(i - 1) != s2.charAt(j - 1))
                            newValue =
                                Math.min(
                                    Math.min(newValue, lastValue),
                                    costs[j]
                                ) + 1;
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0) costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    }

    const getWord = async (freq: number, pronunciation: string) => {
        console.log(pronunciation);
        const wordQuery = query(
            ref,
            where("freq", "==", freq),
            where("pronunciation", "==", pronunciation),
            limit(1)
        );
        const querySnapshot = await getDocs(wordQuery);

        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const data = doc.data() as quizWord;
                const meaningString = data.meanings.join();

                //extract the first meaning for the correct answer in multiple choices
                const japaneseMatch = meaningString.match(
                    /\b[A-Za-z][A-Za-z\s]+(?=;|\(|\!|\,|\.|\;|$)/
                );
                if (japaneseMatch) {
                    setCorrectAnswer(japaneseMatch[0]);
                    getRandomMeanings(data.word, japaneseMatch[0]);
                }
                setCurrentWord(data);
            });
        }
    };

    const onSubmit = async (e: any) => {
        e.preventDefault();

        if (currentWord) {
            const closeness = similarity(answer, currentWord.pronunciation);
            if (closeness >= 0.95) {
                setWrong(0);
                setAnswer("");
                setSkip(false)
                await updateWord();
                if (curIndex + 1 < props.words.length)
                    setCurIndex(curIndex + 1);
                else {
                    const finalScore = (score / props.words.length) * 100;
                    const expGained = finalScore / 10;
                    if (userInfo) {
                        await updateDoc(doc(firestore, "users", user.uid), {
                            exp: userInfo?.exp + expGained,
                        });
                        props.setExp(expGained);
                        props.setScore(finalScore);
                    }
                    props.setDone(true);
                }
            } else {
                if (wrong < 2) setWrong(wrong + 1);
                else {
                    setWrong(0);
                    setSkip(true);
                    setScore(score - 1);
                    setAnswer(currentWord.pronunciation);
                }
            }
        }
    };

    const choiceSubmit = async (answer: string) => {
        if (answer == correctAnswer) {
            setWrong(0);
            setSkip(false);
            await updateWord();
            if (curIndex + 1 < props.words.length) setCurIndex(curIndex + 1);
            else {
                const finalScore = (score / props.words.length) * 100;
                const expGained = finalScore / 10;
                if (userInfo) {
                    await updateDoc(doc(firestore, "users", user.uid), {
                        exp: userInfo?.exp + expGained,
                    });
                    props.setExp(expGained);
                    props.setScore(finalScore);
                }
                props.setDone(true);
            }
        } else {
            if (wrong < 2) setWrong(wrong + 1);
            else {
                setWrong(0);
                setSkip(true);
                setScore(score - 1);
            }
        }
    };

    useEffect(() => {
        const currentFreq = props.words[curIndex].freq;
        const currentPron = props.words[curIndex].pronunciation;
        setQuestionType(Math.floor(Math.random() * 2));
        getWord(currentFreq, currentPron);
        getUserInfo(user.uid);
    }, [curIndex]);

    return (
        <div className="w-[100%] h-[100%] relative z-0 flex">
            <div className="w-[100%] h-[100%] flex overflow-hidden mx-20 items-center">
                <div className="img-transition flex justify-center min-w-full transform transition-all duration-300">
                    <div className="transform transition-all duration-300 w-1/2 max-[640px]:w-full">
                        {currentWord ? (
                            <div className="flashcard transform transition-all duration-300 bg-white hover:bg-slate-50">
                                <div className="front select-none">
                                    <p className="font-bold text-5xl">
                                        {currentWord.word}
                                    </p>
                                    {questionType == 0 && <p>{correctAnswer}</p>}
                                    {wrong > 0 && (
                                        <p className="text-red-600">
                                            The answer is wrong, you have {3-wrong} more guesses
                                        </p>
                                    )}
                                    {questionType == 0 && (!skip ? (<form>
                                        <div>
                                            <label className="text-gray-500 block mt-3">
                                                Input hiragana
                                                <input
                                                    type="answer"
                                                    value={answer}
                                                    onChange={(e) =>
                                                        setAnswer(
                                                            e.target.value
                                                        )
                                                    }
                                                    required
                                                    placeholder="こたえ"
                                                    className="rounded px-4 py-3 w-full mt-1 bg-white text-gray-900 border border-gray-200 focus:border-indigo-400 focus:outline-none focus:ring focus:ring-indigo-100"
                                                />
                                            </label>
                                        </div>
                                        <button
                                            className="mt-6 transition-all block py-3 px-4 w-full text-white font-bold rounded cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-400 hover:from-indigo-700 hover:to-purple-500 focus:bg-indigo-900 transform hover:-translate-y-1 hover:shadow-lg"
                                            type="submit"
                                            onClick={onSubmit}
                                        >
                                            Answer
                                        </button>
                                    </form>) : (
                                    <div>
                                        The right answer is: {currentWord.pronunciation}
                                        <button
                                            className='mt-3 transition-all block py-3 px-4 w-full text-white font-bold rounded cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-400 hover:from-indigo-700 hover:to-purple-500 focus:bg-indigo-900 transform hover:-translate-y-1 hover:shadow-lg'
                                            onClick={onSubmit}>
                                            Next
                                        </button>
                                    </div>
                                ))}
                                {questionType == 1 && (!skip ? (<ul className='mt-5'>
                                    {choices.map((choice, index) => (
                                        <li
                                            key={index}
                                            className='mt-3 transition-all block py-3 px-4 w-full text-white font-bold rounded cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-400 hover:from-indigo-700 hover:to-purple-500 focus:bg-indigo-900 transform hover:-translate-y-1 hover:shadow-lg'
                                            onClick={() => {choiceSubmit(choice)}}
                                            >
                                            {choice}
                                        </li>
                                    ))}
                                </ul>) : (
                                    <div>
                                        The right answer is: {correctAnswer}
                                        <button
                                            className='mt-3 transition-all block py-3 px-4 w-full text-white font-bold rounded cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-400 hover:from-indigo-700 hover:to-purple-500 focus:bg-indigo-900 transform hover:-translate-y-1 hover:shadow-lg'
                                            onClick={() => {choiceSubmit(correctAnswer)}}>
                                            Next
                                        </button>
                                    </div>
                                ))}
                                </div>
                                <p className="mt-4 font-semibold">
                                    {curIndex + 1}/{props.words.length}
                                </p>
                            </div>
                        ) : (
                            <div className="flashcard transform transition-all duration-300 bg-white hover:bg-slate-50">
                                <CircularProgress />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JPQuizCards;
