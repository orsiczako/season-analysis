<template>
  <div class="accordion" :class="{ 'is-open': isOpen }">
    <button class="accordion-header" @click="toggle">
      <div class="header-left">
        <span v-if="badge" class="accordion-badge">{{ badge }}</span>
        <h3 class="accordion-title">{{ title }}</h3>
      </div>
      <div class="header-right">
        <span v-if="preview && !isOpen" class="accordion-preview">{{ preview }}</span>
        <span class="accordion-arrow">{{ isOpen ? '−' : '+' }}</span>
      </div>
    </button>
    <Transition name="accordion">
      <div v-show="isOpen" class="accordion-content">
        <div class="accordion-body">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  badge: { type: String, default: null },
  preview: { type: String, default: null },
  defaultOpen: { type: Boolean, default: false }
})

const isOpen = ref(props.defaultOpen)
const toggle = () => { isOpen.value = !isOpen.value }
</script>

<style scoped lang="scss">
.accordion {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--secondary-300);
  }
  
  &.is-open {
    border-color: var(--secondary-400);
    box-shadow: 0 4px 20px rgba(212, 144, 122, 0.1);
  }
}

.accordion-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: var(--bg-secondary);
  }
  
  .is-open & {
    background: var(--secondary-50);
    border-bottom: 1px solid var(--secondary-200);
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.accordion-badge {
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-full);
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--secondary-100);
  color: var(--secondary-600);
}

.accordion-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  text-align: left;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.accordion-preview {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.accordion-arrow {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: 50%;
  font-size: 1.25rem;
  font-weight: 300;
  color: var(--text-secondary);
  transition: all 0.3s;
  
  .is-open & {
    background: var(--secondary-500);
    color: white;
    transform: rotate(180deg);
  }
}

.accordion-content {
  overflow: hidden;
}

.accordion-body {
  padding: 1.25rem;
}

// Transition
.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.3s ease;
}

.accordion-enter-from,
.accordion-leave-to {
  opacity: 0;
  max-height: 0;
}

.accordion-enter-to,
.accordion-leave-from {
  opacity: 1;
  max-height: 2000px;
}

// Dark mode
.theme-dark {
  .accordion {
    background: rgba(30, 30, 35, 0.6);
    border-color: rgba(255, 255, 255, 0.08);
    
    &:hover {
      border-color: rgba(255, 255, 255, 0.15);
    }
    
    &.is-open {
      border-color: var(--secondary-600);
    }
  }
  
  .accordion-header:hover {
    background: rgba(255, 255, 255, 0.03);
  }
  
  .is-open .accordion-header {
    background: rgba(212, 144, 122, 0.1);
    border-color: rgba(212, 144, 122, 0.2);
  }
  
  .accordion-arrow {
    background: rgba(255, 255, 255, 0.1);
  }
}
</style>
