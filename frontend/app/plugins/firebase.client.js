import { initializeApp } from 'firebase/app'
import { getDatabase, connectDatabaseEmulator } from 'firebase/database'

export default defineNuxtPlugin(() => {
  const app = initializeApp({
    apiKey: 'demo',
    authDomain: 'demo',
    projectId: 'test-ead6f',

    databaseURL: 'http://127.0.0.1:9000/?ns=test-ead6f-default-rtdb',
  })

  const db = getDatabase(app)


  connectDatabaseEmulator(db, '127.0.0.1', 9000)

  return {
    provide: { db },
  }
})
