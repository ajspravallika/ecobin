import { io } from 'socket.io-client'

const API_URL = import.meta.env.VITE_API_URL

let socket = null

// Lazily create a single shared socket connection. Called once the user is
// authenticated (see AppContext) so we're not holding an open connection
// on the login screen.
export function getSocket() {
  if (!API_URL) return null
  if (!socket) {
    socket = io(API_URL, { autoConnect: false, transports: ['websocket', 'polling'] })
  }
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
  }
}
