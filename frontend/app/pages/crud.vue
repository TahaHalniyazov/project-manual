<template>
  <div style="padding: 16px;">
    <h1>CRUD (RTDB Emulator)</h1>

    <div style="display:flex; gap:12px; align-items:center; margin: 12px 0;">
      <label>
        Collection:
        <select v-model="active" style="margin-left: 8px;">
          <option v-for="c in collections" :key="c" :value="c">{{ c }}</option>
        </select>
      </label>

      <button @click="reload">Reload</button>
    </div>

    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items:start;">

      <section style="border:1px solid #ddd; padding:12px;">
        <h3>Create item in "{{ active }}"</h3>

        <div style="display:flex; flex-direction:column; gap:8px;">
          <label>
            Title
            <input v-model="title" placeholder="e.g. John / Project A / Task 1" />
          </label>

          <label>
            JSON (optional)
            <textarea
              v-model="json"
              rows="6"
              placeholder='{"extra":"data"}'
              style="width:100%;"
            />
          </label>

          <button @click="createItem">Create</button>

          <p v-if="createResult" style="margin:0;">
            ✅ Created id: <b>{{ createResult }}</b>
          </p>

          <p v-if="createError" style="margin:0; color:crimson;">
            ❌ {{ createError }}
          </p>
        </div>
      </section>

      <!-- List -->
      <section style="border:1px solid #ddd; padding:12px;">
        <h3>Items (last 50)</h3>

        <p v-if="loading">Loading...</p>
        <p v-if="error" style="color:crimson;">{{ error.message }}</p>

        <div v-if="items.length === 0 && !loading">
          No items yet.
        </div>

        <div v-for="item in items" :key="item.id" style="border-top:1px solid #eee; padding:10px 0;">
          <div style="display:flex; justify-content:space-between; gap:8px;">
            <b>{{ item.id }}</b>
            <button @click="removeItem(item.id)">Delete</button>
          </div>

          <textarea
            :value="stringify(item.data)"
            @input="onEdit(item.id, $event.target.value)"
            rows="5"
            style="width:100%; margin-top:8px;"
          />

          <div style="display:flex; gap:8px; margin-top:8px;">
            <button @click="savePatch(item.id)">Patch (merge)</button>
            <button @click="saveReplace(item.id)">Replace</button>
          </div>

          <p v-if="saved[item.id]" style="margin:6px 0 0 0; color:green;">
            ✅ Saved
          </p>

          <p v-if="saveErrors[item.id]" style="margin:6px 0 0 0; color:crimson;">
            ❌ {{ saveErrors[item.id] }}
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { useRtdbCollection } from '../composables/useRtdbCollection'

const collections = ['users', 'projects', 'tasks']
const active = ref('users')

const title = ref('')
const json = ref('')
const createResult = ref('')
const createError = ref('')

const edited = reactive({})
const saved = reactive({})
const saveErrors = reactive({})

const api = computed(() => useRtdbCollection(active.value))
const items = computed(() => api.value.items.value)
const loading = computed(() => api.value.loading.value)
const error = computed(() => api.value.error.value)

const reload = () => {
  api.value.start()
}

watch(active, () => {
  createResult.value = ''
  createError.value = ''

  api.value.start()
}, { immediate: true })

const stringify = (obj) => {
  try { return JSON.stringify(obj, null, 2) } catch { return '' }
}

const parseJsonSafe = (text) => {
  if (!text || !text.trim()) return {}
  return JSON.parse(text)
}

const createItem = async () => {
  createResult.value = ''
  createError.value = ''

  try {
    const extra = parseJsonSafe(json.value)
    const id = await api.value.create({
      title: title.value || 'Untitled',
      ...extra,
      createdAt: Date.now(),
    })

    createResult.value = id
    title.value = ''
    json.value = ''
  } catch (e) {
    createError.value = e?.message || String(e)
  }
}

const onEdit = (id, text) => {
  edited[id] = text
  saved[id] = false
  saveErrors[id] = ''
}

const savePatch = async (id) => {
  try {
    const data = parseJsonSafe(edited[id])
    await api.value.patch(id, data)
    saved[id] = true
  } catch (e) {
    saveErrors[id] = e?.message || String(e)
  }
}

const saveReplace = async (id) => {
  try {
    const data = parseJsonSafe(edited[id])
    await api.value.replace(id, data)
    saved[id] = true
  } catch (e) {
    saveErrors[id] = e?.message || String(e)
  }
}

const removeItem = async (id) => {
  await api.value.removeOne(id)
}
</script>

<style scoped>
input, select, textarea, button {
  padding: 6px 8px;
  font-size: 14px;
}
button {
  cursor: pointer;
}
</style>
