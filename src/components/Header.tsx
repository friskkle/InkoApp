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

function Header() {
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
      <span className="w-auto cursor-pointer" onClick={() => navigate('/home')}>Inko</span>
      <span className="inline-block">Center</span>
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
