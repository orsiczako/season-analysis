<template>
  <div class="profile-wrapper">
    <PageHeader back-to="/dashboard" />
    <div class="profile-page">
      <AnimatedBackground />
      <main class="main-content">
        <div class="profile-container">
          <div class="profile-hero"
            style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div class="profile-avatar">
              <User :size="48" />
            </div>
            <div class="profile-info">
              <h1 class="profile-name">
                {{ userProfile.fullName }}
              </h1>
              <p class="profile-username">
                {{ userProfile.username }}
              </p>
              <p class="profile-email">
                {{ userProfile.email }}
              </p>
            </div>
          </div>

          <div class="profile-tabs">
            <button v-for="tab in tabs" :key="tab.id" :class="['tab-btn', { active: activeTab === tab.id }]"
              @click="activeTab = tab.id">
              {{ tab.label }}
            </button>
          </div>

          <div class="tab-content">
            <div v-if="activeTab === 'personal'" class="tab-panel">
              <div class="settings-card">
                <h3 class="section-title">
                  Személyes adatok
                </h3>

                <div class="form-grid">
                  <div class="form-field">
                    <label>Teljes név</label>
                    <input v-model="editForm.fullName" type="text" class="input-field" :disabled="!isEditing"
                      placeholder="Add meg a neved">
                  </div>

                  <div class="form-field">
                    <label>Felhasználónév</label>
                    <input v-model="editForm.username" type="text" class="input-field" :disabled="!isEditing"
                      placeholder="Felhasználónév">
                  </div>

                  <div class="form-field full-width">
                    <label>Email cím</label>
                    <input v-model="editForm.email" type="email" class="input-field" :disabled="!isEditing"
                      placeholder="email@example.com">
                  </div>
                </div>

                <div class="card-actions">
                  <button v-if="!isEditing" class="btn btn-primary" @click="startEdit">
                    Szerkesztés
                  </button>
                  <template v-else>
                    <button class="btn btn-secondary" @click="cancelEdit">
                      Mégse
                    </button>
                    <button class="btn btn-primary" :disabled="saving" @click="saveChanges">
                      {{ saving ? 'Mentés...' : 'Mentés' }}
                    </button>
                  </template>
                </div>
              </div>
            </div>

            <div v-if="activeTab === 'security'" class="tab-panel">
              <div class="settings-card">
                <h3 class="section-title">
                  Jelszó módosítás
                </h3>
                <form @submit.prevent="handleChangePassword">
                  <div class="form-grid">
                    <div class="form-field full-width">
                      <label>Jelenlegi jelszó</label>
                      <input v-model="passwordForm.current" type="password" class="input-field"
                        :disabled="passwordLoading" placeholder="Jelenlegi jelszó">
                    </div>
                    <div class="form-field">
                      <label>Új jelszó</label>
                      <input v-model="passwordForm.new" type="password" class="input-field" :disabled="passwordLoading"
                        placeholder="Min. 6 karakter">
                    </div>
                    <div class="form-field">
                      <label>Új jelszó megerősítése</label>
                      <input v-model="passwordForm.confirm" type="password" class="input-field"
                        :disabled="passwordLoading" placeholder="Jelszó megerősítése">
                    </div>
                  </div>
                  <div class="card-actions">
                    <button type="submit" class="btn btn-primary" :disabled="passwordLoading">
                      {{ passwordLoading ? 'Mentés...' : 'Jelszó frissítése' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div v-if="activeTab === 'account'" class="tab-panel">
              <div class="settings-card danger-card">
                <div class="danger-header">
                  <h3 class="section-title danger-title">
                    Fiók törlése
                  </h3>
                  <p class="danger-description">
                    A fiók törlése végleges és visszavonhatatlan.
                  </p>
                </div>
                <div class="card-actions">
                  <button type="button" class="btn btn-danger" :disabled="deleteLoading" @click="handleDeleteAccount">
                    {{ deleteLoading ? 'Törlés...' : 'Fiók törlése' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import { User } from 'lucide-vue-next'
import AnimatedBackground from '@/layouts/AnimatedBackground.vue'
import PageHeader from '@/components/common/layout/PageHeader.vue'
import { apiClient, userService } from '@/services'
import { useToast } from '@/composables/useToast'

export default {
  name: 'ProfileView',
  components: {
    AnimatedBackground,
    PageHeader,
    User
  },
  setup() {
    const toast = useToast()
    return { toast }
  },
  data() {
    return {
      activeTab: 'personal',
      tabs: [
        { id: 'personal', label: 'Személyes adatok' },
        { id: 'security', label: 'Biztonság' },
        { id: 'account', label: 'Fiók kezelése' }
      ],
      isEditing: false,
      saving: false,
      editForm: {
        fullName: '',
        username: '',
        email: ''
      },
      userProfile: {
        fullName: '',
        username: '',
        email: '',
      },
      passwordLoading: false,
      passwordForm: {
        current: '',
        new: '',
        confirm: ''
      },
      deleteLoading: false
    }
  },
  mounted() {
    this.loadUserData()
  },
  activated() {
    this.refreshProfile()
  },
  methods: {
    loadUserData() {
      const userData = localStorage.getItem('authUser')
      if (userData) {
        try {
          const user = JSON.parse(userData)
          this.userProfile = {
            ...this.userProfile,
            fullName: user.fullName || user.full_name || '',
            username: user.username || '',
            email: user.email || ''
          }
          this.editForm = { ...this.userProfile }
        } catch (error) {
          console.error('Error parsing user data:', error)
        }
      }
      this.refreshProfile() // Háttérben frissítünk
    },

    startEdit() {
      this.isEditing = true
      this.editForm = { ...this.userProfile }
    },

    cancelEdit() {
      this.isEditing = false
      this.editForm = { ...this.userProfile }
    },

    // --- ITT A JAVÍTOTT RÉSZ ---
    async saveChanges() {
      this.saving = true
      try {
        // Valódi API hívás
        const result = await userService.updateProfile({
          fullName: this.editForm.fullName,
          username: this.editForm.username,
          email: this.editForm.email
        })

        if (result.success) {
          // Frissítsd a globális user state-et, hogy a dashboard és sidebar is azonnal frissüljön
          if (this.$options?.setupState?.refreshUser) {
            await this.$options.setupState.refreshUser();
          }
          // Ha a szerver visszaadja a frissített usert, azt használjuk, ha nem, akkor a formot
          const updatedUser = result.data?.user || { ...this.userProfile, ...this.editForm }
          this.userProfile = updatedUser
          // LocalStorage frissítése, hogy reloadnál is megmaradjon
          let storedUser = JSON.parse(localStorage.getItem('authUser') || '{}')
          const mergedUser = { ...storedUser, ...updatedUser }
          localStorage.setItem('authUser', JSON.stringify(mergedUser))
          this.isEditing = false
          this.toast.success('Profil sikeresen frissítve!')
        } else {
          this.toast.error(result.message || 'Hiba történt a mentés során')
        }
      } catch (error) {
        console.error('Save error:', error)
        this.toast.error('Váratlan hiba történt a mentés során')
      } finally {
        this.saving = false
      }
    },

    async refreshProfile() {
      const result = await userService.getProfile()

      if (!result.success && result.error && result.error.response?.status === 404) {
        console.warn('User account deleted, logging out...')
        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')
        this.$router.push('/')
        return
      }

      if (!result.success) return

      if (result.data.user) {
        const user = result.data.user
        this.userProfile = {
          ...this.userProfile,
          fullName: user.fullName || '',
          username: user.username || '',
          email: user.email || ''
        }
        // LocalStorage szinkronizálás
        localStorage.setItem('authUser', JSON.stringify(user))
        // Ha nem szerkeszt éppen, a formot is frissítjük
        if (!this.isEditing) {
          this.editForm = { ...this.userProfile }
        }
      }
    },

    async handleChangePassword() {
      if (!this.passwordForm.current || !this.passwordForm.new || !this.passwordForm.confirm) {
        this.toast.error('Kérlek töltsd ki az összes mezőt!')
        return
      }
      if (this.passwordForm.new !== this.passwordForm.confirm) {
        this.toast.error('Az új jelszavak nem egyeznek!')
        return
      }
      if (this.passwordForm.new.length < 6) {
        this.toast.error('Az új jelszónak legalább 6 karakter hosszúnak kell lennie!')
        return
      }

      this.passwordLoading = true
      try {
        const response = await apiClient.put('/api/user/change-password', {
          currentPassword: this.passwordForm.current,
          newPassword: this.passwordForm.new
        })
        if (response.data.success) {
          this.toast.success('Jelszó sikeresen megváltoztatva!')
          this.passwordForm = { current: '', new: '', confirm: '' }
        } else {
          this.toast.error(response.data.message || 'Hiba a jelszó változtatásakor')
        }
      } catch (err) {
        let message = 'Hiba a jelszó változtatásakor'
        if (err?.response?.status === 400) message = 'Hibás jelenlegi jelszó!'
        else if (err?.response?.status === 401) message = 'Nem vagy bejelentkezve!'
        this.toast.error(message)
      } finally {
        this.passwordLoading = false
      }
    },

    async handleDeleteAccount() {
      const confirmed = confirm(
        'Biztosan törölni szeretnéd a fiókodat? Ez a művelet nem visszavonható! Összes adatod véglegesen törlésre kerül.'
      )
      if (!confirmed) return

      this.deleteLoading = true
      try {
        const response = await userService.deleteAccount()
        if (response.success) {
          this.toast.success('Fiók sikeresen törölve!')
        } else {
          this.toast.error(response.message || 'Hiba történt a fiók törlése során')
        }
      } catch (err) {
        let message = 'Hiba történt a fiók törlése során. Próbáld újra!'
        if (err?.response?.status === 401) message = 'Nem vagy bejelentkezve!'
        this.toast.error(message)
      } finally {
        // Mindig töröljük a localStorage-ot és navigáljunk el, akár sikerült, akár nem
        localStorage.removeItem('authUser')
        localStorage.removeItem('authToken')
        localStorage.clear()
        sessionStorage.clear()
        this.$router.push('/')
        this.deleteLoading = false
      }
    }
  }
}
</script>

<style lang="scss">
@use '@/assets/mixins.scss' as *;

.profile-wrapper {
  position: relative;
  width: 100%;
  min-height: 100vh;
}

.page-header {
  z-index: 1000 !important;
}

.profile-page {
  min-height: 100vh;
  background: var(--bg-primary);
  overflow: visible;
  position: relative;
}

.main-content {
  position: relative;
  z-index: 1;
  padding: 72px 0 80px;
}

.profile-container {
  position: relative;
  z-index: 1;
  max-width: 720px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

/* Hero */
.profile-hero {
  text-align: center;
  margin-bottom: 24px;
}

.profile-avatar {
  @include avatar-wrapper(80px);
  border: 3px solid var(--secondary-400);
  margin: var(--space-2) 0;
}

.theme-dark .profile-avatar {
  background: var(--bg-primary);
}

.profile-info {
  margin-top: var(--space-2);
}

.profile-name {
  @include page-title;
  font-size: var(--text-2xl);
  margin: 0 0 var(--space-2);
}

.profile-username,
.profile-email {
  font-size: var(--text-sm);
  margin: 0;
}

.profile-username {
  color: var(--text-secondary);
  margin-bottom: var(--space-1);
}

.profile-email {
  color: var(--text-tertiary);
}

/*  */
.profile-tabs {
  display: flex;
  margin-bottom: var(--space-10);
  border-bottom: 1px solid var(--border-primary);
}

.tab-btn {
  @include tab-btn;
  margin-bottom: -1px;
}

.tab-content {
  min-height: 300px;
}

.tab-panel {
  animation: fadeIn 0.3s ease;
}

.settings-card {
  @include glass-card;
  padding: var(--space-6) var(--space-8) var(--space-8) var(--space-8);
  margin-top: 10px;
}

.section-title {
  @include section-title;
  margin: 0 0 34px 0px;
  font-size: var(--text-xl);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

@media (min-width: 640px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-field.full-width {
    grid-column: 1 / -1;
  }
}

.form-field {
  @include flex-col;

  label {
    @include label-style;
  }
}

.input-field {
  @include input-field;
  margin-top: var(--space-2);
  padding: var(--space-2) var(--space-4);
}

.card-actions {
  @include flex-center;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid var(--border-primary);
}

.btn {
  @include btn-base;
  border-radius: var(--radius-full);
}

.btn-primary {
  @include gradient-btn-primary;
  background: var(--secondary-500);

  &:hover:not(:disabled) {
    background: var(--secondary-600);
  }
}

.btn-secondary {
  background: transparent;
  color: var(--secondary-500);
  border: 1.5px solid var(--secondary-500);

  &:hover:not(:disabled) {
    background: var(--secondary-50);
    color: var(--secondary-600);
    border-color: var(--secondary-600);
  }
}

.btn-danger {
  background: var(--error);
  color: white;
  border: none;

  &:hover:not(:disabled) {
    background: var(--error-dark);
  }
}

.danger-card {
  @include glass-card;
  padding: var(--space-6) var(--space-8) var(--space-8) var(--space-8);
  margin-top: 10px;
  border: 2px solid rgba(239, 68, 68, 0.3);
  box-shadow: 0 2px 8px #ef44441a;
}

.danger-header {
  margin-bottom: 24px;
}

.danger-title {
  color: var(--text-secondary);
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px;
}

.danger-description {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}




@media (max-width: 640px) {
  .page-header {
    z-index: 1000 !important;
  }

  .page-header .header-right {
    min-width: 56px !important;
    flex-shrink: 0 !important;
    overflow: visible !important;
  }

  .main-content {
    padding: 80px 0 60px;
  }

  .profile-container {
    padding: 0 var(--space-4);
  }

  .settings-card {
    padding: 24px;
  }

  .card-actions {
    flex-direction: column;

    .btn {
      width: 100%;
    }
  }
}
</style>