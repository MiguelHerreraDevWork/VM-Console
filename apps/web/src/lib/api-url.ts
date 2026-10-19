/** Public API origin for Socket.IO (direct; Next does not proxy `/socket.io`). */
export function getPublicApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
}
