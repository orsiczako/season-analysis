<template>
  <div v-if="errorMessage || successMessage" class="message-container">
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
    <div v-if="successMessage" class="success">{{ successMessage }}</div>
  </div>
</template>

<script setup>
defineProps({
  errorMessage: {
    type: String,
    default: ''
  },
  successMessage: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.message-container {
  margin-bottom: var(--space-4);
}

.error {
  color: var(--error-dark);
  background: var(--error-light);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--error);
  font-size: var(--text-sm);
  line-height: 1.5;
  margin-bottom: var(--space-3);
}

.success {
  color: var(--success-dark);
  background: var(--success-light);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--success);
  font-size: var(--text-sm);
  line-height: 1.5;
  margin-bottom: var(--space-3);
}
</style>
