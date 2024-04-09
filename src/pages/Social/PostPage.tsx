import React from 'react'
import Header from '../../components/Header'

interface propType {
    postId: string;
}

const PostPage = (props: propType) => {
  return (
    <div className='flex flex-col bg-indigo-100 min-h-screen select-none relative'>
      <Header title='Post'/>
    </div>
  )
}

export default PostPage
