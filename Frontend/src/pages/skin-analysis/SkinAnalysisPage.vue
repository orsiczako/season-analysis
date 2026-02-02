<template>
  <div class="module-layout">
    <AnimatedBackground />
    <PageHeader back-to="/dashboard" />

    <div class="module-content">
      <div class="skin-analysis-page">
        <h1 class="main-title">
          Bőrelemzés AI-al
        </h1>

        <div v-if="isLoadingPage" class="upload-card">
          <div class="analyzing-state">
            <div class="spinner" />
            <p class="analyzing-text">
              Adatok betöltése...
            </p>
          </div>
        </div>

        <div v-if="!analysisResult && !isAnalyzing && !isLoadingPage" class="upload-card">
          <div class="upload-section">
            <div class="icon-wrapper">
              <img src="/media/ai.png" alt="Bőrelemzés" class="feature-icon">
              <div class="icon-glow" />
            </div>

            <h2 class="upload-title">
              Kép feltöltése
            </h2>
            <p class="upload-description">
              Töltsd fel az arcodról készült képet, és az AI meghatározza bőrtípusodat.
              <br>
              Támogatott formátumok: JPG, PNG (max. 10MB)
            </p>

            <div class="file-input-wrapper">
              <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/jpg" class="hidden-input"
                @change="handleFileSelect">
              <BaseButton v-if="!selectedFile" variant="primary" size="lg" :disabled="isAnalyzing"
                @click="triggerFileInput">
                <span class="button-content">Kép kiválasztása</span>
              </BaseButton>
            </div>

            <div v-if="selectedFile && !isAnalyzing" class="file-preview">
              <img :src="previewUrl" alt="Preview" class="preview-image">
              <div class="file-info">
                <p class="file-name">
                  {{ selectedFile.name }}
                </p>
                <p class="file-size">
                  {{ formatFileSize(selectedFile.size) }}
                </p>
              </div>
              <div class="preview-actions">
                <BaseButton variant="primary" size="lg" @click="analyzeImage">
                  Elemzés indítása
                </BaseButton>
                <BaseButton variant="secondary" size="md" @click="clearSelection">
                  Törlés
                </BaseButton>
              </div>
            </div>
          </div>
        </div>

        <div v-if="isAnalyzing && !isLoadingPage" class="upload-card">
          <div class="analyzing-state">
            <div class="spinner" />
            <p class="analyzing-text">
              Elemzés folyamatban...
            </p>
            <p class="analyzing-subtext">
              Ez eltarthat néhány másodpercig
            </p>
          </div>
        </div>

        <div v-if="analysisResult && !isAnalyzing && !isLoadingPage" class="success-container">
          <div class="success-card">
            <div class="success-icon">
              <CheckCircle :size="64" />
            </div>
            <h2 class="success-title">
              Elemzés sikeres!
            </h2>

            <div class="success-result">
              <span class="result-label">Bőrtípusod:</span>
              <span class="result-value" :class="`type-${analysisResult.analysis?.skinType}`">
                {{ getSkinTypeLabel(analysisResult.analysis?.skinType) }}
              </span>
            </div>

            <div v-if="detectedProblems.length > 0" class="problems-result">
              <span class="result-label">Észlelt bőrproblémák:</span>
              <div class="problems-tags">
                <span v-for="problem in detectedProblems" :key="problem.problem || problem.name_hu || problem"
                  class="problem-tag">
                  {{ getProblemLabel(problem) }}
                </span>
              </div>
            </div>
            <div v-else class="no-problems">
              <span class="no-problems-text">Nem észleltünk bőrproblémát</span>
            </div>

            <p class="success-description">
              A részletes elemzést és személyre szabott tanácsokat az Eredményeim oldalon találod.
            </p>
            <div class="success-actions">
              <BaseButton variant="primary" size="sm" @click="goToResults">
                Eredmények megtekintése
              </BaseButton>
              <BaseButton variant="secondary" size="sm" @click="resetAnalysis">
                Új elemzés
              </BaseButton>
            </div>
          </div>
        </div>

        <div v-if="errorMessage" class="error-card">
          <div class="error-content">
            <p class="error-message">
              {{ errorMessage }}
            </p>
            <BaseButton variant="primary" @click="errorMessage = null">
              Rendben
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
//Reaktív változók,származtatott érték és komponens importok  
import { ref, computed, onMounted, watch } from 'vue'
// Vue Router használata az oldalváltáshoz
import { useRouter, useRoute } from 'vue-router'
import { CheckCircle } from 'lucide-vue-next'
import AnimatedBackground from '@/layouts/AnimatedBackground.vue'
import PageHeader from '@/components/common/layout/PageHeader.vue'
import BaseButton from '@/components/common/base/BaseButton.vue'
import { apiClient, userService } from '@/services'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const route = useRoute()
const fileInput = ref(null)
const selectedFile = ref(null)
const previewUrl = ref(null)

// Állapotjelzők
const isAnalyzing = ref(false)     // Képelemzés folyamatban
const isLoadingPage = ref(true)    //Oldal betöltése
const analysisResult = ref(null)
const errorMessage = ref(null)

const detectedProblems = computed(() => {
  //Csak akkor megy a következőre, ha van analysisResult és benne analysis és skinProblems és detected, hogy ne legyen undefined -> üres tömb
  return analysisResult.value?.analysis?.skinProblems?.detected || []
})

// Ez a függvény tölti be az adatokat induláskor
const loadInitialData = async () => {
  isLoadingPage.value = true // Betöltés indul

  try {
    const { setAnalysisResult, getUserId } = useAuth()
    const userId = getUserId()

    // MINDIG az API-ból töltünk, cache-t kikerüljük (hogy friss adatot kapjunk)
    const res = await userService.getAnalysesResults()

    // Itt a kulcs: Ha van eredmény, mentsük el. Ha nincs, legyen NULL.
    if (res.success && res.data?.skinAnalysis) {
      const skinAnalysisData = res.data.skinAnalysis

      // Formátálás: az API skinProblems lehet tömb vagy objektum
      // Ha tömb, csomagoljuk { detected: [...] } formátumba
      let detectedProblems = []
      if (Array.isArray(skinAnalysisData.skinProblems)) {
        // Ha csak sima tömb, már formázott vagy stringek
        detectedProblems = skinAnalysisData.skinProblems
      } else if (skinAnalysisData.skinProblems?.detected) {
        // Ha már { detected: [...] } formátum
        detectedProblems = skinAnalysisData.skinProblems.detected
      }

      analysisResult.value = {
        analysis: {
          skinType: skinAnalysisData.skinType,
          skinProblems: {
            detected: detectedProblems
          },
          analyzedAt: skinAnalysisData.analyzedAt
        }
      }

      // Protocol adatok hozzáadása, ha vannak
      if (res.data.protocol) {
        analysisResult.value.protocol = res.data.protocol
      }
      if (res.data.problemsProtocol) {
        analysisResult.value.problemsProtocol = res.data.problemsProtocol
      }

      // Cache mentése
      if (userId) setAnalysisResult(analysisResult.value, userId)

    } else {
      // Ha nincs adat az adatbázisban, explicit nullázzuk, hogy megjelenjen az Upload kártya
      analysisResult.value = null
    }

  } catch (err) {
    console.error('Hiba az adatok betöltésekor:', err)
    // Hiba esetén is nullázunk, hogy a felhasználó tudjon új elemzést indítani
    analysisResult.value = null
  } finally {
    // Bármi történik, a töltést leállítjuk, így megjelenik a felület
    isLoadingPage.value = false
  }
}

onMounted(() => {
  loadInitialData()
})

// Figyeljük a route változását (navigációt), és újratöltjük az adatokat
watch(
  () => route.fullPath,
  () => {
    loadInitialData()
  }
)

// ... A többi függvény (triggerFileInput, handleFileSelect, stb.) marad változatlan ...
const triggerFileInput = () => { fileInput.value?.click() }

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return
  if (file.size > 10 * 1024 * 1024) {
    errorMessage.value = 'A fájl mérete túl nagy! Maximum 10MB lehet.'
    return
  }
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
  if (!validTypes.includes(file.type)) {
    errorMessage.value = 'Érvénytelen fájlformátum! Csak JPG és PNG képek engedélyezettek.'
    return
  }
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  errorMessage.value = null
}

const clearSelection = () => {
  selectedFile.value = null
  previewUrl.value = null
  if (fileInput.value) fileInput.value.value = ''
}

const analyzeImage = async () => {
  if (!selectedFile.value) return
  isAnalyzing.value = true
  errorMessage.value = null
  try {
    const formData = new FormData()
    formData.append('image', selectedFile.value)
    const response = await apiClient.post('/api/ai/analyze-skin', formData)
    if (response.data?.success) {
      analysisResult.value = {
        analysis: response.data.analysis,
        protocol: response.data.protocol,
        problemsProtocol: response.data.problemsProtocol
      }
      // Cache mentése
      const { setAnalysisResult, getUserId } = useAuth()
      const userId = getUserId()
      if (userId) setAnalysisResult(analysisResult.value, userId)
    } else {
      errorMessage.value = response.data?.message || 'Hiba történt az elemzés során.'
    }
  } catch (error) {
    console.error('Analysis error:', error)
    errorMessage.value = error.response?.data?.message || 'Hiba történt az elemzés során.'
  } finally {
    isAnalyzing.value = false
  }
}

const resetAnalysis = () => {
  analysisResult.value = null
  clearSelection()
}

const goToResults = () => {
  router.push({ path: '/results', query: { tab: 'skin' } })
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const getSkinTypeLabel = (type) => {
  const labels = {
    oily: 'Zsíros bőr',
    dry: 'Száraz bőr',
    normal: 'Normál bőr',
    combination: 'Kombinált bőr'
  }
  return labels[type] || type
}

const getProblemLabel = (problem) => {
  // Ha objektum, használjuk a name_hu-t vagy problem-ot
  const problemName = problem?.problem || problem?.name_hu || problem
  const labels = {
    'Acne': 'Pattanások',
    'Bags': 'Szem alatti karikák',
    'Redness': 'Bőrpír',
    'Milia': 'Mília (fehér pontok)',
    'WhiteHead': 'Mitesszer',
    'Wrinkles': 'Ráncok',
    'Dark Spots': 'Pigmentfoltok',
    'Dryness': 'Szárazság',
    'Oiliness': 'Zsírosság'
  }
  return labels[problemName] || problem?.name_hu || problemName
}
</script>
<style scoped lang="scss">
@use '@/assets/mixins.scss' as *;

.module-content {
  /* Központosítás */
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 1rem 2rem;
  /* Top padding a header miatt */
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.skin-analysis-page {
  @include flex-col;
  width: 100%;
  gap: var(--space-6);
  position: relative;
  z-index: 1;
}

.main-title {
  @include page-title;
  font-size: clamp(2rem, 5vw, 2.5rem);
  margin-bottom: 0;
  text-align: center;
  animation: fadeIn 0.6s ease-out 0.4s both;
}

.upload-card {
  @include glass-card;
  padding: 2.5rem;
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;

  &:hover {
    box-shadow: var(--shadow-xl);
    transform: translateY(-4px);
  }
}

.upload-section {
  text-align: center;
}

.icon-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto var(--space-6);
  z-index: 3;
}

.feature-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.15));
  animation: float 3s ease-in-out infinite;
}

.icon-glow {
  position: absolute;
  inset: 0;
  background: var(--secondary-500);
  border-radius: 50%;
  opacity: 0.2;
  filter: blur(40px);
  animation: pulse 2s ease-in-out infinite;
}

.upload-title {
  @include section-title;
  font-size: 1.75rem;
  margin-bottom: 1rem;
}

.upload-description {
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.7;
}

.file-input-wrapper {
  margin-bottom: var(--space-4);
}

.hidden-input {
  display: none;
}

.button-content {
  @include flex-center;
  gap: var(--space-2);
}

/* File Preview */
.file-preview {
  @include flex-col-center;
  gap: var(--space-4);
  margin-top: var(--space-6);
  width: 100%;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  object-fit: contain;
}

.file-info {
  text-align: center;
}

.file-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.file-size {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.preview-actions {
  @include flex-center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

/* Analyzing State */
.analyzing-state {
  @include analyzing-state;
}

.spinner {
  @include spinner;
}

.analyzing-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 1rem;
}

.analyzing-subtext {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* Success Card */
.success-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.success-card {
  @include success-card;
  padding: 3rem 2rem;
  width: 100%;
  max-width: 600px;
  text-align: center;
}

.success-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin-bottom: 1.5rem;
  color: var(--secondary-600);
  background: var(--secondary-50);
  border-radius: 50%;
}

.success-title {
  @include page-title;
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
}

.success-result {
  @include flex-col;
  padding: 1rem;
  background: var(--secondary-50);
  border-radius: var(--radius-lg);
  border: 1px solid var(--secondary-200);
  margin-bottom: 1.5rem;
}

.result-label {
  @include label-style;
  color: var(--secondary-500);
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}

.result-value {
  font-family: var(--font-sans);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--secondary-700);
}

/* Bőrproblémák */
.problems-result {
  @include flex-col;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.05);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(239, 68, 68, 0.15);
}

.problems-tags {
  @include flex-center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.problem-tag {
  @include chip-style;
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.25rem 0.75rem;
  font-size: 0.9rem;
}

.problem-confidence {
  font-size: 0.75rem;
  font-weight: 500;
  color: #b91c1c;
  opacity: 0.8;
  margin-left: 0.5rem;
}

.no-problems {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(16, 185, 129, 0.05);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(16, 185, 129, 0.15);
}

.no-problems-text {
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 600;
  color: #10b981;
}

/* Success Actions */
.success-actions {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

/* Error Card */
.error-card {
  @include error-card;
  margin-top: var(--space-4);
  text-align: center;
}

.error-content {
  @include flex-col-center;
  gap: var(--space-4);
}

.error-message {
  color: var(--error);
  font-weight: 500;
  margin: 0;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.2;
  }

  50% {
    transform: scale(1.1);
    opacity: 0.3;
  }
}

/* Dark Mode */
:global(.theme-dark) .upload-card {
  background: rgba(30, 30, 30, 0.95);
  border-color: rgba(255, 255, 255, 0.08);
}

:global(.theme-dark) .main-title,
:global(.theme-dark) .upload-title,
:global(.theme-dark) .success-title {
  color: #ffffff;
}

:global(.theme-dark) .upload-description {
  color: rgba(255, 255, 255, 0.7);
}

:global(.theme-dark) .success-card {
  background: rgba(30, 30, 30, 0.95);
  border-color: rgba(255, 255, 255, 0.08);
}

:global(.theme-dark) .success-icon {
  background: rgba(255, 255, 255, 0.05);
  color: var(--secondary-300);
}

/* Responsive */
@media (max-width: 768px) {
  .module-content {
    padding: 60px 1rem 1rem;
    /* Kisebb padding mobilon */
  }

  .upload-card {
    padding: 1.5rem;
  }

  .icon-wrapper {
    width: 80px;
    height: 80px;
    margin-bottom: 1rem;
  }

  .main-title {
    font-size: 1.75rem;
  }

  .success-card {
    padding: 2rem 1rem;
  }

  .success-actions {
    flex-direction: column;
    width: 100%;
  }

  .success-actions .base-btn {
    width: 100%;
    font-size: 1rem !important;
    padding: 0.75rem 1rem;
  }
}
</style>