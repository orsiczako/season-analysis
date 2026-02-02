# SkinAnalysisPage

## 1. Áttekintés

A komponens egy **AI-alapú bőrelemző oldal** megvalósítása Vue 3 Composition API használatával.
Feladatai:

* Oldalbetöltéskor korábbi bőrelemzési eredmények betöltése (cache → API fallback)
* Arcfotó feltöltésének kezelése
* Képfeltöltés validálása
* AI-alapú elemzés indítása backend API-n keresztül
* Elemzési eredmények megjelenítése
* Hibakezelés és felhasználói visszajelzés biztosítása

Az oldal állapotvezérelt módon működik (`v-if` logikával), így a felhasználó mindig az aktuális folyamatnak megfelelő UI-t látja.

---

## 2. Template rész (`<template>`)

### 2.1. Alap layout

```html
<div class="module-layout">
  <AnimatedBackground />
  <PageHeader back-to="/dashboard" />
```

* `AnimatedBackground`: vizuális háttérelem
* `PageHeader`: fejléc, visszanavigálási lehetőséggel a dashboardra

Ez a rész minden állapotban megjelenik.

---

### 2.2. Oldal tartalom konténer

```html
<div class="module-content">
  <div class="skin-analysis-page">
```

* Központosított, maximált szélességű tartalom
* A teljes oldal állapotfüggő UI-elemei ezen belül jelennek meg

---

### 2.3. Oldalcím

```html
<h1 class="main-title">
  Bőrelemzés AI-al
</h1>
```

Statikus cím, animált belépéssel.

---

### 2.4. Oldalbetöltési állapot

```html
<div v-if="isLoadingPage" class="upload-card">
```

Ez az állapot akkor aktív, amikor:


* localStorage
* backend API

ellenőrzése zajlik.

Megjelenítés:

* spinner
* „Adatok betöltése…” szöveg

Ez **nem az AI elemzés**, hanem az oldal inicializálási fázisa.

---

### 2.5. Feltöltési kártya (alapállapot)

```html
<div v-if="!analysisResult && !isAnalyzing && !isLoadingPage">
```

Ez az állapot jelenik meg, ha:

* nincs meglévő elemzés
* nem fut elemzés
* az oldal már betöltött

Tartalma:

* ikon + dekoráció
* leírás a feltöltésről
* fájlválasztó gomb

---

### 2.6. Fájlválasztás és előnézet

#### Fájlválasztó input

```html
<input type="file" accept="image/jpeg,image/png,image/jpg">
```

* Rejtett input
* Programozottan aktiválható (`triggerFileInput`)

#### Előnézeti állapot

```html
<div v-if="selectedFile && !isAnalyzing" class="file-preview">
```

Megjelenik, ha:

* van kiválasztott fájl
* még nem fut elemzés

Tartalmazza:

* képelőnézetet
* fájl nevét és méretét
* „Elemzés indítása” és „Törlés” gombokat

---

### 2.7. Elemzés folyamatban állapot

```html
<div v-if="isAnalyzing && !isLoadingPage">
```

Ez az AI backend feldolgozásának ideje alatt aktív.

Tartalma:

* spinner
* státusz szöveg
* információ az időtartamról

---

### 2.8. Sikeres elemzés megjelenítése

```html
<div v-if="analysisResult && !isAnalyzing && !isLoadingPage">
```

Megjelenik, ha:

* létezik elemzési eredmény
* nem fut elemzés
* az oldal már betöltött

Tartalma:

* siker ikon
* bőrtípus megnevezése
* észlelt bőrproblémák 
* vagy „Nem észleltünk bőrproblémát” üzenet
* navigációs gombok

---

### 2.9. Hibaüzenet kártya

```html
<div v-if="errorMessage" class="error-card">
```

Megjelenik bármilyen validációs vagy API hiba esetén.

---

## 3. Script rész (`<script setup>`)

### 3.1. Importok

```js
import { ref, computed, onMounted } from 'vue'
```

* Composition API alapfunkciók

```js
import { useRouter } from 'vue-router'
```

* Navigáció az eredmények oldalra

```js
import { apiClient, userService } from '@/services'
```

* Backend kommunikáció
* AI elemzés API
* felhasználói eredmények lekérése

```js
import { useLocalStorage } from '@/composables/useLocalStorage'
```

* Egyedi localStorage absztrakció

---

### 3.2. Reaktív állapotok

```js
const fileInput = ref(null)
const selectedFile = ref(null)
const previewUrl = ref(null)
```

* fájlkezeléshez szükséges referenciák

```js
const isAnalyzing = ref(false)
const isLoadingPage = ref(true)
const analysisResult = ref(null)
const errorMessage = ref(null)
```

Állapotjelzők:

* `isLoadingPage`: inicializáció
* `isAnalyzing`: AI feldolgozás
* `analysisResult`: elemzés eredménye
* `errorMessage`: felhasználói hibaüzenet

---

### 3.4. Számított értékek

```js
const detectedProblems = computed(() => {
  return analysisResult.value?.analysis?.skinProblems?.detected || []
})
```

* Biztonságos adatkinyerés
* Ha nincs adat, üres tömb

---

### 3.5. Oldal inicializáló logika

```js
const loadInitialData = async () => { ... }
```

Lépései sorrendben:

1. `isLoadingPage = true`
2. Local Storage ellenőrzése felhasználó ID alapján
3. Backend API lekérés (`getAnalysesResults`)
4. Adatok normalizálása
5. Cache mentése
6. Hibakezelés
7. `isLoadingPage = false`

Ez biztosítja, hogy:

* a lehető leggyorsabban jelenjen meg az eredmény
* a backend csak végső esetben legyen hívva

---

### 3.6. Lifecycle hook

```js
onMounted(() => {
  loadInitialData()
})
```

Az oldal betöltésekor automatikusan elindítja az inicializációt.

---

### 3.7. Fájlválasztás kezelése

#### Input megnyitása

```js
const triggerFileInput = () => {
  fileInput.value?.click()
}
```

#### Fájl validálása

```js
const handleFileSelect = (event) => { ... }
```

Validációk:

* maximum 10 MB
* csak JPG / PNG
* hibák esetén `errorMessage` beállítása

Siker esetén:

* `selectedFile`
* `previewUrl` generálása

---

### 3.8. Elemzés indítása

```js
const analyzeImage = async () => { ... }
```

Folyamat:

1. `isAnalyzing = true`
2. `FormData` összeállítása
3. POST kérés az AI API-ra
4. Eredmény mentése:

   * `analysis`
   * `protocol`
   * `problemsProtocol`
5. localStorage frissítése
6. hiba kezelése
7. `isAnalyzing = false`

---

### 3.9. Állapot visszaállítása

```js
const resetAnalysis = () => { ... }
```

* eredmény törlése
* fájl kiválasztás törlése

---

### 3.10. Navigáció

```js
const goToResults = () => {
  router.push({ path: '/results', query: { tab: 'skin' } })
}
```

Átirányítás a részletes eredmények oldalra.

---

### 3.11. Segédfüggvények

* `formatFileSize`: fájlméret formázása
* `getSkinTypeLabel`: bőrtípus kód → magyar megnevezés

---

## 4. Style rész (`<style scoped lang="scss">`)

* SCSS mixinek használata
* Glassmorphism kártyák
* Animációk (fadeIn, float, pulse)
* Dark mode támogatás
* Teljesen reszponzív kialakítás
* Mobil optimalizált gombméretek

A `scoped` kulcsszó biztosítja, hogy a stílusok kizárólag erre a komponensre vonatkozzanak.

---

## 5. Összegzés

Ez a komponens:

* jól elkülönített állapotokra épül
* teljes lifecycle-t kezel (betöltés → elemzés → megjelenítés)
* cache-first stratégiát alkalmaz
* UX szempontból robusztus
* backend-agnosztikus módon integrálható

A struktúra jól skálázható további elemzési típusokra vagy UI-bővítésekre.
