import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Vocabulary: React.FC = () => {
    const navigate = useNavigate()

    const goBack = async (e: any) => {
        navigate('/home')
    }
    return (
        <div className='p-10 z-0 bg-indigo-100 h-screen w-screen'>
            <button onClick={goBack} className='back-button w-20 p-2 transition-all inline-block text-black font-bold rounded cursor-pointer bg-gradient-to-r from-slate-50 to-slate-100 hover:text-white hover:from-slate-400 hover:to-slate-500 focus:bg-indigo-900 transform hover:-translate-y-0 hover:shadow-lg'>
                    Return
            </button>
            <div className='text-center text-5xl font-extrabold'>
                What would you like to study?
            </div>
            <div className="cards flex justify-evenly mt-9">
              <a href='/learnjp'>
                <div className="inline-block bg-white hover:bg-orange-300 h-[200px] w-[200px] rounded-xl p-4 text-black m-2 text-4xl transition ease-[0.2s]">
                  Japanese flashcards
                </div>
              </a>
              <a href='/learnzh'>
                <div className="inline-block bg-red-200 hover:bg-red-500 h-[200px] w-[200px] rounded-xl p-4 text-black m-2 text-4xl transition ease-[0.2s]">
                  Mandarin flashcards
                </div>
              </a>
            </div>
        </div>
    )
}

export default Vocabulary;