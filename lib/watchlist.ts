// Local watchlist — saved to localStorage, no accounts.

export interface WatchlistItem {
  title: string
  year: string
  type: string
}

const KEY = 'aimov-watchlist'

export function getWatchlist(): WatchlistItem[] {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function save(items: WatchlistItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items.slice(0, 200)))
    window.dispatchEvent(new Event('aimov-watchlist-change'))
  } catch {
    /* storage unavailable */
  }
}

export function isSaved(title: string, year: string): boolean {
  return getWatchlist().some((i) => i.title === title && i.year === year)
}

export function toggleWatchlist(item: WatchlistItem): boolean {
  const list = getWatchlist()
  const idx = list.findIndex((i) => i.title === item.title && i.year === item.year)
  if (idx >= 0) {
    list.splice(idx, 1)
    save(list)
    return false
  }
  save([item, ...list])
  return true
}

export function removeFromWatchlist(title: string, year: string) {
  save(getWatchlist().filter((i) => !(i.title === title && i.year === year)))
}
