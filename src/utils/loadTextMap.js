const baseUrl = import.meta.env.BASE_URL;

async function loadSingleTextMap(lang) {
  const response = await fetch(`${baseUrl}assets/TextMap/TextMap${lang}.json`)
  if (!response.ok) {
    throw new Error(`Failed to load TextMap for ${lang}`)
  }
  return await response.json()
}

export async function loadTextMap(lang) {
  if (lang === "RU" || lang === "TH") {
    const [part0, part1] = await Promise.all([
      loadSingleTextMap(`${lang}_0`),
      loadSingleTextMap(`${lang}_1`)
    ])
    return { ...part0, ...part1 }
  }

  return await loadSingleTextMap(lang)
}
