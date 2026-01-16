import SearchHeader from "./components/SearchHeader";
import LanguageSearchResults from "./components/LanguageSearchResults";
import NormalSearchResults from "./components/NormalSearchResults";
import { useState, useRef, useEffect } from 'react'
import EnQuestjson from './assets/extractedMainQuests.json'
import { loadTextMap } from "./utils/loadTextMap"
import { CellMeasurerCache } from 'react-virtualized'

const regex = /<color=#([0-9A-Fa-f]{8})>(.*?)<\/color>/g;

const LANGUAGES = [
  "CHS", "CHT", "DE", "EN", "ES", "FR", "ID", "IT", "JP", "KR",
  "PT", "RU", "TH", "TR", "VI"
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

/////////

export default function App() {
  const [searchedWordList, setSearchedWordList] = useState([])
  const [filteredWord, setWord] = useState('')
  const [languagesearch, setlanguagesearch] = useState(false)
  const [selectedLANG, setselectedLANG] = useState("CHS")
  const [curDim, setCurrentDim] = useState({ height: window.innerHeight, width: window.innerWidth })
  const listRef = useRef(null)

  const [textMap, setTextMap] = useState(null)
  const [LANGtextMap, setLANGTextMap] = useState(null)

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
    setLANGTextMap(null)
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
      <SearchHeader
        languagesearch={languagesearch}
        selectedLANG={selectedLANG}
        filteredWord={filteredWord}
        searchedWordList={searchedWordList}
        onToggleMode={() => setlanguagesearch(!languagesearch)}
        onInputChange={handleInputChange}
      />
      {languagesearch ?
        // this is looking up text from different langauges (needs to start with english)
        <LanguageSearchResults
          searchedWordList={searchedWordList}
          filteredWord={filteredWord}
          listRef={listRef}
          cache={cache}
          curDim={curDim}
          onResize={({ width, height }) => setCurrentDim({ width: width, height: height })}
          selectedLANG={selectedLANG}
          onSelectLang={setselectedLANG}
          languages={LANGUAGES}
        />
        :
        <NormalSearchResults
          searchedWordList={searchedWordList}
          filteredWord={filteredWord}
          listRef={listRef}
          cache={cache}
          curDim={curDim}
          onResize={({ width, height }) => setCurrentDim({ width: width, height: height })}
          quests={EnQuestjson}
        />
      }
    </div>
  )
}
