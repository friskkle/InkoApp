import { useContext } from "react";
import { Context } from "../../context/AuthContext";
import { Avatar } from "@mui/material";
import EmojiFlagsIcon from '@mui/icons-material/EmojiFlags';
import PeopleIcon from '@mui/icons-material/People';
import ChatIcon from '@mui/icons-material/Chat';

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

	return (
		<div className="sidebar sticky p-10">
			<SidebarRow src={user.photoURL} title={user.displayName} />
			<SidebarRow Icon={EmojiFlagsIcon} title="Topics" />
			<SidebarRow Icon={PeopleIcon} title="Following" />
			<SidebarRow Icon={ChatIcon} title="Messages" />
		</div>
	);
}

export default Sidebar;
