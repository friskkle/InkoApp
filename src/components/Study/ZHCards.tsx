import React, { useState } from "react";
import { ArrowBigLeft, ArrowBigRight, CircleDot, Circle } from "lucide-react";

interface dbWord {
  word: string;
  pinyin: string;
  level: string;
  description: string;
  descriptions: string[]
}

type cardProps = {
  words: dbWord[];
  decNum: () => void;
  incrNum: () => void;
};

export default function ZHCards(props: cardProps) {
  const [curIndex, setCurIndex] = useState(0);
  const [isFlipped, setisFlipped] = useState<Array<boolean>>(Array(props.words.length).fill(false))

  function ShowPrevImg() {
    setCurIndex((index) => {
      if (index === 0) return index;
      props.decNum();
      return index - 1;
    });
  }

  function ShowNextImg() {
    setCurIndex((index) => {
      if (index === props.words.length - 1) return index;
      props.incrNum();
      return index + 1;
    });
  }

  function flipCard(index: number) {
    setisFlipped(isFlipped.map((c, i) => {
        if (i === index){
            return !c
        }
        else{
            return c
        }
    }))
  }

  return (
    <div className="w-[100%] h-[100%] relative z-0 flex">
      <button
        onClick={ShowPrevImg}
        className="img-slider-btn"
        style={{ left: 0 }}
      >
        <ArrowBigLeft />
      </button>
      <div className="w-[100%] h-[100%] flex overflow-hidden mx-20">
        {props.words.map((word: any, index: number) => (
          <div
            key={index}
            className="img-transition flex justify-center min-w-full transform transition-all duration-300"
            style={{ translate: `${-100 * curIndex}%` }}
          >
            <div>
              {word ? (
                <div className="flashcard transform transition-all duration-300 bg-white hover:bg-slate-50" onClick={() => flipCard(index)}>
                  {!isFlipped[index] && (
                    <div className="front select-none">
                      <p className="font-bold text-xl">{word.pinyin}</p>
                      <h2 className="font-bold text-5xl">{word.word}</h2>
                    </div>
                  )}
                  {isFlipped[index] && (
                    <div>
                      <h2 className="font-bold text-lg">Level: {word.level}</h2>
                      <ul>
                        {word.descriptions.slice(0,4).map((meaning: any, index: any) => (
                          <li key={index}>
                            {meaning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* <ul>
          {words[count].english.map((gloss: any, index: number) => (
            <li key={index}>
                <span>{gloss}</span>
            </li>
          ))}
          </ul> */}
                </div>
              ) : (
                <p>Loading...</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={ShowNextImg}
        className="img-slider-btn"
        style={{ right: 0 }}
      >
        <ArrowBigRight />
      </button>
      {/* <div className="absolute bottom-[0.1rem] left-[50%] translate-x-[-50%] flex gap-2">
        {props.words.map((_, index) => (
          <button
            key={index}
            className="circle-dot"
            onClick={() => setCurIndex(index)}
          >
            {index === curIndex ? <CircleDot /> : <Circle />}
          </button>
        ))}
      </div> */}
    </div>
  );
}
