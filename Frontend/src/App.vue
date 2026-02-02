<template>
  <div id="app">
    <router-view />
    <ToastMessage :visible="toast.state.visible" :message="toast.state.message" :type="toast.state.type" :duration="0"
      @hide="toast.hide" />
  </div>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700&display=swap" rel="stylesheet">
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth.js'
import { useToast } from '@/composables/useToast.js'
import ToastMessage from '@/components/common/feedback/ToastMessage.vue'

const { initAuth } = useAuth()
const toast = useToast()

onMounted(() => initAuth())
</script>

<style></style>
