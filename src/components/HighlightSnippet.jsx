/* eslint-disable react/prop-types */
export default function HighlightSnippet({ text, highlightTxt }) {
  if (!highlightTxt) return <p className="ml-5">{text}</p>

  const escaped = highlightTxt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  const parts = text.split(regex)

  return (
    <p className="ml-5">
      {parts.map((part, i) =>
        part.match(regex) ? (
          <span key={i} className="bg-yellow-300">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  )
}
