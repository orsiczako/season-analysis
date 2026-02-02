<template>
  <div class="animated-background">
    <div class="blob-container">
      <BlobSvg class="blob" />
    </div>
  </div>
</template>

<script setup>
import BlobSvg from '@/assets/blob-haikei.svg'
</script>

<style>
.theme-dark .animated-background {
  background-color: #1A1614;
}

/* Paca színe világos módban */
.blob :deep(path) {
  fill: #EABBA8;
  transition: fill 0.5s ease;
}

/* Paca színe sötét módban */
.theme-dark .blob path {
  fill: #3D2F2A;
}

.animated-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  overflow: visible;
  pointer-events: none;

  /* Alap (világos) háttérszín */
  background-color: #FCEEE8;
  transition: background-color 0.5s ease;
  /* Szép átmenet váltáskor */
}

.blob-container {
  position: absolute;
  top: -35%;
  right: -20%;
  width: 60%;
  max-width: 900px;
  aspect-ratio: 1;
  animation: blobFloat 25s ease-in-out infinite;
  overflow: visible;
}

.blob {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
}



@keyframes blobFloat {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  33% {
    transform: translate(-30px, -30px) scale(1.05);
  }

  66% {
    transform: translate(30px, 20px) scale(0.95);
  }
}

@media (max-width: 768px) {
  .blob-container {
    top: -15%;
    right: -30%;
    width: 120%;
  }
}
</style>