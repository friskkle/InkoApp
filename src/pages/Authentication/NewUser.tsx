import { FieldValue, collection, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { auth, firestore } from '../../firebase'
import { onAuthStateChanged, updateProfile } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'

const maxHsk = 6
const maxJlpt = 5

interface userData {
    name: string;
    uid: string;
    hsk: number;
    jlpt: number;
    joindate: FieldValue;
    new: boolean;
  }
export default function NewUser() {
    const navigate = useNavigate()
    
    const [uName, setUName] = useState('')
    const [name, setName] = useState('')
    const [hsk, setHsk] = useState(1)
    const [jlpt, setJlpt] = useState(5)
    const [uid, setUid] = useState('')
    const [empty, setEmpty] = useState(false)
    const [unEmpty, setUnEmpty] = useState(false)
    const [space, setSpace] = useState(false)

    const usersRef = collection(firestore, 'users')

    const getUserInfo = async (uid: string) => {
        const docRef = doc(usersRef, uid);
        const userDoc = await getDoc(docRef);
        if (userDoc.exists()){
          const docData = userDoc.data() as userData
          if (!docData.new)
            navigate("/home")
        }
        else {
          console.log("No user data found!")
          navigate("/")
        }
      }

    // set initial data with the ones the user has set
    const setData = async () => {
        if (auth.currentUser){
            updateProfile(auth.currentUser, {
                displayName: uName
            })
        }
        await updateDoc(doc(firestore, 'users', uid), {
            name: name,
            hsk: hsk,
            jlpt: jlpt,
            new: false
          })
    }

    const incrementHsk = () => {
        if(hsk + 1 > maxHsk)
            return
        setHsk(hsk + 1)
    }

    const decrementHsk = () => {
        if(hsk - 1 < 1)
            return
        setHsk(hsk - 1)
    }

    const incrementJlpt = () => {
        if(jlpt + 1 > maxJlpt)
            return
        setJlpt(jlpt + 1)
    }

    const decrementJlpt = () => {
        if(jlpt - 1 < 1)
            return
        setJlpt(jlpt - 1)
    }

    const onSubmit = async (e: any) => {
        e.preventDefault();
        
        if (name == '')
            setEmpty(true)
        else if(uName == '')
            setUnEmpty(true)
        else if(uName.includes(' '))
            setSpace(true)
        else{
            await setData()
            navigate("/home")
        }
      }

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
          if (user) {
            setUid(user.uid)
            getUserInfo(user.uid)
          } else {
            console.log("user is logged out");
          }
        });
      }, []);
  return (
    <main>        
        <section>
        <div className='main-container bg-gradient-to-b from-[#c7d2fe65] to-indigo-200 flex flex-col h-screen w-screen p-6'>
                <div className='self-center top-[20%] absolute border-t-8 rounded-sm border-indigo-600 bg-white p-12 shadow-2xl w-96'>                  
                    <h1 className='font-bold text-center block text-2xl'> Enter Your Information </h1>
                    <form>
                        <div>
                            {unEmpty && <p className='error-message text-red-600'>Username cannot be empty</p>}
                            {space && <p className='error-message text-red-600'>Username shouldn't have a space</p>}
                            <label className='text-gray-500 block mt-3'>
                                Username
                            <input
                                type="name"
                                value={uName}
                                onChange={(e) => setUName(e.target.value)}  
                                required                                    
                                placeholder="johnnylearning"
                                className='rounded px-4 py-3 w-full mt-1 bg-white text-gray-900 border border-gray-200 focus:border-indigo-400 focus:outline-none focus:ring focus:ring-indigo-100'
                            />
                            </label>
                        </div>
                        <div>
                            {empty && <p className='error-message text-red-600'>Name cannot be empty</p>}
                            <label className='text-gray-500 block mt-3'>
                                Display Name
                            <input
                                type="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}  
                                required                                    
                                placeholder="John Doe"
                                className='rounded px-4 py-3 w-full mt-1 bg-white text-gray-900 border border-gray-200 focus:border-indigo-400 focus:outline-none focus:ring focus:ring-indigo-100'
                            />
                            </label>
                        </div>
                        <div>
                            <label className='text-gray-500 block mt-3'>
                                HSK Level
                            <div className='input-number flex justify-center align-middle relative w-[100px] h-[40px] bg-[#6c6cff11] overflow-hidden rounded-[20px] m-[2px]'>
                                <button className='w-8 h-full bg-transparent border-none text-lg hover:bg-[#ffffff33] transition-transform ease-linear' type='button' onClick={decrementHsk}>-</button>
                                <span className='inline-block bg-white h-full w-[40px] rounded-[20px] text-center leading-9 text-base text-[#6C6DFF]'>{hsk}</span>
                                <button className='w-8 h-full bg-transparent border-none text-lg hover:bg-[#ffffff33] transition-transform ease-linear' type='button' onClick={incrementHsk}>+</button>
                            </div>
                            </label>
                        </div>
                        <div>
                            <label className='text-gray-500 block mt-3'>
                                JLPT Level
                            <div className='input-number flex justify-center align-middle relative w-[100px] h-[40px] bg-[#6c6cff11] overflow-hidden rounded-[20px] m-[2px]'>
                                <button className='w-8 h-full bg-transparent border-none text-lg hover:bg-[#ffffff33] transition-transform ease-linear' type='button' onClick={decrementJlpt}>-</button>
                                <span className='inline-block bg-white h-full w-[40px] rounded-[20px] text-center leading-9 text-base text-[#6C6DFF]'>{jlpt}</span>
                                <button className='w-8 h-full bg-transparent border-none text-lg hover:bg-[#ffffff33] transition-transform ease-linear' type='button' onClick={incrementJlpt}>+</button>
                            </div>
                            </label>
                        </div>
                        <button
                        className='mt-6 transition-all block py-3 px-4 w-full text-white font-bold rounded cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-400 hover:from-indigo-700 hover:to-purple-500 focus:bg-indigo-900 transform hover:-translate-y-1 hover:shadow-lg'
                            type="submit" 
                            onClick={onSubmit}>
                            Submit
                        </button>                                             
                    </form>                 
                </div>
            </div>
        </section>
    </main>
  )
}
