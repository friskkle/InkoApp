import React, { useEffect, useState } from 'react'
import NewPost from './NewPost'
import { Query, Timestamp, collection, getDocs, orderBy, query } from 'firebase/firestore';
import { firestore } from '../../firebase';
import Post from './Post';

function Feed() {
  const [ posts, setPosts ] = useState<any>([]);
  const [update, setUpdate] = useState(1)
  const ref = collection(firestore, "posts")

  const getPosts = async (postQuery: Query) => {
    const querySnapshot = await getDocs(postQuery);

    if(!querySnapshot.empty){
      setPosts(querySnapshot.docs.map((doc) => ({id: doc.id, data: doc.data()})))
    }
  }

	useEffect(() => {
    console.log("fetching new posts...")
    
    const postQuery = query(ref, orderBy('timestamp', 'desc'));
    getPosts(postQuery);

    setInterval(() => {
      getPosts(postQuery);
    },5000)
	}, [update]);
  return (
    <div className='feed flex-1 flex-col justify-center items-center p-10'>
      <NewPost setPost={setUpdate} post={update}/>
      {posts.map((post: { id: React.Key | null | undefined; data: { profilePic: string; message: string; timestamp: Timestamp; username: string; }; }) => (
				<Post
					key={post.id}
					profilePic={post.data.profilePic}
					message={post.data.message}
					timestamp={post.data.timestamp}
					username={post.data.username}
				/>
			))}
    </div>
  )
}

export default Feed
