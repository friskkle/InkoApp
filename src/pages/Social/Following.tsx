import React, { useContext, useEffect, useState } from "react";
import Header from "../../components/Header";
import QuizDone from "../Flashcards/QuizDone";
import { Context } from "../../context/AuthContext";
import { Timestamp, collection, doc, getDoc, getDocs } from "firebase/firestore";
import { firestore } from "../../firebase";
import ExpandedCard from "../../components/Wallet/ExpandedCard";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar } from "@mui/material";
import Sidebar from "../../components/Social/SocialSidebar";

interface wordData {
  frequency: number;
  last_studied: Timestamp;
  mastery: number;
  word: string;
}

interface userData {
    followers: string[];
    following: string[];
  }

const Following = () => {
  const { username } = useParams();
  const navigate = useNavigate();

  const [followed, setFollowed] = useState<string[]>([]);
  const [followedPics, setFollowedPics] = useState<string[]>([]);
  const [followers, setFollowers] = useState<string[]>([]);

  const getList = async () => {
    const collectionRef = collection(firestore, `users`);
    const userRef = doc(collectionRef, username);
    const userDoc = await getDoc(userRef);

    const followingList: any = []
    const followersList: any = []
    const followingPics: any = []
    const followersPics: any = []

    if (userDoc.exists()) {
        const docData = userDoc.data() as userData;
        docData.following.forEach((str) => {
            const strSplit = str.split(',')
            if (strSplit[0] != username){
            followingList.push(strSplit[0])
            followingPics.push(strSplit[1])
            }
        })
        setFollowed(followingList);
        setFollowedPics(followingPics);

        docData.followers.forEach((str) => {
            const strSplit = str.split(',')
            followersList.push(strSplit[0])
            followersPics.push(strSplit[1])
        })
        setFollowers(followersList);
      } else {
        console.error("No user data found!");
      }
    };

  useEffect(() => {
    getList();
  }, []);

  return (
    <div className="flex flex-col bg-indigo-100 min-h-screen select-none relative">
      <Header title="Following" />
      <div className="flex p-8 items-center">
        <Sidebar/>
        <div className="columns-4 w-2/3 gap-4 mt-5 bg-white rounded-2xl p-10">
          {followed.length ?
          followed.map((uid, index) => (
            <div
                key={index}
                className="hover:shadow-md h-fit w-fit rounded-full border-solid border-slate-400/10 border-2"
                onClick={() => {navigate(`/social/profile/${uid}`)}}>
                <Avatar src={followedPics[index]} style={{height: '5rem', width: '5rem'}}/>
            </div>
          )) :
          [24, 36, 36, 32, 32, 32, 16, 48, 64, 48, 24, 24, 32, 16, 48].map(
            (height, index) => (
              <div
                key={index}
                className={`mb-4 break-inside-avoid rounded-full border-slate-400/10 bg-neutral-100 p-4 dark:bg-neutral-900`}
                style={{ height: `${height / 4}rem` }}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Following;
