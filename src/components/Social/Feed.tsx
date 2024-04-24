import React, { useContext, useEffect, useState } from "react";
import NewPost from "./NewPost";
import {
    Query,
    Timestamp,
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    where,
} from "firebase/firestore";
import { firestore } from "../../firebase";
import Post from "./Post";
import { Context } from "../../context/AuthContext";

interface userData {
    name: string;
    daily: boolean;
    dailyquiz: boolean;
    bio: string;
    exp: number;
    email: string;
    uid: string;
    hsk: number;
    jlpt: number;
    joindate: Timestamp;
    new: boolean;
    jwlevel: number;
    zhlast: string;
    username: string;
    photoUrl: string;
    following: string[];
    followers: string[];
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

function Feed() {
    const { user } = useContext(Context);

    const [posts, setPosts] = useState<any>([]);
    const [update, setUpdate] = useState(1);
    const [mode, setMode] = useState("All");
    const [followColor, setFollowColor] = useState("#dbe3ff");
    const [allColor, setAllColor] = useState("white");

    const usersRef = collection(firestore, "users");
    const ref = collection(firestore, "posts");

    const getPosts = async (mode: string) => {
        const myRef = doc(usersRef, user.uid);
        const userDoc = await getDoc(myRef);
        let followingList: any = []

        if (userDoc.exists()) {
            const docData = userDoc.data() as userData;
            docData.following.forEach((str) => {
                const strSplit = str.split(',');
                followingList.push(strSplit[0])
            })
        }

        let postQuery: any = "";
        if (mode == "All") postQuery = query(ref, orderBy("timestamp", "desc"));
        else if (mode == "Following")
            postQuery = query(
                ref,
                orderBy("timestamp", "desc"),
                where("uid", "in", followingList)
            );
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

    useEffect(() => {
        console.log("fetching new posts...");

        getPosts(mode);

        const checkPosts = setInterval(() => {
            getPosts(mode);
        }, 5000);

        return () => {
            clearInterval(checkPosts);
        };
    }, [update, mode]);
    return (
        <div className="feed flex flex-1 flex-col justify-center items-center p-10">
            <NewPost setPost={setUpdate} post={update} />
            <div className="flex flex-auto w-1/2 mt-3 p-2 gap-2 bg-indigo-200 rounded-xl">
                <div
                    onClick={() => {
                        setAllColor("white");
                        setFollowColor("#dbe3ff");
                        setMode("All")
                    }}
                    className="py-1 flex-1 rounded-[10px] text-center shadow-sm cursor-pointer"
                    style={{ backgroundColor: `${allColor}` }}
                >
                    All
                </div>
                <div
                    onClick={() => {
                        setAllColor("#dbe3ff");
                        setFollowColor("white");
                        setMode("Following")
                    }}
                    className="py-1 flex-1 rounded-[10px] text-center shadow-sm cursor-pointer"
                    style={{ backgroundColor: `${followColor}` }}
                >
                    Following
                </div>
            </div>
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
    );
}

export default Feed;
