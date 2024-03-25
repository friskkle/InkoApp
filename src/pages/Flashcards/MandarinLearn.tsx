import React from 'react'
import MandarinWord from '../../components/Study/MandarinParse'
import { useNavigate } from 'react-router-dom'

export default function MandarinLearn() {
    const navigate = useNavigate()

    const goBack = async (e: any) => {
        navigate('/vocabulary')
    }
    return (
    <div className='p-10'>
        <button onClick={goBack} className='back-button w-20 p-2 transition-all inline-block text-black font-bold rounded cursor-pointer bg-gradient-to-r from-slate-50 to-slate-100 hover:text-white hover:from-slate-400 hover:to-slate-500 focus:bg-indigo-900 transform hover:-translate-y-0 hover:shadow-lg'>
                    Return
        </button>
        <div className='mt-5 px-10'>
            <MandarinWord/>
        </div>
    </div>
  )
}
