/* eslint-disable react/prop-types */
import { AutoSizer, List, CellMeasurer } from "react-virtualized";
import HighlightTextLanguage from "./HighlightTextLanguage";
import HighlightSnippet from "./HighlightSnippet";

const baseUrl = import.meta.env.BASE_URL;

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
                rowRenderer={({ index, key, style, parent }) => {
                  const item = searchedWordList[index]
                  return (
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
                              {item.type === "book" ? (
                                <>
                                  {(() => {
                                    const href = `${baseUrl}#/readable/${selectedLANG}/${encodeURIComponent(item.langFilename)}`
                                    return (
                                      <a
                                        href={href}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={(e) => {
                                          e.preventDefault()
                                          window.open(href, "_blank", "noopener,noreferrer")
                                        }}
                                      >
                                        <p className="ml-5 mb-2 font-bold">{item.title}</p>
                                      </a>
                                    )
                                  })()}
                                  <p className="ml-5 mb-1 text-sm font-bold">EN:</p>
                                  <HighlightSnippet
                                    text={item.enSnippet}
                                    highlightTxt={filteredWord}
                                  />
                                  <p className="ml-5 mt-3 mb-1 text-sm font-bold">{selectedLANG}:</p>
                                  <HighlightSnippet
                                    text={item.translatedSnippet}
                                    highlightTxt={filteredWord}
                                  />
                                </>
                              ) : (
                                <HighlightTextLanguage
                                  id={item.id}
                                  translatedtext={item.transtext}
                                  text={item.text}
                                  highlightTxt={filteredWord}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      }
                    </CellMeasurer>
                  )
                }}
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
