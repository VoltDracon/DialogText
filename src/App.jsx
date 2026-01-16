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
  const [normalMode, setNormalMode] = useState("quest")
  const [selectedLANG, setselectedLANG] = useState("CHS")
  const [curDim, setCurrentDim] = useState({ height: window.innerHeight, width: window.innerWidth })
  const listRef = useRef(null)
  const searchCounter = useRef(0)

  const [textMap, setTextMap] = useState(null)
  const [LANGtextMap, setLANGTextMap] = useState(null)
  const [readablesIndex, setReadablesIndex] = useState([])

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
    fetch(`/DialogText/assets/Readable/EN/readables_index.json`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load readables index")
        }
        return res.json()
      })
      .then(setReadablesIndex)
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

  function getReadableLangFilename(filename, lang) {
    if (lang === "EN") return filename
    if (lang === "CHS") return filename.replace(/_EN\.txt$/i, ".txt")
    if (/_EN\.txt$/i.test(filename)) {
      return filename.replace(/_EN\.txt$/i, `_${lang}.txt`)
    }
    return filename.replace(/\.txt$/i, `_${lang}.txt`)
  }

  function getReadableSnippet(text, word) {
    const normalized = text.replace(/\s+/g, " ").trim()
    const index = normalized.indexOf(word)
    if (index === -1) return normalized.slice(0, 160)
    const radius = 80
    const start = Math.max(0, index - radius)
    const end = Math.min(normalized.length, index + word.length + radius)
    const prefix = start > 0 ? "..." : ""
    const suffix = end < normalized.length ? "..." : ""
    return `${prefix}${normalized.slice(start, end)}${suffix}`
  }

  async function fetchReadableText(lang, filename) {
    const response = await fetch(`/DialogText/assets/Readable/${lang}/${filename}`)
    if (!response.ok) {
      throw new Error(`Failed to load readable ${lang}/${filename}`)
    }
    return await response.text()
  }

  async function searchSelectedWord(word, languagesearchtrue) {
    const currentSearch = ++searchCounter.current

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
            type: "textmap",
            id: item.id,
            transtext: (LANGtextMap)[item.id] || "Language ID not found",
            text: removeColorTags(item.text)
          });
        }
      }

      const readablePromises = readablesIndex
        .filter((readable) => checkWordExistLanguage(word, readable.text))
        .map(async (readable) => {
          const langFilename = getReadableLangFilename(readable.filename, selectedLANG)
          try {
            const translatedText = await fetchReadableText(selectedLANG, langFilename)
            return {
              type: "book",
              title: readable.title,
              filename: readable.filename,
              langFilename,
              enSnippet: getReadableSnippet(readable.text, word),
              translatedSnippet: getReadableSnippet(translatedText, word)
            }
          } catch (error) {
            return {
              type: "book",
              title: readable.title,
              filename: readable.filename,
              langFilename,
              enSnippet: getReadableSnippet(readable.text, word),
              translatedSnippet: "Language text not found."
            }
          }
        })

      const readableMatches = await Promise.all(readablePromises)
      matchingWords.push(...readableMatches)
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

      for (const readable of readablesIndex) {
        if (checkWordExistLanguage(word, readable.text)) {
          matchingWords.push({
            type: "book",
            title: readable.title,
            filename: readable.filename,
            snippet: getReadableSnippet(readable.text, word)
          })
        }
      }
    }
    if (currentSearch !== searchCounter.current) return
    if (matchingWords.length === 0) return setSearchedWordList([null])

    setSearchedWordList(matchingWords)
  }

  async function handleInputChange(event) {
    const nextValue = event.target.value
    setWord(nextValue)
    if (languagesearch) {
      await searchSelectedWord(nextValue, true)
    }
    else {
      await searchSelectedWord(nextValue, false)
    }
  }

  function handleToggleMode() {
    setlanguagesearch(!languagesearch)
    searchCounter.current += 1
    setWord("")
    setSearchedWordList([])
  }

  function handleToggleNormalMode() {
    setNormalMode((prev) => (prev === "book" ? "quest" : "book"))
    searchCounter.current += 1
    setWord("")
    setSearchedWordList([])
  }

  if (!textMap || !LANGtextMap) return <div>Loading EN and {selectedLANG}…</div>

  return (
    <div className='font-serif flex flex-col h-screen'>
      <SearchHeader
        languagesearch={languagesearch}
        selectedLANG={selectedLANG}
        filteredWord={filteredWord}
        searchedWordList={searchedWordList}
        normalMode={normalMode}
        onToggleMode={handleToggleMode}
        onToggleNormalMode={handleToggleNormalMode}
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
          normalMode={normalMode}
          readables={readablesIndex}
        />
      }
    </div>
  )
}
