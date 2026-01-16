/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";

export default function MainQuest({ mainquest }) {
  return (
    <div className='bg-gray-300 border-4 border-black rounded-3xl min-h-[350px] w-[calc(25%-10px)] m-[5px]'>
      <Link className='block h-full' to={`/quest/${mainquest.questId}`}>
        <p className='mt-1 font-bold text-center'>{mainquest.chapterNum}</p>
        <p className='font-bold text-center'>{mainquest.chapterTitle}</p>
        <p className='font-bold text-center'>{mainquest.questTitle}</p>
        <p className='m-3'>{mainquest.questDesc}</p>
      </Link>
    </div>
  )
}
