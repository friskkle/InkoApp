import React, { useContext, useEffect, useState } from "react";
import Header from "../../components/Header";
import { Button } from "@mui/material";
import { Context } from "../../context/AuthContext";
import { Timestamp, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../../firebase";

interface userData {
    lesson_num: number;
    quiz_num: number;
}

const Settings = () => {
    const { user } = useContext(Context);

    const [lessonNum, setLessonNum] = useState(10);
    const [quizNum, setQuizNum] = useState(15);

    const userRef = collection(firestore, `users`);

    const getUserInfo = async () => {
        const docRef = doc(userRef, user.uid);
        const userDoc = await getDoc(docRef);

        if (userDoc.exists()) {
            const docData = userDoc.data() as userData;
            setLessonNum(docData.lesson_num);
            setQuizNum(docData.quiz_num);
        } else {
            console.log("No user data found!");
        }
    };

    const incrementLesson = () => {
        if(lessonNum >= 30) return
        setLessonNum(lessonNum + 1);
    }

    const decrementLesson = () => {
        if(lessonNum <= 10) return
        setLessonNum(lessonNum - 1);
    }

    const incrementQuiz = () => {
        if(quizNum >= 60) return
        setQuizNum(quizNum + 1);
    }

    const decrementQuiz = () => {
        if(quizNum <= 15) return
        setQuizNum(quizNum - 1);
    }

    const handleSave = async () => {
        await updateDoc(doc(userRef, user.uid), {
            lesson_num: lessonNum,
            quiz_num: quizNum
        })
    };

    useEffect(() => {
        getUserInfo();
    }, []);
    return (
        <div className="App flex flex-col bg-indigo-100 min-h-screen">
            <Header title="Settings" />
            <div className="flex mt-10 p-10 justify-center w-full">
                <div className="flex flex-col p-10 rounded-2xl gap-2 bg-slate-100 w-2/3 items-center">
                    <div className="bg-white p-3 rounded-xl w-full">
                        <div className="flex items-center justify-center w-full">
                            <label className="flex justify-between w-full items-center">
                            <p>Words per lesson</p>
                            <div className='input-number flex justify-center align-middle relative h-[40px] bg-[#6c6cff11] overflow-hidden rounded-[20px] m-[2px]'>
                                <button className='w-8 h-full bg-transparent border-none text-lg hover:bg-[#ffffff33] transition-transform ease-linear' type='button' onClick={decrementLesson}>-</button>
                                <span className='inline-block bg-white h-full w-[40px] rounded-[20px] text-center leading-9 text-base text-[#6C6DFF]'>{lessonNum}</span>
                                <button className='w-8 h-full bg-transparent border-none text-lg hover:bg-[#ffffff33] transition-transform ease-linear' type='button' onClick={incrementLesson}>+</button>
                            </div>
                            </label>
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-xl w-full">
                        <div className="flex items-center justify-center w-full">
                            <label className="flex justify-between w-full items-center">
                            <p>Words per quiz</p>
                            <div className='input-number flex justify-center align-middle relative h-[40px] bg-[#6c6cff11] overflow-hidden rounded-[20px] m-[2px]'>
                                <button className='w-8 h-full bg-transparent border-none text-lg hover:bg-[#ffffff33] transition-transform ease-linear' type='button' onClick={decrementQuiz}>-</button>
                                <span className='inline-block bg-white h-full w-[40px] rounded-[20px] text-center leading-9 text-base text-[#6C6DFF]'>{quizNum}</span>
                                <button className='w-8 h-full bg-transparent border-none text-lg hover:bg-[#ffffff33] transition-transform ease-linear' type='button' onClick={incrementQuiz}>+</button>
                            </div>
                            </label>
                        </div>
                    </div>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        sx={{ fontWeight: "bold" }}
                        autoFocus
                        style={{width: '50%', marginTop:'1rem'}}
                    >
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
