<template>
  <div style="padding: 16px;">
    <h1>Reverse Index (Layer)</h1>
    <p>
      Shows: <b>tasksByProject</b> + Filter tasks by indexed field <b>projectId</b>
    </p>

    <section style="margin-top: 14px; border:1px solid #ddd; padding:12px;">
      <h3>Select Project</h3>

      <div style="display:flex; gap:12px; align-items:center;">
        <select v-model="selectedProjectId">
          <option value="">-- choose project --</option>
          <option v-for="p in projects" :key="p.id" :value="p.id">
            {{ p.data.title || p.id }}
          </option>
        </select>

        <button @click="reloadAll">Reload</button>
      </div>
    </section>

    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">

      <section style="border:1px solid #ddd; padding:12px;">
        <h3>tasksByProject / {{ selectedProjectId || "—" }}</h3>

        <p v-if="!selectedProjectId">Select project to load reverse index.</p>

        <div v-else>
          <p v-if="reverseIds.length === 0">No reverse index records.</p>

          <ul v-else>
            <li v-for="id in reverseIds" :key="id">
              {{ id }}
            </li>
          </ul>
        </div>
      </section>


      <section style="border:1px solid #ddd; padding:12px;">
        <h3>Tasks filtered by index (projectId)</h3>

        <p v-if="!selectedProjectId">Select project to filter tasks.</p>

        <div v-else>
          <p v-if="filteredTasks.length === 0">No tasks found.</p>

          <div
            v-for="t in filteredTasks"
            :key="t.id"
            style="border-top:1px solid #eee; padding:10px 0;"
          >
            <b>{{ t.data.title || t.id }}</b>
            <div style="font-size: 12px; opacity: 0.8;">
              taskId: {{ t.id }} | projectId: {{ t.data.projectId }}
            </div>
          </div>
        </div>
      </section>
    </div>

    <section style="margin-top: 16px; border:1px solid #ddd; padding:12px;">
      <h3>Debug</h3>
      <p style="margin:0;">
        Reverse index count: <b>{{ reverseIds.length }}</b>
      </p>
      <p style="margin:0;">
        Filtered tasks count: <b>{{ filteredTasks.length }}</b>
      </p>
    </section>
  </div>
</template>

<script setup>
import {
  ref as dbRef,
  onValue,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";

const { $db } = useNuxtApp();

const projects = ref([]);
const selectedProjectId = ref("");

const reverseIds = ref([]);
const filteredTasks = ref([]);

let unsubProjects = null;
let unsubReverse = null;
let unsubTasks = null;

const stopAll = () => {
  if (typeof unsubProjects === "function") unsubProjects();
  if (typeof unsubReverse === "function") unsubReverse();
  if (typeof unsubTasks === "function") unsubTasks();

  unsubProjects = null;
  unsubReverse = null;
  unsubTasks = null;
};

const loadProjects = () => {
  if (typeof unsubProjects === "function") unsubProjects();

  unsubProjects = onValue(dbRef($db, "projects"), (snap) => {
    const val = snap.val() || {};
    projects.value = Object.entries(val).map(([id, data]) => ({ id, data }));
  });
};

const loadReverseIndex = (projectId) => {
  if (typeof unsubReverse === "function") unsubReverse();
  reverseIds.value = [];

  if (!projectId) return;

  unsubReverse = onValue(dbRef($db, `tasksByProject/${projectId}`), (snap) => {
    const val = snap.val() || {};
    reverseIds.value = Object.keys(val);
  });
};

const loadTasksByIndex = (projectId) => {
  if (typeof unsubTasks === "function") unsubTasks();
  filteredTasks.value = [];

  if (!projectId) return;

  const q = query(dbRef($db, "tasks"), orderByChild("projectId"), equalTo(projectId));

  unsubTasks = onValue(q, (snap) => {
    const val = snap.val() || {};
    filteredTasks.value = Object.entries(val).map(([id, data]) => ({ id, data }));
  });
};

const reloadAll = () => {
  loadProjects();
  loadReverseIndex(selectedProjectId.value);
  loadTasksByIndex(selectedProjectId.value);
};

watch(selectedProjectId, (id) => {
  loadReverseIndex(id);
  loadTasksByIndex(id);
});

onMounted(() => {
  loadProjects();
});

onUnmounted(() => {
  stopAll();
});
</script>

<style scoped>
select, button {
  padding: 6px 8px;
  font-size: 14px;
}
button {
  cursor: pointer;
}
</style>
