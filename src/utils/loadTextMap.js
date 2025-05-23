export async function loadTextMap(lang) {
  const response = await fetch(`/DialogText/assets/TextMap/TextMap${lang}.json`)
  if (!response.ok) {
    throw new Error(`Failed to load TextMap for ${lang}`)
  }
  return await response.json()
}
