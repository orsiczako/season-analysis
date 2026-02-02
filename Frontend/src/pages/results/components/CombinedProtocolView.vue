<template>
  <div class="combined-protocol">
    <div class="accordion-list">
      <!-- Hero Card (Always visible) -->
      <div class="hero-card">
        <h2 class="hero-title">Személyre Szabott Szépségprofilod</h2>
        <div class="badges">
          <div class="badge">
            <span class="badge-label">Színtípus</span>
            <span class="badge-value">{{ seasonDisplay }}</span>
          </div>
          <div class="divider" />
          <div class="badge">
            <span class="badge-label">Bőrtípus</span>
            <span class="badge-value">{{ skinDisplay }}</span>
          </div>
        </div>
      </div>

      <!-- Golden Rule -->
      <BaseAccordion 
        v-if="synth"
        title="Aranyszabály"
        badge="Legfontosabb"
        :preview="synth.goldenSynergyRule.title"
        default-open
      >
        <div class="golden-rule">
          <h3>{{ synth.goldenSynergyRule.title }}</h3>
          <p>{{ synth.goldenSynergyRule.description }}</p>
        </div>
      </BaseAccordion>

      <!-- Synergy Cards -->
      <BaseAccordion 
        v-if="synth"
        title="Hogyan hangold össze?"
        badge="Szinergia"
        :preview="synth.synergyCards.length + ' stratégia'"
      >
        <div class="synergy-list">
          <div v-for="card in synth.synergyCards" :key="card.id" class="synergy-item">
            <h4 class="synergy-title">{{ card.title }}</h4>
            <div class="contributions">
              <div class="contribution">
                <span class="label">Bőrtípus alapján:</span>
                <span>{{ card.skinContribution }}</span>
              </div>
              <div class="contribution">
                <span class="label">Színtípus alapján:</span>
                <span>{{ card.colorContribution }}</span>
              </div>
            </div>
          </div>
        </div>
      </BaseAccordion>

      <!-- Smart Makeup -->
      <BaseAccordion 
        v-if="synth"
        title="Okos Sminkelés"
        badge="Smink"
        preview="Teljes smink útmutató"
      >
        <MakeupCard 
          v-for="(config, key) in makeupCards" 
          :key="key"
          :title="config.title"
          :data="synth.smartMakeupRoutine[key]"
          :fields="config.fields"
          :accent="config.accent"
        />
      </BaseAccordion>

      <!-- Color Correction -->
      <BaseAccordion 
        v-if="synth?.skincareColorCorrection"
        title="Színkorrekció"
        badge="Korrekció"
        :preview="synth.skincareColorCorrection.problem"
      >
        <div class="correction-grid">
          <div class="correction-box problem">
            <span class="correction-label">Probléma</span>
            <p>{{ synth.skincareColorCorrection.problem }}</p>
          </div>
          <div class="correction-box solution">
            <span class="correction-label">Megoldás</span>
            <p>{{ synth.skincareColorCorrection.solution }}</p>
          </div>
        </div>
      </BaseAccordion>

      <!-- Shopping List -->
      <BaseAccordion 
        v-if="synth"
        title="Gyors Bevásárlólista"
        badge="Vásárlás"
        :preview="Object.keys(synth.quickFixShoppingList).length + ' termék'"
      >
        <div class="shopping-grid">
          <div v-for="(value, key) in synth.quickFixShoppingList" :key="key" class="shopping-item">
            <span class="shopping-label">{{ SHOPPING_LABELS[key] }}</span>
            <p>{{ value }}</p>
          </div>
        </div>
      </BaseAccordion>

      <!-- Quick Tips -->
      <BaseAccordion 
        title="Gyors Tippek"
        badge="Összefoglaló"
        preview="Szín & Bőr tippek"
      >
        <div class="tips-grid">
          <div class="tip-box color">
            <span class="tip-label">Szín Tipp</span>
            <p v-if="seasonData">{{ seasonData.corePhilosophy.goldenRule }}</p>
            <div v-if="seasonData?.wardrobeColorPalette" class="swatches">
              <div 
                v-for="c in seasonData.wardrobeColorPalette.bestColors.slice(0, 4)" 
                :key="c.name"
                class="swatch" 
                :style="{ background: c.hex }" 
                :title="translateColor(c.name)" 
              />
            </div>
          </div>
          <div class="tip-box skin">
            <span class="tip-label">Bőr Tipp</span>
            <p v-if="skinData">{{ skinData.profileDiagnostics.clinicalDefinition }}</p>
          </div>
        </div>
      </BaseAccordion>

      <!-- Quick Overview -->
      <BaseAccordion 
        title="Gyors Áttekintés"
        badge="Összesítés"
        preview="Ideális & Kerülendő"
      >
        <div class="overview-grid">
          <div class="overview-box ideal">
            <span class="overview-label">Ideális Választás</span>
            <div v-if="seasonData" class="overview-content">
              <span class="detail-label">Kiemelt színek</span>
              <p>{{ seasonData.wardrobeColorPalette.bestColors.slice(0, 3).map(c => translateColor(c.name)).join(', ') }}</p>
            </div>
          </div>
          <div class="overview-box avoid">
            <span class="overview-label">Kerülendő</span>
            <div v-if="seasonData" class="overview-content">
              <span class="detail-label">Tiltólistás színek</span>
              <p>{{ seasonData.wardrobeColorPalette.colorsToAvoid.slice(0, 2).map(c => translateColor(c.name)).join(', ') }}</p>
            </div>
          </div>
        </div>
      </BaseAccordion>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BaseAccordion from '@/components/common/base/BaseAccordion.vue'
import MakeupCard from '@/components/features/results/MakeupCard.vue'
import { generateSynthesizedProfile } from '@/services/synthesis.service'

const props = defineProps(['seasonProtocol', 'skinProtocol', 'seasonName', 'skinType'])

const SEASON_NAMES = { spring: 'Tavasz', summer: 'Nyár', autumn: 'Ősz', winter: 'Tél' }
const SKIN_NAMES = { oily: 'Zsíros', dry: 'Száraz', normal: 'Normál', combination: 'Kombinált' }
const SHOPPING_LABELS = { foundation: 'Alapozó', blush: 'Pirosító', powder: 'Púder', lips: 'Rúzs' }

// Angol-Magyar szín fordító
const COLOR_NAMES = {
  // Spring
  'Camel': 'Teveszín', 'Cream/Ivory': 'Krém/Elefántcsont', 'Coral': 'Korall', 'Turquoise': 'Türkiz',
  'Apple Green': 'Almazöld', 'Golden Yellow': 'Aranysárga', 'Black': 'Fekete', 'Snow White': 'Hófehér',
  'Cool Grey': 'Hideg szürke', 'Fuchsia/Cool Berry': 'Fukszia/Hideg bogyó',
  // Summer
  'Pastel Blue/Baby Blue': 'Pasztellkék/Babakék', 'Soft Navy': 'Lágy sötétkék', 'Lavender': 'Levendula',
  'Grey (Minden árnyalat)': 'Szürke (minden árnyalat)', 'Mint Green': 'Mentazöld', 'Raspberry Red': 'Málnapiros',
  'Mustard/Gold': 'Mustár/Arany', 'Neon Colors': 'Neon színek', 'Orange': 'Narancs',
  // Autumn
  'Olive Green': 'Olívazöld', 'Mustard Yellow': 'Mustársárga', 'Rust/Terracotta': 'Rozsda/Terrakotta',
  'Cream/Beige': 'Krém/Bézs', 'Chocolate Brown': 'Csokoládébarna', 'Teal (Meleg)': 'Pávazöld (meleg)',
  'White': 'Fehér', 'Baby Pink/Blue': 'Babapink/Babakék',
  // Winter
  'Pure White': 'Tiszta fehér', 'True Black': 'Koromfekete', 'Royal Blue': 'Királykék',
  'Emerald Green': 'Smaragdzöld', 'Ruby Red': 'Rubinvörös', 'Icy Pastels': 'Jeges pasztellek',
  'Earth Tones': 'Földszínek', 'Warm Gold': 'Meleg arany'
}
const translateColor = (name) => COLOR_NAMES[name] || name

const seasonData = computed(() => {
  if (!props.seasonProtocol) return null
  const key = Object.keys(props.seasonProtocol).find(k => k.includes('ColorAnalysisProfile'))
  return key ? props.seasonProtocol[key] : null
})

const skinData = computed(() => {
  if (!props.skinProtocol) return null
  const key = Object.keys(props.skinProtocol).find(k => k.includes('MasterProtocol'))
  return key ? props.skinProtocol[key] : null
})

const synth = computed(() => {
  if (!props.seasonName || !props.skinType) return null
  return generateSynthesizedProfile(props.seasonName, props.skinType)
})

const seasonDisplay = computed(() => SEASON_NAMES[props.seasonName] || props.seasonName)
const skinDisplay = computed(() => SKIN_NAMES[props.skinType] || props.skinType)

const makeupCards = {
  baseStrategy: {
    title: 'Arcbázis Stratégia',
    accent: 'var(--secondary-400)',
    fields: [
      { key: 'productType', label: 'Termék típus' },
      { key: 'shadeGuide', label: 'Árnyalat' },
      { key: 'applicationHack', label: 'Tipp', isTip: true },
      { key: 'whyThisWorks', label: null, isWhy: true }
    ]
  },
  cheekAndContour: {
    title: 'Pirosító és Bronzosító',
    accent: 'var(--secondary-500)',
    fields: [
      { key: 'textureRecommendation', label: 'Textúra' },
      { key: 'colorRecommendation', label: 'Színek' },
      { key: 'bronzerStrategy', label: 'Bronzosító', isTip: true }
    ]
  },
  highlighterAlert: {
    title: 'Fényesítő',
    accent: 'var(--secondary-300)',
    fields: [
      { key: 'color', label: 'Szín' },
      { key: 'alternatives', label: 'Alternatívák', isArray: true },
      { key: 'placement', label: 'Elhelyezés', fullWidth: true },
      { key: 'warning', label: 'Figyelem', isWarning: true }
    ]
  },
  lipStrategy: {
    title: 'Rúzs Stratégia',
    accent: 'var(--secondary-600)',
    fields: [
      { key: 'dailyShades', label: 'Hétköznapi', isArray: true },
      { key: 'dramaticShades', label: 'Drámai', isArray: true },
      { key: 'textureAdvice', label: 'Textúra', isTip: true }
    ]
  }
}
</script>

<style scoped lang="scss">
.accordion-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

// Hero Card (always visible)
.hero-card {
  background: linear-gradient(135deg, var(--secondary-50) 0%, var(--secondary-100) 100%);
  border-radius: var(--radius-lg);
  padding: 2rem;
  text-align: center;
  margin-bottom: 1rem;
  border: 1px solid var(--secondary-200);
  
  .theme-dark & {
    background: linear-gradient(135deg, rgba(212, 144, 122, 0.15) 0%, rgba(212, 144, 122, 0.08) 100%);
    border-color: rgba(212, 144, 122, 0.2);
  }
}

.hero-title {
  font-size: var(--text-xl);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.badges {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.badge-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--secondary-500);
}

.badge-value {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.divider {
  width: 1px;
  height: 40px;
  background: var(--secondary-300);
  
  .theme-dark & {
    background: rgba(255, 255, 255, 0.2);
  }
}

// Golden Rule
.golden-rule {
  text-align: center;
  padding: 1rem 0;
  
  h3 {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--secondary-700);
    margin-bottom: 0.75rem;
    
    .theme-dark & {
      color: var(--secondary-300);
    }
  }
  
  p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }
}

// Synergy
.synergy-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.synergy-item {
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--secondary-500);
}

.synergy-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.contributions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.contribution {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  
  .label {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--secondary-500);
  }
  
  span:last-child {
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }
}

// Correction boxes
.correction-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.correction-box {
  padding: 1rem;
  border-radius: var(--radius-md);
  
  &.problem {
    background: var(--error-light);
    border-left: 3px solid var(--error);
  }
  
  &.solution {
    background: var(--success-light);
    border-left: 3px solid var(--success);
  }
  
  .theme-dark &.problem {
    background: rgba(239, 68, 68, 0.15);
  }
  
  .theme-dark &.solution {
    background: rgba(16, 185, 129, 0.15);
  }
}

.correction-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: block;
  margin-bottom: 0.25rem;
  
  .problem & { color: var(--error-dark); }
  .solution & { color: var(--success-dark); }
}

.correction-box p {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

// Shopping
.shopping-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.shopping-item {
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--secondary-500);
}

.shopping-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--secondary-500);
  display: block;
  margin-bottom: 0.25rem;
}

.shopping-item p {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

// Tips
.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.tip-box {
  padding: 1rem;
  border-radius: var(--radius-md);
  
  &.color {
    background: var(--primary-100);
    border-left: 3px solid var(--secondary-400);
  }
  
  &.skin {
    background: var(--secondary-100);
    border-left: 3px solid var(--secondary-500);
  }
  
  .theme-dark &.color {
    background: rgba(212, 144, 122, 0.15);
  }
  
  .theme-dark &.skin {
    background: rgba(212, 144, 122, 0.1);
  }
}

.tip-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(0, 0, 0, 0.5);
  display: block;
  margin-bottom: 0.5rem;
  
  .theme-dark & {
    color: var(--text-muted);
  }
}

.tip-box p {
  font-size: var(--text-sm);
  color: rgba(0, 0, 0, 0.8);
  line-height: 1.6;
  margin: 0;
  
  .theme-dark & {
    color: var(--text-primary);
  }
}

.swatches {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.swatch {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

// Overview
.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.overview-box {
  padding: 1rem;
  border-radius: var(--radius-md);
  
  &.ideal {
    background: var(--success-light);
    border-left: 3px solid var(--success);
  }
  
  &.avoid {
    background: var(--error-light);
    border-left: 3px solid var(--error);
  }
  
  .theme-dark &.ideal {
    background: rgba(16, 185, 129, 0.15);
  }
  
  .theme-dark &.avoid {
    background: rgba(239, 68, 68, 0.15);
  }
}

.overview-label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
  display: block;
  margin-bottom: 0.5rem;
}

.detail-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  display: block;
  margin-bottom: 0.25rem;
}

.overview-content p {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}
</style>
