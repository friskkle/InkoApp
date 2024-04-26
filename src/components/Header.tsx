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
    <div className="Header bg-white p-6 font-semibold shadow-sm relative flex justify-between items-center">
      <span className="w-auto cursor-pointer bg-indigo-100 hover:bg-indigo-200 p-2 rounded-xl font-bold hover:shadow-sm transition duration-150" onClick={() => navigate('/home')}>INKO</span>
      <div className="absolute right-0 left-0 justify-self-center">{props.title}</div>
      <span
        className="w-auto flex items-center justify-center gap-1"
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
