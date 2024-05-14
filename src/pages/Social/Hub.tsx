import React, { useContext, useEffect } from 'react'
import Header from '../../components/Header'
import Sidebar from '../../components/Social/SocialSidebar'
import Feed from '../../components/Social/Feed'
import { Context } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { collection, doc, getDoc } from 'firebase/firestore'
import { firestore } from '../../firebase'

interface userData {
  name: string;
  uid: string;
  hsk: number;
  jlpt: number;
  level: number;
  new: boolean;
  jwlevel: number;
  zhlast: string;
  daily: boolean;
  dailyquiz: boolean;
}

function Hub() {
  const { user, level } = useContext(Context);
  const navigate = useNavigate()
  const usersRef = collection(firestore, "users");

  const getUserInfo = async () => {
    const docRef = doc(usersRef, user.uid);
    const userDoc = await getDoc(docRef);
    if (userDoc.exists()) {
      const docData = userDoc.data() as userData;
      if (docData.new === true) navigate("/newuser");
      if (docData.level < 5) navigate("home");
    } else {
      console.log("No user data found!");
    }
  }

  useEffect(() => {
    getUserInfo()
  }, [])
  return (
    <div className="flex flex-col bg-indigo-100 min-h-screen select-none">
      <Header title='Social'/>
      <div className='flex max-[720px]:flex-col'>
        <Sidebar/>
        <Feed/>
      </div>
    </div>
  )
}

export default Hub
