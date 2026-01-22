import { ref as dbRef, push, set, update, remove, onValue, query, limitToLast } from 'firebase/database'

export function useRtdbCollection(collectionName) {
  const { $db } = useNuxtApp()

  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  let unsubscribe = null

  const start = () => {
    stop()
    loading.value = true
    error.value = null

    const q = query(dbRef($db, collectionName), limitToLast(50))

    unsubscribe = onValue(
      q,
      (snap) => {
        const val = snap.val() || {}
        items.value = Object.entries(val).map(([id, data]) => ({ id, data }))
        loading.value = false
      },
      (err) => {
        error.value = err
        loading.value = false
      }
    )
  }

  const stop = () => {
    if (typeof unsubscribe === 'function') {
      unsubscribe()
      unsubscribe = null
    }
  }

  const create = async (data) => {
    const newRef = push(dbRef($db, collectionName))
    await set(newRef, data)
    return newRef.key
  }

  const patch = async (id, partial) => {
    await update(dbRef($db, `${collectionName}/${id}`), partial)
  }

  const replace = async (id, data) => {
    await set(dbRef($db, `${collectionName}/${id}`), data)
  }

  const removeOne = async (id) => {
    await remove(dbRef($db, `${collectionName}/${id}`))
  }

  onUnmounted(() => stop())

  return {
    items,
    loading,
    error,
    start,
    stop,
    create,
    patch,
    replace,
    removeOne,
  }
}
