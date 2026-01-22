<template>
  <div>
    <nav style="display:flex;gap:16px;padding:12px;border-bottom:1px solid #ddd;">
      <strong>MENU:</strong>
      <NuxtLink v-for="item in menu" :key="item.to" :to="item.to">
        {{ item.title }}
      </NuxtLink>
    </nav>

    <main style="padding: 16px;">
      <slot />
    </main>
  </div>
</template>

<script setup>
const appConfig = useAppConfig()
const menu = computed(() => Object.values(appConfig.menuItems || {}))
</script>
