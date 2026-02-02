<template>
  <div class="steps-list">
    <div v-for="(step, key) in steps" :key="key" class="step-item">
      <div class="step-badge" :class="{ evening: isEvening }">
        {{ getStepNumber(key) }}
      </div>
      <div class="step-content">
        <h4 class="step-title">{{ getStepName(key) }}</h4>
        <div v-for="(value, field) in getStepDetails(step)" :key="field" class="step-detail">
          <span class="detail-label">{{ field }}:</span> {{ value }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  steps: { type: Object, required: true },
  isEvening: { type: Boolean, default: false }
})

const STEP_NAMES = {
  Cleansing: 'Tisztítás', Toning: 'Tonizálás', EssenceToner: 'Esszencia/Tonik',
  Essence: 'Esszencia', FunctionalSerums: 'Hatóanyag szérumok', Moisturizing: 'Hidratálás',
  ZoneMoisturizing: 'Zónás hidratálás', SunProtection: 'Fényvédelem',
  DoubleCleansing: 'Dupla tisztítás', OilCleansing: 'Olajos tisztítás',
  CreamCleansing: 'Krémes tisztítás', ActiveTreatments: 'Aktív kezelések',
  OcclusiveAndSlugging: 'Okkuzív lezárás', NightCream: 'Éjszakai krém'
}

const DETAIL_LABELS = {
  goal: 'Cél', concept: 'Cél', product: 'Termék', formula: 'Típus',
  technique: 'Technika', primary: 'Összetevő', reason: 'Miért',
  phase1: '1. fázis', phase2: '2. fázis', tip: 'Tipp'
}

const getStepNumber = (key) => {
  const match = key.match(/step(\d+)/)
  return match ? match[1] : '?'
}

const getStepName = (key) => {
  const base = key.replace(/step\d+_/, '')
  return STEP_NAMES[base] || base.replace(/([A-Z])/g, ' $1').trim()
}

const getStepDetails = (step) => {
  const details = {}
  for (const [key, label] of Object.entries(DETAIL_LABELS)) {
    if (step[key]) details[label] = step[key]
  }
  return details
}
</script>

<style scoped lang="scss">
.steps-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.step-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--card-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.step-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  min-width: 28px;
  background: var(--secondary-100);
  color: var(--secondary-600);
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.85rem;
  
  &.evening {
    background: var(--accent-100);
    color: var(--accent-700);
  }
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem;
}

.step-detail {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.detail-label {
  font-weight: 600;
  color: var(--secondary-500);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

// Dark mode
.theme-dark .step-item {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08);
}
</style>
