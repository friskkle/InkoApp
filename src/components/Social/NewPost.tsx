import React, { useContext, useState } from "react";
import { Context } from "../../context/AuthContext";
import {
  FieldValue,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { firestore, storage } from "../../firebase";
import { Avatar, TextareaAutosize } from "@mui/material";
import WebIcon from '@mui/icons-material/Web';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';

function NewPost(props: {setPost: React.Dispatch<React.SetStateAction<number>>, post: number}) {
  const { user } = useContext(Context);

  const [key, setKey] = useState(1);
  const [title, setTitle] = useState("");
  const [input, setInput] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [img, setImg] = useState<any>("");
  const [imgUrl, setImgUrl] = useState<any>("");
  const [linkOpen, setLinkOpen] = useState(false)

  const handleUpload = async () => {
    if (!img) {
      return
    } else {
      console.log("uploading image");
      var time = new Date()
      const timeName = Date.parse(time.toString())
      const storageRef = ref(storage, `/post-pictures/${user.uid}${timeName}`);

      const uploadTask = uploadBytesResumable(storageRef, img);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const percent = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          console.log(`image ${percent}% uploaded`);
        },
        (err) => console.error(err),
        () => {
          // download url
          getDownloadURL(uploadTask.snapshot.ref).then(async (url) => {
            await addDoc(collection(firestore, "posts"), {
              title: title,
              message: input,
              timestamp: serverTimestamp(),
              profilePic: user.photoURL,
              username: user.displayName,
              url: linkUrl,
              img: url,
              uid: user.uid,
              likes: [],
            });
          });
        }
      );
    }
  }

  // post submission
  const handleSubmit = async (e: any) => {
    e.preventDefault(); //preventing a refresh
    if(img)
      await handleUpload()
    else
      await addDoc(collection(firestore, "posts"), {
        title: title,
        message: input,
        timestamp: serverTimestamp(),
        profilePic: user.photoURL,
        username: user.displayName,
        url: linkUrl,
        img: "",
        uid: user.uid,
        likes: [],
      });

    // DB stuff
    // resetting the values
    props.setPost(props.post + 1)
    setInput("");
    setTitle("");
    setImg("");
    setImgUrl("");
    setLinkUrl("");
  };

  const handlePic = (e: any) => {
    setImg(e.target.files[0]);
    setImgUrl(URL.createObjectURL(e.target.files[0]))
  }

  return (
    <div>
      <div className="messageSender mt-5 flex flex-col bg-white rounded-xl shadow-sm w-full">
        <div className="messageSender__top flex border-b-black p-4">
          <Avatar src={user.photoURL} />
          <form onSubmit={(e) => {e.preventDefault()}}>
            <div className="w-full">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="messageSender__input w-1/2"
                placeholder="Title"
              />
              <TextareaAutosize
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="messageSender__input w-[96%]"
                placeholder="Write your post here!"
              />
              {linkOpen && <input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="messageSender__input"
                placeholder="Insert article or video url"
              />}
              <div className="previews ml-[10px] mt-2">
                {img && <div onClick={() => {setImg(""); setImgUrl(""); setKey(key+1);}}><CloseIcon className="cursor-pointer"/></div>}
                <img className="max-h-52" src={imgUrl}/>
              </div>
            </div>
            <div onClick={handleSubmit} className="self-center p-2 bg-[#eff2f5] hover:bg-[#e4e7e9] rounded-full ml-auto">
              <SendIcon color="secondary"/>
            </div>
          </form>
        </div>

        <div className="messageSender__bottom cursor-pointer">
          <div className="messageSender__option" onClick={() => {setLinkOpen(!linkOpen); setLinkUrl("")}}>
            <WebIcon style={{ color: "blue" }} />
            <h3>Site Link</h3>
          </div>

          <div className="messageSender__option relative cursor-pointer">
            <PhotoLibraryIcon style={{ color: "#27ae60" }} />
            <h3>Photo/Video</h3>
            <input
                  key={key}
                  type="file"
                  className="absolute top-0 bottom-0 left-0 right-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handlePic}
                  accept="/image/jpg, image/png"
                />
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewPost;
