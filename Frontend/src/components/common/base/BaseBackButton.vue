<template>
    <button class="base-back-button" type="button" @click="handleNavigation">
        <span class="back-icon">
            ←
        </span>
        <span class="back-text">
            <slot>Vissza</slot>
        </span>
    </button>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
    // Opcionális: ha konkrét oldalra akarsz visszalépni (pl. '/dashboard')
    to: {
        type: String,
        default: null
    }
})

const router = useRouter()

const handleNavigation = () => {
    if (props.to) {
        router.push(props.to)
    } else {
        // Ha nincs megadva cél, simán visszalép az előző oldalra
        router.back()
    }
}
</script>

<style scoped>
.base-back-button {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    border: 1.5px solid var(--border-accent);
    background: transparent;
    border-radius: var(--radius-full);
    color: var(--secondary-500);
    font-family: var(--font-sans);
    font-weight: var(--font-medium);
    font-size: var(--text-sm);
    letter-spacing: var(--tracking-wide);
    cursor: pointer;
    transition: all var(--transition-base);
}

.base-back-button:hover {
    background: var(--secondary-50);
    border-color: var(--secondary-500);
    transform: translateX(-3px);
}

.back-icon {
    font-size: 1.1rem;
    line-height: 1;
    font-weight: var(--font-bold);
}

/* Dark mode támogatás */
:global(.theme-dark) .base-back-button {
    color: var(--secondary-400);
    border-color: var(--border-accent);
}

:global(.theme-dark) .base-back-button:hover {
    background: var(--primary-subtle);
    border-color: var(--secondary-400);
}
</style>