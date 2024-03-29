import React from 'react'
import JapaneseWord from '../../components/Study/JapaneseParse'
import { useNavigate } from 'react-router-dom'

export default function JapaneseLearn() {
    const navigate = useNavigate()

    const goBack = async (e: any) => {
        navigate('/vocabulary')
    }
    
    return (
    <div className='p-10 bg-indigo-100 min-h-screen'>
        <button onClick={goBack} className='back-button w-20 p-2 select-none transition-all inline-block text-black font-bold rounded cursor-pointer bg-gradient-to-r from-slate-50 to-slate-100 hover:text-white hover:from-slate-400 hover:to-slate-500 focus:bg-indigo-900 transform hover:-translate-y-0 hover:shadow-lg'>
                    Return
        </button>
        <div className='mt-5'>
            <JapaneseWord/>
        </div>
    </div>
  )
}
