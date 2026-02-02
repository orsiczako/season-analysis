<template>
    <section class="protocol-section" :class="variant">
        <div v-if="title" class="section-header">
            <h3 class="section-title">
                {{ title }}
            </h3>
            <slot name="header-action" />
        </div>
        <div class="section-content">
            <slot />
        </div>
    </section>
</template>

<script setup>
defineProps({
    title: String,
    variant: { type: String, default: 'default' }
})
</script>

<style scoped>
.protocol-section {
    /* Tömör padding */
    padding: 1rem;
    background: var(--card-bg);
    backdrop-filter: blur(10px);
    border-radius: var(--radius-lg);
    /* Kisebb lekerekítés */
    border: 1px solid var(--secondary-200);
    /* Halvány terracotta keret */
    box-shadow: var(--shadow-sm);
    margin-bottom: 1rem;
    /* Kisebb távolság a szekciók között */
}

/* Kiemelt variáns (pl. diagnosztika) */
.protocol-section.highlight {
    background: linear-gradient(180deg, var(--primary-50) 0%, var(--secondary-100) 100%);
    /* Nagyon halvány terracotta átmenet */
    border-color: var(--secondary-300);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    /* Cím alatti rés csökkentése */
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--secondary-200);
}

.section-title {
    font-family: var(--font-sans);
    font-size: var(--text-lg);
    font-weight: 600;
    color: #3D3D3D;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.15em;
}

.theme-dark .section-title {
    color: #F5F5F5;
}

.section-content {
    margin: 0;
}

/* Dark Mode */
:global(.theme-dark) .protocol-section {
    background: rgba(30, 25, 35, 0.8);
    border-color: var(--secondary-700);
}
</style>