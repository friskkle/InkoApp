import { useContext } from "react";
import { Context } from "../../context/AuthContext";
import { Avatar } from "@mui/material";
import EmojiFlagsIcon from '@mui/icons-material/EmojiFlags';
import PeopleIcon from '@mui/icons-material/People';
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate } from "react-router-dom";

function SidebarRow( {src, Icon, title} ) {
    return (
        <div className="sidebarRow flex items-center p-[10px] cursor-pointer hover:bg-gray-200 rounded-lg">
            {/* if there's a src, pass in the src prop */}
            {src && <Avatar src={src}  />} 
            
            {/* if an icon is passed, passing component as a prop (capitalised icon)*/}
            {Icon && <Icon />}

            <h4>{title}</h4>
        </div>
    )
}

function Sidebar() {
	const { user } = useContext(Context);
    const navigate = useNavigate();

	return (
		<div className="sidebar sticky p-10">
			<div onClick={()=>{navigate(`/social/profile/${user.uid}`)}}><SidebarRow src={user.photoURL} title={user.displayName} /></div>
			<div onClick={()=>{navigate(`/social`)}}><SidebarRow Icon={EmojiFlagsIcon} title="Topics" /></div>
			<div onClick={()=>{navigate(`/social/${user.uid}/following`)}}><SidebarRow Icon={PeopleIcon} title="Following" /></div>
			<div onClick={()=>{navigate(`/social`)}}><SidebarRow Icon={ChatIcon} title="Messages" /></div>
		</div>
	);
}

export default Sidebar;
