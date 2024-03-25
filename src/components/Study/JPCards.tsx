import React, { useState } from 'react';
import {ArrowBigLeft, ArrowBigRight, CircleDot, Circle} from "lucide-react"

interface dbWord {
    word: string;
    example_sentences?: string[];
    freq: number;
    jlpt?: number;
    meanings: string[];
    pronunciation: string;
    type: string;
  }

type cardProps = {
    words: dbWord[];
    decNum: () => void;
    incrNum: () => void;
}

export default function JPCards(props: cardProps) {
    const [curIndex, setCurIndex] = useState(0);
    const [curNum, setCurNum] = useState(1);
    const [isFlipped, setisFlipped] = useState<Array<boolean>>(Array(props.words.length).fill(false))

    function ShowPrevImg() {
        setCurIndex(index => {
            if (index === 0) return index
            props.decNum()
            return index - 1
        })
    }

    function ShowNextImg() {
        setCurIndex(index => {
            if (index === props.words.length -1) return index
            props.incrNum()
            return index + 1
        })
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

    return(
        <div className="w-[100%] h-[100%] relative z-0 flex">
            <button onClick={ShowPrevImg} className="img-slider-btn">
                <ArrowBigLeft/>
            </button>
            <div className="w-[100%] h-[100%] flex overflow-hidden mx-20 items-center">
                {props.words.map((word: any, index: number) => (
                    <div key={index} className='img-transition flex justify-center min-w-full transform transition-all duration-300' style={{translate: `${-100 * curIndex}%`}}>
                    <div className="transform transition-all duration-300">
                    {word ? (
                  <div className='flashcard transform transition-all duration-300 bg-white hover:bg-slate-50' onClick={() => flipCard(index)}>
                    {!isFlipped[index] && <div className='front select-none'>
                        <p className='font-bold text-xl'>{word.pronunciation}</p>
                        <h2 className='font-bold text-5xl'>{word.word || '-'}</h2>
                    </div>}
                    {isFlipped[index] && <div>
                        <ul>
                        {word.meanings.slice(0,4).map((sense: any, index: number) => (
                            <li key={index}>{sense}</li>
                        ))}
                        </ul>
                        <p className='mt-5 font-semibold text-xl'>Usage:</p>
                        <ul>
                        {word.example_sentences?.slice(0,4).map((sense: any, index: number) => (
                            <li key={index}>"{sense}"</li>
                        ))}
                        </ul>
                    </div>}
                  </div>
                ) : (
                    <div className='flashcard transform transition-all duration-300 bg-white hover:bg-slate-50'>
                        <p>Loading...</p>
                    </div>
                )}
                </div>
                </div>
                ))}
            </div>
            <button onClick={ShowNextImg} className="img-slider-btn">
                <ArrowBigRight/>
            </button>

        </div>
    )
}