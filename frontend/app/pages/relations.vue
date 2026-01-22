<template>
  <div style="padding: 16px;">
    <h1>Relations</h1>
    <p>Bind Tasks to Projects (creates reverse index: tasksByProject)</p>

    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-top: 16px;">

      <section style="border:1px solid #ddd; padding:12px;">
        <h3>Projects</h3>

        <button @click="loadProjects">Reload projects</button>
        <div v-if="projects.length === 0" style="margin-top: 8px;">No projects</div>

        <ul>
          <li v-for="p in projects" :key="p.id">
            <label style="cursor:pointer;">
              <input type="radio" name="project" :value="p.id" v-model="selectedProjectId" />
              <b>{{ p.data.title || p.id }}</b>
            </label>
          </li>
        </ul>
      </section>


      <section style="border:1px solid #ddd; padding:12px;">
        <h3>Tasks</h3>

        <button @click="loadTasks">Reload tasks</button>
        <div v-if="tasks.length === 0" style="margin-top: 8px;">No tasks</div>

        <ul>
          <li v-for="t in tasks" :key="t.id">
            <label style="cursor:pointer;">
              <input type="checkbox" :value="t.id" v-model="selectedTaskIds" />
              <b>{{ t.data.title || t.id }}</b>
              <small v-if="t.data.projectId"> (projectId: {{ t.data.projectId }})</small>
            </label>
          </li>
        </ul>
      </section>
    </div>

    <section style="margin-top:16px; border:1px solid #ddd; padding:12px;">
      <h3>Action</h3>

      <p>
        Selected project:
        <b>{{ selectedProjectId || '—' }}</b>
      </p>

      <p>
        Selected tasks:
        <b>{{ selectedTaskIds.length }}</b>
      </p>

      <div style="display:flex; gap:12px;">
        <button :disabled="!canBind" @click="bindTasks">Bind selected tasks → project</button>
        <button :disabled="!canBind" @click="unbindTasks">Unbind selected tasks</button>
      </div>

      <p v-if="status" style="margin-top: 10px;">{{ status }}</p>
    </section>
  </div>
</template>

<script setup>
import { ref as dbRef, update } from 'firebase/database'
import { useRtdbCollection } from '../composables/useRtdbCollection'

const { $db } = useNuxtApp()

const projectsApi = useRtdbCollection('projects')
const tasksApi = useRtdbCollection('tasks')

const projects = computed(() => projectsApi.items.value)
const tasks = computed(() => tasksApi.items.value)

const selectedProjectId = ref('')
const selectedTaskIds = ref([])
const status = ref('')

const loadProjects = () => projectsApi.start()
const loadTasks = () => tasksApi.start()

onMounted(() => {
  loadProjects()
  loadTasks()
})

const canBind = computed(() => selectedProjectId.value && selectedTaskIds.value.length > 0)

const bindTasks = async () => {
  status.value = ''
  const projectId = selectedProjectId.value
  const taskIds = selectedTaskIds.value


  const updates = {}

  for (const taskId of taskIds) {

    updates[`tasks/${taskId}/projectId`] = projectId


    updates[`tasksByProject/${projectId}/${taskId}`] = true
  }

  await update(dbRef($db), updates)
  status.value = `✅ Bound ${taskIds.length} task(s) to project ${projectId}`

  loadTasks()
}

const unbindTasks = async () => {
  status.value = ''
  const projectId = selectedProjectId.value
  const taskIds = selectedTaskIds.value

  const updates = {}

  for (const taskId of taskIds) {
    updates[`tasks/${taskId}/projectId`] = null
    updates[`tasksByProject/${projectId}/${taskId}`] = null
  }

  await update(dbRef($db), updates)
  status.value = `✅ Unbound ${taskIds.length} task(s) from project ${projectId}`

  loadTasks()
}
</script>

<style scoped>
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
