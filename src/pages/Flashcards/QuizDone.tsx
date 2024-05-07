import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { firestore } from "../../firebase";
import { Context } from "../../context/AuthContext";
import { userInfo } from "os";
import Levelup from "../../components/LevelupHandle";

interface Stats {
    score: number;
    curExp: number;
    exp: number;
}

interface userData {
    dailyquiz: boolean;
    level: number;
    name: string;
    exp: number;
}

const QuizDone = (props: Stats) => {
    const { user } = useContext(Context);
    const navigate = useNavigate();

    const [daily, setDaily] = useState(false);
    const [bonus, setBonus] = useState(0);
    const [level, setLevel] = useState(0)

    const usersRef = collection(firestore, 'users');

    const levelThreshold = (curLevel: number) => {
        return Math.floor(Math.pow(curLevel/0.5, 1.8));
    }

    const getUserInfo = async (uid: string) => {
        const docRef = doc(usersRef, uid);
        const userDoc = await getDoc(docRef);
        if (userDoc.exists()){
        const docData = userDoc.data() as userData
        if(docData.dailyquiz === false){
            setDaily(true);
            setBonus(10);
            let lev = await Levelup(user.uid, docData.name, docData.level, props.curExp + props.exp + 10)
            setLevel(lev);
            await updateDoc(docRef, {
                dailyquiz: true,
                exp: props.curExp + props.exp + 10,
                level: lev
            })
            }
        else {
            let lev = await Levelup(user.uid, docData.name, docData.level, props.curExp+props.exp)
            setLevel(lev)
            await updateDoc(docRef, {
                dailyquiz: true,
                exp: props.curExp + props.exp,
                level: lev
            })
        }
        }
        else {
        console.log("No user data found!");
        }
    }

    const onSubmit = () => {
        navigate("/home");
    };

    useEffect(() => {
        getUserInfo(user.uid)
    }, [])
    return (
        <div className="bg-[#bababa7b] h-full w-full absolute top-0 left-0 p-40">
            <div className="p-10 h-fit w-1/2 m-auto bg-white absolute left-0 right-0 top-0 bottom-0 rounded-xl font-bold shadow-xl text-center select-text">
                <p className="text-xl">Your score is {props.score}</p>
                <p>Exp gained: {props.exp}</p>
                {daily && <p>Bonus daily exp: +10</p>}
                <p className="mt-5">Your exp: {props.curExp + props.exp + bonus}</p>
                <p>Your Level {level}</p>
                <button
                    className="mt-6 transition-all block py-3 px-4 w-full text-white font-bold rounded cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-400 hover:from-indigo-700 hover:to-purple-500 focus:bg-indigo-900 transform hover:-translate-y-1 hover:shadow-lg"
                    type="submit"
                    onClick={onSubmit}
                >
                    Done
                </button>
            </div>
        </div>
    );
};

export default QuizDone;
