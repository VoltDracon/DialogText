/* eslint-disable react/prop-types */
export default function SearchHeader({
  languagesearch,
  selectedLANG,
  filteredWord,
  searchedWordList,
  normalMode,
  onToggleMode,
  onToggleNormalMode,
  onInputChange,
}) {
  return (
    <div>
      <div className="flex">
        <h1 className='ml-4 text-3xl font-bold'>Genshin Dialog Viewer</h1>
        <span className="my-auto ml-10">Alt Language: {selectedLANG}</span>
        <div className="ml-auto mr-5 flex gap-2">
          {!languagesearch ? (
            <button
              className="bg-gray-100 border border-black rounded px-1"
              onClick={onToggleNormalMode}
            >
              {normalMode === "book" ? "Switch to quest mode" : "Switch to book mode"}
            </button>
          ) : null}
          <button
            className="bg-gray-100 border border-black rounded px-1"
            onClick={onToggleMode}
          >
            {languagesearch ? "Switch to normal search mode" : "Switch to textmap search mode"}
          </button>
        </div>
      </div>
      <label className='ml-5' htmlFor='searchBox'>Search: </label>
      <input
        id='searchBox' placeholder='Type to search text' value={filteredWord}
        className='bg-gray-100 border border-black rounded px-1 inline-flex'
        onChange={onInputChange}
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
  )
}
