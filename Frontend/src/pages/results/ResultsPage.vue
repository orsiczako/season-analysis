<template>
  <div class="module-layout">
    <PageHeader back-to="/dashboard" />

    <div class="module-content">
      <div class="results-container">
        <div v-if="loading" class="loading-state">
          <div class="loader-wrapper">
            <div class="loader" />
            <p>Eredmények betöltése...</p>
          </div>
        </div>

        <div v-else class="content-wrapper">
          <div class="hero-header">
            <h1 class="hero-title">
              Elemzési Eredményeid
            </h1>
            <p class="hero-subtitle">
              Személyre szabott szépségápolási útmutatóid
            </p>
          </div>

          <div class="status-grid">
            <div class="status-card" :class="{ completed: hasColorAnalysis }">
              <div class="status-indicator" />
              <div class="status-content">
                <h3 class="status-title">
                  Színtípus Elemzés
                </h3>
                <p v-if="hasColorAnalysis" class="status-result">
                  {{ colorResult.displayName }}
                </p>
                <p v-else class="status-placeholder">
                  Még nem végezted el
                </p>
              </div>
              <div class="status-action">
                <BaseButton v-if="!hasColorAnalysis" variant="primary" size="sm" @click="navigateToChat">
                  Indítás
                </BaseButton>
                <span v-else class="check-mark">Kész</span>
              </div>
            </div>

            <div class="status-card" :class="{ completed: hasSkinAnalysis }">
              <div class="status-indicator" />
              <div class="status-content">
                <h3 class="status-title">
                  Bőrtípus Elemzés
                </h3>
                <p v-if="hasSkinAnalysis" class="status-result">
                  {{ skinTypeLabel }}
                </p>
                <p v-else class="status-placeholder">
                  Még nem végezted el
                </p>
              </div>
              <div class="status-action">
                <BaseButton v-if="!hasSkinAnalysis" variant="primary" size="sm" @click="navigateToSkinAnalysis">
                  Indítás
                </BaseButton>
                <span v-else class="check-mark">Kész</span>
              </div>
            </div>
          </div>

          <div v-if="hasAnyAnalysis" class="protocols-section">
            <div class="tabs-navigation">
              <button v-for="tab in availableTabs" :key="tab.id" class="tab-button"
                :class="{ active: activeTab === tab.id }" @click="setActiveTab(tab.id)">
                {{ tab.label }}
              </button>
            </div>

            <div class="tab-content-area">
              <SeasonProtocolView v-if="activeTab === 'season' && seasonProtocol" :protocol="seasonProtocol"
                :season-name="colorResult?.name" />

              <SkinProtocolView v-else-if="activeTab === 'skin' && skinProtocol" :protocol="skinProtocol"
                :skin-type="skinResult?.skinType" :problems-protocol="problemsProtocol"
                :skin-problems="skinResult?.skinProblems" />

              <CombinedProtocolView v-else-if="activeTab === 'combined'" :season-protocol="seasonProtocol"
                :skin-protocol="skinProtocol" :season-name="colorResult?.name" :skin-type="skinResult?.skinType"
                @change-tab="setActiveTab" />
            </div>
          </div>

          <div v-else class="locked-state">
            <div class="locked-card">
              <div class="locked-header">
                <h3 class="locked-title">
                  Kezdd el az átalakulást!
                </h3>
              </div>
              <p class="locked-desc">
                Végezd el valamelyik elemzést fenti gombokkal, hogy megkapd a személyre szabott útmutatódat. A teljes
                áttekintéshez mindkét elemzés szükséges.
              </p>

              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 0%" />
                </div>
                <span class="progress-text">0/2 elemzés kész</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PageHeader from '@/components/common/layout/PageHeader.vue'
import BaseButton from '@/components/common/base/BaseButton.vue'
import SeasonProtocolView from './components/SeasonProtocolView.vue'
import SkinProtocolView from './components/SkinProtocolView.vue'
import CombinedProtocolView from './components/CombinedProtocolView.vue'
import { userService } from '@/services'

const SKIN_TYPE_LABELS = { oily: 'Zsíros', dry: 'Száraz', normal: 'Normál', combination: 'Kombinált' }

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const activeTab = ref('combined') // Default, de felülírjuk majd

// Data States
const colorResult = ref(null)
const skinResult = ref(null)
const seasonProtocol = ref(null)
const skinProtocol = ref(null)
const problemsProtocol = ref(null)

// Computed Statuses
const hasColorAnalysis = computed(() => !!colorResult.value)
const hasSkinAnalysis = computed(() => !!skinResult.value)
const hasAnyAnalysis = computed(() => hasColorAnalysis.value || hasSkinAnalysis.value)
const allAnalysesCompleted = computed(() => hasColorAnalysis.value && hasSkinAnalysis.value)

// Dinamikus fül lista generálás
const availableTabs = computed(() => {
  const tabs = []

  // 1. Ha mindkettő kész, mehet az Áttekintés
  if (allAnalysesCompleted.value) {
    tabs.push({ id: 'combined', label: 'Áttekintés' })
  }

  // 2. Színtípus fül
  if (hasColorAnalysis.value) {
    tabs.push({ id: 'season', label: 'Színtípus' })
  }

  // 3. Bőrápolás fül
  if (hasSkinAnalysis.value) {
    tabs.push({ id: 'skin', label: 'Bőrápolás' })
  }

  return tabs
})

// UI Helpers
const skinTypeLabel = computed(() => {
  if (!skinResult.value) return ''
  return SKIN_TYPE_LABELS[skinResult.value.skinType] || skinResult.value.skinType
})

// Navigation Actions
const navigateToChat = () => router.push('/chat')
const navigateToSkinAnalysis = () => router.push('/skin-analysis')
const setActiveTab = (tabId) => { activeTab.value = tabId }

// Data Loading
const loadResults = async () => {
  loading.value = true
  try {
    const response = await userService.getAnalysesResults()
    if (response.success) {
      colorResult.value = response.data.colorSeason
      skinResult.value = response.data.skinAnalysis

      // API Protocols
      if (response.data.protocol) skinProtocol.value = response.data.protocol
      if (response.data.problemsProtocol) problemsProtocol.value = response.data.problemsProtocol

      // Static Loaders
      if (colorResult.value) await loadSeasonProtocol(colorResult.value.name)
      if (skinResult.value && !skinProtocol.value) await loadSkinProtocol(skinResult.value.skinType)

      // -- TAB LOGIKA FRISSÍTÉSE BETÖLTÉS UTÁN --
      determineInitialTab()
    }
  } catch (error) {
    console.error('Failed to load analysis results:', error)
  } finally {
    loading.value = false
  }
}

// Logika: Melyik fül legyen aktív betöltéskor?
const determineInitialTab = () => {
  const requestedTab = route.query.tab

  // 1. Ha a kért fül elérhető (pl. visszairányítás után), nyissuk meg azt
  const tabExists = availableTabs.value.find(t => t.id === requestedTab)
  if (tabExists) {
    activeTab.value = requestedTab
    return
  }

  // 2. Ha van 'combined' (mindkettő kész), az a default
  if (allAnalysesCompleted.value) {
    activeTab.value = 'combined'
    return
  }

  // 3. Ha csak az egyik van kész, nyissuk meg az első elérhetőt
  if (availableTabs.value.length > 0) {
    activeTab.value = availableTabs.value[0].id
  }
}

const loadSeasonProtocol = async (seasonName) => {
  try {
    const res = await fetch(`/protocols/season/${seasonName}.json`)
    if (!res.ok) throw new Error('Protocol not found')
    seasonProtocol.value = await res.json()
  } catch (e) { console.error('Season protocol error:', e) }
}

const loadSkinProtocol = async (skinType) => {
  try {
    const res = await fetch(`/protocols/skin/${skinType}.json`)
    if (!res.ok) throw new Error('Protocol not found')
    skinProtocol.value = await res.json()
  } catch (e) { console.error('Skin protocol error:', e) }
}

onMounted(loadResults)
</script>

<style scoped lang="scss">
@use '@/assets/mixins.scss' as *;

/* Results Specific */
.module-content {
  justify-content: center;
}

.results-container {
  width: 100%;
  max-width: 1000px;
}

/* Hero Section (Compact) */
.hero-header {
  text-align: center;
  margin-bottom: 2rem;
}

.hero-title {
  @include page-title;
  font-size: var(--text-3xl);
  margin-bottom: var(--space-2);
}

.hero-subtitle {
  font-size: var(--text-base);
  color: #3D3D3D;
  font-weight: 400;
  opacity: 0.8;
}

.theme-dark .hero-subtitle {
  color: #F5F5F5;
}

/* Status Cards */
.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.status-card {
  @include glass-card;
  @include flex-between;
  padding: 1rem 1.25rem;
  gap: 1rem;
  transition: transform 0.2s;

  &.completed {
    border-left: 4px solid #10b981;
  }

  &:not(.completed) {
    border-left: 4px solid var(--secondary-500);
  }
}

.status-content {
  flex: 1;
}

.status-title {
  @include section-title;
  font-size: var(--text-sm);
  margin: 0;
}

.status-result {
  font-size: 0.85rem;
  font-weight: 600;
  color: #10b981;
  margin: 0;
}

.status-placeholder {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-style: italic;
  margin: 0;
}

.check-mark {
  @include label-style;
  color: #10b981;
}

/* Tabs Navigation */
.tabs-navigation {
  @include flex-center;
  background: var(--bg-secondary);
  padding: 4px;
  border-radius: var(--radius-md);
  margin-bottom: 1.5rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.tab-button {
  @include tab-btn;
  flex: 1;
  border-bottom: none;

  &.active {
    background: #3D3D3D;
    color: #ffffff;
    border-bottom: none;
  }

  @media (max-width: 600px) {
    padding: 0.5rem 0.5rem;
    font-size: 0.7rem;
    min-width: 70px;
    border-radius: var(--radius-sm);
  }
}

.theme-dark .tab-button.active {
  background: #F5F5F5;
  color: #3D3D3D;
}

/* Locked State (Zero State) */
.locked-state {
  @include flex-center;
  margin-top: 2rem;
}

.locked-card {
  @include glass-card;
  max-width: 400px;
  padding: 2rem;
  text-align: center;
}

.locked-title {
  @include section-title;
  font-size: var(--text-lg);
  margin-bottom: 0.5rem;
}

.locked-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.progress-bar {
  height: 6px;
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: var(--secondary-500);
  transition: width 0.5s ease;
}

.progress-text {
  @include label-style;
}

/* Loader */
.loading-state {
  @include flex-center;
  min-height: 50vh;
  color: var(--text-secondary);
}

.loader {
  @include spinner(40px, 3px);
  border-color: var(--secondary-200);
  border-top-color: var(--secondary-500);
  margin: 0 auto 1rem;
}

/* Dark Mode Overrides */
:global(.theme-dark) .status-card {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.05);
}

:global(.theme-dark) .tabs-navigation {
  background: rgba(255, 255, 255, 0.05);
}

:global(.theme-dark) .tab-button.active {
  background: rgba(255, 255, 255, 0.1);
  color: var(--secondary-400);
}

:global(.theme-dark) .locked-card {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.05);
}
</style>