import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

export default function ReadableViewer() {
  const { lang, filename } = useParams()
  const [content, setContent] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const decoded = decodeURIComponent(filename || "")
    fetch(`/DialogText/assets/Readable/${lang}/${decoded}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Readable not found")
        }
        return res.text()
      })
      .then((text) => {
        setContent(text)
        setError("")
      })
      .catch((err) => {
        setError(err.message || "Failed to load readable")
      })
  }, [lang, filename])

  if (error) {
    return <div className="p-4">Error: {error}</div>
  }

  if (!content) {
    return <div className="p-4">Loading readable...</div>
  }

  return (
    <div className="p-4">
      <pre className="whitespace-pre-wrap font-serif">{content}</pre>
    </div>
  )
}
