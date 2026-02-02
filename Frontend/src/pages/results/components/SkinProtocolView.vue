<template>
  <div class="skin-protocol">
    <div v-if="data" class="accordion-list">
      <!-- Diagnostics -->
      <BaseAccordion 
        title="Bőrdiagnosztika" 
        badge="Alapok"
        :preview="data.profileDiagnostics.clinicalDefinition?.slice(0, 50) + '...'"
        default-open
      >
        <p class="def-text">{{ data.profileDiagnostics.clinicalDefinition }}</p>
        <div v-if="data.profileDiagnostics.sensoryAnalysis" class="two-col">
          <div class="info-block morning">
            <span class="block-label">Reggel</span>
            <p>{{ data.profileDiagnostics.sensoryAnalysis.morning }}</p>
          </div>
          <div class="info-block midday">
            <span class="block-label">Délben</span>
            <p>{{ data.profileDiagnostics.sensoryAnalysis.midDay }}</p>
          </div>
        </div>
      </BaseAccordion>

      <!-- Core Methods -->
      <BaseAccordion 
        title="Kulcsmódszerek" 
        badge="Technikák"
        :preview="Object.keys(data.coreMethodologies).length + ' módszer'"
      >
        <div class="methods-list">
          <div v-for="(value, key) in data.coreMethodologies" :key="key" class="method-item">
            <span class="method-name">{{ methodNames[key] || key }}</span>
            <p class="method-desc">{{ value }}</p>
          </div>
        </div>
      </BaseAccordion>

      <!-- Morning Routine -->
      <BaseAccordion 
        title="Reggeli Rutin" 
        badge="AM"
        :preview="Object.keys(data.comprehensiveSkincareRoutine.morningRegimen).length + ' lépés'"
      >
        <RoutineSteps :steps="data.comprehensiveSkincareRoutine.morningRegimen" />
      </BaseAccordion>

      <!-- Evening Routine -->
      <BaseAccordion 
        title="Esti Rutin" 
        badge="PM"
        :preview="Object.keys(data.comprehensiveSkincareRoutine.eveningRegimen).length + ' lépés'"
      >
        <RoutineSteps :steps="data.comprehensiveSkincareRoutine.eveningRegimen" is-evening />
      </BaseAccordion>

      <!-- Hero Ingredients -->
      <BaseAccordion 
        v-if="data.ingredientArchitecture?.heroIngredients"
        title="Kulcs Összetevők" 
        badge="Hatóanyagok"
        :preview="data.ingredientArchitecture.heroIngredients.map(i => i.name).join(', ')"
      >
        <div class="ingredients-list">
          <div v-for="ing in data.ingredientArchitecture.heroIngredients" :key="ing.name" class="ingredient-item">
            <span class="ingredient-name">{{ ing.name }}</span>
            <p>{{ ing.synergy || ing.bestUse || ing.note || ing.benefit }}</p>
          </div>
        </div>
      </BaseAccordion>
    </div>

    <!-- Skin Problems -->
    <div v-if="problemsWithProtocol.length" class="problems-section">
      <h2 class="problems-title">Észlelt Bőrproblémák</h2>
      <div class="accordion-list">
        <BaseAccordion
          v-for="problem in problemsWithProtocol"
          :key="problem.name"
          :title="problem.protocol.metaData?.displayName || problem.name"
          badge="Probléma"
        >
          <ProblemProtocol :problem="problem" />
        </BaseAccordion>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BaseAccordion from '@/components/common/base/BaseAccordion.vue'
import RoutineSteps from '@/components/features/results/RoutineSteps.vue'
import ProblemProtocol from '@/components/features/results/ProblemProtocol.vue'

const props = defineProps({
  protocol: { type: Object, required: true },
  skinType: { type: String, required: true },
  problemsProtocol: { type: Object, default: null },
  skinProblems: { type: Array, default: () => [] }
})

const methodNames = {
  HydrationIsKey: 'A hidratálás a kulcs',
  TheOilDissolvesOilRule: 'Olaj az olajat oldja',
  GentleExfoliation: 'Kíméletes hámlasztás',
  LipidReplacementTherapy: 'Lipidpótlás',
  OcclusionStrategy: 'Fedő technika',
  MicroExfoliation: 'Mikrohámlasztás',
  MoistureSandwich: 'Nedvesség szendvics',
  ZoneTherapy: 'Zónás kezelés',
  HydrationFirst: 'Hidratálás először',
  LayeringTechnique: 'Rétegzés technika',
  TheNiacinamideBridge: 'Niacinamid híd',
  StatusQuoMaintenance: 'Státuszfenntartás',
  TheGlowProtocol: 'Ragyogás protokoll',
  AntioxidantBanking: 'Antioxidáns tartalék',
  MicroDosing: 'Mikrodózis'
}

const data = computed(() => {
  const key = Object.keys(props.protocol).find(k => k.includes('MasterProtocol'))
  return key ? props.protocol[key] : null
})

const problemsWithProtocol = computed(() => {
  if (!props.skinProblems || !props.problemsProtocol) return []
  return props.skinProblems
    .filter(p => props.problemsProtocol[p])
    .map(p => ({ name: p, protocol: props.problemsProtocol[p] }))
})
</script>

<style scoped lang="scss">
.accordion-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.def-text {
  font-size: var(--text-base);
  line-height: 1.7;
  color: var(--text-secondary);
  margin-bottom: 1.25rem;
}

// Two column layout
.two-col {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-block {
  padding: 1rem;
  border-radius: var(--radius-md);
  
  &.morning {
    background: var(--primary-100);
    border-left: 3px solid var(--secondary-500);
  }
  
  &.midday {
    background: var(--secondary-100);
    border-left: 3px solid var(--secondary-600);
  }
  
  .block-label {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(0,0,0,0.5);
    display: block;
    margin-bottom: 0.5rem;
  }
  
  p {
    margin: 0;
    font-size: var(--text-sm);
    color: rgba(0,0,0,0.8);
    line-height: 1.5;
  }
}

// Methods list
.methods-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.method-item {
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-primary);
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
}

.method-name {
  font-weight: 600;
  color: var(--secondary-700);
  display: block;
  margin-bottom: 0.25rem;
}

.method-desc {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.6;
}

// Ingredients
.ingredients-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.ingredient-item {
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--secondary-400);
}

.ingredient-name {
  font-weight: 600;
  color: var(--text-primary);
  display: block;
  margin-bottom: 0.25rem;
}

.ingredient-item p {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

// Problems section
.problems-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid var(--secondary-200);
}

.problems-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--error);
  margin-bottom: 1rem;
}

// Dark mode
.theme-dark {
  .info-block.morning {
    background: rgba(212, 144, 122, 0.15);
    
    .block-label, p { color: var(--text-primary); }
  }
  
  .info-block.midday {
    background: rgba(212, 144, 122, 0.1);
    
    .block-label, p { color: var(--text-primary); }
  }
  
  .problems-section {
    border-color: rgba(255, 255, 255, 0.1);
  }
}
</style>