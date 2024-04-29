import React, { useContext, useEffect, useState } from "react";
import Header from "../../components/Header";
import QuizDone from "../Flashcards/QuizDone";
import { Context } from "../../context/AuthContext";
import { Timestamp, collection, getDocs } from "firebase/firestore";
import { firestore } from "../../firebase";
import ExpandedCard from "../../components/Wallet/ExpandedCard";

interface JPData {
  frequency: number;
  last_studied: Timestamp;
  mastery: number;
  word: string;
}

interface ZHData {
  last_studied: Timestamp;
  mastery: number;
  word: string;
}

const Wallet = () => {
  const { user } = useContext(Context);

  const [walletWords, setWalletWords] = useState<any>([]);
  const [mode, setMode] = useState("JP");
  const [curWord, setCurWord] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [popup, setPopup] = useState(false);
  const [JPColor, setJPColor] = useState("white");
  const [ZHColor, setZHColor] = useState("#dbe3ff");

  const getWords = async () => {
    const wordsRef = collection(firestore, `users/${user.uid}/${mode}wallet`);
    const words = await getDocs(wordsRef);

    if (!words.empty) {
      const wordArray: any = []
      let count = 0;
      words.forEach((doc) => {
        let word = doc.data() as JPData;
        word.word = doc.id;
        wordArray.push({id: count, data: word});
        count += 1;
      })
      setWalletWords(wordArray);
    }
  };

  const openJPWord = async (word: string, hrgn: string) => {
    setCurWord(word);
    setPronunciation(hrgn);
    setPopup(true);
  };

  const openZHWord = async (word: string) => {
    setCurWord(word);
    setPopup(true);
  }

  useEffect(() => {
    getWords();
  }, [mode]);

  return (
    <div className="flex flex-col bg-gradient-to-b from-indigo-100 to-indigo-200 min-h-screen select-none relative">
      <Header title="Wallet" />
      <div className="flex flex-col p-8 items-center">
        <div className="flex flex-auto p-2 gap-2 bg-indigo-200 rounded-xl">
          <div
            onClick={() => {
              setJPColor("white");
              setZHColor("#dbe3ff");
              setMode('JP')
            }}
            className="p-1 w-12 rounded-[10px] text-center shadow-sm cursor-pointer"
            style={{backgroundColor: `${JPColor}`}}>
              JP
            </div>
          <div
            onClick={() => {
              setJPColor("#dbe3ff");
              setZHColor("white");
              setMode('ZH')
            }}
            className="p-1 w-12 rounded-[10px] text-center shadow-sm cursor-pointer"
            style={{backgroundColor: `${ZHColor}`}}>ZH</div>
        </div>
        <div className="columns-4 w-2/3 gap-4 mt-5">
          {walletWords.length ?
          (mode == 'JP' ? walletWords.map((word: { id: React.Key | null | undefined; data: { frequency: number, last_studied: Timestamp; mastery: number; word: string; }; }) => (
            <div
              key={word.id}
              className={`mb-4 h-[100px] break-inside-avoid rounded-xl text-center content-evenly text-2xl font-bold border-2 border-slate-400/10 bg-neutral-100 p-4 dark:bg-neutral-900 hover:bg-neutral-50`}
              style={{height: `${word.data.word.length*1.2}rem`}}
              onClick={() => {
                const match = word.data.word.match(/([\p{L}\p{N}]+)\s*\(([\p{L}\p{N}]+)\)/u);
                if (match) {
                  const wordBeforeBracket = match[1];
                  const wordInBracket = match[2];
                  openJPWord(wordBeforeBracket, wordInBracket);
                }
              }}
              >
                {word.data.word}
            </div>
          )): walletWords.map((word: { id: React.Key | null | undefined; data: { frequency: number, last_studied: Timestamp; mastery: number; word: string; }; }) => (
            <div
              key={word.id}
              className={`mb-4 h-[100px] break-inside-avoid rounded-xl text-center content-evenly text-2xl font-bold border-2 border-slate-400/10 bg-neutral-100 p-4 dark:bg-neutral-900 hover:bg-neutral-50`}
              style={{height: `${word.data.word.length*3.14}rem`}}
              onClick={() => {
                openZHWord(word.data.word);
              }}
              >
                {word.data.word}
            </div>
          ))) :
          [24, 36, 36, 32, 32, 32, 16, 48, 64, 48, 24, 24, 32, 16, 48].map(
            (height, index) => (
              <div
                key={index}
                className={`mb-4 break-inside-avoid rounded-xl border-2 border-slate-400/10 bg-neutral-100 p-4 dark:bg-neutral-900`}
                style={{ height: `${height / 4}rem` }}
              />
            )
          )}
        </div>
      </div>
      {popup && <ExpandedCard word={curWord} pronunciation={pronunciation} mode={mode} setPopup={setPopup}/>}
    </div>
  );
};

export default Wallet;
