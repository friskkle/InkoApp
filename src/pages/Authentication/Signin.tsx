import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase'

export default function Signin() {
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('');
    const [wrongCred, setWrongCred] = useState(false);

    const goHome = async (e: any) => {
        navigate('/')
    }

    const onLogin = (e: any) => {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            navigate("/home")
            console.log(user);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage)

            setWrongCred(true);
        });
       
    }
    return (
        <main>        
        <section>
            <div className='main-container bg-gray-200 flex flex-col h-screen w-screen p-6'>
                <button onClick={goHome} className='back-button w-20 p-2 transition-all inline-block text-black font-bold rounded cursor-pointer bg-gradient-to-r from-slate-50 to-slate-100 hover:text-white hover:from-slate-400 hover:to-slate-500 focus:bg-indigo-900 transform hover:-translate-y-0 hover:shadow-lg'>
                    Return
                </button>
                <div className='self-center top-[20%] absolute border-t-8 rounded-sm border-indigo-600 bg-white p-12 shadow-2xl w-96'>                  
                    <h1 className='font-bold text-center block text-2xl'> Log into Inko </h1>
                    <form className='mt-3'>
                    {wrongCred && <p className='error-message text-red-600'>Invalid email or password</p>}
                        <div>
                            <label className='text-gray-500 block mt-1'>
                                Email address
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}  
                                required                                    
                                placeholder="mail@address.com"
                                className='rounded px-4 py-3 w-full mt-1 bg-white text-gray-900 border border-gray-200 focus:border-indigo-400 focus:outline-none focus:ring focus:ring-indigo-100'
                            />
                            </label>
                        </div>

                        <div>
                            <label className='text-gray-500 block mt-3'>
                                Password
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} 
                                required                                 
                                placeholder="Password"
                                className='rounded px-4 py-3 w-full mt-1 bg-white text-gray-900 border border-gray-200 focus:border-indigo-400 focus:outline-none focus:ring focus:ring-indigo-100'
                            />
                            </label>
                        </div>                                             
                        
                        <button
                        className='mt-6 transition-all block py-3 px-4 w-full text-white font-bold rounded cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-400 hover:from-indigo-700 hover:to-purple-500 focus:bg-indigo-900 transform hover:-translate-y-1 hover:shadow-lg'
                            type="submit" 
                            onClick={onLogin}>
                            Log in                               
                        </button>                                             
                    </form>                
                </div>
            </div>
        </section>
    </main>
    )
}
