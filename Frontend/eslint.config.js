// ESLint Flat Config for Vue 3 + JS
import js from '@eslint/js';
import vue from 'eslint-plugin-vue';
import globals from 'globals'; // <--- 1. ÚJ IMPORT

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
    js.configs.recommended,
    ...vue.configs['flat/recommended'],
    {
        // <--- 2. EZ A RÉSZ HIÁNYZOTT:
        languageOptions: {
            globals: {
                ...globals.browser, // Ez oldja meg a window, document, localStorage hibákat
                ...globals.node     // Ez kell a process.env miatt
            }
        },
        rules: {
            'vue/multi-word-component-names': 'off',
            'vue/no-unused-components': 'error',
            'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
            'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
            'no-unused-vars': 'error',
            'no-empty': 'error',
        },
    },
];