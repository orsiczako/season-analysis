<!--
  Animated Background Component
  Inspired by: https://codepen.io/tag/floating-shapes
  Design inspiration: Glassmorphism & Holographic effects
-->
<template>
  <div class="animated-background">
    <div class="floating-shapes">
      <!--  Minde alakzat kap egy számot, amit majd növelünk-->
      <div 
        v-for="i in shapeCount" 
        :key="i" 
        :class="`shape shape-${i}`"
      ></div>
    </div>
    <!--Itt is minde alakzat kap egy számot, amit majd növelünk-->
    <div v-if="showLights" class="holographic-lights">
      <div 
        v-for="i in lightCount" 
        :key="i" 
        :class="`light light-${i}`"
      ></div>
    </div>
    
    <div class="gradient-overlay"></div>
  </div>
</template>

<script setup>
/**Eventek a szulo komponens fele */
defineProps({
  shapeCount: {
    type: Number,
    default: 6
  },
  lightCount: {
    type: Number,
    default: 3
  },
  showLights: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped>
.animated-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
}

.floating-shapes {
  position: relative;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, 
    rgba(244, 114, 182, 0.08) 0%, 
    rgba(236, 72, 153, 0.12) 50%, 
    rgba(217, 70, 239, 0.06) 100%);
  backdrop-filter: blur(2px);
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  box-shadow: 0 4px 20px rgba(244, 114, 182, 0.1);
}

.theme-dark .shape {
  background: linear-gradient(135deg, 
    rgba(244, 114, 182, 0.15) 0%, 
    rgba(232, 121, 249, 0.2) 50%, 
    rgba(168, 85, 247, 0.12) 100%);
  box-shadow: 0 4px 20px rgba(244, 114, 182, 0.2),
              0 0 40px rgba(232, 121, 249, 0.1);
}

/* Shape positions and sizes */
.shape-1 {
  width: 120px;
  height: 120px;
  top: 10%;
  left: 10%;
  animation: float1 8s infinite;
}

.shape-2 {
  width: 80px;
  height: 80px;
  top: 20%;
  right: 15%;
  animation: float2 6s infinite;
}

.shape-3 {
  width: 150px;
  height: 150px;
  bottom: 20%;
  left: 20%;
  animation: float3 10s infinite;
}

.shape-4 {
  width: 60px;
  height: 60px;
  top: 60%;
  right: 25%;
  animation: float4 7s infinite;
}

.shape-5 {
  width: 100px;
  height: 100px;
  bottom: 10%;
  right: 10%;
  animation: float5 9s infinite;
}

.shape-6 {
  width: 40px;
  height: 40px;
  top: 40%;
  left: 60%;
  animation: float6 5s infinite;
}

/* Floating animations */
@keyframes float1 {
  0% { transform: translate(0px, 0px) rotate(0deg); }
  50% { transform: translate(30px, -20px) rotate(180deg); }
  100% { transform: translate(0px, 0px) rotate(360deg); }
}

@keyframes float2 {
  0% { transform: translate(0px, 0px) rotate(0deg); }
  33% { transform: translate(-25px, 15px) rotate(120deg); }
  66% { transform: translate(20px, -10px) rotate(240deg); }
  100% { transform: translate(0px, 0px) rotate(360deg); }
}

@keyframes float3 {
  0% { transform: translate(0px, 0px) scale(1); }
  50% { transform: translate(-15px, -25px) scale(1.1); }
  100% { transform: translate(0px, 0px) scale(1); }
}

@keyframes float4 {
  0% { transform: translate(0px, 0px) rotate(0deg); }
  25% { transform: translate(15px, -15px) rotate(90deg); }
  50% { transform: translate(-10px, -20px) rotate(180deg); }
  75% { transform: translate(-20px, 10px) rotate(270deg); }
  100% { transform: translate(0px, 0px) rotate(360deg); }
}

@keyframes float5 {
  0% { transform: translate(0px, 0px); }
  20% { transform: translate(10px, -15px); }
  40% { transform: translate(-15px, -10px); }
  60% { transform: translate(20px, 5px); }
  80% { transform: translate(-5px, 15px); }
  100% { transform: translate(0px, 0px); }
}

@keyframes float6 {
  0% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
  50% { transform: translate(-20px, 20px) rotate(180deg) scale(1.2); }
  100% { transform: translate(0px, 0px) rotate(360deg) scale(1); }
}

/* Holographic lights */
.holographic-lights {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.light {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

.light-1 {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, 
    rgba(244, 114, 182, 0.3) 0%, 
    rgba(244, 114, 182, 0.1) 40%, 
    transparent 70%);
  top: 20%;
  left: 80%;
  animation: hologram1 20s infinite;
}

.light-2 {
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, 
    rgba(232, 121, 249, 0.25) 0%, 
    rgba(232, 121, 249, 0.08) 40%, 
    transparent 70%);
  bottom: 30%;
  left: 10%;
  animation: hologram2 25s infinite;
}

.light-3 {
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, 
    rgba(168, 85, 247, 0.2) 0%, 
    rgba(168, 85, 247, 0.06) 40%, 
    transparent 70%);
  top: 60%;
  right: 20%;
  animation: hologram3 18s infinite;
}

.theme-dark .light-1 {
  background: radial-gradient(circle, 
    rgba(244, 114, 182, 0.4) 0%, 
    rgba(244, 114, 182, 0.15) 40%, 
    transparent 70%);
}

.theme-dark .light-2 {
  background: radial-gradient(circle, 
    rgba(232, 121, 249, 0.35) 0%, 
    rgba(232, 121, 249, 0.12) 40%, 
    transparent 70%);
}

.theme-dark .light-3 {
  background: radial-gradient(circle, 
    rgba(168, 85, 247, 0.3) 0%, 
    rgba(168, 85, 247, 0.1) 40%, 
    transparent 70%);
}

@keyframes hologram1 {
  0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.3; }
  33% { transform: translate(-30px, -50px) scale(1.1); opacity: 0.6; }
  66% { transform: translate(20px, 30px) scale(0.9); opacity: 0.4; }
}

@keyframes hologram2 {
  0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.25; }
  25% { transform: translate(40px, -20px) scale(1.2); opacity: 0.5; }
  50% { transform: translate(-20px, -40px) scale(0.8); opacity: 0.7; }
  75% { transform: translate(30px, 20px) scale(1.1); opacity: 0.3; }
}

@keyframes hologram3 {
  0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.2; }
  40% { transform: translate(-25px, 35px) scale(1.3); opacity: 0.6; }
  80% { transform: translate(15px, -25px) scale(0.7); opacity: 0.4; }
}

/* Gradient overlay */
.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 70%, 
    rgba(244, 114, 182, 0.04) 0%, 
    transparent 60%),
    radial-gradient(circle at 70% 30%, 
    rgba(236, 72, 153, 0.06) 0%, 
    transparent 60%),
    radial-gradient(circle at 50% 50%, 
    rgba(217, 70, 239, 0.03) 0%, 
    transparent 70%);
  animation: pulse 15s ease-in-out infinite;
}

.theme-dark .gradient-overlay {
  background: radial-gradient(circle at 30% 70%, 
    rgba(244, 114, 182, 0.08) 0%, 
    transparent 50%),
    radial-gradient(circle at 70% 30%, 
    rgba(232, 121, 249, 0.1) 0%, 
    transparent 50%),
    radial-gradient(circle at 50% 50%, 
    rgba(168, 85, 247, 0.06) 0%, 
    transparent 60%);
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}

/* Responsive */
@media (max-width: 768px) {
  .shape-4, .shape-6, .light-3 {
    display: none;
  }
  
  .shape {
    animation-duration: 12s;
  }
  
  .light {
    animation-duration: 25s;
  }
}

@media (prefers-reduced-motion: reduce) {
  .shape, .light {
    animation: none;
  }
  
  .gradient-overlay {
    animation: none;
  }
}
</style>