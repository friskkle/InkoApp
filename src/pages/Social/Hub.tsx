import React from 'react'
import Header from '../../components/Header'
import Sidebar from '../../components/Social/SocialSidebar'
import Feed from '../../components/Social/Feed'

function Hub() {
  return (
    <div className="flex flex-col bg-indigo-100 min-h-screen select-none">
      <Header title='Social'/>
      <div className='flex max-[720px]:flex-col'>
        <Sidebar/>
        <Feed/>
      </div>
    </div>
  )
}

export default Hub
