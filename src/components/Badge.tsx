import { Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';


interface badgeInfo {
    description: string;
    obtained: Timestamp;
    type: string;
}

const Badge = (props: badgeInfo) => {
    const [reveal, setReveal] = useState(false)

    const showDescription = () => {
        setReveal(true)
    }

    const hideDescription = () => {
        setReveal(false)
    }
  return (
    <div>
        <div className='h-14 w-14 flex items-center justify-center border-solid border-black border-2 rounded-full hover:bg-slate-100'
            onMouseEnter={showDescription}
            onMouseLeave={hideDescription}>
        {props.type == 'Level 5' && <AssignmentIndRoundedIcon style={{width: '2rem', height: '2rem'}}/>}
        </div>
        {reveal && <div className='bg-white p-2 z-10 rounded-md fixed overflow-hidden shadow-md'>
            <p>{props.description}</p>
            <p>Obtained: {props.obtained.toDate().toDateString()}</p>
        </div>}
    </div>
  )
}

export default Badge
