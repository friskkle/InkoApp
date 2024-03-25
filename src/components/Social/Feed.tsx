import React, { useEffect, useState } from 'react'
import NewPost from './NewPost'
import { Timestamp, collection, getDocs, orderBy, query } from 'firebase/firestore';
import { firestore } from '../../firebase';
import Post from './Post';

function Feed() {
  const [ posts, setPosts ] = useState<any>([]);
  const ref = collection(firestore, "posts")

  const getPosts = async () => {
    const postQuery = query(ref, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(postQuery);

    if(!querySnapshot.empty){
      setPosts(querySnapshot.docs.map((doc) => ({id: doc.id, data: doc.data()})))
    }
  }

	useEffect(() => {
    console.log("fetching new posts...")
    getPosts()
	}, [posts]);
  return (
    <div className='feed flex-1 flex-col justify-center items-center p-10'>
      <NewPost/>
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
