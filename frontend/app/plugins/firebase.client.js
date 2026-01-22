import { initializeApp } from 'firebase/app'
import { getDatabase, connectDatabaseEmulator } from 'firebase/database'

export default defineNuxtPlugin(() => {
  const app = initializeApp({
    apiKey: 'demo',
    authDomain: 'demo',
    projectId: 'demo',
  })

  const db = getDatabase(app)

  // Connect RTDB emulator
  connectDatabaseEmulator(db, '127.0.0.1', 9000)

  return {
    provide: { db },
  }
})
