import React from "react";
import TagFacesIcon from "@mui/icons-material/TagFaces";
import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { firestore } from "../firebase";
import { Description } from "@mui/icons-material";

const levelThreshold = (curLevel: number) => {
    return Math.floor(Math.pow((curLevel + 1) / 0.5, 1.8));
};

const Levelup = async (uid: string, name: string, level: number, exp: number) => {
    let lev = level;
    if (exp >= levelThreshold(level)) {
      lev = Math.floor(Math.pow((exp)*0.287, 0.556));
      
      // announce this level up on the social page
      await addDoc(collection(firestore, "posts"), {
        title: "Level Up!",
        message: `${name} has just leveled up to level ${lev}!`,
        timestamp: serverTimestamp(),
        profilePic: '',
        username: 'Inko',
        url: "",
        img: "",
        uid: 'inkobaseuid',
        likes: [],
      })

      if (lev >= 5) {
        const docRef = doc(firestore, `users/${uid}/achievements`, 'lvl5');
        const docTest = await getDoc(docRef);

        if(docTest.exists()) {
          console.log("Nothing to see here.")
        }
        else{
            await setDoc(doc(firestore, `users/${uid}/achievements`, 'lvl5'), {
            obtained: serverTimestamp(),
            type: 'Level 5',
            description:'Reached level 5 and unlocked the social features!'
          })
        }
      }
    }
    
    console.log(exp)
    console.log(lev)
    return lev;
};

export default Levelup;
