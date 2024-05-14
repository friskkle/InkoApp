import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '../../firebase';
import Duolingo from '../../assets/img/duolingo_2.gif'

export default function Start() {
    const navigate = useNavigate();

    useEffect(()=>{
        onAuthStateChanged(auth, (user) => {
            if (user) {
              console.log("user is already logged in")
              navigate('/home')
            } else {
              console.log("user is logged out")
            }
          });
         
    }, [])
    
    return (
        <div className='z-0 bg-gradient-to-b from-[#c7d2fe65] to-indigo-200 h-[100vh] w-[100vw]'>
            <div className='navbar bg-slate-50 p-6 font-semibold justify-center'>
                <div className='inline-block'>
                    Inko
                    <img src={Duolingo} className='logo inline h-[20px] w-[30px]'/>
                </div>
                <div id='nav-elements' className='float-right inline-block'>
                    <div className='logged-out inline-block px-1 hover:bg-slate-100 rounded-lg'>
                        <a href='/login'>Login</a>
                    </div>
                    <span className='select-none'> | </span>
                    <div className='logged-out inline-block px-1 hover:bg-slate-100 rounded-lg'>
                        <a href='/signup'>Sign Up</a>
                    </div>
                </div>
            </div>
            <div className='main-body flex flex-col p-10 w-full items-center justify-center'>
                <h1 className='text-4xl font-bold'>Welcome to Inko!</h1>
                <h2 className='mt-10 text-2xl font-semibold'>Are you ready to improve your vocabulary with others?</h2>
            </div>
        </div>
    )
}
