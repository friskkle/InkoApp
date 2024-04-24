import {
    Timestamp,
    addDoc,
    collection,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    where,
} from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { firestore } from "../../firebase";
import { TextareaAutosize } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { Context } from "../../context/AuthContext";
import WordComment from "./WordComment";

interface propType {
    word: string;
    pronunciation: string;
    setPopup: React.Dispatch<React.SetStateAction<boolean>>;
}

interface dbWord {
    word: string;
    example_sentences?: string[];
    freq: number;
    jlpt?: number;
    meanings: string[];
    pronunciation: string;
    type: string;
}

interface userExample {
    uid: string;
    docId: string;
    photoUrl: string;
    example: string;
    meaning: string;
    likes: string[];
    likeCount: number;
    timestamp: Timestamp;
}

const ExpandedCard = (props: propType) => {
    const { user } = useContext(Context);
    const wordsRef = collection(firestore, "japanese");
    const pattern = /(\d+\.)|〔([^〕]+)〕|〈([^〉]+)〉/g; // expression to format the meanings

    const [word, setWord] = useState<dbWord>();
    const [meanings, setMeanings] = useState("");
    const [wordId, setWordId] = useState("");
    const [input, setInput] = useState("");
    const [english, setEnglish] = useState("");
    const [change, setChange] = useState(1);
    const [userExamples, setUserExamples] = useState<any>([]);

    const getWordInfo = async () => {
        // get the word from the database
        const wordQuery = query(
            wordsRef,
            where("word", "==", props.word),
            where("pronunciation", "==", props.pronunciation),
            limit(1)
        );
        const wordSnapshot = await getDocs(wordQuery);
        let exQuery: any = ""; // set up the query to get user examples

        if (!wordSnapshot.empty) {
            wordSnapshot.forEach((doc) => {
                const data = doc.data() as dbWord;
                const meaningsString = data.meanings.join();
                setWord(data);
                setWordId(doc.id);

                // format the meanings to be more readable
                const formattedString = meaningsString.replace(
                    pattern,
                    (_match, p1, p2, p3) => {
                        if (p1) return `\n${p1}`;
                        else if (p2) return ` (${p2}) `;
                        else if (p3) return ` [${p3}] `;
                        return _match;
                    }
                );
                setMeanings(formattedString);

                // get the user submitted examples query
                const exRef = collection(
                    firestore,
                    `japanese/${doc.id}/userexamples`
                );
                exQuery = query(
                    exRef,
                    orderBy("timestamp", "desc"),
                    orderBy("likes_count", "desc")
                );
            });
        }

        // get user examples
        const exSnapshot = await getDocs(exQuery);
        if (!exSnapshot.empty) {
            const exContainer: any = [];
            exSnapshot.forEach((doc) => {
                const data = doc.data() as userExample;
                data.docId = doc.id;
                exContainer.push({ id: doc.id, data: data });
            });

            setUserExamples(exContainer);
        }
    };

    const handleSubmit = async (e: any) => {
        if (input == "") {
            return;
        } else if (english == "") {
            return;
        }
        e.preventDefault();
        await addDoc(collection(firestore, `japanese/${wordId}/userexamples`), {
            uid: user.uid,
            photoUrl: user.photoURL,
            example: input,
            meaning: english,
            likes: [],
            likes_count: 0,
            timestamp: serverTimestamp(),
        });
        setInput("");
        setEnglish("");
        setChange(change + 1)
    };

    useEffect(() => {
        getWordInfo();
    }, [change]);
    return (
        <div
            onClick={() => {
                props.setPopup(false);
            }}
            className="bg-[#bababa7b] h-full w-full absolute top-0 p-40"
        >
            <div
                onClick={(e) => {
                    e.stopPropagation();
                }}
                className="messageSender__top bg-white fixed w-2/3 h-fit max-h-full overflow-y-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-10 z-10 rounded-2xl text-center text-xl select-text"
            >
                <h1 className="font-bold text-5xl">{props.word}</h1>
                <p className="mt-2">
                    {meanings
                        .split("\n")
                        .slice(0, 6)
                        .map((item, key) => {
                            return (
                                <span key={key}>
                                    {item}
                                    <br />
                                </span>
                            );
                        })}
                </p>
                <ul className="mt-5">
                    <p className="font-bold">Examples</p>
                    {word?.example_sentences
                        ?.slice(0, 4)
                        .map((sense: any, index: number) => (
                            <li key={index}>"{sense}"</li>
                        ))}
                </ul>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                    }}
                >
                    <div className="w-full mt-8">
                        <p className="font-bold">Submit your own example or explanations!</p>
                        <div className="flex mt-2 items-center justify-items-center">
                            <TextareaAutosize
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="messageSender__input w-[96%]"
                                placeholder="Your sentence here!"
                            />
                            <TextareaAutosize
                                value={english}
                                onChange={(e) => setEnglish(e.target.value)}
                                className="messageSender__input w-[96%]"
                                placeholder="English translation here!"
                            />
                            <div
                                onClick={handleSubmit}
                                className="self-center p-2 bg-[#eff2f5] hover:bg-[#e4e7e9] rounded-full ml-auto"
                            >
                                <SendIcon color="secondary" />
                            </div>
                        </div>
                    </div>
                </form>
                <div>
                    {userExamples.map(
                        (example: {
                            id: React.Key | null | undefined;
                            data: {
                                uid: string;
                                docId: string;
                                photoUrl: string;
                                example: string;
                                meaning: string;
                                likes: string[];
                                likeCount: number;
                                timestamp: Timestamp;
                            };
                        }) => (
                            <WordComment 
                            key={example.id}
                            uid= {example.data.uid}
                            docId={example.data.docId}
                            photoUrl={example.data.photoUrl}
                            example={example.data.example}
                            meaning={example.data.meaning}
                            likes={example.data.likes}
                            likeCount={example.data.likeCount}
                            timestamp={example.data.timestamp}
                            parentId={wordId}/>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExpandedCard;
