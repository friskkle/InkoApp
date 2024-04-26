import React from "react";
import { signOut } from "firebase/auth";
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

const ProfileMenu: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {               
        signOut(auth).then(() => {
        // Sign-out successful.
            navigate("/");
            console.log("Signed out successfully")
        }).catch((error: any) => {
          console.error(error)
        });
      }
      
    const openAccount = () => {
      navigate('/profile')
    }

    const openSettings = () => {
      navigate('/settings')
    }

  return (
    <div className="dropdown-menu z-10 fixed mt-40 bg-white shadow-sm rounded-[10px] overflow-hidden text-center transition-all duration-100 ease-linear">
      <ul>
        <li className="hover:bg-slate-50 hover:cursor-pointer focus:ring px-5 py-2" onClick={openAccount}>Profile</li>
        <li className="hover:bg-slate-50 hover:cursor-pointer focus:ring px-5 py-2" onClick={openSettings}>Settings</li>
        <li className="hover:bg-slate-50 hover:cursor-pointer focus:ring px-5 py-2" onClick={handleLogout}>Logout</li>
      </ul>
    </div>
  );
};

export default ProfileMenu;