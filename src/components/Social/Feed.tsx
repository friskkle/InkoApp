import React, { useEffect, useState } from 'react'
import NewPost from './NewPost'
import { Query, Timestamp, collection, getDocs, orderBy, query } from 'firebase/firestore';
import { firestore } from '../../firebase';
import Post from './Post';

interface postData {
  title: string;
  postId: string;
  profilePic: string;
  username: string;
  timestamp: Timestamp;
  message: string;
  uid: string;
  url: string;
  img: string;
  likes: string[];
}

function Feed() {
  const [ posts, setPosts ] = useState<any>([]);
  const [update, setUpdate] = useState(1)
  const ref = collection(firestore, "posts")

  const getPosts = async (postQuery: Query) => {
    const querySnapshot = await getDocs(postQuery);

    if(!querySnapshot.empty){
      const postArray: any = []
      querySnapshot.docs.forEach((doc) => {
        let data = doc.data() as postData
        data.postId = doc.id
        postArray.push({id: doc.id, data: data})
      })
      setPosts(postArray)
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
      {posts.map((post: { id: React.Key | null | undefined; data: { title: string; postId: string; profilePic: string; message: string; timestamp: Timestamp; username: string; uid: string; url: string; img: string; likes: string[];}; }) => (
				<Post
					key={post.id}
          title = {post.data.title}
					profilePic={post.data.profilePic}
					message={post.data.message}
					timestamp={post.data.timestamp}
					username={post.data.username}
          uid={post.data.uid}
          postId={post.data.postId}
          url={post.data.url}
          img={post.data.img}
          likes={post.data.likes}
          full={false}
				/>
			))}
    </div>
  )
}

export default Feed
