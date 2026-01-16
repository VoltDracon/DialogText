/* eslint-disable react/prop-types */
export default function ReadableCard({ readable }) {
  return (
    <div className='bg-gray-300 border-4 border-black rounded-3xl min-h-[200px] w-[calc(25%-10px)] m-[5px]'>
      <a
        className='block h-full'
        href={`/DialogText/assets/Readable/EN/${readable.filename}`}
      >
        <p className='mt-2 font-bold text-center'>{readable.title}</p>
      </a>
    </div>
  )
}
