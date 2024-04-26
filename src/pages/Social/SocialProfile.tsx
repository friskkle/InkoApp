import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth, firestore, db, storage } from "../../firebase";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import {
    Timestamp,
    arrayRemove,
    arrayUnion,
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    updateDoc,
    where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import {
    Avatar,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Snackbar,
} from "@mui/material";
import { Context } from "../../context/AuthContext";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import Header from "../../components/Header";
import Post from "../../components/Social/Post";
import Sidebar from "../../components/Social/SocialSidebar";

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

const SocialProfile = () => {
    const { username } = useParams();
    const { user } = useContext(Context);
    const navigate = useNavigate();

    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    const [userInfo, setUserInfo] = useState<userData>();
    const [posts, setPosts] = useState<any>([]);
    const [bio, setBio] = useState("No bio set yet");
    const [infoToast, setInfoToast] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [self, setSelf] = useState(false)

    const usersRef = collection(firestore, 'users');
    const postsRef = collection(firestore, 'posts');

    const getUserInfo = async (uid: string) => {
        const docRef = doc(usersRef, uid);
        const myRef = doc(usersRef, user.uid);
        const userDoc = await getDoc(docRef);
        const myDoc = await getDoc(myRef);

        if (userDoc.exists()) {
            const docData = userDoc.data() as userData;
            const myData = myDoc.data() as userData;
            setUserInfo(docData);
            if (docData.bio) setBio(docData.bio);

            // check if the current user is the same as the profile to prevent self following
            if (docData.uid === user.uid) {
                setSelf(true);
                console.log(self);
            }
            else {
                if (myData.following) {
                    if (myData.following.includes(`${docData.uid},${docData.photoUrl}`))
                        setIsFollowing(true);
                }
            }

            // collect the posts belonging to the profile
            const postQuery = query(postsRef, where("uid", "==", docData.uid), orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(postQuery);
            if (!querySnapshot.empty) {
                const postArray: any = []
                querySnapshot.docs.forEach((doc) => {
                    let data = doc.data() as postData
                    data.postId = doc.id
                    postArray.push({ id: doc.id, data: data })
                })
                setPosts(postArray)
            }
        } else {
            console.log("No user data found!");
        }
    };

    const handleFollow = async () => {
        if (isFollowing) {
            setIsFollowing(false)

            await updateDoc(doc(usersRef, user.uid), {
                following: arrayRemove(`${userInfo?.uid},${userInfo?.photoUrl}`)
            });
            await updateDoc(doc(usersRef, userInfo?.uid), {
                followers: arrayRemove(`${user.uid},${user.photoURL}`)
            })
        }
        else {
            setIsFollowing(true)

            await updateDoc(doc(usersRef, user.uid), {
                following: arrayUnion(`${userInfo?.uid},${userInfo?.photoUrl}`)
            });
            await updateDoc(doc(usersRef, userInfo?.uid), {
                followers: arrayUnion(`${user.uid},${user.photoURL}`)
            })
        }
    }

    useEffect(() => {
        if (username) getUserInfo(username);
        else console.error("no user info provided.");
    }, []);
    return (
        <div className="flex flex-col bg-indigo-100 min-h-screen select-none">
            <Header title="Profile" />
            <div className="flex max-[768px]:flex-col max-[768px]:items-center pb-10 select-text">
                <div className="min-[768px]:mr-auto"><Sidebar/></div>
                <div className="bg-white rounded-md mt-10 min-[768px]:mr-auto overflow-hidden max-[768px]:w-[90%] w-[60%] max-[426px]:w-2/3 transform transition-all duration-500">
                    <div className="flex flex-col gap-0">
                        <div className="flex flex-col items-center max-[768px]:w-full py-10 text-center text-white font-bold bg-gradient-to-tr from-purple-400 to-purple-500">
                            <div className="relative w-[75px] h-[75px] cursor-pointer">
                                <Avatar src={userInfo?.photoUrl} sx={{ width: 75, height: 75 }} />

                            </div>
                            <div className="mt-3 flex flex-col items-center">
                                {!self && (isFollowing ?
                                    <button onClick={handleFollow} className="p-2 bg-[#fc4040] shadow-sm font-bold text-black rounded-xl select-none cursor-pointer hover:bg-[#f22e2e] active:scale-95 duration-75">
                                        Unfollow
                                    </button> :
                                    <button onClick={handleFollow} className="p-2 bg-gray-100 shadow-sm font-bold text-black rounded-xl select-none cursor-pointer hover:bg-white active:scale-95 duration-75">
                                        Follow
                                    </button>)}
                                <p className="text-xl">{userInfo?.name}</p>
                                <p>@{userInfo?.username}</p>
                                <p>{userInfo?.exp} exp</p>
                                <p className="mt-2 text-xl text-orange-200">JLPT N{userInfo?.jlpt} | HSK {userInfo?.hsk}</p>
                                <p></p>
                            </div>
                            <div>
                                <div className="mt-2">
                                    <p>
                                        Joined: {userInfo?.joindate.toDate().toDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="p-5 flex-1">
                                <p className="font-bold">Bio</p>
                                <div className="w-full mt-2 h-[2px] bg-white" />
                                <div className="mt-2 h-full">
                                    <p>{bio}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="posts p-8">
                        <span className="text-xl font-bold">Posts</span>
                        {posts.map((post: { id: React.Key | null | undefined; data: { title: string; postId: string; profilePic: string; message: string; timestamp: Timestamp; username: string; uid: string; url: string; img: string; likes: string[]; }; }) => (
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
                        ))}
                    </div>
                </div>
            </div>
            <Dialog
                open={showConfirmationModal}
                onClose={() => {
                    setShowConfirmationModal(false);
                }}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <DialogTitle id="upload-confirmation">
                    {"Confirm Profile Picture Upload?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="upload-confirmation-desc">
                        Are you sure you want to change your profile picture?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setShowConfirmationModal(false);
                        }}
                        sx={{ color: "red" }}
                    >
                        Cancel
                    </Button>
                    <Button onClick={() => { }} sx={{ fontWeight: "bold" }} autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={infoToast}
                autoHideDuration={3000}
                onClose={() => setInfoToast(false)}
                message="Information updated."
            />
        </div>
    )
}

export default SocialProfile
