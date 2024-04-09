import React from "react";
import Header from "../../components/Header";
import QuizDone from "../Flashcards/QuizDone";

const Wallet = () => {
  return (
    <div className="flex flex-col bg-indigo-100 min-h-screen select-none relative">
      <Header title="Wallet" />
      <div className="flex flex-col p-10 items-center">
        <div className="columns-4 w-2/3 gap-4">
            {[24, 36, 36, 32, 32, 32, 16, 48, 64, 48, 24, 24, 32, 16, 48].map((height, index) => (
            <div
                key={index}
                className={`mb-4 break-inside-avoid rounded-xl border-2 border-slate-400/10 bg-neutral-100 p-4 dark:bg-neutral-900`}
                style={{height: `${height/4}rem`}}
            />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
