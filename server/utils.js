export function parseCookie (cookieString) {
  const cookies = cookieString ? cookieString.split('; ') : ''
  const jar = {}
  for (let i = 0; i < cookies.length; i++) {
    const parts = cookies[i].split('=')
    const value = parts.slice(1).join('=')
    try {
      const found = decodeURIComponent(parts[0])
      // jar[found] = converter.read(value, found)
      jar[found] = decodeURIComponent(value)
    } catch (e) {}
  }
  return jar
}
