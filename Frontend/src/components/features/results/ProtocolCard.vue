<template>
    <div class="protocol-card" :class="[variant, { interactive: isInteractive }]">
        <div v-if="accentColor" class="accent-bar" :style="{ background: accentColor }" />

        <div v-if="$slots.icon" class="card-icon-area">
            <slot name="icon" />
        </div>

        <div class="card-content">
            <h4 v-if="title" class="card-title">
                {{ title }}
            </h4>
            <div v-if="$slots.default" class="card-body">
                <slot />
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    title: String,
    accentColor: String,
    variant: { type: String, default: 'default' }, // 'default', 'compact', 'minimal'
    isInteractive: Boolean
})
</script>

<style scoped>
.protocol-card {
    position: relative;
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    /* Finomabb árnyék */
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--card-border);
    display: flex;
    flex-direction: column;
    /* Alapból egymás alá */
    overflow: hidden;
    height: 100%;
    transition: all 0.2s ease;
}

.protocol-card.interactive:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(212, 144, 122, 0.12);
    border-color: var(--secondary-400);
}

/* Accent bar */
.accent-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    /* Felülre került a csík, elegánsabb */
}

.card-icon-area {
    padding: 0;
    width: 100%;
    /* Ha kép/színminta van benne, töltse ki */
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--bg-secondary);
}

.card-content {
    padding: 1rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.card-title {
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    font-weight: 600;
    color: #3D3D3D;
    margin: 0;
    line-height: 1.3;
    text-transform: uppercase;
    letter-spacing: 0.15em;
}

.theme-dark .card-title {
    color: #F5F5F5;
}

.card-body {
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    color: #3D3D3D;
    line-height: 1.5;
    font-weight: 400;
    opacity: 0.8;
}

.theme-dark .card-body {
    color: #F5F5F5;
}

/* Minimal variant (pl. kiegészítőknek) */
.protocol-card.minimal {
    flex-direction: row;
    align-items: center;
    padding: 0.75rem 1rem;
    gap: 1rem;
}

.protocol-card.minimal .card-content {
    padding: 0;
}

.protocol-card.minimal .card-icon-area {
    width: auto;
    background: transparent;
}

/* Dark Mode */
:global(.theme-dark) .protocol-card {
    background: rgba(30, 30, 35, 0.6);
    border-color: rgba(255, 255, 255, 0.05);
}

:global(.theme-dark) .card-title {
    color: #fff;
}

:global(.theme-dark) .card-body {
    color: #ccc;
}

:global(.theme-dark) .card-icon-area {
    background: rgba(0, 0, 0, 0.2);
}
</style>