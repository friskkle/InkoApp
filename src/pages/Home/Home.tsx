import React, { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { collection, doc, setDoc, serverTimestamp, getDoc, FieldValue } from "firebase/firestore";
import { firestore } from "../../firebase";
import Header from "../../components/Header";

const dayStreak = 5;

interface userData {
  name: string;
  uid: string;
  hsk: number;
  jlpt: number;
  joindate: FieldValue;
  new: boolean;
  jwlevel: number;
  zhlast: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<userData>()

  const usersRef = collection(firestore, 'users')

  const getUserInfo = async (uid: string) => {
    const docRef = doc(usersRef, uid);
    const userDoc = await getDoc(docRef);
    if (userDoc.exists()){
      const docData = userDoc.data() as userData
      if(docData.new === true)
        navigate('/newuser')
      setUserInfo(docData)
    }
    else {
      console.log("No user data found!")
    }
  }

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        getUserInfo(uid)
      } else {
        console.log("user is logged out");
      }
    });
  }, []);

  return (
    <div className="App flex flex-col bg-indigo-100 min-h-screen select-none">
      <Header title="Home"/>
      <div className="content flex max-[768px]:flex-col p-5 gap-5">
        <div className="status flex flex-auto flex-col">
          <div className="streak flex flex-row text-black text-xl p-5 justify-evenly">
            <div className="day-streak mx-1 flex flex-col text-center">
              <span className="font-bold">{dayStreak}</span>
              <span className="text-base">Day streak</span>
            </div>
            <div className="day-streak mx-1 flex flex-col text-center">
              <span className="font-bold">
                HSK{userInfo?.hsk || 0}, N{userInfo?.jlpt || 0}
              </span>
              <span className="text-base">Level</span>
            </div>
          </div>
          <div className="progress block bg-white rounded-xl p-5 w-[100%]">
            <div>Chapter 3</div>
            <a>Last Studied: Vocabulary part 4</a>
          </div>
          <div className="glossary p-5">
            <ul>
              <li>1. vocab 1, beginner kanji 1</li>
              <li>2. vocab 2, beginner kanji 2</li>
            </ul>
          </div>
        </div>
        <div className="today flex flex-auto flex-col p-5 text-blue-500 bg-white rounded-xl">
          <h1 className="text-5xl font-bold">TODAY</h1>
          <h1>Here are your tasks for today, keep up the good work!</h1>
          <div className="tasks flex flex-col mt-3 items-center">
            <div className="cards columns-2">
              <a href="/vocabulary">
                <div 
                  className="bg-orange-200 hover:bg-orange-300 rounded-xl p-4 mb-4 text-black leading-10 m-2 text-4xl max-[768px]:text-3xl transition ease-[0.2s]"
                  style={{height: `${'Vocabulary flashcards'.length/2}rem`, width: `${'Vocabulary flashcards'.length/1.6}rem`}}>
                  Vocabulary flashcards
                </div>
              </a>
              <a href="/quiz">
                <div
                  className="bg-green-100 hover:bg-green-200 rounded-xl p-4 mb-4 text-black leading-10 m-2 text-4xl max-[768px]:text-3xl transition ease-[0.2s]"
                  style={{height: `${'wallet'.length/1.4}rem`, width: `${'Vocabulary flashcards'.length/1.6}rem`}}>
                  Quiz
                </div>
              </a>
              <a href="/social">
                <div
                  className="bg-purple-100 hover:bg-purple-200 rounded-xl p-4 mb-4 text-black leading-10 m-2 text-4xl max-[768px]:text-3xl transition ease-[0.2s]"
                  style={{height: `${'Social Hub'.length/1.4}rem`, width: `${'Social Hub'.length}rem`}}>
                  Social Hub
                </div>
              </a>
              <a href="/wallet">
                <div
                  className="bg-green-100 hover:bg-green-200 rounded-xl p-4 mb-4 text-black leading-10 m-2 text-4xl max-[768px]:text-3xl transition ease-[0.2s]"
                  style={{height: `${'wallet'.length/1.15}rem`, width: `${'social hub'.length}rem`}}>
                  Wallet
                </div>
              </a>
            </div>
          </div>
        </div>
        <div className="stats flex flex-auto flex-col p-5 gap-[15px]">
          <h1 className="text-5xl font-bold">Statistics</h1>
          <div className="statblocks block gap-[10px]">
            <div className="inline square-stat bg-white rounded-lg min-h-[50px] min-w-[100px] p-3 mx-[10px]">
              Days
            </div>
            <div className="inline square-stat bg-white rounded-lg min-h-[50px] min-w-[100px] p-3 mx-[10px]">
              Lessons
            </div>
          </div>
          <h1 className="text-5xl font-bold mt-5">Calendar</h1>
        </div>
      </div>
    </div>
  );
};

export default Home;
