import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, firestore, db, storage } from "../../firebase";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
} from "@mui/material";
import { Context } from "../../context/AuthContext";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import Header from "../../components/Header";
import Badge from "../../components/Badge";

interface userData {
  name: string;
  daily: boolean;
  dailyquiz: boolean;
  bio: string;
  exp: number;
  email: string;
  uid: string;
  hsk: number;
  jlpt: number;
  joindate: Timestamp;
  level: number;
  new: boolean;
  jwlevel: number;
  zhlast: string;
}

interface achievementData {
  description: string;
  obtained: Timestamp;
  type: string;
}

function Profile() {
  const { user } = useContext(Context);
  const navigate = useNavigate();

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const [userInfo, setUserInfo] = useState<userData>();
  const [achievements, setAchievements] = useState<any>([]);
  const [bio, setBio] = useState("No bio set yet");
  const [isHovered, setIsHovered] = useState(false);
  const [file, setFile] = useState<any>("");
  const [edit, setEdit] = useState<boolean>(false);
  const [newName, setNewName] = useState("");
  const [picToast, setPicToast] = useState(false);
  const [infoToast, setInfoToast] = useState(false);
  const [nameEmpty, setNameEmpty] = useState(false);
  const [change, setChange] = useState(false);
  const [threshold, setThreshold] = useState(0);

  const usersRef = collection(firestore, "users");
  const badgeRef = collection(firestore, `users/${user.uid}/achievements`)

  const getAchievements = async () => {
    const docs = await getDocs(badgeRef);
    if(!docs.empty){
      const docList: any = []
      docs.docs.forEach((doc) => {
        let data = doc.data();
        const badgeId = doc.id;
        docList.push({id: badgeId, data: data})
      })

      setAchievements(docList);
    }
  }

  const getUserInfo = async (uid: string) => {
    const docRef = doc(usersRef, uid);
    const userDoc = await getDoc(docRef);

    if (userDoc.exists()) {
      const docData = userDoc.data() as userData;
      setUserInfo(docData);
      if (docData.bio) setBio(docData.bio);
      if (docData.name) setNewName(docData.name)
      if (docData.exp) setThreshold(levelThreshold(docData.level + 1))
    } else {
      console.log("No user data found!");
    }
  };
  
  const levelThreshold = (curLevel: number) => {
      return Math.floor(Math.pow(curLevel/0.5, 1.8));
  }

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  function handleChange(event: any) {
    setFile(event.target.files[0]);
    setShowConfirmationModal(true);
  }

  const handleEdit = () => {
    setEdit(true);
  };

  const cancelEdit = () => {
    setEdit(false);
    setNameEmpty(false);
  };

  const confirmEdit = async () => {
    if (newName == "") {
      setNameEmpty(true);
    } else if (userInfo) {
      setNameEmpty(false);
      await updateDoc(doc(firestore, "users", userInfo.uid), {
        name: newName,
        bio: bio,
      });
      setInfoToast(true);
      setEdit(false);
      setChange(!change);
    }
  };

  const toSocialProfile = async () => {
    navigate(`/social/profile/${userInfo?.uid}`)
  }

  const handleUpload = () => {
    setShowConfirmationModal(false);

    if (!file) {
      alert("Please upload an image first!");
    } else {
      console.log("uploading image");
      const storageRef = ref(storage, `/profile-pictures/${user.uid}`);

      const uploadTask = uploadBytesResumable(storageRef, file);
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
            if (auth.currentUser) {
              await updateProfile(auth.currentUser, {
                photoURL: url,
              });
              if(userInfo) {
                await updateDoc(doc(firestore, "users", userInfo.uid), {
                photoUrl: url,
              });
            }
            }
          });

          setPicToast(true);
          setChange(!change);
        }
      );
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        getUserInfo(uid);
        getAchievements();
      } else {
        console.log("user is logged out");
      }
    });
  }, [change]);
  return (
    <div className="flex flex-col bg-indigo-100 min-h-screen select-none">
      <Header title="Profile"/>
      <div className="flex mt-10 pb-10 justify-center select-text">
        <div className="bg-white rounded-md overflow-hidden w-1/2 max-[426px]:w-2/3 transform transition-all duration-500">
          <div className="flex max-[768px]:flex-col flex-row gap-0">
            <div className="flex flex-col items-center w-1/2 max-[768px]:w-full py-10 text-center text-white font-bold bg-gradient-to-tr from-[#f6d365] to-[#fda085]">
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
                <input
                  type="file"
                  className="absolute top-0 bottom-0 left-0 right-0 w-full h-full opacity-0"
                  onChange={handleChange}
                  accept="/image/jpg, image/png"
                />
              </div>
              <div className="mt-3 flex flex-col items-center">
                {nameEmpty && (
                  <p className="text-red-600">Your name cannot be empty</p>
                )}
                {edit ? (
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    placeholder="Display Name"
                    className="rounded p-2 w-2/3 mt-1 bg-white text-gray-900 focus:border-indigo-400 focus:outline-none focus:ring focus:ring-indigo-100"
                  />
                ) : (
                  <p className="text-xl">{userInfo?.name}</p>
                )}
                <p>@{user.displayName}</p>
                <p>Level {userInfo?.level}</p>
                <p>{userInfo?.exp}/{threshold} exp</p>
                <p className="mt-2">JLPT N{userInfo?.jlpt}</p>
                <p>HSK {userInfo?.hsk}</p>
                {edit ? (
                  <div className="mt-2 flex gap-2 max-[425px]:flex-col">
                    <Button
                      variant="contained"
                      color="error"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </Button>
                    <Button variant="contained" onClick={confirmEdit}>
                      Confirm
                    </Button>
                  </div>
                ) : (
                  <div
                    className="mt-2 cursor-pointer hover:shadow-md transition-all hover:translate-y-[-2px] duration-200 rounded-xl"
                    onClick={handleEdit}
                  >
                    <EditOutlinedIcon
                      sx={{
                        color: "black",
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        minWidth: 35,
                        minHeight: 35,
                        p: 0.5,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col flex-1 py-10 px-5">
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
              <div className="mt-5 flex-1">
                <p className="font-bold">Bio</p>
                <div className="w-full h-[2px] bg-black" />
                <div className="mt-2 h-full">
                  {edit ? (
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      required
                      placeholder="Display Name"
                      className="rounded p-2 w-full mt-1 overflow-clip h-[90%] bg-white text-gray-900 outline outline-gray-200 focus:border-indigo-400 focus:outline-none focus:ring focus:ring-indigo-100"
                    />
                  ) : (
                    <p>{bio}</p>
                  )}
                </div>
              </div>
              {!edit &&<Button variant="contained" onClick={toSocialProfile}>
                Social Page
              </Button>}
            </div>
          </div>
        </div>
      </div>
      <div className="achievements flex items-center justify-center">
        <div className="flex flex-col w-1/2 bg-white rounded-xl p-7">
          <h1 className="font-bold text-xl">Achievements</h1>
          <div className="w-full mt-5">
            {achievements.map((badge: {
              id: React.Key | undefined | null;
              data: {
                description: string;
                obtained: Timestamp;
                type: string;
              }
            }) => (
              <div key={badge.id}>
                <Badge description={badge.data.description} obtained={badge.data.obtained} type={badge.data.type}/>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Dialog
        open={showConfirmationModal}
        onClose={() => {
          setShowConfirmationModal(false);
        }}
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
          <Button
            onClick={() => {
              setShowConfirmationModal(false);
            }}
            sx={{ color: "red" }}
          >
            Cancel
          </Button>
          <Button onClick={handleUpload} sx={{ fontWeight: "bold" }} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={picToast}
        autoHideDuration={3000}
        onClose={() => setPicToast(false)}
        message="Profile picture changed."
      />
      <Snackbar
        open={infoToast}
        autoHideDuration={3000}
        onClose={() => setInfoToast(false)}
        message="Information updated."
      />
    </div>
  );
}

export default Profile;
