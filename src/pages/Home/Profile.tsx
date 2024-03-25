import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, firestore, db, storage } from "../../firebase";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { Timestamp, collection, doc, getDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { Context } from "../../context/AuthContext";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import Header from "../../components/Header";

interface userData {
  name: string;
  email: string;
  uid: string;
  hsk: number;
  jlpt: number;
  joindate: Timestamp;
  new: boolean;
  jwlevel: number;
  zhlast: string;
}

function Profile() {
  const { user } = useContext(Context);
  const navigate = useNavigate();

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const [userInfo, setUserInfo] = useState<userData>();
  const [bio, setBio] = useState("No bio set yet");
  const [isHovered, setIsHovered] = useState(false);
  const [file, setFile] = useState<any>("");

  const usersRef = collection(firestore, "users");

  const getUserInfo = async (uid: string) => {
    const docRef = doc(usersRef, uid);
    const userDoc = await getDoc(docRef);

    if (userDoc.exists()) {
      const docData = userDoc.data() as userData;
      setUserInfo(docData);
    } else {
      console.log("No user data found!");
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  function handleChange(event: any) {
    setFile(event.target.files[0]);
    setShowConfirmationModal(true)
  }

  const handleUpload = () => {
    setShowConfirmationModal(false)

    if (!file) {
        alert("Please upload an image first!");
    }
    else{
      console.log('uploading image')
      const storageRef = ref(storage, `/profile-pictures/${user.uid}`);

      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
            const percent = Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            console.log(`image ${percent}% uploaded`)
        },
        (err) => console.error(err),
        () => {
            // download url
            getDownloadURL(uploadTask.snapshot.ref).then(async (url) => {
                if (auth.currentUser){
                  await updateProfile(auth.currentUser, {
                      photoURL: url
                  })
                }
            });
        }
    );
    }
  };

  useEffect(() => {
    console.log("fetching user info...")
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        getUserInfo(uid);
      } else {
        console.log("user is logged out");
      }
    });
  }, [user]);
  return (
    <div className="flex flex-col bg-indigo-100 min-h-screen select-none">
      <Header />
      <div className="flex mt-10 justify-center select-text">
        <div className="bg-white rounded-md overflow-hidden w-1/2">
          <div className="flex max-[640px]:flex-col flex-row gap-0">
            <div className="flex flex-col items-center max-[640px]:w-full w-1/2 py-10 text-center text-white font-bold bg-gradient-to-tr from-[#f6d365] to-[#fda085]">
              <div
                className="relative w-[75px] h-[75px] cursor-pointer"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Avatar src={user.photoURL} sx={{ width: 75, height: 75 }} />
                {isHovered && (
                  <PhotoLibraryIcon
                    sx={{ width: 25, height: 25 }}
                    className="absolute right-0 bottom-0"
                  />
                )}
                <input type="file" className="absolute top-0 bottom-0 left-0 right-0 w-full h-full opacity-0" onChange={handleChange} accept="/image/jpg, image/png"/>
              </div>
              <div className="mt-3 flex flex-col items-center">
                <p className="text-xl">{userInfo?.name}</p>
                <p>@{user.displayName}</p>
                <p className="mt-2">JLPT N{userInfo?.jlpt}</p>
                <p>HSK {userInfo?.hsk}</p>
                <EditOutlinedIcon className="mt-2" sx={{color: "black", bgcolor: 'background.paper', borderRadius: 2, minWidth: 35, minHeight: 35, p: 0.5}}/>
              </div>
            </div>
            <div className="flex flex-col py-10 px-5">
              <div>
                <p className="font-bold">Info</p>
                <div className="w-full h-[2px] bg-black" />
                <div className="mt-2">
                  <p>E-mail: {userInfo?.email}</p>
                  <p>
                    Joined since: {userInfo?.joindate.toDate().toDateString()}
                  </p>
                </div>
              </div>
              <div className="mt-5">
                <p className="font-bold">Bio</p>
                <div className="w-full h-[2px] bg-black" />
                <div className="mt-2">
                  <p>{bio}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Dialog
        open={showConfirmationModal}
        onClose={() => {setShowConfirmationModal(false)}}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <DialogTitle id="upload-confirmation">
          {"Confirm Profile Picture Upload?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="upload-confirmation-desc">
            Are you sure you want to change your profile picture?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {setShowConfirmationModal(false)}} sx={{color: 'red'}}>Cancel</Button>
          <Button onClick={handleUpload} sx={{fontWeight: 'bold'}} autoFocus>Confirm</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Profile;
