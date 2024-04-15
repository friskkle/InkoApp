import React, { useContext, useEffect, useState } from "react";
import Header from "../../components/Header";
import QuizDone from "../Flashcards/QuizDone";
import { Context } from "../../context/AuthContext";
import { Timestamp, collection, getDocs } from "firebase/firestore";
import { firestore } from "../../firebase";

interface wordData {
  frequency: number;
  last_studied: Timestamp;
  mastery: number;
  word: string;
}

const Wallet = () => {
  const { user } = useContext(Context);

  const [walletWords, setWalletWords] = useState<any>([]);
  const [mode, setMode] = useState("JP");

  const getWords = async () => {
    const wordsRef = collection(firestore, `users/${user.uid}/${mode}wallet`);
    const words = await getDocs(wordsRef);

    if (!words.empty) {
      const wordArray: any = []
      let count = 0;
      words.forEach((doc) => {
        let word = doc.data() as wordData;
        word.word = doc.id;
        wordArray.push({id: count, data: word});
        count += 1;
      })
      setWalletWords(wordArray);
    }
  }

  useEffect(() => {
    getWords();
  }, [mode]);

  return (
    <div className="flex flex-col bg-indigo-100 min-h-screen select-none relative">
      <Header title="Wallet" />
      <div className="flex flex-col p-8 items-center">
        <div className="flex flex-auto p-2 gap-2 bg-indigo-200 rounded-xl">
          <div className="p-1 w-12 bg-white rounded-[10px] text-center shadow-sm">JP</div>
          <div className="p-1 w-12 bg-white rounded-[10px] text-center shadow-sm">ZH</div>
        </div>
        <div className="columns-4 w-2/3 gap-4 mt-5">
          {walletWords.length ?
          walletWords.map((word: { id: React.Key | null | undefined; data: { frequency: number, last_studied: Timestamp; mastery: number; word: string; }; }) => (
            <div
              key={word.id}
              className={`mb-4 h-[100px] break-inside-avoid rounded-xl text-center content-evenly text-2xl font-bold border-2 border-slate-400/10 bg-neutral-100 p-4 dark:bg-neutral-900 hover:bg-neutral-50`}
              style={{height: `${word.data.word.length*1.2}rem`}}>
                {word.data.word}
            </div>
          )) :
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
    </div>
  );
};

export default Wallet;
