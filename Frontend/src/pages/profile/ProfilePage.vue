<template>
  <div class="profile-page">
    <AnimatedBackground />
    
    <!-- Header -->
    <PageHeader 
      :isDashboard="false" 
      backRoute="/dashboard"
    />

    <!-- Main content -->
    <main class="main-content">
      <div class="profile-container">
        <!-- Profil header -->
        <ProfileHeader
          :avatar="userProfile.avatar"
          :fullName="userProfile.fullName"
          :email="userProfile.email"
        />

    <!-- Profil beállítások -->
    <div class="profile-settings">
      <!-- Személyes adatok -->
      <div class="settings-section card">
        <h3 class="section-title">
          Személyes adatok
        </h3>
        <div class="profile-info-display">
          <div class="form-group">
            <label>Teljes név</label>
            <div class="info-value">{{ userProfile.fullName || 'Nincs megadva' }}</div>
          </div>
          <div class="form-group">
            <label>Email cím</label>
            <div class="info-value">{{ userProfile.email || 'Nincs megadva' }}</div>
          </div>
          <div class="form-group">
            <label>Színtípus</label>
            <div class="info-value color-season" v-if="userProfile.colorSeason">
              <span :class="['season-badge', `season-${userProfile.colorSeason}`]">
                {{ getSeasonName(userProfile.colorSeason) }}
              </span>
              <small v-if="userProfile.colorAnalysisDate" class="analysis-date">
                Elemzés dátuma: {{ formatDate(userProfile.colorAnalysisDate) }}
              </small>
            </div>
            <div class="info-value" v-else>
              <span class="no-analysis">Még nem végzett színelemzést</span>
              <router-link to="/chat" class="analysis-link">
                Kezdje el itt
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Jelszó módosítás -->
      <PasswordChangeForm
        @success="handlePasswordSuccess"
        @error="handlePasswordError"
      />

      <!-- Fiók törlése -->
      <DeleteAccountSection
        @success="handleDeleteSuccess"
        @error="handleDeleteError"
      />

      <!-- Kedvenc színek -->
      <div class="settings-section card">
        <h3 class="section-title">
          Kedvenc színek
          <span v-if="favoriteColors.length > 0" class="color-count">({{ favoriteColors.length }})</span>
        </h3>
        <div v-if="favoriteColors.length" class="favorite-colors-section">
          <div class="favorite-colors">
            <div 
              v-for="colorHex in favoriteColors"
              :key="colorHex"
              class="fav-color"
              :class="{ selected: selectedForDeletion.has(colorHex) }"
              :title="colorHex"
              @click="toggleColorSelection(colorHex)"
            >
              <div class="dot" :style="{ backgroundColor: colorHex }"></div>
              <span class="hex">{{ colorHex }}</span>
              <div v-if="selectedForDeletion.has(colorHex)" class="selected-indicator">✓</div>
            </div>
          </div>
          <div v-if="selectedForDeletion.size > 0" class="color-actions">
            <button 
              class="btn btn--danger" 
              @click="deleteSelectedColors"
              :disabled="deleting"
            >
              {{ deleting ? 'Törlés...' : `${selectedForDeletion.size} szín törlése` }}
            </button>
          </div>
        </div>
        <div v-else class="no-favorites">Még nincs kedvenc szín elmentve.</div>
      </div>
    </div>

    <!-- Toast üzenetek -->
    <ToastMessage
      :visible="toast.visible"
      :message="toast.message"
      :type="toast.type"
      :duration="toast.duration"
      @hide="hideToast"
    />
      </div>
    </main>
  </div>
</template>

<script>
import AnimatedBackground from '@/components/layout/AnimatedBackground.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import ToastMessage from '@/components/common/feedback/ToastMessage.vue'
import ProfileHeader from '@/components/profile/ProfileHeader.vue'
import PasswordChangeForm from '@/components/profile/PasswordChangeForm.vue'
import DeleteAccountSection from '@/components/profile/DeleteAccountSection.vue'
import { apiClient, userService, favoriteColorsService } from '@/services'

export default {
  name: 'ProfileView',
  components: {
    AnimatedBackground,
    PageHeader,
    ToastMessage,
    ProfileHeader,
    PasswordChangeForm,
    DeleteAccountSection
  },
  data() {
    return {
  favoriteColors: [],
  selectedForDeletion: new Set(),
  deleting: false,
      userProfile: {
        fullName: '',
        email: '',
        colorSeason: null,
        colorAnalysisDate: null,
        avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUwIiBmaWxsPSIjZDIxOTdmIi8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzUiIHI9IjE1IiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjAgODBjMC0xNi41Njg1IDEzLjQzMTUtMzAgMzAtMzBzMzAgMTMuNDMxNSAzMCAzMCIgZmlsbD0id2hpdGUiLz4KPC9zdmc+'
      },
      toast: {
        visible: false,
        message: '',
        type: 'success',
        duration: 4000
      }
    }
  },
  mounted() {
    // Felhasználói adatok betöltése a localStorage-ból
    this.loadUserData()
  },
  activated() {
    // Újratöltjük az adatokat amikor az oldal aktiválódik (pl. navigáció után)
    this.refreshProfile()
  },
  methods: {
    loadUserData() {
      // Felhasználói adatok betöltése localStorage-ból
      const userData = localStorage.getItem('authUser')
      if (userData) {
        try {
          const user = JSON.parse(userData)
          this.userProfile = {
            fullName: user.fullName || user.full_name || '',
            email: user.email || '',
            colorSeason: user.colorSeason || null,
            colorAnalysisDate: user.colorAnalysisDate || null,
            avatar: this.userProfile.avatar // Megtartjuk az alapértelmezett avatart
          }
        } catch (error) {
          console.error('Error parsing user data:', error)
        }
      }

      // Próbáljuk meg frissíteni a profilt a szerverről
      this.refreshProfile()
    },

    async refreshProfile() {
      const result = await userService.getProfile()
      
      // Ha 404 (user törölve lett), logolja ki automatikusan
      if (!result.success && result.error && result.error.response?.status === 404) {
        console.warn('User account deleted, logging out...')
        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')
        this.$router.push('/auth/login')
        return
      }

      // Ha egyéb hiba, csak warning
      if (!result.success) {
        console.warn('Could not refresh profile from server:', result.message)
        return
      }

      // Ha sikeres
      if (result.data.user) {
        const user = result.data.user
        this.userProfile = {
          ...this.userProfile,
          fullName: user.fullName || '',
          email: user.email || '',
          colorSeason: user.colorSeason || null,
          colorAnalysisDate: user.colorAnalysisDate || null
        }
        
        // Frissítsük a localStorage-t is
        localStorage.setItem('authUser', JSON.stringify(user))
      }

      // Frissítsük a kedvenc színeket is
      this.loadFavoriteColors()
    },

    async loadFavoriteColors() {
      try {
        const res = await favoriteColorsService.getFavoriteColors()
        if (res.success && res.data) {
          // The API returns the data directly in res.data.favoriteColors
          this.favoriteColors = res.data.favoriteColors || []
          console.log('Loaded favorite colors:', this.favoriteColors)
        } else {
          console.warn('Failed to load favorite colors:', res)
        }
      } catch (e) {
        console.warn('Error loading favorite colors:', e)
      }
    },

    toggleColorSelection(colorHex) {
      if (this.selectedForDeletion.has(colorHex)) {
        this.selectedForDeletion.delete(colorHex)
      } else {
        this.selectedForDeletion.add(colorHex)
      }
      // Trigger reactivity
      this.selectedForDeletion = new Set(this.selectedForDeletion)
    },

    async deleteSelectedColors() {
      if (this.selectedForDeletion.size === 0) return
      
      // Confirmation dialog
      const confirmed = confirm(`Biztosan törölni szeretnéd a kijelölt ${this.selectedForDeletion.size} színt?`)
      if (!confirmed) return
      
      this.deleting = true
      try {
        let deletedCount = 0
        const colorsToDelete = Array.from(this.selectedForDeletion)
        
        console.log('🗑️ Deleting colors:', colorsToDelete)
        
        for (const hex of colorsToDelete) {
          try {
            const res = await favoriteColorsService.removeFavoriteColor(hex)
            if (res.success) {
              deletedCount++
              console.log(`🗑️ Deleted color: ${hex}`)
            } else {
              console.warn('Failed to delete favorite color:', hex, res)
            }
          } catch (error) {
            console.warn('Error deleting favorite color:', hex, error)
          }
        }
        
        // Show success message
        if (deletedCount > 0) {
          this.showSuccessToast(`${deletedCount} szín sikeresen törölve!`)
          // Clear selection and reload colors
          this.selectedForDeletion.clear()
          this.selectedForDeletion = new Set()
          await this.loadFavoriteColors()
        } else {
          this.showErrorToast('Nem sikerült törölni a színeket.')
        }
        
      } catch (e) {
        console.error('Delete colors error:', e)
        this.showErrorToast('Hiba történt a színek törlésekor.')
      } finally {
        this.deleting = false
      }
    },

    getSeasonName(season) {
      const seasonNames = {
        spring: 'Tavasz',
        summer: 'Nyár', 
        autumn: 'Ősz',
        winter: 'Tél'
      }
      return seasonNames[season] || season
    },

    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('hu-HU')
    },

    handlePasswordSuccess(message) {
      this.showSuccessToast(message)
    },

    handlePasswordError(message) {
      this.showErrorToast(message)
    },

    handleDeleteSuccess(message) {
      this.showSuccessToast(message)
    },

    handleDeleteError(message) {
      this.showErrorToast(message)
    },

    showSuccessToast(message) {
      this.toast = {
        visible: true,
        message,
        type: 'success',
        duration: 4000
      }
    },

    showErrorToast(message) {
      this.toast = {
        visible: true,
        message,
        type: 'error',
        duration: 4000
      }
    },

    hideToast() {
      this.toast.visible = false
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/mixins.scss';
@import '@/assets/components/view-common.css';

.profile-page {
  position: relative;
  min-height: 100vh;
}

.main-content {
  padding-top: 70px; /* Space for fixed PageHeader */
  padding-bottom: 20px;
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

/* Settings sections */
.profile-settings {
  @include flex-col;
  gap: 25px;
}

.settings-section {
  @include card-base;
  padding: 25px;

  @media (max-width: 768px) {
    padding: 20px;
  }
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--text-primary);
}

.favorite-colors-section {
  @include flex-col;
  gap: 16px;
}

.favorite-colors {
  @include flex-center;
  flex-wrap: wrap;
  gap: 12px;
}

.fav-color {
  @include flex-center;
  gap: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  padding: 6px 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  user-select: none;
}

.fav-color:hover {
  background: var(--bg-tertiary, #f0f0f0);
  border-color: var(--color-primary, #1976d2);
  transform: translateY(-1px);
}

.fav-color.selected {
  background: var(--color-primary-light, rgba(25, 118, 210, 0.1));
  border-color: var(--color-primary, #1976d2);
  color: var(--color-primary-dark, #1565c0);
}

.fav-color .dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(0,0,0,0.1);
  flex-shrink: 0;
}

.fav-color .hex {
  font-size: 0.9rem;
  font-weight: 500;
}

.selected-indicator {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 20px;
  height: 20px;
  background: var(--color-success, #4caf50);
  color: white;
  border-radius: 50%;
  @include flex-center;
  font-size: 0.7rem;
  font-weight: bold;
  border: 2px solid var(--bg-primary, #fff);
}

.color-count {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: normal;
}

.color-actions {
  @include flex-center;
  gap: 12px;
  flex-wrap: wrap;
  padding-top: 12px;
  border-top: 1px solid var(--border-primary);
}

.btn--danger {
  background: var(--color-danger, #f44336);
  color: white;
  border: none;
}

.btn--danger:hover:not(:disabled) {
  background: var(--color-danger-dark, #d32f2f);
}

.btn--danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.no-favorites {
  color: var(--text-secondary);
  font-style: italic;
  padding: 20px;
  @include text-center;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px dashed var(--border-primary);
}

.profile-info-display {
  @include flex-col;
  gap: 15px;
}

.info-item,
.form-group {
  @include flex-col;
  gap: 8px;

  label {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--text-primary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

.info-value {
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 1rem;
  line-height: 1.5;
}

.color-season {
  @include flex-col;
  gap: 8px;
}

.season-badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  width: fit-content;
  color: white;

  &.season-spring { background: linear-gradient(45deg, #FF6B35, #F7931E); }
  &.season-summer { background: linear-gradient(45deg, #A8DADC, #457B9D); }
  &.season-autumn { background: linear-gradient(45deg, #D2691E, #8B4513); }
  &.season-winter { background: linear-gradient(45deg, #4169E1, #000080); }
}

.analysis-date {
  font-size: 0.85rem;
  color: var(--text-secondary);
  display: block;
  font-style: italic;
}

.no-analysis {
  display: block;
  margin-bottom: 8px;
  color: var(--text-secondary);
  font-style: italic;
}

.analysis-link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
  margin-left: 0.5rem;

  &:hover {
    text-decoration: underline;
  }
}

@media (max-width: 768px) {
  .section-title {
    font-size: 1.1rem;
  }

  .profile-info-display {
    grid-template-columns: 1fr;
  }
}
</style>
