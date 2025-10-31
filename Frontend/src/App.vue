<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { useAuth } from '@/composables/useAuth.js'

export default {
  name: 'App',
  setup() {
    const { initAuth } = useAuth()
    return { initAuth }
  },
  mounted() {
    // Indításkor ellenőrizzük a tárolt token érvényességét
    this.initAuth()
  }
}
</script>

<style>
/* A CSS-t külön fájlba tesszük */
</style>
