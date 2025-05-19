import { Link } from "react-router-dom";
import {useState, useRef, useEffect} from 'react'
import json from './assets/extractedMainQuests.json'
import {AutoSizer, List, CellMeasurer, CellMeasurerCache} from 'react-virtualized'

function MainQuest({mainquest}){
  return (
    <div className = 'bg-gray-300 border-4 border-black rounded-3xl min-h-[350px] w-[calc(25%-10px)] m-[5px]'>
      <Link className = 'block h-full' to={`/quest/${mainquest.questId}`}>
        <p className = 'mt-1 font-bold text-center'>{mainquest.chapterNum}</p>
        <p className = 'font-bold text-center'>{mainquest.chapterTitle}</p>
        <p className = 'font-bold text-center'>{mainquest.questTitle}</p>
        <p className = 'm-3'>{mainquest.questDesc}</p>
      </Link>
    </div>
  )
}

// until i find a way to make color text work with highlights i will comment this out
// function ColorText({text, speaker, color}){ //this is overtop of highlights as i can't code this seprately sorry
//   let textString
//   if (color.length > 0){
//     for (const attr of color){
//       textString = text.replaceAll(attr.text, "<span style = 'color:" + attr.color + "'>" + attr.text + '</span>')
//     }
//   }
//   else textString = text
//   const comWord = '<span class="font-bold">' + speaker + '</span>' + ': ' + textString
//   return <p className = "absolute top-0 left-0 ml-5" dangerouslySetInnerHTML={{__html: comWord}}/>
// }

function HighlightText({text, speaker, highlightTxt}){
  const textString = text.replaceAll(highlightTxt, '<span class="bg-yellow-300">' + highlightTxt + '</span>')
  const speakerString = speaker.replaceAll(highlightTxt, '<span class="bg-yellow-300">' + highlightTxt + '</span>')
  const comWord = '<span class="font-bold">' + speakerString + '</span>' + ': ' + textString

  return <p className = "ml-5" dangerouslySetInnerHTML={{__html: comWord}}/>
}

export default function App() {
  const [searchedWordList, setSearchedWordList] = useState([])
  const [filteredWord, setWord] = useState('')
  const [curDim, setCurrentDim] = useState({height: window.innerHeight, width: window.innerWidth})
  const listRef = useRef(null)

  const cache = new CellMeasurerCache({
    defaultHeight: 30,
    fixedWidth: true
  });

  useEffect(() => {
    // When filtered word changes, scroll to the top
    if (listRef.current) {
      listRef.current.scrollToPosition(0);
    }
  }, [filteredWord]);

  function searchSelectedWord(word){

    if (word === '') return setSearchedWordList([]) //don't search empty strings, pls

    // Regular expression to match <color=#COLOR_CODE>{TEXT}</color> pattern
    const regex = /<color=#([0-9A-Fa-f]{8})>(.*?)<\/color>/g;

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
    
    function checkWordExist(word, speaker, dialog){
      if (speaker.includes(word) || dialog.includes(word)) {
        return true
      }
      return false
    }

    const matchingWords = []
    for (const quest of json){
      for (const subquest of quest.subQuestList){
        for (const dialog of subquest.dialogList) {
          if (dialog.dialogType === "Single") {
            if (checkWordExist(word, dialog.speakerName, removeColorTags(dialog.dialogText)))
              matchingWords.push({quest: `${quest.chapterNum}, ${quest.chapterTitle}: ${quest.questTitle}`, 
                speaker: dialog.speakerName, 
                questId: quest.questId,
                color: extractColorTags(dialog.dialogText),
                text: removeColorTags(dialog.dialogText)})
          } 
          else {
            for (const multi of dialog.multiDialogList) {
              if (checkWordExist(word, multi.speakerName, removeColorTags(multi.dialogText))) 
                matchingWords.push({quest: `${quest.chapterNum}, ${quest.chapterTitle}: ${quest.questTitle}`, 
                  speaker: multi.speakerName, 
                  questId: quest.questId,
                  color: extractColorTags(multi.dialogText),
                  text: removeColorTags(multi.dialogText)})
            }
          }
        }
      }
    }
    if (matchingWords.length === 0) return setSearchedWordList([null])

    setSearchedWordList(matchingWords)
  }

  function handleInputChange(event){
    setWord(event.target.value)
    searchSelectedWord(event.target.value)
  }

  return (
    <div className='font-serif flex flex-col h-screen'>
      <div>
        <h1 className='text-3xl font-bold'>Genshin Dialog Viewer</h1>
        <label htmlFor = 'searchBox'>Search: </label>
        <input 
          id = 'searchBox' placeholder='Type to search text' value = {filteredWord}
          className = 'bg-gray-100 border border-black rounded pl-1 inline-flex' 
          onChange={e => handleInputChange(e)}
          type = 'search'>
        </input>
        {searchedWordList.length > 0? 
          searchedWordList[0] === null ?
          <span className="ml-5">Number of Lines Found: 0</span>
          :
          <span className="ml-5">Number of Lines Found: {searchedWordList.length}</span>
          :
        null}
      </div>
      {searchedWordList.length > 0?
        <div className="h-full">
          <AutoSizer
            onResize={({width, height}) => setCurrentDim({width: width, height: height})}
          >
            {() => (
              <List
                ref={listRef}
                height={curDim.height}
                width={curDim.width}
                deferredMeasurementCache={cache}
                rowHeight={cache.rowHeight}
                rowCount={searchedWordList.length}
                rowRenderer={({ index, key, style, parent}) => (
                  <CellMeasurer 
                    key={key} 
                    cache={cache} 
                    columnIndex={0} 
                    parent={parent} 
                    rowIndex={index}>
                      { searchedWordList[0] === null?
                        <p className = 'm-1' style={style}>No Matched Words Found!</p>
                        :
                        <div style = {style}>
                          <div className="border-2 border-black m-1 p-4 rounded-xl bg-gray-300">
                            <Link to={`/quest/${(searchedWordList[index]).questId}`}><p className='font-bold'>{(searchedWordList[index]).quest}</p></Link>
                            <div className="relative">
                              <HighlightText speaker = {(searchedWordList[index]).speaker} 
                                text = {(searchedWordList[index]).text} 
                                highlightTxt = {filteredWord}/>
                              {/* <ColorText speaker = {(searchedWordList[index]).speaker} 
                                text = {(searchedWordList[index]).text} 
                                color = {(searchedWordList[index]).color}/> */}
                            </div>
                          </div>
                        </div>
                      }
                  </CellMeasurer>
                )}
              />
            )}
          </AutoSizer>
        </div>
        :
        <div className='flex flex-wrap'>
          {
            json.map((mainquest)=>(
              <MainQuest key = {mainquest.questId} mainquest = {mainquest}/>
            ))
          }
        </div>
      }
    </div>
  )
}
