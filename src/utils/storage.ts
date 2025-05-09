export function getItem(key: string): string | null {
  if (typeof key !== 'string') {
    console.error('Key must be a string')
    return null
  }
  return localStorage.getItem(key)
}

export function setItem(key: string, value: string): void {
  if (typeof key !== 'string' || typeof value !== 'string') {
    console.error('Key and value must be strings')
    return
  }
  localStorage.setItem(key, value)
}

export function removeItem(key: string): void {
  if (typeof key !== 'string') {
    console.error('Key must be a string')
    return
  }
  localStorage.removeItem(key)
}

export function clearStorage(): void {
  localStorage.clear()
}
