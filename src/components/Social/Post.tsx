import React, { useContext, useEffect, useState } from "react";
import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar } from "@mui/material";
import { Timestamp, arrayRemove, collection, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../../firebase";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import NearMeIcon from '@mui/icons-material/NearMe';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Context } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface postData {
  title: string;
  postId: string;
  profilePic: string;
  username: string;
  timestamp: Timestamp;
  message: string;
  uid: string;
  img: string;
  likes: string[];
}

interface userData {
  name: string;
  bio: string;
  joindate: Timestamp;
}

function Post(props: postData) {
  const navigate = useNavigate()

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const { user } = useContext(Context)
  const [userInfo, setUserInfo] = useState<userData>()
  const [likeCount, setLikeCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [deleteToast, setDeleteToast] = useState(false)

  const usersRef = collection(firestore, 'users')

  const getUserInfo = async (uid: string) => {
    const docRef = doc(usersRef, uid);
    const userDoc = await getDoc(docRef);

    if (userDoc.exists()) {
      const docData = userDoc.data() as userData;
      setUserInfo(docData);
    } else {
      console.log("No user data found!");
    }
  };

  const handleLike = async () => {
    const postRef = collection(firestore, 'posts')
    if (props.likes) {
      if (props.likes.includes(user.uid)) {
        await updateDoc(doc(postRef, props.postId), {
          likes: arrayRemove(user.uid)
        })
        setLikeCount(likeCount - 1)
        return
      }
      await updateDoc(doc(postRef, props.postId), {
        likes: [...props.likes, user.uid]
      })
      setLikeCount(likeCount + 1)
    }
    else {
      await updateDoc(doc(postRef, props.postId), {
        likes: [user.uid]
      })
      setLikeCount(likeCount + 1)
    }
  }

  const openPost = () => {
    navigate('/home')
  }

  const openMenu = () => {
    setShowConfirmationModal(true)
  }

  const handleDelete = async () => {
    await deleteDoc(doc(firestore, "posts", props.postId))
    setDeleteToast(true)
  }

  useEffect(() => {
    getUserInfo(props.uid)

    if(props.likes)
      setLikeCount(props.likes.length)
    else
      setLikeCount(0)
  }, [props.likes, likeCount])

  return (
    <div className="post w-full mt-3 bg-white shadow-sm rounded-xl hover:bg-gray-50">
      <div className="post__top w-full flex relative items-center p-4 select-text" onClick={(e) => {e.stopPropagation()}}>
        <Avatar src={props.profilePic} className="post__avatar mr-3" />
        <div className="post__topInfo">
          <h3 className="inline">{userInfo?.name}</h3>
          <p className="text-xs ml-1 inline text-gray-400">@{props.username}</p>
          <p className="text-sm text-gray-400"> {new Date(props.timestamp?.toDate()).toUTCString()} </p>
        </div>
        <div className="ml-auto p-2 hover:bg-[#eff2f5] rounded-full transition duration-150" onClick={openMenu}>
          <MoreVertIcon/>
        </div>
      </div>
      <h1 className="pl-5 text-xl font-semibold">{props.title}</h1>
      <div className="post__bottom mt-2 mb-3 pl-5 pt-6 select-text text-lg cursor-default">
        <p onClick={(e) => {e.stopPropagation()}}>{props.message}</p>
        <img src={props.img} className="max-h-80 mt-3"/>
      </div>

      <div className="post__options gap-5 pt-3 border-t-1 border-solid border-gray-200 flex justify-evenly font-medium text-gray-300 cursor-pointer p-4">
        <div className="post__option flex items-center justify-center p-2 flex-1 hover:bg-[#eff2f5] rounded-xl transition duration-150"
          onClick={handleLike}>
          <ThumbUpIcon className="like2"/>
          <a className="ml-[10px]">{likeCount}</a>
        </div>

        <div className="post__option flex items-center justify-center p-2 flex-1 hover:bg-[#eff2f5] rounded-xl transition duration-150">
          <ChatBubbleOutlineIcon/>
          <p className="ml-[10px]">Comment</p>
        </div>

        <div className="post__option flex items-center justify-center p-2 flex-1 hover:bg-[#eff2f5] rounded-xl transition duration-150">
          <NearMeIcon/>
          <p className="ml-[10px]">Share</p>
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
        <DialogTitle id="delete-confirmation">
          {"Confirm Delete Post?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-confirmation-desc">
            Are you sure you want to delete this post?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowConfirmationModal(false);
            }}
            variant="text"
          >
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error" sx={{ fontWeight: "bold"}} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={deleteToast}
        autoHideDuration={3000}
        onClose={() => setDeleteToast(false)}
        message="Post deleted."
      />
    </div>
  );
}

export default Post;
