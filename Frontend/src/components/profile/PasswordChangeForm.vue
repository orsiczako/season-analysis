<template>
  <div class="settings-section card">
    <h3 class="section-title">
      Jelszó módosítás
    </h3>
    <form @submit.prevent="handleChangePassword" class="settings-form">
      <div class="form-group">
        <label for="currentPassword">Jelenlegi jelszó</label>
        <input
          type="password"
          id="currentPassword"
          v-model="form.current"
          class="input"
          placeholder="Jelenlegi jelszó megadása"
          :disabled="isLoading"
        >
      </div>
      <div class="form-group">
        <label for="newPassword">Új jelszó</label>
        <input
          type="password"
          id="newPassword"
          v-model="form.new"
          class="input"
          placeholder="Új jelszó megadása (min. 6 karakter)"
          :disabled="isLoading"
        >
      </div>
      <div class="form-group">
        <label for="confirmPassword">Új jelszó megerősítése</label>
        <input
          type="password"
          id="confirmPassword"
          v-model="form.confirm"
          class="input"
          placeholder="Új jelszó megerősítése"
          :disabled="isLoading"
        >
      </div>
      <div class="form-actions">
        <button type="submit" class="btn-submit" :disabled="isLoading">
          {{ isLoading ? 'Feldolgozás...' : 'Jelszó módosítás' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { apiClient } from '@/services'

const emit = defineEmits(['success', 'error'])

const form = ref({
  current: '',
  new: '',
  confirm: ''
})

const isLoading = ref(false)

async function handleChangePassword() {
  // Validáció
  if (!form.value.current || !form.value.new || !form.value.confirm) {
    emit('error', 'Kérlek töltsd ki az összes mezőt!')
    return
  }

  if (form.value.new !== form.value.confirm) {
    emit('error', 'Az új jelszavak nem egyeznek!')
    return
  }

  if (form.value.new.length < 6) {
    emit('error', 'Az új jelszónak legalább 6 karakter hosszúnak kell lennie!')
    return
  }

  try {
    isLoading.value = true

    const response = await apiClient.put('/api/user/change-password', {
      currentPassword: form.value.current,
      newPassword: form.value.new
    })

    if (response.data.success) {
      emit('success', 'Jelszó sikeresen megváltoztatva!')
      form.value = { current: '', new: '', confirm: '' }
    } else {
      emit('error', response.data.message || 'Hiba a jelszó változtatásakor')
    }
  } catch (error) {
    console.error('Password change error:', error)
    if (error.response?.status === 400) {
      emit('error', 'Hibás jelenlegi jelszó!')
    } else if (error.response?.status === 401) {
      emit('error', 'Nem vagy bejelentkezve!')
    } else {
      emit('error', 'Hiba történt a jelszó változtatásakor. Próbáld újra!')
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

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--color-text);
}

.settings-form {
  @include flex-col;
  gap: 15px;
}

.form-group {
  @include flex-col;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: var(--color-text);
  font-size: 0.95rem;
}

.form-group input {
  @include input-base;
}

.form-actions {
  @include flex-center;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.btn-submit {
  @include button-primary;
  min-width: 150px;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>
