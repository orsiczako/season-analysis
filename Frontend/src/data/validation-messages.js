/**
 * Központosított validációs hibaüzenetek
 * Frontend form validációhoz
 */
export const validationMessages = {
    // Általános
    required: 'Ezt a mezőt kötelező kitölteni',

    // Email
    email: 'Érvénytelen email cím formátum',
    emailRequired: 'Az email cím megadása kötelező',

    // Jelszó
    passwordRequired: 'A jelszó megadása kötelező',
    passwordMin: 'A jelszó minimum 8 karakter legyen',
    passwordUppercase: 'A jelszónak tartalmaznia kell legalább egy nagybetűt',
    passwordLowercase: 'A jelszónak tartalmaznia kell legalább egy kisbetűt',
    passwordNumber: 'A jelszónak tartalmaznia kell legalább egy számot',
    passwordMatch: 'A két jelszó nem egyezik',

    // Felhasználónév
    usernameRequired: 'A felhasználónév megadása kötelező',
    usernameMin: 'A felhasználónév minimum 3 karakter',
    usernameMax: 'A felhasználónév maximum 20 karakter',
    usernameFormat: 'Csak betűk, számok és alulvonás (_) használható',

    // Név
    fullNameRequired: 'A teljes név megadása kötelező',

    // Általános hossz
    minLength: (min) => `Minimum ${min} karakter szükséges`,
    maxLength: (max) => `Maximum ${max} karakter engedélyezett`
}

/**
 * Mező-specifikus validátorok
 * Visszaadja a hibaüzenetet vagy null-t ha valid
 */
export const fieldValidators = {
    email: (value) => {
        if (!value?.trim()) return validationMessages.emailRequired
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(value) ? null : validationMessages.email
    },

    password: (value) => {
        if (!value) return validationMessages.passwordRequired
        if (value.length < 8) return validationMessages.passwordMin
        if (!/[A-Z]/.test(value)) return validationMessages.passwordUppercase
        if (!/[a-z]/.test(value)) return validationMessages.passwordLowercase
        if (!/[0-9]/.test(value)) return validationMessages.passwordNumber
        return null
    },

    passwordSimple: (value) => {
        if (!value) return validationMessages.passwordRequired
        if (value.length < 8) return validationMessages.passwordMin
        return null
    },

    username: (value) => {
        if (!value?.trim()) return validationMessages.usernameRequired
        if (value.length < 3) return validationMessages.usernameMin
        if (value.length > 20) return validationMessages.usernameMax
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return validationMessages.usernameFormat
        return null
    },

    fullName: (value) => {
        if (!value?.trim()) return validationMessages.fullNameRequired
        return null
    },

    required: (value) => {
        if (!value?.toString().trim()) return validationMessages.required
        return null
    },

    passwordConfirm: (value, password) => {
        if (!value) return validationMessages.passwordRequired
        if (value !== password) return validationMessages.passwordMatch
        return null
    }
}

/**
 * Form validáló helper
 * @param {Object} form - A form adatok
 * @param {Object} rules - Szabályok: { mezőNév: 'validatorNév' | validatorFn }
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateForm(form, rules) {
    const errors = {}

    for (const [field, validator] of Object.entries(rules)) {
        let error = null

        if (typeof validator === 'string') {
            // Előre definiált validator név
            error = fieldValidators[validator]?.(form[field], form)
        } else if (typeof validator === 'function') {
            // Egyedi validator függvény
            error = validator(form[field], form)
        } else if (Array.isArray(validator)) {
            // Több validator egy mezőre
            for (const v of validator) {
                if (typeof v === 'string') {
                    error = fieldValidators[v]?.(form[field], form)
                } else if (typeof v === 'function') {
                    error = v(form[field], form)
                }
                if (error) break
            }
        }

        if (error) {
            errors[field] = error
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    }
}

/**
 * Backend hibaüzenet lefordítása magyarra
 * @param {string} code - Backend hibakód (pl. USERNAME_TAKEN, EMAIL_TAKEN)
 * @returns {string} - Magyar hibaüzenet
 */
export function translateError(code) {
    if (!code) return 'Ismeretlen hiba történt'

    // Hibakód → magyar üzenet map
    const errorMap = {
        // Auth sikeres műveletek
        'auth.registration_success': 'Sikeres regisztráció! Most már bejelentkezhetsz.',
        'auth.password_reset_success': 'A jelszó sikeresen megváltozott! Most már bejelentkezhetsz.',

        // User hibák
        USERNAME_TAKEN: 'Ez a felhasználónév már foglalt',
        EMAIL_TAKEN: 'Ezzel az email címmel már regisztráltak',
        INVALID_CREDENTIALS: 'Hibás felhasználónév vagy jelszó',
        INVALID_CREDENTIALS_FORMAT: 'Hibás felhasználónév vagy jelszó',
        USERNAME_AND_PASSWORD_REQUIRED: 'Felhasználónév és jelszó megadása kötelező',
        'auth.errors.invalid_token': 'Érvénytelen munkamenet, jelentkezz be újra',
        AUTH_REQUIRED: 'Bejelentkezés szükséges',

        // Token hibák
        INVALID_TOKEN: 'Érvénytelen vagy lejárt link',
        TOKEN_EXPIRED: 'A link lejárt, kérj újat',

        // Validációs hibák
        MISSING_REQUIRED_FIELDS: 'Minden mező kitöltése kötelező',
        USERNAME_TOO_SHORT: 'A felhasználónév túl rövid',
        PASSWORD_TOO_SHORT: 'A jelszó túl rövid (min. 6 karakter)',
        INVALID_EMAIL_FORMAT: 'Érvénytelen email formátum',
        VALIDATION_ERROR: 'Érvénytelen adatok',

        // Jelszó hibák
        INVALID_CURRENT_PASSWORD: 'A jelenlegi jelszó helytelen',
        PASSWORD_CHANGE_FAILED: 'Nem sikerült megváltoztatni a jelszót',
        UPDATE_FAILED: 'Nem sikerült frissíteni az adatokat',
        USER_NOT_FOUND: 'Felhasználó nem található',
        DELETE_ACCOUNT_FAILED: 'Nem sikerült törölni a fiókot',
        GET_ANALYSES_FAILED: 'Nem sikerült lekérni az elemzési eredményeket',


        INVALID_SEASON: 'Érvénytelen évszak típus',

        // AI hibák
        MESSAGE_REQUIRED: 'Üzenet megadása kötelező',
        CONVERSATION_HISTORY_REQUIRED: 'Beszélgetés előzmények szükségesek',
        ACCOUNT_ID_REQUIRED: 'Felhasználó azonosító szükséges',
        IMAGE_REQUIRED: 'Kép feltöltése kötelező',

        // Email
        EMAIL_FAILED: 'Nem sikerült elküldeni az emailt',
        EMAIL_TEMPLATE_INVALID: 'Hibás email sablon',

        // Általános
        SERVER_ERROR: 'Szerverhiba történt, próbáld újra később'
    }

    return errorMap[code] || code
}
