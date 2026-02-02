<template>
  <div class="season-protocol">
    <div v-if="data" class="accordion-list">
      <!-- Hero Always Visible -->
      <div class="season-hero">
        <span class="hero-label">Elemzésed alapja</span>
        <h2 class="season-title">{{ seasonDisplay }} Típus</h2>
        <p class="essence">{{ data.corePhilosophy.essence }}</p>
        <div class="golden-rule">{{ data.corePhilosophy.goldenRule }}</div>
        <div class="tags">
          <span v-for="attr in data.corePhilosophy.primaryAttributes" :key="attr" class="tag">{{ attr }}</span>
        </div>
      </div>

      <!-- Color Palette -->
      <BaseAccordion 
        title="Színpalettád" 
        badge="Tökéletes színek"
        :preview="data.wardrobeColorPalette.bestColors.length + ' szín'"
        default-open
      >
        <div class="palette-grid">
          <div v-for="color in data.wardrobeColorPalette.bestColors" :key="color.name" class="swatch-card">
            <div class="swatch" :style="{ backgroundColor: color.hex }" />
            <span class="swatch-name">{{ translateColor(color.name) }}</span>
            <span class="swatch-note">{{ color.note }}</span>
          </div>
        </div>
      </BaseAccordion>

      <!-- Colors to Avoid -->
      <BaseAccordion 
        title="Kerülendő árnyalatok" 
        badge="Kerüld"
        :preview="data.wardrobeColorPalette.colorsToAvoid?.length + ' szín'"
      >
        <div class="avoid-list">
          <div v-for="color in data.wardrobeColorPalette.colorsToAvoid" :key="color.name" class="avoid-item">
            <strong>{{ translateColor(color.name) }}</strong>
            <p>{{ color.reason }}</p>
          </div>
        </div>
      </BaseAccordion>

      <!-- Accessories -->
      <BaseAccordion 
        v-if="data.accessoriesAndJewelry"
        title="Ékszerek & Fémek" 
        badge="Kiegészítők"
        :preview="data.accessoriesAndJewelry.metals"
      >
        <div class="accessories-grid">
          <div class="accessory-item metals">
            <span class="accessory-label">Fémek</span>
            <p>{{ data.accessoriesAndJewelry.metals }}</p>
          </div>
          <div class="accessory-item stones">
            <span class="accessory-label">Drágakövek</span>
            <p>{{ data.accessoriesAndJewelry.stones }}</p>
          </div>
        </div>
      </BaseAccordion>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BaseAccordion from '@/components/common/base/BaseAccordion.vue'

const props = defineProps({
  protocol: { type: Object, required: true },
  seasonName: { type: String, required: true }
})

const SEASON_NAMES = { spring: 'Tavasz', summer: 'Nyár', autumn: 'Ősz', winter: 'Tél' }

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

const data = computed(() => {
  const key = Object.keys(props.protocol).find(k => k.includes('ColorAnalysisProfile'))
  return key ? props.protocol[key] : null
})

const seasonDisplay = computed(() => SEASON_NAMES[props.seasonName] || props.seasonName)
</script>

<style scoped lang="scss">
@use '@/assets/mixins.scss' as m;

.accordion-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

// --- Hero ---
.season-hero {
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

.hero-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--secondary-500);
  margin-bottom: 0.5rem;
  display: block;
}

.season-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--secondary-700);
  margin-bottom: 1rem;
  text-transform: capitalize;
  
  .theme-dark & {
    color: var(--secondary-300);
  }
}

.essence {
  font-size: var(--text-base);
  line-height: 1.7;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  max-width: 600px;
  margin-inline: auto;
}

.golden-rule {
  display: inline-block;
  background: var(--secondary-500);
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: 50px;
  font-size: var(--text-sm);
  font-weight: 500;
  margin-bottom: 1.5rem;
}

.tags {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.tag {
  background: white;
  border: 1px solid var(--secondary-200);
  border-radius: 50px;
  padding: 0.35rem 0.9rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--secondary-600);
  
  .theme-dark & {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: var(--text-primary);
  }
}

// --- Palette ---
.palette-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1.25rem;
}

.swatch-card {
  @include m.flex-col-center;
  gap: 0.5rem;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-3px);
  }
}

.swatch {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 3px solid white;
}

.swatch-name {
  font-weight: 600;
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.swatch-note {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-align: center;
}

// --- Avoid List ---
.avoid-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.avoid-item {
  padding: 0.75rem 1rem;
  border-left: 3px solid var(--error);
  background: var(--error-light);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  
  strong {
    font-size: var(--text-sm);
    color: var(--text-primary);
  }
  
  p {
    font-size: 0.8rem;
    color: var(--text-muted);
    margin: 0.25rem 0 0;
    line-height: 1.4;
  }
}

// --- Accessories ---
.accessories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.accessory-item {
  padding: 1rem;
  border-radius: var(--radius-md);
  
  &.metals {
    background: var(--primary-100);
    border-left: 3px solid var(--secondary-400);
  }
  
  &.stones {
    background: var(--secondary-100);
    border-left: 3px solid var(--secondary-500);
  }
  
  .theme-dark & {
    &.metals {
      background: rgba(212, 144, 122, 0.15);
    }
    &.stones {
      background: rgba(212, 144, 122, 0.1);
    }
  }
}

.accessory-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(0, 0, 0, 0.5);
  display: block;
  margin-bottom: 0.5rem;
  
  .theme-dark & {
    color: var(--text-muted);
  }
}

.accessory-item p {
  margin: 0;
  font-size: var(--text-sm);
  color: rgba(0, 0, 0, 0.8);
  line-height: 1.5;
  
  .theme-dark & {
    color: var(--text-primary);
  }
}
</style>