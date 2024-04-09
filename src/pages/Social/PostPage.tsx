import React, { useContext, useEffect, useState } from "react";
import Header from "../../components/Header";
import Post from "../../components/Social/Post";
import { Timestamp, collection, doc, getDoc } from "firebase/firestore";
import { firestore } from "../../firebase";
import Sidebar from "../../components/Social/SocialSidebar";
import { Context } from "../../context/AuthContext";
import { Avatar, TextareaAutosize } from "@mui/material";
import WebIcon from '@mui/icons-material/Web';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";

interface propType {
    postId: string;
}

interface postData {
    title: string;
    profilePic: string;
    username: string;
    timestamp: Timestamp;
    message: string;
    uid: string;
    img: string;
    likes: string[];
}

const PostPage = (props: propType) => {
    const { user } = useContext(Context);

    const [post, setPost] = useState<postData>();
    const [input, setInput] = useState("");
    const [img, setImg] = useState<any>("");
    const [imgUrl, setImgUrl] = useState<any>("");
    const [key, setKey] = useState(5);

    const getPost = async () => {
        const postRef = collection(firestore, "posts");

        const docRef = doc(postRef, props.postId);
        const postDoc = await getDoc(docRef);
        if (postDoc.exists()) {
            const docData = postDoc.data() as postData;
            setPost(docData);
        } else console.error("No data found!");
    };

    const handleSubmit = () => {
        return;
    };

    const handlePic = (e: any) => {
        setImg(e.target.files[0]);
        setImgUrl(URL.createObjectURL(e.target.files[0]))
    }

    useEffect(() => {
        getPost();

        setInterval(() => {
            getPost();
        }, 5000);
    }, []);

    return (
        <div className="flex flex-col bg-indigo-100 min-h-screen select-none relative">
            <Header title="Post" />
            <div className="flex w-full">
                <Sidebar />
                <div className="flex flex-col p-10 w-full">
                    {post && (
                        <Post
                            title={post.title}
                            profilePic={post.profilePic}
                            message={post.message}
                            timestamp={post.timestamp}
                            username={post.username}
                            uid={post.uid}
                            postId={props.postId}
                            img={post.img}
                            likes={post.likes}
                            full={true}
                        />
                    )}
                    <div className="comments bg-white rounded-xl p-6 mt-4 shadow-sm">
                        <div className="messageSender__top flex flex-col border-b-black p-4">
                            <div className="ml-3 flex items-center">
                                <Avatar src={user.photoURL} />
                                <span className="ml-3 font-medium text-lg">Send a reply</span>
                            </div>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                }}
                            >
                                <div className="w-full">
                                    <div className="flex mt-2 items-center justify-items-center">
                                        <TextareaAutosize
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        className="messageSender__input w-[96%]"
                                        placeholder="Write your post here!"
                                        />
                                        <div
                                        onClick={handleSubmit}
                                        className="self-center p-2 bg-[#eff2f5] hover:bg-[#e4e7e9] rounded-full ml-auto"
                                        >
                                        <SendIcon color="secondary" />
                                        </div>
                                    </div>
                                    <div className="previews ml-[10px] mt-2">
                                        {img && (
                                            <div
                                                onClick={() => {
                                                    setImg("");
                                                    setImgUrl("");
                                                    setKey(key + 1);
                                                }}
                                            >
                                                <CloseIcon className="cursor-pointer" />
                                            </div>
                                        )}
                                        <img className="max-h-52" src={imgUrl} />
                                    </div>
                                </div>
                            </form>
                            <div className="messageSender__bottom cursor-pointer">
                                <div className="messageSender__option">
                                    <WebIcon style={{ color: "blue" }} />
                                    <h3>Site Link</h3>
                                </div>

                                <div className="messageSender__option relative cursor-pointer">
                                    <PhotoLibraryIcon style={{ color: "#27ae60" }} />
                                    <h3>Photo/Video</h3>
                                    <input
                                        key={key}
                                        type="file"
                                        className="absolute top-0 bottom-0 left-0 right-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handlePic}
                                        accept="/image/jpg, image/png"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostPage;
