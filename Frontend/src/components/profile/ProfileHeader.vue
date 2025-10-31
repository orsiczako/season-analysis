<template>
  <div class="profile-header card">
    <div class="profile-avatar-section">
      <div class="avatar-wrapper">
        <img :src="avatar" alt="Profil kép" class="profile-avatar">
      </div>
      <div class="profile-info">
        <h2 class="profile-name">{{ fullName }}</h2>
        <p class="profile-email">{{ email }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  avatar: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  }
})
</script>

<style scoped lang="scss">
@import '@/assets/mixins.scss';

.profile-header {
  @include card-base;
  padding: 30px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
}

.profile-avatar-section {
  @include flex-col-center;
  gap: 20px;
  text-align: center;
  
  @media (min-width: 768px) {
    @include flex-between;
    text-align: left;
    gap: 30px;
  }
}

.avatar-wrapper {
  flex-shrink: 0;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid var(--color-primary);
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
  }
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 8px 0;
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
}

.profile-email {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin: 0;
}
</style>
