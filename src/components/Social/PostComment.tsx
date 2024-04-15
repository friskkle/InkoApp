import React, { useContext, useEffect, useState } from 'react'
import { Timestamp, arrayRemove, collection, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../firebase';
import { Context } from '../../context/AuthContext';
import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

interface commentData {
    postId: string;
    username: string;
    message: string;
    profilePic: string;
    uid: string;
    timestamp: Timestamp;
    img: string;
    likes: string[];
    parentId: string;
}

interface userData {
    name: string;
    bio: string;
    joindate: Timestamp;
}

const PostComment = (props: commentData) => {
    const { user } = useContext(Context);
    const usersRef = collection(firestore, 'users');

    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [deleteToast, setDeleteToast] = useState(false)
    const [likeCount, setLikeCount] = useState(0)

    const [userInfo, setUserInfo] = useState<userData>()

    const handleLike = async () => {
        const postRef = collection(firestore, `posts/${props.parentId}/comments`)
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

    const openMenu = () => {
        setShowConfirmationModal(true)
    }

    const handleDelete = async () => {
        await deleteDoc(doc(firestore, `posts/${props.parentId}/comments`, props.postId))
        setDeleteToast(true)
    }

    useEffect(() => {
        if(props.likes)
            setLikeCount(props.likes.length)
    }, [props.likes, likeCount])

    return (
        <div className='border-t-[1px] border-gray-200 border-solid'>
            <div className="post__top w-full flex relative items-center p-5 select-text" onClick={(e) => { e.stopPropagation() }}>
                <Avatar src={props.profilePic} className="post__avatar mr-3" />
                <div className="post__topInfo">
                    <h3 className="inline">{userInfo?.name}</h3>
                    <p className="text-xs ml-1 inline text-gray-400">@{props.username}</p>
                    <p className="text-sm text-gray-400"> {new Date(props.timestamp?.toDate()).toUTCString()} </p>
                </div>
                {user.uid === props.uid && <div className="ml-auto p-2 hover:bg-[#eff2f5] rounded-full transition duration-150" onClick={openMenu}>
                    <MoreVertIcon />
                </div>}
            </div>
            <div className='body flex px-5'>
                <span>{props.message}</span>
                <div className="post__option flex items-center ml-auto p-2 hover:bg-[#eff2f5] rounded-xl transition duration-150"
                    onClick={handleLike}>
                    <ThumbUpIcon className="like2"/>
                    <a className="ml-[10px]">{likeCount}</a>
                </div>
            </div>
            <div className='attachments p-5 pt-0'>
                <img src={props.img} className='max-h-36 mt-3'/>
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
                        Are you sure you want to delete this comment?
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
                    <Button onClick={handleDelete} variant="contained" color="error" sx={{ fontWeight: "bold" }} autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={deleteToast}
                autoHideDuration={3000}
                onClose={() => setDeleteToast(false)}
                message="Comment deleted."
            />
        </div>
    )
}

export default PostComment
