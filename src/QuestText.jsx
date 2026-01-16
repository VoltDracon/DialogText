import { useEffect, useState } from 'react'
import { useParams } from "react-router-dom";

const baseUrl = import.meta.env.BASE_URL;

export default function QuestText() {
  const {id} = useParams();
  const [questData, setQuestData] = useState([])
  const [error, setError] = useState("")
  const quest = questData.find((q) => q.questId === parseInt(id)) //find i
  const regex = /<color=#([0-9A-Fa-f]{8})>(.*?)<\/color>/g;

  useEffect(() => { //scroll to top
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    fetch(`${baseUrl}assets/extractedMainQuests.json`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load quest data")
        }
        return res.json()
      })
      .then(setQuestData)
      .catch((err) => {
        setError(err.message || "Failed to load quest data")
      })
  }, [])

  function removeColorTags(text) {
    
    // Replace matched patterns with just the text inside the tags
    const result = text.replace(regex, (match, p1, p2) => {
      // p2 is the captured text inside the <color> tags
      return p2;
    });
  
    return result;
  }

  function extractColorTags(text) {
    // Regular expression to match <color=#COLOR_CODE>{TEXT}</color> pattern
    const matches = [];
    let match;
    // Iterate over all matches
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        color: `#${match[1]}`, // Extracted color code
        text: match[2]          // Extracted text inside the tags
      });
    }
    return matches;
  }

  function renderOutput(){
    const sOut = [];
    if (!('questType' in quest)) {
      sOut.push(`<span class="font-bold">ID: ${quest.questId}, ?????</span>`);
      sOut.push(`<span>---${quest.chapterNum}, ${quest.chapterTitle}, ${quest.questTitle}---</span>`);
      return sOut;
    }
    sOut.push(`<span class="font-bold">ID: ${quest.questId}, ${quest.questType}</span>`);
    sOut.push(`<span class="font-bold">---${quest.chapterNum}, ${quest.chapterTitle}, ${quest.questTitle}---</span>`);
    sOut.push(`<span class="font-bold">Desc:</span> ${quest.questDesc}`);

    for (const subquest of quest.subQuestList) {
      sOut.push(`<span class="font-bold">---Quest: ${subquest.subQuestTitle}---</span>`);

      for (const dialog of subquest.dialogList) {
        if (dialog.dialogType === "Single") {
          const color = extractColorTags(dialog.dialogText)
          let textString = removeColorTags(dialog.dialogText)
          if (color.length > 0){
            for (const attr of color){
              textString = textString.replaceAll(attr.text, "<span style = 'color:" + attr.color + "'>" + attr.text + '</span>')
            }
          }
          sOut.push(`<span class="font-bold">${dialog.speakerName}:</span> ${textString}`);
        } 
        else {
          sOut.push('<span class="font-bold">---MultiDialog Start---</span>');
          for (const multi of dialog.multiDialogList) {
            const color = extractColorTags(multi.dialogText)
            let textString = removeColorTags(multi.dialogText)
            if (color.length > 0){
              for (const attr of color){
                textString = textString.replaceAll(attr.text, "<span style = 'color:" + attr.color + "'>" + attr.text + '</span>')
              }
            }
            sOut.push(`<span class="font-bold">${multi.speakerName}:</span> ${textString}`);
          }
          sOut.push('<span class="font-bold">---MultiDialog End---</span>');
        }
      }
    }
    return sOut
  };

  if (error) {
    return <div className="p-4">Error: {error}</div>
  }

  if (!questData.length) {
    return <div className="p-4">Loading quest...</div>
  }

  if (!quest) {
    return <div className="p-4">Quest not found.</div>
  }

  return (
    <div className='font-serif'>
      {renderOutput().map((line, index) => (
        <p className = 'm-1 p-0.5' key={index} dangerouslySetInnerHTML={{__html: line}}/>
      ))}
    </div>
  )
}
