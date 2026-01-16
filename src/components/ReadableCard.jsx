/* eslint-disable react/prop-types */
export default function ReadableCard({ readable }) {
  const href = `/DialogText/readable/EN/${encodeURIComponent(readable.filename)}`

  return (
    <div className='bg-gray-300 border-4 border-black rounded-3xl min-h-[200px] w-[calc(25%-10px)] m-[5px]'>
      <a
        className='block h-full'
        href={href}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => {
          e.preventDefault()
          window.open(href, "_blank", "noopener,noreferrer")
        }}
      >
        <p className='mt-2 font-bold text-center'>{readable.title}</p>
      </a>
    </div>
  )
}
