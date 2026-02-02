<template>
  <div class="module-layout">
    <!--Header  -->
    <PageHeader back-to="/dashboard" />
    <!--Maga az oldal -->
    <div class="module-content chat-layout">
      <!--Chat section-->
      <div class="chat-section">
        <h1 class="main-title">
          Színtípus Elemzés
        </h1>

        <div class="mode-switcher">
          <button class="mode-btn" :class="{ active: !cameraMode }" @click="cameraMode = false">
            <MessageSquare :size="20" />
            Chat
          </button>
          <button class="mode-btn" :class="{ active: cameraMode }" @click="switchToCameraMode">
            <Camera :size="20" />
            Kamera
          </button>
        </div>

        <!-- Kamera mód -->
        <div v-if="cameraMode" class="main-panel camera-container">
          <div class="preview-wrapper">
            <video ref="videoElement" autoplay playsinline class="video-preview" :class="{ hidden: !isCameraOn }" />
            <canvas ref="canvasElement" style="display: none;" />

            <div v-if="!isCameraOn" class="camera-placeholder">
              <Camera :size="64" :stroke-width="1.5" />
              <p>Kamera kikapcsolva</p>
            </div>
          </div>

          <div class="camera-controls">
            <button v-if="!isCameraOn" class="camera-btn start" @click="startCamera">
              <Camera :size="24" />
              Kamera indítása
            </button>

            <template v-else>
              <button class="camera-btn stop" @click="stopCamera">
                <Square :size="24" />
                Leállítás
              </button>
              <button class="camera-btn analyze" :disabled="isCameraLoading" @click="analyzeCurrentFrame">
                <Info v-if="!isCameraLoading" :size="24" />
                <span v-else class="btn-spinner" />
                {{ isCameraLoading ? 'Elemzés...' : 'Mit szólsz ehhez?' }}
              </button>
            </template>
          </div>

          <div v-if="cameraResponse" class="camera-response">
            <div class="response-header">
              <img src="/media/ai.png" alt="AI" class="response-avatar">
              <span class="response-label">Stylist véleménye</span>
              <button class="speak-btn" :disabled="isSpeaking" @click="speakResponse">
                <Volume2 :size="20" />
              </button>
              <button class="stop-speak-btn" :disabled="!isSpeaking" @click="stopSpeech">
                <Square :size="20" />
              </button>
            </div>
            <p class="response-text">
              {{ cameraResponse }}
            </p>
          </div>

          <div class="quick-prompts">
            <p class="prompts-label">
              Gyors kérdések:
            </p>
            <div class="prompts-grid">
              <button class="prompt-chip" @click="askQuickPrompt('Jól áll ez a szín nekem?')">
                Jól áll ez a szín?
              </button>
              <button class="prompt-chip" @click="askQuickPrompt('Milyen kiegészítőt ajánlasz ehhez?')">
                Kiegészítő javaslat
              </button>
              <button class="prompt-chip" @click="askQuickPrompt('Hogyan lehetne feldobni ezt az outfitet?')">
                Hogyan lehetne feldobni?
              </button>
              <button class="prompt-chip" @click="askQuickPrompt('Alkalmas ez a ruha a jelenlegi időjáráshoz?')">
                Időjáráshoz illő?
              </button>
            </div>
          </div>

          <div class="camera-input-area input-container">
            <input v-model="cameraQuestion" type="text" class="camera-input" placeholder="Kérdezz bármit a ruhádról..."
              :disabled="!isCameraOn || isCameraLoading" @keyup.enter="analyzeCurrentFrame">
          </div>
        </div>

        <div v-else class="main-panel chat-container">
          <div ref="messagesContainer" class="chat-messages">
            <div v-if="conversationHistory.length === 0" class="welcome-state">
              <div class="welcome-icon">
                <img src="/media/ai.png" alt="AI" class="ai-avatar">
              </div>
              <h2 class="welcome-title">
                Üdvözöllek!
              </h2>
              <p class="welcome-description">
                Segítek megtalálni, hogy te melyik színtípushoz tartozol.
                Az elemzés alapján személyre szabott színpalettát kapsz.
              </p>
              <BaseButton variant="primary" size="lg" @click="startConversation">
                Kezdjük el
              </BaseButton>
            </div>

            <template v-for="(message, index) in conversationHistory" :key="index">
              <div class="chat-message" :class="`message-${message.role}`">
                <div class="message-avatar">
                  <img :src="message.role === 'assistant' ? '/media/ai.png' : '/media/user.png'"
                    :alt="message.role === 'assistant' ? 'AI' : 'Te'">
                </div>
                <div class="message-content">
                  <span class="message-sender">{{ message.role === 'assistant' ? 'AI Tanácsadó' : 'Te' }}</span>
                  <div class="message-bubble" v-html="formatMessageContent(message.content)" />
                </div>
              </div>

              <div v-if="message.isAnalysisComplete && index === conversationHistory.length - 1"
                class="analysis-actions">
                <p class="actions-label">
                  Továbblépési lehetőségek:
                </p>
                <div class="action-buttons">
                  <button class="action-btn primary" @click="goToResults">
                    <CheckCircle :size="20" />
                    <span>Eredmények megtekintése</span>
                  </button>
                  <button class="action-btn secondary" @click="goToSkinAnalysis">
                    <CheckCircle v-if="hasSkinAnalysis" :size="20" />
                    <Clock v-else :size="20" />
                    <span>Bőrtípus elemzés</span>
                    <span v-if="hasSkinAnalysis" class="check-badge" />
                  </button>
                </div>
              </div>
            </template>

            <div v-if="isLoading" class="loading-state">
              <div class="typing-indicator">
                <span /><span /><span />
              </div>
              <p class="loading-text">
                Gondolkodom...
              </p>
            </div>
          </div>

          <div class="chat-input-area">
            <div class="input-container">
              <input v-model="userMessage" type="text" class="message-input" placeholder="Írj egy üzenetet..."
                :disabled="isLoading" @keyup.enter="sendMessage">
              <button class="send-btn" :disabled="!userMessage.trim() || isLoading" @click="sendMessage">
                <Send :size="20" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { MessageSquare, Camera, Square, Info, Volume2, CheckCircle, Clock, Send } from 'lucide-vue-next';
import PageHeader from '@/components/common/layout/PageHeader.vue';
import BaseButton from '@/components/common/base/BaseButton.vue';
import { aiService, userService } from '@/services';
import { useAuth } from '@/composables/useAuth';

const router = useRouter()

const messagesContainer = ref(null);
const conversationHistory = ref([]);
const userMessage = ref('');
const isLoading = ref(false);
const analysisResult = ref(null);
const hasSkinAnalysis = ref(false);

const cameraMode = ref(false);
const videoElement = ref(null);
const canvasElement = ref(null);
const isCameraOn = ref(false);
const isCameraLoading = ref(false);
const cameraResponse = ref('');
const cameraQuestion = ref('');
const cameraConversationHistory = ref([]);
const isSpeaking = ref(false);
const mediaStream = ref(null);
const userColorSeason = ref(null);

const { getUserId } = useAuth();

const getStorageKey = (prefix) => {
  const id = getUserId();
  return id ? `${prefix}_${id}` : null;
};

const formatMessageContent = (content) => {
  if (!content) return '';
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
};


const startConversation = () => {
  const welcomeMessage = {
    role: 'assistant',
    content: 'Szia! Segítek megtalálni a tökéletes színpalettádat.\n\nKét módszer közül választhatsz:\n\n**1) KÉRDŐÍV ALAPÚ ELEMZÉS**\nFelteszek neked 15 konkrét kérdést. Ez strukturált, pontos eredményt ad.\n\n**2) SZABAD LEÍRÁS ALAPÚ ELEMZÉS**\nTe leírod magad saját szavaiddal, és én az alapján elemzem a színtípusod.\n\nMelyiket választod?',
    timestamp: new Date()
  };

  conversationHistory.value.push(welcomeMessage);
  saveConversationHistory();
  scrollToBottom();
};

const saveConversationHistory = () => {
  const key = getStorageKey('aiChatHistory');
  if (key) localStorage.setItem(key, JSON.stringify(conversationHistory.value));
};

const loadConversationHistory = () => {
  const key = getStorageKey('aiChatHistory');
  if (!key) return false;

  const saved = localStorage.getItem(key);
  if (saved) {
    conversationHistory.value = JSON.parse(saved);
    return true;
  }
  return false;
};

const sendMessage = async () => {
  if (!userMessage.value.trim() || isLoading.value) return;

  const message = userMessage.value.trim();

  conversationHistory.value.push({
    role: 'user',
    content: message,
    timestamp: new Date()
  });
  saveConversationHistory();

  userMessage.value = '';
  isLoading.value = true;
  await nextTick();
  scrollToBottom();

  try {
    const response = await aiService.chat(message, conversationHistory.value);

    if (response.success && response.data) {
      await handleAiResponse(response.data.response || '');
    } else {
      throw new Error('Invalid API response');
    }
  } catch (error) {
    console.error('Chat error:', error);
    conversationHistory.value.push({
      role: 'assistant',
      content: 'Sajnálom, hiba történt a kapcsolódáskor. Kérlek próbáld újra!',
      timestamp: new Date()
    });
  } finally {
    isLoading.value = false;
    await nextTick();
    scrollToBottom();
  }
};

const handleAiResponse = async (rawMessage) => {
  let displayMessage = rawMessage;

  if (rawMessage.includes('SZÍNANALÍZIS_KÉSZ')) {
    const jsonMatch = rawMessage.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      try {
        const analysisData = JSON.parse(jsonMatch[0]);
        saveAnalysisResult(analysisData);

        // JSON és marker eltávolítása a megjelenített szövegből
        const textPart = rawMessage.split('SZÍNANALÍZIS_KÉSZ')[0].trim();
        displayMessage = textPart;

        conversationHistory.value.push({
          role: 'assistant',
          content: displayMessage,
          timestamp: new Date(),
          isAnalysisComplete: true
        });
        saveConversationHistory();
        return;
      } catch (e) {
        console.error('Result parsing error:', e);
      }
    }
  }

  conversationHistory.value.push({
    role: 'assistant',
    content: displayMessage,
    timestamp: new Date()
  });

  saveConversationHistory();
};

const saveAnalysisResult = async (data) => {
  const key = getStorageKey('aiLastAnalysisResult');
  if (key) localStorage.setItem(key, JSON.stringify(data));

  if (data.season) {
    try {
      await userService.updateColorSeason(data.season);
    } catch (e) {
      console.warn('Failed to sync with backend:', e);
    }
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const goToResults = () => {
  router.push({ path: '/results', query: { tab: 'season' } })
}

const goToSkinAnalysis = () => {
  router.push('/skin-analysis')
}


const switchToCameraMode = async () => {
  cameraMode.value = true;
  // Betöltjük a user színtípusát ha van
  await loadUserColorSeason();
};

const loadUserColorSeason = async () => {
  try {
    const response = await userService.getProfile();
    if (response.success && response.data?.colorSeason) {
      userColorSeason.value = response.data.colorSeason;
    }
  } catch (err) {
    console.warn('Could not load user color season:', err);
  }
};

const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });
    mediaStream.value = stream;

    if (videoElement.value) {
      videoElement.value.srcObject = stream;
    }
    isCameraOn.value = true;
    cameraResponse.value = '';
  } catch (err) {
    console.error('Nem sikerült elérni a kamerát:', err);
    alert('Kérlek engedélyezd a kamera használatát a böngésződben!');
  }
};

const stopCamera = () => {
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach(track => track.stop());
    mediaStream.value = null;
  }
  if (videoElement.value) {
    videoElement.value.srcObject = null;
  }
  isCameraOn.value = false;
};

const captureFrame = () => {
  if (!videoElement.value || !canvasElement.value) return null;

  const video = videoElement.value;
  const canvas = canvasElement.value;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
};

const analyzeCurrentFrame = async () => {
  if (!isCameraOn.value || isCameraLoading.value) return;

  const prompt = cameraQuestion.value.trim() || 'Jól áll ez a ruha nekem? Illik a színtípusomhoz?';

  isCameraLoading.value = true;
  cameraResponse.value = '';

  try {
    // Kis várakozás, hogy a user felkészülhessen
    await new Promise(resolve => setTimeout(resolve, 1500));

    const imageBase64 = captureFrame();
    if (!imageBase64) {
      throw new Error('Nem sikerült képet készíteni');
    }

    cameraConversationHistory.value.push({
      role: 'user',
      content: prompt
    });

    // A backend automatikusan lekéri a user színtípusát az adatbázisból
    const response = await aiService.chatWithImage(
      imageBase64,
      prompt,
      cameraConversationHistory.value
    );

    if (response.success && response.data?.response) {
      cameraResponse.value = response.data.response;

      cameraConversationHistory.value.push({
        role: 'assistant',
        content: response.data.response
      });

      // Auto felolvasás ha be van kapcsolva
      speakResponse();
    } else {
      throw new Error(response.message || 'Hiba történt az elemzés során');
    }
  } catch (error) {
    console.error('Camera analysis error:', error);
    cameraResponse.value = 'Sajnálom, hiba történt az elemzés során. Kérlek próbáld újra!';
  } finally {
    isCameraLoading.value = false;
    cameraQuestion.value = '';
  }
};

const askQuickPrompt = (prompt) => {
  cameraQuestion.value = prompt;
  analyzeCurrentFrame();
};

const speakResponse = () => {
  if (!cameraResponse.value || isSpeaking.value) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(cameraResponse.value);
  utterance.lang = 'hu-HU';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  utterance.onstart = () => {
    isSpeaking.value = true;
  };

  utterance.onend = () => {
    isSpeaking.value = false;
  };

  utterance.onerror = () => {
    isSpeaking.value = false;
  };

  window.speechSynthesis.speak(utterance);
};

const stopSpeech = () => {
  window.speechSynthesis.cancel();
  isSpeaking.value = false;
};


onMounted(async () => {
  const hasHistory = loadConversationHistory();

  // Korábbi elemzés betöltése ha van
  const resultKey = getStorageKey('aiLastAnalysisResult');
  if (resultKey) {
    const last = localStorage.getItem(resultKey);
    if (last) {
      analysisResult.value = JSON.parse(last);
      if (analysisResult.value?.season) {
        userColorSeason.value = analysisResult.value.season;
      }
    }
  }

  // Bőrtípus elemzés ellenőrzése API-ból
  try {
    const res = await userService.getAnalysesResults();
    if (res.success && res.data?.skinAnalysis) {
      hasSkinAnalysis.value = true;
    }
  } catch (e) {
    console.warn('Could not check skin analysis:', e);
  }

  if (!hasHistory) {
    startConversation();
  } else {
    scrollToBottom();
  }
});

onUnmounted(() => {
  stopCamera();
  window.speechSynthesis.cancel();
});
</script>

<style scoped lang="scss">
@use '@/assets/mixins.scss' as *;

/* Page Title */
.main-title {
  @include page-title;
  margin-bottom: var(--space-2);
}

.chat-message {
  display: flex;
  gap: var(--space-3);
  animation: messageIn 0.3s ease-out;
}

@keyframes messageIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-user {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, var(--secondary-100), var(--secondary-200));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);

  img {
    width: 65%;
    height: 65%;
    object-fit: contain;
  }
}

.message-user .message-avatar {
  background: linear-gradient(135deg, var(--secondary-400), var(--secondary-500));

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center bottom;
  }
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  max-width: 75%;

}

.message-sender {
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
  padding: 0 var(--space-2);
}

.message-user .message-sender {
  text-align: right;
}

.message-bubble {
  padding: var(--space-3) var(--space-3);
  border-radius: var(--radius-xl);
  line-height: 1.6;
  font-family: var(--font-sans);
  font-size: var(--text-xs);

  :deep(strong) {
    font-weight: 600;
    color: var(--secondary-700);
  }
}

.message-assistant .message-bubble {
  background: var(--secondary-50);
  color: var(--text-primary);
  border-bottom-left-radius: var(--radius-sm);
  border: 1px solid var(--secondary-100);
}

.message-user .message-bubble {
  background: linear-gradient(135deg, var(--secondary-500), var(--secondary-600));
  color: white;
  border-bottom-right-radius: var(--radius-sm);
  box-shadow: 0 4px 12px rgba(180, 120, 100, 0.25);

  :deep(strong) {
    color: rgba(255, 255, 255, 0.95);
  }
}

.theme-dark .message-assistant .message-bubble {
  background: rgba(180, 120, 100, 0.1);
  border-color: rgba(180, 120, 100, 0.2);
}

.theme-dark .message-bubble :deep(strong) {
  color: var(--secondary-300);
}


.chat-section {
  @include flex-col;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  min-height: 0;
  padding-top: 0;
  padding-bottom: 16px;
}

.main-panel {
  @include flex-col;
  @include glass-card;
  overflow: hidden;
  max-width: 1100px;
  margin: 0 auto;
  min-height: 400px;
  max-height: 70vh;
  height: 100%;
  box-sizing: border-box;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
  @include flex-col;
  gap: var(--space-4);
  @include custom-scrollbar;

}

.welcome-state {
  @include empty-state;
}

.welcome-icon {
  @include avatar-wrapper(100px);
  margin-bottom: var(--space-6);
}

.ai-avatar {
  width: 70%;
  height: 70%;
  object-fit: contain;
}

.welcome-title {
  @include section-title;
}

.welcome-description {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 400px;
  margin-bottom: var(--space-8);
}

.loading-state {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  background: var(--secondary-50);
  border-radius: var(--radius-xl);
  border-bottom-left-radius: var(--radius-sm);
  max-width: 200px;
  animation: fadeIn 0.3s ease-out;
}

.typing-indicator {
  @include typing-indicator;
}

.loading-text {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--secondary-600);
  margin: 0;
}

.analysis-actions {
  border-radius: var(--radius-xl);
  margin-top: var(--space-2);
}

.actions-label {
  @include label-style;
  color: var(--secondary-600);
  margin: 0 0 var(--space-4);
}

.action-buttons {
  @include flex-col;
  gap: var(--space-3);
}

.action-btn {
  @include btn-base;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);

  &.primary {
    @include gradient-btn-primary;
    box-shadow: 0 4px 12px rgba(180, 120, 100, 0.3);
  }

  &.secondary {
    background: white;
    color: var(--secondary-700);
    border: 1px solid var(--secondary-200);

    &:hover {
      background: var(--secondary-50);
      border-color: var(--secondary-300);
    }

    .theme-dark & {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.1);
      color: var(--secondary-300);

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }

  svg {
    flex-shrink: 0;
  }
}

.chat-input-area {
  padding: 8px 0;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-primary);
}

.input-container {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--card-bg);
  border: 1px solid var(--border-primary);
  border-radius: 18px;
  padding: 2px 12px;
  transition: all 0.2s ease;

  &:focus-within {
    border-color: var(--secondary-400);
    box-shadow: 0 0 0 3px rgba(180, 120, 100, 0.15);
  }
}

.message-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--text-primary);
  outline: none;
  padding: 3px 0;

  &::placeholder {
    color: var(--text-tertiary);
    font-size: 0.95em;
  }
}

.send-btn {
  @include btn-base;
  padding: 4px 10px;
  gap: 4px;
  font-size: 1rem;
  min-width: 36px;
  min-height: 36px;

  svg {
    width: 18px;
    height: 18px;
  }
}

@include mobile-only {
  .chat-container {
    height: calc(100vh - 180px);
    border-radius: var(--radius-lg);
  }

  .chat-messages {
    padding: var(--space-4);
  }


  .welcome-state {
    padding: var(--space-8) var(--space-4);
  }

  .welcome-icon {
    width: 80px;
    height: 80px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-btn {
    justify-content: center;
  }

  .message-content {
    max-width: 85%;
  }

  .message-avatar {
    width: 36px;
    height: 36px;
  }

  .message-bubble {
    padding: var(--space-3) var(--space-4);
    font-size: var(--text-xs);
  }
}

.mode-switcher {
  @include mode-switcher;
}

.mode-btn {
  @include btn-base;
  background: transparent;
  border-radius: var(--radius-full);
  padding: 0.7em 1.3em;
  color: var(--text-secondary);

  &:hover {
    color: var(--text-primary);
    background: var(--bg-tertiary);
  }

  &.active {
    background: linear-gradient(135deg, var(--secondary-500), var(--secondary-600));
    color: white;
    box-shadow: 0 0 12px rgba(26, 24, 24, 0.3);
  }
}

.theme-dark .mode-btn:hover {
  background: var(--border-secondary);
  color: var(--text-secondary);
}

.camera-container {
  gap: var(--space-5);
  padding: 24px;
  animation: fadeIn 0.4s ease-out;
}

.preview-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #1a1a1a;
  border-radius: var(--radius-lg);
  overflow: hidden;
  max-height: 40vh;
}

.video-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
}

.video-preview.hidden {
  display: none;
}

.camera-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  @include flex-col-center;
  gap: var(--space-3);
  color: #666;

  svg {
    opacity: 0.5;
  }

  p {
    font-size: var(--text-sm);
    margin: 0;
  }
}

.camera-controls {
  @include flex-center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.camera-btn {
  @include btn-base;
  font-size: var(--text-xs);
  padding: 8px 14px;

  &.start {
    @include gradient-btn-primary;
  }

  &.stop {
    background: var(--secondary-600);
    color: white;

    &:hover {
      background: #dc2626;
    }
  }

  &.analyze {
    background: var(--secondary-600);
    color: white;
    min-width: 200px;
    justify-content: center;

    &:hover:not(:disabled) {
      background: #059669;
      transform: translateY(-2px);
    }
  }
}

.btn-spinner {
  @include spinner;
}



.response-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.response-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.response-label {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--secondary-700);
  flex: 1;
}

.speak-btn {
  @include icon-btn;
}

.response-text {
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  color: var(--text-primary);
  line-height: 1.6;
  margin: 0;
}

.quick-prompts {
  @include flex-col;
  gap: var(--space-3);
}

.prompts-label {
  @include label-style;
}

.prompts-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.prompt-chip {
  @include chip-style;
}

.camera-input-area {
  margin-top: var(--space-2);
}

.camera-input {
  @include input-field;
  border: none;
  font-size: var(--text-xs);
  padding-top: 4px;
  padding-bottom: 4px;
  padding-left: 8px;
  padding-right: 8px;

  &::placeholder {
    font-size: var(--text-xs);
  }
}

@include mobile-only {
  .mode-switcher {
    width: 80%;
  }

  .mode-btn {
    flex: 1;
    justify-content: center;
    font-size: 0.95em;
    padding: 0.5em 0.8em;
  }

  .camera-container {
    padding: 8px !important;
    gap: var(--space-2);
  }

  .preview-wrapper {
    max-height: 55vw;
    min-height: 180px;
  }

  .camera-controls {
    flex-direction: column;
    gap: var(--space-2);
  }


  .camera-btn {
    width: 100%;
    min-width: 0;
    min-height: 32px;
    font-size: var(--text-xs);
    padding: 6px 0;
    justify-content: center;
  }

  .camera-input-area {
    margin-top: var(--space-1);
  }

  .camera-input {
    font-size: 0.75em;
    padding: 3px 6px;

    &::placeholder {
      font-size: 0.7em;
    }
  }

  .prompts-grid {
    flex-direction: column;
    gap: var(--space-1);
  }

  .prompt-chip {
    text-align: center;
    font-size: var(--text-xs);
    padding: 6px 8px;
  }

  .camera-response {
    font-size: var(--text-xs);
  }

  .response-label {
    font-size: var(--text-xs);
  }

  .response-text {
    font-size: var(--text-xs);
  }
}
</style>