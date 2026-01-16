/* eslint-disable react/prop-types */
export default function HighlightText({ text, speaker, highlightTxt }) {
  const textString = text.replaceAll(highlightTxt, '<span class="bg-yellow-300">' + highlightTxt + '</span>')
  const speakerString = speaker.replaceAll(highlightTxt, '<span class="bg-yellow-300">' + highlightTxt + '</span>')
  const comWord = '<span class="font-bold">' + speakerString + '</span>' + ': ' + textString

  return <p className="ml-5" dangerouslySetInnerHTML={{ __html: comWord }} />
}
