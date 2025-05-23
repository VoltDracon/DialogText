/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from 'react'
import EnQuestjson from './assets/extractedMainQuests.json'
import { loadTextMap } from "./utils/loadTextMap"
import { AutoSizer, List, CellMeasurer, CellMeasurerCache } from 'react-virtualized'

const regex = /<color=#([0-9A-Fa-f]{8})>(.*?)<\/color>/g;

const LANGUAGES = [
  "CHS", "CHT", "DE", "EN", "ES", "FR", "ID", "IT", "JP", "KR",
  "PT", "RU", "TH_0", "TH_1", "TR", "VI"
];
/////////

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

function MainQuest({ mainquest }) {
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

//for the regular search mode
function HighlightText({ text, speaker, highlightTxt }) {
  const textString = text.replaceAll(highlightTxt, '<span class="bg-yellow-300">' + highlightTxt + '</span>')
  const speakerString = speaker.replaceAll(highlightTxt, '<span class="bg-yellow-300">' + highlightTxt + '</span>')
  const comWord = '<span class="font-bold">' + speakerString + '</span>' + ': ' + textString

  return <p className="ml-5" dangerouslySetInnerHTML={{ __html: comWord }} />
}

//for the language mode
function HighlightTextLanguage({ id, text, translatedtext, highlightTxt }) {
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

/////////

export default function App() {
  const [searchedWordList, setSearchedWordList] = useState([])
  const [filteredWord, setWord] = useState('')
  const [languagesearch, setlanguagesearch] = useState(false)
  const [selectedLANG, setselectedLANG] = useState("CHS")
  const [curDim, setCurrentDim] = useState({ height: window.innerHeight, width: window.innerWidth })
  const listRef = useRef(null)

  const [textMap, setTextMap] = useState(null)
  const [LANGtextMap, setLANGTextMap] = useState("CHS")

  const cache = new CellMeasurerCache({
    defaultHeight: 30,
    fixedWidth: true
  });

  useEffect(() => {
    loadTextMap("EN")
      .then((res) => {
          const EnSorted = Object.entries(res).map(([key, text]) => ({
            id: key,
            text
          }));
          setTextMap(EnSorted)
        }
      )
        .catch(console.error)
  }, [])

  useEffect(() => {
    // Whenever selectedLANG changes, load its TextMap
    loadTextMap(selectedLANG)
      .then(setLANGTextMap)
      .catch(console.error);
  }, [selectedLANG]);

  useEffect(() => {
    // When filtered word changes, scroll to the top
    if (listRef.current) {
      listRef.current.scrollToPosition(0);
    }
  }, [filteredWord]);

  function searchSelectedWord(word, languagesearchtrue) {

    if (word === '') return setSearchedWordList([]) //don't search empty strings, pls

    // Regular expression to match <color=#COLOR_CODE>{TEXT}</color> pattern

    //for regular search
    function checkWordExist(word, speaker, dialog) {
      if (speaker.includes(word) || dialog.includes(word)) {
        return true
      }
      return false
    }

    //for language search
    function checkWordExistLanguage(word, dialog) {
      if (dialog.includes(word)) {
        return true
      }
      return false
    }

    const matchingWords = []

    if (languagesearchtrue) {
      for (const item of textMap) {
        if (checkWordExistLanguage(word, item.text)) {
          
          matchingWords.push({
            id: item.id,
            transtext: (LANGtextMap)[item.id] || "Language ID not found",
            text: removeColorTags(item.text)
          });
        }
      }
    }
    else {
      for (const quest of EnQuestjson) {
        for (const subquest of quest.subQuestList) {
          for (const dialog of subquest.dialogList) {
            if (dialog.dialogType === "Single") {
              if (checkWordExist(word, dialog.speakerName, removeColorTags(dialog.dialogText)))
                matchingWords.push({
                  quest: `${quest.chapterNum}, ${quest.chapterTitle}: ${quest.questTitle}`,
                  speaker: dialog.speakerName,
                  questId: quest.questId,
                  color: extractColorTags(dialog.dialogText),
                  text: removeColorTags(dialog.dialogText)
                })
            }
            else {
              for (const multi of dialog.multiDialogList) {
                if (checkWordExist(word, multi.speakerName, removeColorTags(multi.dialogText)))
                  matchingWords.push({
                    quest: `${quest.chapterNum}, ${quest.chapterTitle}: ${quest.questTitle}`,
                    speaker: multi.speakerName,
                    questId: quest.questId,
                    color: extractColorTags(multi.dialogText),
                    text: removeColorTags(multi.dialogText)
                  })
              }
            }
          }
        }
      }
    }
    if (matchingWords.length === 0) return setSearchedWordList([null])

    setSearchedWordList(matchingWords)
  }

  function handleInputChange(event) {
    setWord(event.target.value)
    if (languagesearch) {
      searchSelectedWord(event.target.value, true)
    }
    else {
      searchSelectedWord(event.target.value, false)
    }
  }
  
  if (!textMap || !LANGtextMap) return <div>Loading EN and {selectedLANG}…</div>

  return (
    <div className='font-serif flex flex-col h-screen'>
      <div>
        <div className="flex">
          <h1 className='ml-4 text-3xl font-bold'>Genshin Dialog Viewer</h1>
          <button className="ml-auto mr-5 bg-gray-100 border border-black rounded px-1"
            onClick={() => {
              setlanguagesearch(!languagesearch)
              setWord('');
              setSearchedWordList([]);
            }}
          >{languagesearch ? "Switch to normal search mode" : "Switch to textmap search mode"}</button>
        </div>
        <label className='ml-5' htmlFor='searchBox'>Search: </label>
        <input
          id='searchBox' placeholder='Type to search text' value={filteredWord}
          className='bg-gray-100 border border-black rounded px-1 inline-flex'
          onChange={e => handleInputChange(e)}
          type='search'>
        </input>
        {searchedWordList.length > 0 ?
          searchedWordList[0] === null ?
            <span className="ml-5">Number of Lines Found: 0</span>
            :
            <span className="ml-5">Number of Lines Found: {searchedWordList.length}</span>
          :
          null}
      </div>
      {languagesearch ?
        // this is looking up text from different langauges (needs to start with english)
        <>
          {searchedWordList.length > 0 ?
            <div className="h-full">
              <AutoSizer
                onResize={({ width, height }) => setCurrentDim({ width: width, height: height })}
              >
                {() => (
                  <List
                    ref={listRef}
                    height={curDim.height}
                    width={curDim.width}
                    deferredMeasurementCache={cache}
                    rowHeight={cache.rowHeight}
                    rowCount={searchedWordList.length}
                    rowRenderer={({ index, key, style, parent }) => (
                      <CellMeasurer
                        key={key}
                        cache={cache}
                        columnIndex={0}
                        parent={parent}
                        rowIndex={index}>
                        {searchedWordList[0] === null ?
                          <p className='m-1' style={style}>No Matched Words Found!</p>
                          :
                          <div style={style}>
                            <div className="border-2 border-black m-1 p-4 rounded-xl bg-gray-300">
                              <div className="relative">
                                <HighlightTextLanguage
                                  id={(searchedWordList[index]).id}
                                  translatedtext={(searchedWordList[index]).transtext}
                                  text={(searchedWordList[index]).text}
                                  highlightTxt={filteredWord} />
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
            <div className="ml-5">
              <p>
                Type the dialogue in the search bar to find all instances of the word in the textmap!
                You will also see the text in the language you selected. This does not include text found in books or weapon descriptions.
              </p>
              <div className="grid grid-cols-4 gap-2">
                {LANGUAGES.map((lang) => (
                  <label key={lang} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value={lang}
                      checked={selectedLANG === lang}
                      onChange={() => setselectedLANG(lang)}
                      className="accent-blue-600"
                    />
                    <span>{lang}</span>
                  </label>
                ))}
              </div>
            </div>
          }
        </>
        :
        <>
          {searchedWordList.length > 0 ?
            //this is the searched texted appearing
            <div className="h-full">
              <AutoSizer
                onResize={({ width, height }) => setCurrentDim({ width: width, height: height })}
              >
                {() => (
                  <List
                    ref={listRef}
                    height={curDim.height}
                    width={curDim.width}
                    deferredMeasurementCache={cache}
                    rowHeight={cache.rowHeight}
                    rowCount={searchedWordList.length}
                    rowRenderer={({ index, key, style, parent }) => (
                      <CellMeasurer
                        key={key}
                        cache={cache}
                        columnIndex={0}
                        parent={parent}
                        rowIndex={index}>
                        {searchedWordList[0] === null ?
                          <p className='m-1' style={style}>No Matched Words Found!</p>
                          :
                          <div style={style}>
                            <div className="border-2 border-black m-1 p-4 rounded-xl bg-gray-300">
                              <Link to={`/quest/${(searchedWordList[index]).questId}`}><p className='font-bold'>{(searchedWordList[index]).quest}</p></Link>
                              <div className="relative">
                                <HighlightText speaker={(searchedWordList[index]).speaker}
                                  text={(searchedWordList[index]).text}
                                  highlightTxt={filteredWord} />
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
            //this is the quest blocks you can click
            <div className='flex flex-wrap'>
              {
                EnQuestjson.map((mainquest) => (
                  <MainQuest key={mainquest.questId} mainquest={mainquest} />
                ))
              }
            </div>
          }
        </>
      }
    </div>
  )
}
