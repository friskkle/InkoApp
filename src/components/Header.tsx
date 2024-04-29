import { Timestamp } from "firebase/firestore";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileMenu from "./ProfileMenu";
import { Context } from "../context/AuthContext";
import { Avatar } from "@mui/material";

interface userData {
  name: string;
  uid: string;
  hsk: number;
  jlpt: number;
  joindate: Timestamp;
  new: boolean;
  jwlevel: number;
  zhlast: string;
}

function Header(props: {title: string}) {
  const navigate = useNavigate();
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const { user } = useContext(Context);

  const handleMouseEnter = () => {
    setDropdownVisible(true);
  };

  const handleMouseLeave = () => {
    setDropdownVisible(false);
  };

  return (
    <div className="Header bg-white p-4 font-semibold shadow-sm relative flex justify-between items-center">
      <span className="w-auto cursor-pointer from-indigo-100 to-indigo-100 bg-gradient-to-r hover:from-indigo-200 hover:to-indigo-400 p-2 rounded-xl font-bold hover:shadow-sm transition duration-500" onClick={() => navigate('/home')}>INKO</span>
      <div className="absolute right-0 left-0 justify-self-center">{props.title}</div>
      <span
        className="w-auto flex p-1 rounded-xl items-center justify-center gap-1 hover:bg-slate-50"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {user.displayName}
        <Avatar src={user.photoURL}/>
        {isDropdownVisible && <ProfileMenu />}
      </span>
    </div>
  );
}

export default Header;
