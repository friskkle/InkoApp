import React, { useContext, useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { collection, doc, setDoc, serverTimestamp, getDoc, FieldValue, Timestamp, query, orderBy, getDocs, limit } from "firebase/firestore";
import { firestore } from "../../firebase";
import Header from "../../components/Header";
import { Context } from "../../context/AuthContext";
import Post from "../../components/Social/Post";

const dayStreak = 5;

interface userData {
  name: string;
  uid: string;
  hsk: number;
  jlpt: number;
  joindate: FieldValue;
  level: number;
  new: boolean;
  jwlevel: number;
  zhlast: string;
  daily: boolean;
  dailyquiz: boolean;
}

interface postData {
  title: string;
  postId: string;
  profilePic: string;
  username: string;
  timestamp: Timestamp;
  message: string;
  uid: string;
  url: string;
  img: string;
  likes: string[];
}

const Home: React.FC = () => {
  const navigate = useNavigate();

  const [posts, setPosts] = useState<any>([]);
  const [userInfo, setUserInfo] = useState<userData>();
  const [daily, setDaily] = useState("Available");
  const [dailyQuiz, setDailyQuiz] = useState("Available");

  const usersRef = collection(firestore, 'users');
  const ref = collection(firestore, "posts");

  const getPosts = async () => {
    const postQuery = query(ref, orderBy("timestamp", "desc"), limit(3));
    const querySnapshot = await getDocs(postQuery);

    if (!querySnapshot.empty) {
        const postArray: any = [];
        querySnapshot.docs.forEach((doc) => {
            let data = doc.data() as postData;
            data.postId = doc.id;
            postArray.push({ id: doc.id, data: data });
        });
        setPosts(postArray);
    }
};

  const getUserInfo = async (uid: string) => {
    const docRef = doc(usersRef, uid);
    const userDoc = await getDoc(docRef);
    if (userDoc.exists()){
      const docData = userDoc.data() as userData
      if(docData.new === true)
        navigate('/newuser')
      setUserInfo(docData)
      if(docData.daily === true)
        setDaily("Completed!")
      if(docData.dailyquiz === true)
        setDailyQuiz("Completed!")
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
        getPosts()
      } else {
        console.log("user is logged out");
      }
    });
  }, []);

  return (
    <div className="App flex flex-col bg-gradient-to-b from-indigo-100 to-indigo-200 min-h-screen select-none">
      <Header title="Home"/>
      <div className="content flex max-[768px]:flex-col p-5 gap-5">
        <div className="status flex flex-1 flex-col">
          <div className="streak flex flex-row text-black text-xl p-3 justify-evenly">
            <div className="day-streak mx-1 flex flex-col text-center">
              <span className="font-bold bg-white rounded-xl p-2">{dayStreak}</span>
              <span className="text-base font-semibold">Day streak</span>
            </div>
            <div className="day-streak mx-1 flex flex-col text-center">
              <span className="font-bold bg-white rounded-xl p-2">
                HSK{userInfo?.hsk || 0}, N{userInfo?.jlpt || 0}
              </span>
              <span className="text-base font-semibold">Level</span>
            </div>
          </div>
          <div className="progress block bg-white rounded-xl p-5 shadow-md">
            <p className="font-bold text-2xl">Daily Missions</p>
          </div>
          <div className="glossary p-5 bg-white mt-2 rounded-xl">
            <ul>
              <li className="flex p-1 justify-between rounded-md hover:bg-slate-50">
                <span>Study one vocabulary lesson: </span> 
                <span className="font-semibold">{daily}</span>
              </li>
              <li className="flex p-1 justify-between rounded-md hover:bg-slate-50">
                <span>Complete one quiz: </span>
                <span className="font-semibold">{dailyQuiz}</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="today flex flex-1 h-fit flex-col p-8 text-blue-500 bg-white rounded-xl shadow-md">
          <h1 className="text-5xl font-bold">TODAY</h1>
          <h1>Here are your tasks for today, keep up the good work!</h1>
          <div className="tasks flex flex-col mt-3">
            <div className="cards columns-2 items-center">
              <a href="/vocabulary">
                <div 
                  className="bg-[#fed7aa] hover:bg-orange-300 rounded-xl p-4 mb-4 text-black leading-10 m-2 text-4xl max-[768px]:text-3xl transition ease-[0.2s]">
                  Vocabulary flashcards
                </div>
              </a>
              <a href="/quiz">
                <div
                  className="hover:bg-[#CDDFA0] bg-[#e2f3b8] rounded-xl p-4 mb-4 text-black leading-10 m-2 text-4xl max-[768px]:text-3xl transition ease-[0.2s]">
                  Quiz
                </div>
              </a>
              <a href="/social">
                <div
                  className="bg-purple-100 hover:bg-[#BD9DDE] rounded-xl p-4 mb-4 text-black leading-10 m-2 text-4xl max-[768px]:text-3xl transition ease-[0.2s]">
                  Social Hub
                </div>
              </a>
              <a href="/wallet">
                <div
                  className="bg-green-100 hover:bg-green-200 rounded-xl p-4 mb-4 text-black leading-10 m-2 text-4xl max-[768px]:text-3xl transition ease-[0.2s]">
                  Wallet
                </div>
              </a>
              <a href="/profile">
                <div
                  className="bg-[#fcf6bd] hover:bg-[#eae4aa] rounded-xl p-4 mb-4 text-black leading-10 m-2 text-4xl max-[768px]:text-3xl transition ease-[0.2s]">
                  Achievements
                </div>
              </a>
            </div>
          </div>
        </div>
        <div className="stats flex flex-1 flex-col gap-[15px]">
          <h1 className="text-5xl font-bold p-5 bg-white rounded-xl shadow-md">Recent Posts</h1>
          <div className="statblocks block">
          {posts.map(
                (post: {
                    id: React.Key | null | undefined;
                    data: {
                        title: string;
                        postId: string;
                        profilePic: string;
                        message: string;
                        timestamp: Timestamp;
                        username: string;
                        uid: string;
                        url: string;
                        img: string;
                        likes: string[];
                    };
                }) => (
                    <Post
                        key={post.id}
                        title={post.data.title}
                        profilePic={post.data.profilePic}
                        message={post.data.message}
                        timestamp={post.data.timestamp}
                        username={post.data.username}
                        uid={post.data.uid}
                        postId={post.data.postId}
                        url={post.data.url}
                        img={post.data.img}
                        likes={post.data.likes}
                        full={false}
                    />
                )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
