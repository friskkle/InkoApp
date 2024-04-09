import React from "react";
import { useNavigate } from "react-router-dom";

interface Stats {
  score: number;
  curExp: number;
  exp: number;
  level: number;
}

const QuizDone = (props: Stats) => {
  const navigate = useNavigate()

  const onSubmit = () => {
    navigate('/home')
  }
  return (
    <div className="p-10 h-fit w-fit m-auto bg-white absolute left-0 right-0 top-0 bottom-0 rounded-xl font-bold shadow-xl text-center select-text">
      <p className="text-xl">Your score is {props.score}</p>
      <p className="mt-5">Exp gained: {props.exp}</p>
      <p>Your exp: {props.curExp}</p>
      <p>Level {props.level}</p>
      <button
        className="mt-6 transition-all block py-3 px-4 w-full text-white font-bold rounded cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-400 hover:from-indigo-700 hover:to-purple-500 focus:bg-indigo-900 transform hover:-translate-y-1 hover:shadow-lg"
        type="submit"
        onClick={onSubmit}>
        Done
      </button>
    </div>
  );
};

export default QuizDone;
