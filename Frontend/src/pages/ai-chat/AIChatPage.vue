<template>
  <div class="ai-chat-page">

    <AnimatedBackground />
    
    <PageHeader 
      :isDashboard="false" 
      :backRoute="isGuestMode ? '/login' : '/dashboard'"
    />

    <!-- Guest mód figyelmeztetés -->
    <div v-if="isGuestMode" class="guest-warning">
      <p><strong>Vendég mód:</strong> Próbáld ki a színelemzést! Regisztrálj a teljes élményért!</p>
    </div>

    <!-- A fő tartalom: bal oldalon a chat, jobb oldalon (ha van) az eredményA dupla tagadás (!!) egy JavaScript trükk, ami bármilyen értéket boolean-né konvertál: -->
    <div class="content-container" :class="{'has-result': !!analysisResult}">
      <!-- CHAT rész -->
      <div class="chat-container">
      
        <!-- Üzenetek listája -->
        <div class="chat-messages" ref="messagesContainer">
          
          <!-- Üdvözlő szöveg, ha még nincs korábbi beszélgetés -->
          <div class="welcome-message" v-if="conversationHistory.length === 0">
            <h2>Üdvözöllek!</h2>
            <p>Segítek megtalálni, hogy te melyik évszakhoz tartozol.</p>
            <button class="btn btn--primary" @click="startConversation">
              Kezdjük el! 
            </button>
          </div>

          <!-- Dinamikus chat üzenetek (user + AI) -->
          <ChatMessage 
            v-for="(message, index) in conversationHistory" 
            :key="index"
            :message="message"
          />

          <!-- Betöltési animáció, amikor az AI éppen válaszol -->
          <div v-if="isLoading" class="loading-message">
            <div class="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p>Az AI gondolkodik...</p>
          </div>
        </div>

        <!-- Beviteli mező (felhasználó üzenetet írhat) -->
        <div class="chat-input-area">
          <div class="chat-input">
            <input 
              v-model="userMessage"
              @keyup.enter="sendMessage"
              :disabled="isLoading"
              placeholder="Írj egy üzenetet..."
              type="text"
            />
            <button 
              class="btn-send"
              @click="sendMessage"
              :disabled="!userMessage.trim() || isLoading"
            >
              <img src="/media/paw.png" alt="Küldés" class="send-icon" />
            </button>
          </div>
        </div>
      </div>
      
      <!-- Színelemzés eredmény -->
      <div v-if="analysisResult" class="result-container">
        <ColorAnalysisResult 
          :result="analysisResult"
          :isGuestMode="isGuestMode"
          @new-analysis="resetChat"
        />
      </div>
    </div>
  </div>
</template>

<script setup>

import { ref, nextTick, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// Komponensek importálása
import ChatMessage from '@/components/features/ai/ChatMessage.vue';
import ColorAnalysisResult from '@/components/features/ai/ColorAnalysisResult.vue';
import PageHeader from '@/components/layout/PageHeader.vue';
import AnimatedBackground from '@/components/layout/AnimatedBackground.vue';

// AI backend hívások szolgáltatása
import { aiService } from '@/services';

const router = useRouter();
const route = useRoute();

// Guest mód ellenőrzése
const isGuestMode = computed(() => route.query.guest === 'true');

const messagesContainer = ref(null);         // a chat scrollozható tartalma
const conversationHistory = ref([]);         // a chat üzenetek listája
const userMessage = ref('');                 // a felhasználó aktuális beírt üzenete
const isLoading = ref(false);                // AI válaszra várunk-e
const analysisResult = ref(null);            // színelemzés eredménye (ha kész)

/* Eredmény mentése localstorageba (felhasználóhoz kötve) */
const setAnalysisResult = (data) => {
  analysisResult.value = data;
  try {
    const user = JSON.parse(localStorage.getItem('authUser') || 'null');
    const userId = user?.id || 'guest';
    localStorage.setItem(`aiLastAnalysisResult_${userId}`, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to persist analysis result:', e);
  }
};

/* Beszélgetés indítása */
const startConversation = () => {
  const welcomeMessage = {
    role: 'assistant',
    content: 'Szia! Segítek megtalálni a tökéletes színpalettádat.\n\nKét módszer közül választhatsz:\n\n**1) KÉRDŐÍV ALAPÚ ELEMZÉS**\nFelteszek neked 15 konkrét kérdést (bőrtónus, hajszín, vénák színe, napfény hatása, stb.). Ez strukturált, pontos eredményt ad.\n\n**2) SZABAD LEÍRÁS ALAPÚ ELEMZÉS**\nTe leírod magad saját szavaiddal (megjelenés, bőr, haj, szem, színpreferenciák), és én az alapján elemzem a színtípusod.\n\nMelyiket választod?\n',
    timestamp: new Date()
  };
  
  // Első AI üzenet beszúrása
  conversationHistory.value.push(welcomeMessage);
  saveConversationHistory();
  scrollToBottom();
};

/* Beszélgetés mentése localstorageba (felhasználóhoz kötve) */
const saveConversationHistory = () => {
  // Guest módban ne mentsük el a beszélgetéseket
  if (isGuestMode.value) {
    return;
  }
  
  try {
    const user = JSON.parse(localStorage.getItem('authUser') || 'null');
    const userId = user?.id || 'guest';
    localStorage.setItem(`aiChatHistory_${userId}`, JSON.stringify(conversationHistory.value));
  } catch (error) {
    console.warn('Failed to save conversation history:', error);
  }
};

/* Korábbi chat betöltése (felhasználóhoz kötve) */
const loadConversationHistory = () => {
  // Guest módban ne töltsünk be korábbi historyt
  if (isGuestMode.value) {
    return false;
  }
  
  try {
    const user = JSON.parse(localStorage.getItem('authUser') || 'null');
    const userId = user?.id || 'guest';
    const saved = localStorage.getItem(`aiChatHistory_${userId}`);
    if (saved) {
      conversationHistory.value = JSON.parse(saved);
      return true;
    }
  } catch (error) {
    console.warn('Failed to load conversation history:', error);
  }
  return false;
};

/* Üzenet küldése az AI felé */
const sendMessage = async () => {
  if (!userMessage.value.trim() || isLoading.value) return;
  
  const message = userMessage.value.trim();
  
  // Felhasználói üzenet hozzáadása a beszélgetéshez
  conversationHistory.value.push({
    role: 'user',
    content: message,
    timestamp: new Date()
  });
  
  saveConversationHistory(); // mentjük az új állapotot
  
  userMessage.value = '';
  isLoading.value = true;
  
  await nextTick();
  scrollToBottom();

  try {
    // AI hívás - vendég módban külön endpoint
    const response = isGuestMode.value 
      ? await aiService.chatGuest(message, conversationHistory.value)
      : await aiService.chat(message, conversationHistory.value);
    
    if (response.success && response.data) {
      const aiMessage = response.data.response || '';
      let cleanedMessage = aiMessage;
      
      /* 
       * Ha az AI elkészült az elemzéssel, akkor az üzenetében szerepel a "SZÍNANALÍZIS_KÉSZ" kulcsszó,
       * és ilyenkor JSON formátumban küldött elemzési adatokat is.
       */
      if (aiMessage.includes('SZÍNANALÍZIS_KÉSZ')) {
        // Markdown JSON kódblokk eltávolítása
        let cleanText = aiMessage.replace(/```\s*json\n?/gi, '').replace(/```\n?/g, '');
        // JSON objektum kinyerése
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const analysisData = JSON.parse(jsonMatch[0]);
            setAnalysisResult(analysisData); // eredmény elmentése
            // Csak a szöveges rész maradjon meg
            cleanedMessage = aiMessage.split('SZÍNANALÍZIS_KÉSZ')[0].trim();
            
          } catch (e) {
            console.error('JSON parse error (AIChatPage):', e);
          }
        } else {
          console.warn('No JSON block found after SZÍNANALÍZIS_KÉSZ (AIChatPage)');
        }
      }
      
      // AI üzenet hozzáadása
      conversationHistory.value.push({
        role: 'assistant',
        content: cleanedMessage,
        timestamp: new Date()
      });
      
      saveConversationHistory();
      await nextTick();
      scrollToBottom();

    } else {
      console.error('Chat failed:', response);
      alert('Hiba történt az AI válasz során. Próbáld újra!');
    }
  } catch (error) {
    console.error('Chat error:', error);
    alert('Hiba történt. Ellenőrizd az internetkapcsolatot!');
  } finally {
    isLoading.value = false;
  }
};

/* Új elemzés indítása (chat és eredmény törlése a felhasználóhoz kötve) */
const resetChat = () => {
  conversationHistory.value = [];
  analysisResult.value = null;
  try {
    const user = JSON.parse(localStorage.getItem('authUser') || 'null');
    const userId = user?.id || 'guest';
    localStorage.removeItem(`aiChatHistory_${userId}`);
    localStorage.removeItem(`aiLastAnalysisResult_${userId}`);
  } catch (e) {
    console.warn('Failed to clear storage:', e);
  }
  startConversation();
};

/* Görgetés a chat aljára */
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

/* Oldal betöltésekor */
onMounted(() => {
  const hasHistory = loadConversationHistory(); // próbáljuk visszatölteni a régi chatet

  // Ha volt korábbi elemzési eredmény ÉS van chat history, azt is betöltjük
  // (felhasználóhoz kötve)
  if (hasHistory) {
    try {
      const user = JSON.parse(localStorage.getItem('authUser') || 'null');
      const userId = user?.id || 'guest';
      const last = localStorage.getItem(`aiLastAnalysisResult_${userId}`);
      if (last) {
        analysisResult.value = JSON.parse(last);
      }
    } catch (e) {
      console.warn('Failed to restore last analysis result:', e);
    }
  }

  // Ha nincs korábbi chat, indítunk egy új beszélgetést
  if (!hasHistory) {
    startConversation();
  } else {
    scrollToBottom();
  }
});
</script>


<style scoped>
.ai-chat-page {
  position: relative;
  width: 100%;
  margin: 0;
  padding: 70px 24px 24px 24px; 
  height: calc(100vh - 70px);
  display: flex;
  flex-direction: column;
}

.content-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  align-items: stretch;
  flex: 1;
  height: 100%;
}

.content-container.has-result {
  grid-template-columns: 1fr 1fr;
}


.content-container .chat-container {
  height: 100%;
}


.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary, #fff);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  scroll-behavior: smooth;
}

.welcome-message {
  text-align: center;
  padding: 48px 24px;
}


.welcome-message h2 {
  font-size: 1.75rem;
  margin-bottom: 12px;
}

.welcome-message p {
  color: var(--text-secondary, #666);
  margin-bottom: 24px;
}

.loading-message {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--bg-secondary, #f5f5f5);
  border-radius: 12px;
  margin-bottom: 16px;
}

.loading-dots {
  display: flex;
  gap: 6px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary, #1976d2);
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.chat-input-area {
  border-top: 1px solid var(--border-color, #e0e0e0);
  padding: 16px;
  background: var(--bg-secondary, #f5f5f5);
}

.chat-input {
  display: flex;
  gap: 12px;
}

.chat-input input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 8px;
  font-size: 1rem;
}

.chat-input input:focus {
  outline: none;
  border-color: var(--color-primary, #1976d2);
}

.btn-send {
  padding: 12px 20px;
  background: var(--color-primary, #1976d2);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-send .send-icon {
  width: 24px;
  height: 24px;
}

.btn-send:hover:not(:disabled) {
  background: var(--color-primary-dark, #1565c0);
  transform: scale(1.05);
}

.btn-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn--primary {
  background: var(--color-primary, #1976d2);
  color: white;
}

.btn--primary:hover {
  background: var(--color-primary-dark, #1565c0);
}

.result-container {
  overflow-y: auto;
  height: 100%;
}

@media (max-width: 900px) {
  .content-container,
  .content-container.has-result {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .content-container .chat-container {
    height: 50vh;
  }
}

.theme-dark .chat-container {
  background: var(--bg-secondary-dark, #1e1e1e);
}

.theme-dark .chat-input-area {
  background: var(--bg-tertiary-dark, #2a2a2a);
}

.theme-dark .chat-input input {
  background: var(--bg-primary-dark, #121212);
  color: var(--text-primary-dark, #fff);
}
</style>
