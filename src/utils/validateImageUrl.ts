const IMAGE_URL_REGEX =
  /^https?:\/\/.+(\.(jpe?g|png|webp|gif)(\?.*)?)$/i

export function isValidImageUrl(url: string): boolean {
  if (!url.trim()) return false
  try {
    new URL(url)
    return IMAGE_URL_REGEX.test(url.trim())
  } catch {
    return false
  }
}
