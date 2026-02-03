// Utility helpers for validation and id generation

/**
 * Generate a compact room id suitable for display/use in URLs.
 * Default length is 6 (alphanumeric, uppercase).
 */
export function generateRoomId(length = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let out = ''
  for (let i = 0; i < length; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return out
}
