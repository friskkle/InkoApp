import React, { useContext, useEffect, useState } from "react";
import Header from "../../components/Header";
import Post from "../../components/Social/Post";
import { Query, Timestamp, addDoc, collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore";
import { firestore, storage } from "../../firebase";
import Sidebar from "../../components/Social/SocialSidebar";
import { Context } from "../../context/AuthContext";
import { Avatar, TextareaAutosize } from "@mui/material";
import WebIcon from '@mui/icons-material/Web';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate, useParams } from "react-router-dom";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import PostComment from "../../components/Social/PostComment";

interface postData {
    title: string;
    profilePic: string;
    username: string;
    timestamp: Timestamp;
    message: string;
    uid: string;
    url: string;
    img: string;
    likes: string[];
}

interface commentData {
    postId: string;
    username: string;
    message: string;
    profilePic: string;
    uid: string;
    timestamp: Timestamp;
    img: string;
    likes: string[];
}

const PostPage = () => {
    const { postId } = useParams();
    const { user } = useContext(Context);
    const navigate = useNavigate();
    const commentRef = collection(firestore, `posts/${postId}/comments`);

    const [post, setPost] = useState<postData>();
    const [comments, setComments] = useState<any>([]);
    const [input, setInput] = useState("");
    const [img, setImg] = useState<any>("");
    const [imgUrl, setImgUrl] = useState<any>("");
    const [key, setKey] = useState(5);

    const getPost = async () => {
        const postRef = collection(firestore, "posts");

        const docRef = doc(postRef, postId);
        const postDoc = await getDoc(docRef);
        if (postDoc.exists()) {
            const docData = postDoc.data() as postData;
            setPost(docData);
        } else console.error("No data found!");
    };

    const getComments = async (postQuery: Query) => {
        const querySnapshot = await getDocs(postQuery);
    
        if(!querySnapshot.empty){
          const postArray: any = []
          querySnapshot.docs.forEach((doc) => {
            let data = doc.data() as commentData
            data.postId = doc.id
            postArray.push({id: doc.id, data: data})
          })
          setComments(postArray)
        }
      }

    const handleUpload = async () => {
        if (!img) {
          return
        } else {
          console.log("uploading image");
          var time = new Date()
          const timeName = Date.parse(time.toString())
          const storageRef = ref(storage, `/post-pictures/${user.uid}${timeName}`);
    
          const uploadTask = uploadBytesResumable(storageRef, img);
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const percent = Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              );
              console.log(`image ${percent}% uploaded`);
            },
            (err) => console.error(err),
            () => {
              // download url
              getDownloadURL(uploadTask.snapshot.ref).then(async (url) => {
                await addDoc(collection(firestore, `posts/${postId}/comments`), {
                  message: input,
                  timestamp: serverTimestamp(),
                  profilePic: user.photoURL,
                  username: user.displayName,
                  img: url,
                  uid: user.uid,
                  likes: [],
                });
              });
            }
          );
        }
      }

    const handleSubmit = async (e: any) => {
        e.preventDefault(); //preventing for a refresh
        if(img)
        await handleUpload()
        else
        await addDoc(collection(firestore, `posts/${postId}/comments`), {
            message: input,
            timestamp: serverTimestamp(),
            profilePic: user.photoURL,
            username: user.displayName,
            img: "",
            uid: user.uid,
            likes: [],
        });

        // DB stuff
        //resetting the values
        setInput("");
        setImg("");
        setImgUrl("");
        setKey(key + 1);
    };

    const handlePic = (e: any) => {
        setImg(e.target.files[0]);
        setImgUrl(URL.createObjectURL(e.target.files[0]))
    };

    const goBack = () => {
        navigate(-1);
    }

    useEffect(() => {
        getPost();

        const commentsQuery = query(commentRef, orderBy('timestamp', 'desc'))
        getComments(commentsQuery);

        setInterval(() => {
            getPost();
            getComments(commentsQuery);
        }, 5000);
    }, []);
    if(!postId) {
        console.error("Post ID is undefined");
        return (
            <div>
                Post not found!
            </div>
        )
    }
    else return (
        <div className="flex flex-col bg-indigo-100 min-h-screen select-none relative">
            <Header title="Post" />
            <div className="pl-12 pt-10">
                <button onClick={goBack} className='back-button w-20 p-2 transition-all inline-block text-black font-bold rounded cursor-pointer bg-gradient-to-r from-slate-50 to-slate-100 hover:text-white hover:from-slate-400 hover:to-slate-500 focus:bg-indigo-900 transform hover:-translate-y-0 hover:shadow-lg'>
                    Return
                </button>
            </div>
            <div className="flex max-[720px]:flex-col w-full">
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
                            postId={postId}
                            url={post.url}
                            img={post.img}
                            likes={post.likes}
                            full={true}
                        />
                    )}
                    
                    {/* Comments section */}
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
                        <div>
                            {comments.map((comment: {id: React.Key | null | undefined; data: {postId: string; profilePic: string; message: string; timestamp: Timestamp; username: string; uid: string; img: string; likes: string[];};}) => (
                                <PostComment
                                    key={comment.id}
                                    postId={comment.data.postId}
                                    username={comment.data.username}
                                    profilePic={comment.data.profilePic}
                                    timestamp={comment.data.timestamp}
                                    message={comment.data.message}
                                    uid={comment.data.uid}
                                    img={comment.data.img}
                                    likes={comment.data.likes}
                                    parentId={postId}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostPage;
