<template>
  <!--Dinamikus css osztályt adunk, ha assistant akkor ez, ha user akkor az, itt oldjuk meg az üzenet megjelenítését-->
  <div class="message" :class="message.role">
    <img 
      class="icon" 
      :src="message.role === 'assistant' ? '/media/ai.png' : '/media/user.png'"
      :alt="message.role === 'assistant' ? 'AI Assistant' : 'User'"
    >
    <!--  Tartalom HTMLKÉNT  jelenik meg-->
    <div class="content" v-html="formatContent(message.content)"></div>
  </div>
</template>

<script setup>
/**egy message objektum felépítése a definepropsban megmondjuk hogy milyen adatokat várjon
 * {
    role: 'user' | 'assistant',        // Ki küldte az üzenetet
    content: 'Szöveges tartalom...'    // Mit írt
}
 */
defineProps({
  message: { type: Object, required: true }
});

const formatContent = (content) => {
  if (!content) return '';
  //Megkeresi a **szöveget** és strong tagbe teszi, valamint a sortöréseket br taggé alakítja
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
};
</script>

<style lang="scss" scoped>
@import '@/assets/mixins.scss';

.message {
  @include flex-center;
  justify-content: flex-start;
  gap: 10px;
  margin-bottom: 15px;
  align-items: flex-start;
}

.message.user {
  flex-direction: row-reverse;
}

.icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.message.user .icon {
  width: 40px;
  height: 40px;
}

.content {
  background: #f5f5f5;
  padding: 10px 15px;
  border-radius: 12px;
  max-width: 70%;
  line-height: 1.4;
}

.message.user .content {
  background: #007bff;
  color: white;
}

.theme-dark .message .content {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.theme-dark .message.user .content {
  background: #0056b3;
  color: white;
}
</style>