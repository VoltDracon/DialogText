/* eslint-disable react/prop-types */
import { AutoSizer, List, CellMeasurer } from "react-virtualized";
import HighlightTextLanguage from "./HighlightTextLanguage";

export default function LanguageSearchResults({
  searchedWordList,
  filteredWord,
  listRef,
  cache,
  curDim,
  onResize,
  selectedLANG,
  onSelectLang,
  languages,
}) {
  return (
    <>
      {searchedWordList.length > 0 ?
        <div className="h-full">
          <AutoSizer
            onResize={onResize}
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
          <div>
            <p>
              Type the dialogue in the search bar to find all instances of the word in the textmap!
              You will also see the text in the language you selected. This does not include text found in books or weapon descriptions.
            </p>
            <div className="grid grid-cols-4 gap-2">
              {languages.map((lang) => (
                <label key={lang} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value={lang}
                    checked={selectedLANG === lang}
                    onChange={() => onSelectLang(lang)}
                    className="accent-blue-600"
                  />
                  <span>{lang}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      }
    </>
  )
}
