/* eslint-disable react/prop-types */
export default function HighlightTextLanguage({ id, text, translatedtext, highlightTxt }) {
  const renderHighlightedText = (rawText, highlight) => {
    if (!highlight) return [rawText];

    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');

    return rawText.split(regex).map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-300">{part}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <>
      <p className="ml-5 mb-5 font-bold">{id}</p>
      <p className="ml-5 mb-5">{translatedtext}</p>
      <p className="ml-5">
        {renderHighlightedText(text, highlightTxt)}
      </p>
    </>
  );
}
