<template>

  <div class="result">
    <!-- 
      Fejlec: evszak megjelenítese
      Megjeleníti a felhasznalo szintipusat (Tavasz, Nyar, Osz, Tel)
    -->
    <div class="result-header">
      <h2>
        <span class="season-badge">
          {{ result.seasonHu || result.season }}
        </span>
      </h2>
    </div>
    
    <!-- 
      AI magyarazat megjelenitese ha van
    -->
    <p v-if="result.reasoning" class="reasoning">{{ result.reasoning }}</p>

    <!-- 
      Ajanlott szinek szekcio
    -->
    <div class="colors-section" v-if="result.recommendedColors">
      <h3>Ajánlott színek</h3>
      
      <!-- 
        Szin korok megjelenitese
        Minden szin egy 60x60px-es kor formajaban jelenik meg
        A szin hex kodja hatterkent van beallítva
        Ha a szin ki van valasztva akkor megjelenik a selected class
        Kattintasra meghivodik a toggleColor fuggveny
      -->
      <div class="palette">
        <div 
          v-for="color in result.recommendedColors" 
          :key="color.hex"
          class="color"
          :class="{ selected: selectedColors.has(color.hex) }"
          :style="{ backgroundColor: color.hex }"
          :title="`${color.category || color.name || 'Szín'}: ${color.hex}`"
          @click="toggleColor(color.hex)"
        >
        </div>
      </div>
      
      <!-- 
        Szin nevek cimkek formajaban
        Vegigmegy a result.recommendedColors tombon es minden szinhez kattinthato cimket hoz letre
        :key-el egyedi azonosítót ad minden elemnek
        A category mezo jelenik meg (pl. 'top', 'dress', 'accessory') amit az AI kuld
        Ha nincs category akkor name vagy hex kod jelenik meg
        Kattintasra toggleColor() hivodik meg ugyanugy mint a szin koroknel

        A color.hex + '_name' azert kell mert fentebb a palette-ben mar hasznaltuk a color.hex-et key-kent
        Es egy oldalon minden key-nek egyedinek kell lennie ezert hozzaadjuk a '_name' vegzodest
      -->
      <div class="color-names">
        <span 
          v-for="color in result.recommendedColors" 
          :key="color.hex + '_name'"
          class="color-name"
          :class="{ selected: selectedColors.has(color.hex) }"
          @click="toggleColor(color.hex)"
        >
          {{ color.category || color.name || color.hex }}
        </span>
      </div>
      
      <!-- 
        Mentes gomb
      -->
      <div class="actions">
        <button 
          class="btn btn--success" 
          @click="addSelectedToFavorites" 
          :disabled="adding || selectedColors.size === 0"
        >
          {{ adding ? 'Hozzáadás...' : `${selectedColors.size} szín mentése kedvencekhez` }}
        </button>
      </div>
    </div>

    <!-- 
      Kerulendo szinek szekcio
      Itt jelennek meg azok a szinek, amiket az AI szerint kerulni kell
      Ezek a szinek nem valaszthatok ki es nem menthetok kedvencek koze
      Itt is végigmegy a result.avoidColors tombon es megjeleniti a szineket
    -->
    <div class="colors-section" v-if="result.avoidColors?.length">
      <h3>Kerülendő színek</h3>
      
      <!-- Kerulendo szin korok X jellel -->
      <div class="palette">
        <div 
          v-for="color in result.avoidColors" 
          :key="color.hex"
          class="color avoid"
          :style="{ backgroundColor: color.hex }"
          :title="color.name || color.reason"
        >
          <div class="avoid-mark">✕</div>
        </div>
      </div>
      
      <!-- Indoklasok hogy miert kerulendo az adott szin -->
      <div class="avoid-reasons">
        <span 
          v-for="color in result.avoidColors" 
          :key="color.hex + '_reason'"
          class="avoid-reason"
        >
          {{ color.reason }}
        </span>
      </div>
    </div>

    <!-- 
      Lablelc: uj elemzes gomb
      Visszavisz a chat feluletre hogy uj elemzest lehessen inditani
      Meghivja a new-analysis eventet a szulo komponensnek
    -->
    <div class="result-footer">
      <button @click="emit('new-analysis')" class="btn btn--outline">
        Új elemzés
      </button>
    </div>
  </div>
</template>

<script setup>


import { ref, computed, onMounted } from 'vue'
import { favoriteColorsService, userService } from '@/services'
import { useAuth } from '@/composables/useAuth'

/**
 * 7. Az AIChatPage setAnalysisResult() függvénye beállítja az analysisResult ref-et
 * 8. Ez a result prop kerül átadásra ennek a ColorAnalysisResult komponensnek
 * 
 * 
 * FONTOS: A result.season és result.seasonHu értékeket az AI határozza meg
 * egy komplex döntési algoritmus alapján (alaptónus -> világosság -> élénkség -> kontraszt)
 * Ez a komponens csak MEGJELENÍTI ezeket az értékeket, nem módosítja őket.
 */
const props = defineProps({
  result: { 
    type: Object, 
    required: true,
    validator: (value) => {
      // Ellenorizzuk hogy van-e season vagy seasonHu mezo
      return value.season || value.seasonHu
    }
  }
})

/**
 * Eventek amit a komponens kibocsajt a szulo komponens fele
 */
const emit = defineEmits(['new-analysis', 'colors-saved'])

// Auth composable a user frissítéséhez
const { refreshUser } = useAuth()

// adding: Boolean ami jelzi hogy eppen folyamatban van-e a mentes
// Igy megakadalyozzuk hogy tobbszor rakatthassanak a mentes gombra
const adding = ref(false)

// selectedColors: Set adatstruktura a kivalasztott szinek hex kodjaihoz
// Azert Set mert gyorsan ellenorizheto hogy benne van-e egy elem
// Alapertelmezetten ures, a felhasznalo valasztja ki a kivant szineket
const selectedColors = ref(new Set())

/**

 * Mukodes:
 * Ellenorzi hogy a hex kod benne van-e mar a Set-ben
 * Ha benne van akkor torli 
 * Ha nincs benne akkor hozzaadja
 */
function toggleColor(hex) {
  if (selectedColors.value.has(hex)) {
    // Ha mar ki van valasztva akkor toroljuk
    selectedColors.value.delete(hex)
  } else {
    // Ha meg nincs kivalasztva akkor hozzaadjuk
    selectedColors.value.add(hex)
  }
  //uj Set peldany letrehozasa a regi tartalmaval
  // Ez azert kell mert a Vue nem erzekel Set belso valtozasokat
  selectedColors.value = new Set(selectedColors.value)
}



function selectAll() {
  if (selectedColors.value.size === props.result.recommendedColors.length) {
    // Ha minden ki van valasztva akkor toroljuk az osszeset
    selectedColors.value.clear()
  } else {
    // Kulonben kivalasztjuk az osszeset
    selectedColors.value = new Set(props.result.recommendedColors.map(c => c.hex))
  }
}


async function addSelectedToFavorites() {
  // Ha nincs kivalasztott szin akkor nem csinalunk semmit
  if (selectedColors.value.size === 0) return
  
  // Jeloljuk hogy folyamatban van a mentes
  adding.value = true
  
  try {
    for (const hex of selectedColors.value) {
      try {
        await favoriteColorsService.addFavoriteColor(hex)
      } catch (error) {
        if (error.response?.status !== 409) {
          console.warn('Failed to add favorite color:', hex, error)
        }
      }
    }
    
    // Kibocsajtjuk az eventet hogy a szinek elmentve
    emit('colors-saved')
  } catch (e) {
    console.error('Add favorites error:', e)
  } finally {
    
    adding.value = false
  }
}

// Színtípus mentése a profilba amikor az eredmény megérkezik
onMounted(async () => {
  if (props.result?.season) {
    try {
      const result = await userService.updateColorSeason(props.result.season)
      if (result.success) {
        console.log('Színtípus elmentve a profilba:', props.result.season)
        // Frissítjük a localStorage-ban tárolt user adatokat is
        const user = JSON.parse(localStorage.getItem('authUser') || '{}')
        user.colorSeason = props.result.season
        user.colorAnalysisDate = new Date().toISOString()
        localStorage.setItem('authUser', JSON.stringify(user))
        
        // Frissítjük az auth composable-ben lévő user ref-et is
        if (refreshUser) {
          await refreshUser()
        }
      }
    } catch (error) {
      console.warn('Failed to save color season to profile:', error)
    }
  }
})
</script>

<style lang="scss" scoped>
@import '@/assets/mixins.scss';
.result {
  padding: 24px;
  background: var(--bg-primary);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  height: 100%;
  overflow-y: auto;
  width: 100%;
}

.result-header {
  margin-bottom: 20px;
  text-align: center;
}

.result-header h2 {
  @include flex-center;
  gap: 12px;
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-primary);
}

.season-badge {
  padding: 8px 16px;
  border-radius: 24px;
  font-weight: 600;
  background: var(--color-primary);
  color: white;
}

.reasoning {
  margin-bottom: 24px;
  line-height: 1.6;
  color: var(--text-secondary);
  text-align: center;
  font-style: italic;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.colors-section {
  margin-bottom: 24px;
}

.colors-section h3 {
  margin-bottom: 16px;
  font-size: 1.2rem;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.palette {
  @include flex-center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.color {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid var(--border-color);
  transition: all 0.3s ease;
  position: relative;
  @include flex-center;
  box-shadow: var(--shadow-sm);
}

.color:hover {
  transform: scale(1.15);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-lg);
}

.color.selected {
  border-color: var(--color-success);
  border-width: 5px;
  transform: scale(1.1);
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2);
  animation: pulse 0.5s ease;
}

@keyframes pulse {
  0%, 100% { transform: scale(1.1); }
  50% { transform: scale(1.15); }
}

.color.avoid {
  opacity: 0.8;
  cursor: default;
  position: relative;
}

.color.avoid:hover {
  transform: none;
  border-color: var(--color-danger);
}

.avoid-mark {
  @include center-absolute;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
}

.color-names, .avoid-reasons {
  @include flex-center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.color-name, .avoid-reason {
  padding: 4px 12px;
  background: var(--bg-secondary);
  border-radius: 16px;
  font-size: 0.9rem;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-name:hover {
  background: var(--bg-tertiary);
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.color-name.selected {
  background: var(--color-success);
  color: var(--text-primary);
  border-color: var(--color-success);
  font-weight: 600;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(34, 197, 94, 0.3);
}

.avoid-reason {
  background: var(--color-danger-light);
  border-color: var(--color-danger-light);
  color: var(--color-danger);
  cursor: default;
}

.actions {
  @include flex-center;
  gap: 12px;
  flex-wrap: wrap;
}

.result-footer {
  @include flex-center;
  margin-top: 24px;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn--success {
  background: var(--color-success);
  color: var(--text-primary);
}

.btn--success:hover:not(:disabled) {
  background: var(--color-success-dark);
  color: var(--text-primary);
}

.btn--outline {
  background: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

.btn--outline:hover:not(:disabled) {
  background: var(--color-primary);
  color: var(--text-primary);
}
</style>