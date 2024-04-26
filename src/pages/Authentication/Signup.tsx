import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, firestore } from "../../firebase";
import {
    getDocs,
    collection,
    doc,
    setDoc,
    serverTimestamp,
} from "firebase/firestore";

export default function Start() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [checkPass, setCheckPass] = useState("");
    const [wrongCred, setWrongCred] = useState(false);
    const [empty, setEmpty] = useState(false);

    const goHome = async (e: any) => {
        navigate("/home");
    };

    const initData = async (uid: string, email: string | null) => {
        await setDoc(doc(firestore, "users", uid), {
            bio: "",
            daily: false,
            dailyquiz: false,
            email: email,
            exp: 0,
            followers: [uid],
            following: [uid],
            hsk: 1,
            jlpt: 5,
            joindate: serverTimestamp(),
            jwlevel: 1,
            last_logged: serverTimestamp(),
            lesson_num: 10,
            name: "new user",
            new: true,
            quiz_num: 15,
            uid: uid,
            zhlast: "",
        });
    };

    const onSubmit = async (e: any) => {
        e.preventDefault();

        if (password != checkPass) setWrongCred(true);
        else if (email == "" || password == "" || checkPass == "")
            setEmpty(true);
        else {
            await createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // Signed in
                    const user = userCredential.user;
                    initData(user.uid, user.email);
                    navigate("/newuser");
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.log(errorCode);
                    // ..
                });
        }
    };
    return (
        <main>
            <section>
                <div className="main-container bg-gray-200 flex flex-col h-screen w-screen p-6">
                    <button
                        onClick={goHome}
                        className="back-button w-20 p-2 transition-all inline-block text-black font-bold rounded cursor-pointer bg-gradient-to-r from-slate-50 to-slate-100 hover:text-white hover:from-slate-400 hover:to-slate-500 focus:bg-indigo-900 transform hover:-translate-y-0 hover:shadow-lg"
                    >
                        Return
                    </button>
                    <div className="self-center top-[20%] absolute border-t-8 rounded-sm border-indigo-600 bg-white p-12 shadow-2xl w-96">
                        <h1 className="font-bold text-center block text-2xl">
                            {" "}
                            Create an Account{" "}
                        </h1>
                        <form>
                            {empty && (
                                <p className="error-message text-red-600">
                                    All fields should be filled
                                </p>
                            )}
                            <div>
                                <label className="text-gray-500 block mt-3">
                                    Email address
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        required
                                        placeholder="mail@address.com"
                                        className="rounded px-4 py-3 w-full mt-1 bg-white text-gray-900 border border-gray-200 focus:border-indigo-400 focus:outline-none focus:ring focus:ring-indigo-100"
                                    />
                                </label>
                            </div>
                            {wrongCred && (
                                <p className="error-message text-red-600">
                                    Passwords do not match
                                </p>
                            )}
                            <div>
                                <label className="text-gray-500 block mt-3">
                                    Password
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        required
                                        placeholder="Password"
                                        className="rounded px-4 py-3 w-full mt-1 bg-white text-gray-900 border border-gray-200 focus:border-indigo-400 focus:outline-none focus:ring focus:ring-indigo-100"
                                    />
                                </label>
                            </div>

                            <div>
                                <label className="text-gray-500 block mt-3">
                                    Re-enter Password
                                    <input
                                        type="password"
                                        value={checkPass}
                                        onChange={(e) =>
                                            setCheckPass(e.target.value)
                                        }
                                        required
                                        placeholder="Retype Password"
                                        className="rounded px-4 py-3 w-full mt-1 bg-white text-gray-900 border border-gray-200 focus:border-indigo-400 focus:outline-none focus:ring focus:ring-indigo-100"
                                    />
                                </label>
                            </div>

                            <button
                                className="mt-6 transition-all block py-3 px-4 w-full text-white font-bold rounded cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-400 hover:from-indigo-700 hover:to-purple-500 focus:bg-indigo-900 transform hover:-translate-y-1 hover:shadow-lg"
                                type="submit"
                                onClick={onSubmit}
                            >
                                Sign up
                            </button>
                        </form>

                        <p className="text-center mt-2">
                            Already have an account?{" "}
                            <NavLink to="/login" className="text-blue-700">
                                Sign in
                            </NavLink>
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
