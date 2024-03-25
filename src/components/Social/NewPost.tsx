import React, { useContext, useState } from "react";
import { Context } from "../../context/AuthContext";
import {
  FieldValue,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { firestore } from "../../firebase";
import { Avatar } from "@mui/material";
import WebIcon from '@mui/icons-material/Web';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';


function NewPost() {
  const { user } = useContext(Context);

  const [input, setInput] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault(); //preventing for a refresh

    await addDoc(collection(firestore, "posts"), {
      message: input,
      timestamp: serverTimestamp(),
      profilePic: user.photoURL,
      username: user.displayName,
    });

    // DB stuff
    //resetting the values
    setInput("");
  };
  return (
    <div>
      <div className="messageSender mt-5 flex flex-col bg-white rounded-xl shadow-sm w-full">
        <div className="messageSender__top flex border-b-black p-4">
          <Avatar src={user.photoURL} />
          <form>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="messageSender__input"
              placeholder={`What's popping, ${user.displayName} ?`}
            />

            <button onClick={handleSubmit} type="submit">
              Hidden Submit
            </button>
          </form>
        </div>

        <div className="messageSender__bottom ">
          <div className="messageSender__option">
            <WebIcon style={{ color: "blue" }} />
            <h3>Site Link</h3>
          </div>

          <div className="messageSender__option">
            <PhotoLibraryIcon style={{ color: "#27ae60" }} />
            <h3>Photo/Video</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewPost;
