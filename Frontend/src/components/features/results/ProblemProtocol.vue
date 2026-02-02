<template>
  <div class="problem-protocol">
    <ProtocolSection :title="problem.protocol.metaData?.displayName || problem.name">
      <p v-if="problem.protocol.metaData?.description" class="description">
        {{ problem.protocol.metaData.description }}
      </p>
    </ProtocolSection>

    <!-- Visual Diagnostics -->
    <ProtocolSection v-if="problem.protocol.visualDiagnostics" title="Tünetek felismerése">
      <div class="diagnostics-grid">
        <ProtocolCard 
          v-if="problem.protocol.visualDiagnostics.symptoms" 
          title="Jellemzők" 
          accent-color="#ef4444"
        >
          {{ problem.protocol.visualDiagnostics.symptoms }}
        </ProtocolCard>
        <ProtocolCard 
          v-if="problem.protocol.visualDiagnostics.locationLogic" 
          title="Hol jelenik meg?" 
          accent-color="#f97316"
        >
          {{ problem.protocol.visualDiagnostics.locationLogic }}
        </ProtocolCard>
        <ProtocolCard 
          v-if="problem.protocol.visualDiagnostics.whatNotToDo" 
          title="Mit NE tegyél!" 
          accent-color="#dc2626"
        >
          <span class="warning">{{ problem.protocol.visualDiagnostics.whatNotToDo }}</span>
        </ProtocolCard>
      </div>
    </ProtocolSection>

    <!-- Routine Addons -->
    <ProtocolSection v-if="problem.protocol.routineAddons" title="Kezelési tanácsok">
      <div class="grid">
        <ProtocolCard 
          v-for="(value, key) in routineAddons" 
          :key="key" 
          :title="ADDON_LABELS[key]" 
          :accent-color="ADDON_COLORS[key]"
        >
          {{ value }}
        </ProtocolCard>
      </div>
    </ProtocolSection>

    <!-- Makeup Adjustments -->
    <ProtocolSection v-if="problem.protocol.makeupAdjustments" title="Smink tippek">
      <div class="grid">
        <ProtocolCard 
          v-for="(value, key) in problem.protocol.makeupAdjustments" 
          :key="key"
          :title="MAKEUP_LABELS[key] || key"
          accent-color="#ec4899"
        >
          {{ value }}
        </ProtocolCard>
      </div>
    </ProtocolSection>

    <!-- Ingredients -->
    <ProtocolSection v-if="problem.protocol.ingredientLogic" title="Összetevők">
      <div class="ingredients-grid">
        <ProtocolCard 
          v-if="problem.protocol.ingredientLogic.hero" 
          title="Ajánlott" 
          accent-color="#22c55e"
        >
          {{ problem.protocol.ingredientLogic.hero }}
        </ProtocolCard>
        <ProtocolCard 
          v-if="problem.protocol.ingredientLogic.avoid" 
          title="Kerülendő" 
          accent-color="#ef4444"
        >
          <span class="warning">{{ problem.protocol.ingredientLogic.avoid }}</span>
        </ProtocolCard>
      </div>
    </ProtocolSection>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ProtocolSection from './ProtocolSection.vue'
import ProtocolCard from './ProtocolCard.vue'

const props = defineProps({
  problem: { type: Object, required: true }
})

const ADDON_LABELS = {
  cleansingTweak: 'Tisztítás',
  treatmentStep: 'Kezelés',
  emergencyHack: 'Gyors segítség',
  tool: 'Eszköz'
}

const ADDON_COLORS = {
  cleansingTweak: '#10b981',
  treatmentStep: '#3b82f6',
  emergencyHack: '#8b5cf6',
  tool: '#06b6d4'
}

const MAKEUP_LABELS = {
  primerTip: 'Primer tipp',
  foundation: 'Alapozás',
  concealer: 'Korrektor',
  setting: 'Fixálás',
  foundationTexture: 'Alapozó textúra',
  productSelection: 'Termékválasztás',
  concealerTrick: 'Korrektor trükk',
  colorTheory: 'Színelmélet'
}

const routineAddons = computed(() => {
  const addons = props.problem.protocol.routineAddons
  if (!addons) return {}
  return Object.fromEntries(
    Object.entries(addons).filter(([key]) => ADDON_LABELS[key] && addons[key])
  )
})
</script>

<style scoped lang="scss">
.problem-protocol {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-primary);
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
}

.description {
  font-family: 'Georgia', serif;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
}

.grid,
.diagnostics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.75rem;
}

.ingredients-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.warning {
  color: #dc2626;
  font-weight: 500;
}

// Dark mode
.theme-dark {
  .problem-protocol {
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .description {
    color: rgba(255, 255, 255, 0.8);
  }
  
  .warning {
    color: #fca5a5;
  }
}
</style>
