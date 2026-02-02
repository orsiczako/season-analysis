<template>
  <div class="makeup-card">
    <div class="card-header">
      <div class="accent-bar" :style="{ background: accent }" />
      <h4 class="card-title">{{ title }}</h4>
    </div>
    
    <div class="card-body">
      <div class="fields-grid">
        <div 
          v-for="field in visibleFields" 
          :key="field.key" 
          class="field-item"
          :class="{ 'full-width': field.fullWidth }"
        >
          <span class="field-label">{{ field.label }}</span>
          <span class="field-value">{{ formatValue(data[field.key], field) }}</span>
        </div>
      </div>
      
      <!-- Tip boxes -->
      <div v-for="field in tipFields" :key="field.key" class="tip-box">
        <span class="tip-label">{{ field.label }}</span>
        <p class="tip-text">{{ data[field.key] }}</p>
      </div>
      
      <!-- Warning box -->
      <div v-if="warningField && data[warningField.key]" class="warning-box">
        <span class="warning-label">{{ warningField.label }}</span>
        <p class="warning-text">{{ data[warningField.key] }}</p>
      </div>
      
      <!-- Why text -->
      <p v-if="whyField && data[whyField.key]" class="why-text">
        {{ data[whyField.key] }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  data: { type: Object, required: true },
  fields: { type: Array, required: true },
  accent: { type: String, default: 'var(--secondary-400)' }
})

const visibleFields = computed(() => 
  props.fields.filter(f => f.label && !f.isTip && !f.isWarning && !f.isWhy && props.data[f.key])
)

const tipFields = computed(() => 
  props.fields.filter(f => f.isTip && props.data[f.key])
)

const warningField = computed(() => 
  props.fields.find(f => f.isWarning)
)

const whyField = computed(() => 
  props.fields.find(f => f.isWhy)
)

const formatValue = (value, field) => {
  if (field.isArray && Array.isArray(value)) {
    return value.join(', ')
  }
  return value
}
</script>

<style scoped lang="scss">
.makeup-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--card-border);
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.card-header {
  position: relative;
  padding: 1rem;
  padding-top: 1.25rem;
}

.accent-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
}

.card-title {
  font-size: var(--text-sm);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-primary);
  margin: 0;
}

.card-body {
  padding: 0 1rem 1rem;
}

.fields-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.field-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  
  &.full-width {
    grid-column: 1 / -1;
  }
}

.field-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--secondary-500);
}

.field-value {
  font-size: var(--text-sm);
  color: var(--text-primary);
  line-height: 1.4;
}

.tip-box {
  background: var(--secondary-50);
  border-left: 3px solid var(--secondary-400);
  padding: 0.75rem 1rem;
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  margin-bottom: 0.75rem;
}

.tip-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--secondary-600);
  display: block;
  margin-bottom: 0.25rem;
}

.tip-text {
  font-size: var(--text-sm);
  color: var(--text-primary);
  line-height: 1.5;
  margin: 0;
}

.warning-box {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
  margin-top: 0.5rem;
}

.warning-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #dc2626;
  display: block;
  margin-bottom: 0.25rem;
}

.warning-text {
  font-size: var(--text-sm);
  color: #991b1b;
  line-height: 1.5;
  margin: 0;
}

.why-text {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-style: italic;
  margin: 0;
}

// Dark mode
.theme-dark {
  .makeup-card {
    background: rgba(30, 30, 35, 0.6);
    border-color: rgba(255, 255, 255, 0.08);
  }
  
  .tip-box {
    background: rgba(180, 120, 100, 0.1);
  }
  
  .warning-box {
    background: rgba(239, 68, 68, 0.15);
  }
  
  .warning-text {
    color: #fca5a5;
  }
}
</style>
