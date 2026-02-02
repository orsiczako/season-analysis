import { reactive } from 'vue'

/**
 * Globális toast notification rendszer
 * Singleton pattern - ugyanaz az állapot minden komponensben
 * 
 * Használat bármelyik komponensben:
 *   import { useToast } from '@/composables/useToast'
 *   const toast = useToast()
 *   toast.success('Sikeres művelet!')
 *   toast.error('Hiba történt!')
 */

// Globális state - minden useToast() hívás ugyanezt kapja
const state = reactive({
    visible: false,
    message: '',
    type: 'success',
    duration: 4000
})

let hideTimeout = null

const show = (message, type = 'success', duration = 4000) => {
    // Előző timeout törlése
    if (hideTimeout) {
        clearTimeout(hideTimeout)
    }

    state.visible = true
    state.message = message
    state.type = type
    state.duration = duration

    // Auto-hide
    if (duration > 0) {
        hideTimeout = setTimeout(() => {
            state.visible = false
        }, duration)
    }
}

const hide = () => {
    if (hideTimeout) {
        clearTimeout(hideTimeout)
    }
    state.visible = false
}

// Shorthand metódusok
const success = (message, duration = 4000) => show(message, 'success', duration)
const error = (message, duration = 5000) => show(message, 'error', duration)
const warning = (message, duration = 4500) => show(message, 'warning', duration)
const info = (message, duration = 4000) => show(message, 'info', duration)

export function useToast() {
    return {
        state,      // Reaktív állapot (v-bind-hoz)
        show,
        success,
        error,
        warning,
        info,
        hide
    }
}
