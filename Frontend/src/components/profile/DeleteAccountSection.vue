<template>
  <div class="settings-section card danger-section">
    <!-- Figyelmeztetés a fiók törléséről, piros háttérrel -->
    <h3 class="section-title danger-title">
      Fiók törlése
    </h3>
    <p class="danger-description">
      A fiók törlése permanens és nem visszavonható. Az összes adatod véglegesen törlésre kerül.
    </p>
    <div class="form-actions">
      <button type="button" @click="handleDeleteClick" class="btn-danger" :disabled="isLoading">
        {{ isLoading ? 'Feldolgozás...' : 'Fiók törlése' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiClient } from '@/services'

const emit = defineEmits(['success', 'error'])

const router = useRouter()
const isLoading = ref(false)

async function handleDeleteClick() {
  const confirmed = confirm(
    'Biztosan törölni szeretnéd a fiókodat? Ez a művelet nem visszavonható! Összes adatod véglegesen törlésre kerül.'
  )
  
  if (!confirmed) return

  try {
    isLoading.value = true

    // Küldjük el a törlési kérést az API-nak
    const response = await apiClient.delete('/api/user/delete-account')

    //Ha sikeres a válasz, kezeljük az eredményt
    if (response.data.success) {
      emit('success', 'Fiók sikeresen törölve!')

      // Töröljük ki a localStorage-ból a felhasználói adatokat
      localStorage.removeItem('authUser')
      localStorage.removeItem('token')

      // Irányítsuk át a login oldalra
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      emit('error', response.data.message || 'Hiba a fiók törlése során')
    }
  } catch (error) {
    console.error('Account deletion error:', error)
    if (error.response?.status === 401) {
      emit('error', 'Nem vagy bejelentkezve!')
    } else {
      emit('error', 'Hiba történt a fiók törlése során. Próbáld újra!')
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/mixins.scss';

.settings-section {
  @include card-base;
  padding: 25px;
  margin-bottom: 25px;
}

.danger-section {
  border-color: #f87171;
  background: rgba(248, 113, 113, 0.05);
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: var(--color-text);
}

.danger-title {
  color: #dc2626;
}

.danger-description {
  color: var(--color-text-secondary);
  margin-bottom: 20px;
  line-height: 1.6;
}

.form-actions {
  @include flex-center;
  justify-content: flex-start;
  gap: 10px;
}

.btn-danger {
  @include button-danger;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>
