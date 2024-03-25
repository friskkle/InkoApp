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
        <div className='z-0 bg-slate-400 h-[100vh] w-[100vw]'>
            <div className='navbar bg-slate-50 p-6 font-semibold justify-center'>
                <div className='inline-block'>
                    Inko
                    <img src={Duolingo} className='logo inline h-[20px] w-[30px]'/>
                </div>
                <div id='nav-elements' className='float-right inline-block'>
                    <div className='logged-out inline-block px-1'>
                        <a href='/login'>Login</a>
                    </div>
                    <div className='logged-out inline-block px-1'>
                        <a href='/signup'>Sign Up</a>
                    </div>
                </div>
            </div>
            <div className='main-body flex flex-row p-10 w-full justify-center'>
                <h1 className='text-4xl font-bold'>Welcome to Inko!</h1>
            </div>
        </div>
    )
}
