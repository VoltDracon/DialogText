/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { AutoSizer, List, CellMeasurer } from "react-virtualized";
import HighlightText from "./HighlightText";
import MainQuest from "./MainQuest";

export default function NormalSearchResults({
  searchedWordList,
  filteredWord,
  listRef,
  cache,
  curDim,
  onResize,
  quests,
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
            quests.map((mainquest, index) => (
              <MainQuest key={`${mainquest.questId}-${index}`} mainquest={mainquest} />
            ))
          }
        </div>
      }
    </>
  )
}
