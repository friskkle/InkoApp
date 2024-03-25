import React from "react";
import { Avatar } from "@mui/material";
import { Timestamp } from "firebase/firestore";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import NearMeIcon from '@mui/icons-material/NearMe';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface postData {
  profilePic: string;
  username: string;
  timestamp: Timestamp;
  message: string;
}

function Post(props: postData) {
  return (
    <div className="post w-full mt-3 bg-white shadow-sm rounded-xl">
      <div className="post__top flex relative items-center p-4">
        <Avatar src={props.profilePic} className="post__avatar mr-3" />

        <div className="post__topInfo">
          <h3> {props.username}</h3>

          <p className="text-sm text-gray-400"> {new Date(props.timestamp?.toDate()).toUTCString()} </p>
        </div>
      </div>

      <div className="post__bottom mt-3 mb-3 pl-3 pt-6">
        <p>{props.message}</p>
      </div>

      <div className="post__options pt-3 border-t-1 border-solid border-gray-200 flex justify-evenly font-medium text-gray-300 cursor-pointer p-4">
        <div className="post__option flex items-center justify-center pl-2 pt-2 flex-1 hover:bg-[#eff2f5] rounded-xl">
          <ThumbUpIcon className="like2" />
          <p className="ml-[10px]">Like</p>
        </div>

        <div className="post__option flex items-center justify-center pl-2 pt-2 flex-1 hover:bg-[#eff2f5] rounded-xl">
          <ChatBubbleOutlineIcon />
          <p className="ml-[10px]">Comment</p>
        </div>

        <div className="post__option flex items-center justify-center pl-2 pt-2 flex-1 hover:bg-[#eff2f5] rounded-xl">
          <NearMeIcon />
          <p className="ml-[10px]">Share</p>
        </div>

        <div className="post__option flex items-center justify-center pl-2 pt-2 flex-1 hover:bg-[#eff2f5] rounded-xl">
          <AccountCircleIcon />
          <ExpandMoreIcon />
        </div>
      </div>
    </div>
  );
}

export default Post;
