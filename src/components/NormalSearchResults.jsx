/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { AutoSizer, List, CellMeasurer } from "react-virtualized";
import HighlightText from "./HighlightText";
import HighlightSnippet from "./HighlightSnippet";
import MainQuest from "./MainQuest";
import ReadableCard from "./ReadableCard";

export default function NormalSearchResults({
  searchedWordList,
  filteredWord,
  listRef,
  cache,
  curDim,
  onResize,
  quests,
  normalMode,
  readables,
}) {
  return (
    <>
      {searchedWordList.length > 0 ?
        //this is the searched texted appearing
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
                            {item.type === "book" ? (
                              <>
                                {(() => {
                                  const href = `/DialogText/readable/EN/${encodeURIComponent(item.filename)}`
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
                                      <p className='font-bold'>{item.title}</p>
                                    </a>
                                  )
                                })()}
                                <HighlightSnippet
                                  text={item.snippet}
                                  highlightTxt={filteredWord}
                                />
                              </>
                            ) : (
                              <>
                                <Link to={`/quest/${item.questId}`}>
                                  <p className='font-bold'>{item.quest}</p>
                                </Link>
                                <div className="relative">
                                  <HighlightText
                                    speaker={item.speaker}
                                    text={item.text}
                                    highlightTxt={filteredWord}
                                  />
                                  {/* <ColorText speaker = {item.speaker} 
                                      text = {item.text} 
                                      color = {item.color}/> */}
                                </div>
                              </>
                            )}
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
        //this is the quest blocks you can click
        <div className='flex flex-wrap'>
          {
            normalMode === "book" ?
              readables.map((readable) => (
                <ReadableCard key={readable.id} readable={readable} />
              ))
              :
              quests.map((mainquest, index) => (
                <MainQuest key={`${mainquest.questId}-${index}`} mainquest={mainquest} />
              ))
          }
        </div>
      }
    </>
  )
}
