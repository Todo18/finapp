# Finapp AI Coding Agent Instructions

## Architecture Overview

**Multi-workspace Project Structure:**
- `finapp/` - Nuxt 2 Vue.js SPA (main app)
- `finapp-coda/` - Node.js daemon for bank file processing (CODA/CSV import)
- Firebase Realtime Database for data persistence
- Firebase Functions (TypeScript) for backend API (`functions/` directory)

**Tech Stack:** Nuxt 2 + Vue 2.7 + Pinia/Vuex + Firebase + Stylus + Tailwind + Pug templates

## State Management (Hybrid Pattern)

The codebase is **transitioning from Vuex to Pinia**. Both patterns exist:

**Legacy Vuex stores** (`store/*/index.ts`):
```typescript
// Old pattern with state(), mutations, actions
export function state(): TrnsState { return { items: {} } }
```

**New Pinia stores** (e.g., `components/trnForm/useTrnForm.ts`):
```typescript
import { defineStore } from 'pinia'
export const useTrnFormStore = defineStore('trnForm', () => { /* ... */ })
```

**Accessing state in components** (Composition API):
```vue
<script setup lang="ts">
const { $store } = useNuxtApp()
$store.state.trns.items  // Access Vuex state
$store.commit('trns/showTrnModal')  // Vuex mutations
</script>
```

Store modules: `app`, `categories`, `currencies`, `filter`, `rules`, `stat`, `trns`, `trnForm`, `ui`, `user`, `wallets`

## Component Patterns

**Use Composition API with `<script setup>`**:
```vue
<template lang="pug">
div.class-name
  //- Pug template syntax
</template>

<script setup lang="ts">
import { type Ref } from 'vue'
const { $store, nuxt2Context: { i18n } } = useNuxtApp()
const { $notify } = useNuxtApp()  // For notifications
</script>

<style lang="stylus" scoped>
@import '~/assets/stylus/variables'
.class-name
  padding $m6
</style>
```

**Key Nuxt 2 Bridge patterns:**
- Use `useNuxtApp()` to access `$store`, `$notify`, `nuxt2Context`
- Access i18n: `nuxt2Context: { i18n }` from `useNuxtApp()`
- Component auto-import from `components/` directory
- TypeScript types defined per module (e.g., `store/trns/types.ts`)

## Styling Conventions

**Stylus + Tailwind hybrid approach:**
- Tailwind classes in templates for layout/spacing
- Stylus for component-specific styles with shared variables
- Variables: `~/assets/stylus/variables` (imported in scoped styles)
- Spacing: `$m6`, `$m8`, etc. (Stylus variables)

**Pug templates:**
```pug
.flex.items-center(@click="handleClick")
  Icon(icon="mdi-plus")
  | {{ i18n.t('common.add') }}
```

## Firebase Integration

**Services API** ([services/firebase/api.js](services/firebase/api.js)):
```javascript
import { saveData, getDataOnce, updateData, removeData } from '~/services/firebase/api'

// Usage patterns
await saveData(`users/${uid}/trns/${id}`, trnData)
await updateData(`users/${uid}/wallets`, { [walletId]: updates })
const data = await getDataOnce(`users/${uid}/categories`)
```

**Firebase config:**
- Copy `services/firebase/config.example.js` → `config.js` (gitignored)
- Set `OPEN_EXCHANGE_RATES` API key in `.env` for currency conversion

**Database structure:**
```
users/
  {uid}/
    categories/
    wallets/
    trns/
    rules/
currencies/
ratesUsd/
```

## CODA Daemon Integration

**Separate workspace** (`finapp-coda/`):
- Processes bank exports (CODA format, KBC/AmEx CSV) and unstructured PDF statements (BullionVault)
- Uses Firebase Admin SDK to write directly to database
- **PDF track**: `worker.mjs` dispatches on file extension; `processPdfFile` calls a per-pickup extractor in `finapp-coda/extractors/` and `finapp-coda/llm.mjs`, which uses the same Azure OpenAI model as the SPA — but directly, via the `openai` SDK on the stable v1 route (`{endpoint}/openai/v1/`), not through the `/api/responses` function. Extractions are gated on a per-statement reconciliation check before anything is written.
- If you change the Azure model or endpoint, both consumers need it: `functions/src/index.ts` (still on the older `/openai/responses?api-version=...` route) and `finapp-coda/config.mjs`
- **Shared logic**: the rule-expression vocabulary is duplicated across both repos, so adding to it is always a **three-place change**:
  - A custom function (e.g. `isEmpty`, `startsWith`) → `mathjsExtensions` in [components/rules/Form.vue](components/rules/Form.vue) (implementation, validates on save) + `namespace` in [components/shared/Autocomplete.vue](components/shared/Autocomplete.vue) (signature and tooltip) + `mathjsExtensions` in `finapp-coda/worker.mjs` (implementation, runs at import)
  - A transaction field a rule may reference → the dummy scope in `Form.vue`'s `validate` + `namespace` in `Autocomplete.vue` + `RULE_SCOPE` in `finapp-coda/rules.mjs`
- Forgetting the frontend places blocks saving or hides the addition while authoring; forgetting the daemon place lets a rule save and then throw mid-import on live data
- See the "Rules engine" section of the root `CLAUDE.md` for the full table and the Math.js missing-symbol gotcha behind `RULE_SCOPE`

## Development Workflow

**Local development:**
```bash
yarn dev              # Start dev server (localhost:3000)
yarn test             # Run Vitest tests
yarn test-coverage    # With coverage report
```

**Environment setup:**
1. Firebase config: `services/firebase/config.js`
2. Environment vars: `.env` (from `.env.example`)
3. Node.js env exported in `deploy.bat` for legacy OpenSSL

**Testing:**
- Vitest for unit tests (see `components/amount/getAmount.test.ts`)
- Tests colocated with utilities (*.test.ts files)

## Deployment Process

**Firebase deployment:**
```bash
yarn build            # Nuxt generate → dist/
yarn deploy           # Build + firebase deploy (hosting + functions)
yarn deploy-func      # Functions only
```

**Alternative FTP deployment:**
```bash
yarn upload-all       # Upload all dist files via Gulp
yarn upload           # Upload minified files only (css/js/html)
```

**Deployment scripts:**
- [deploy.bat](deploy.bat) - Sets Node.js path, runs `npm run deploy`
- [gulpfile.js](gulpfile.js) - FTP upload tasks (requires `ftp.config.js`)
- [firebase.json](firebase.json) - Hosting config (SPA rewrites, functions)

**Functions deployment:**
- TypeScript build: `functions/src/` → `functions/lib/`
- Node 22 runtime (see `functions/package.json`)
- Predeploy hook runs `npm run build` automatically

## Project-Specific Patterns

**Rule system** (`components/rules/`):
- Uses Math.js with custom extensions for transaction matching
- Expression evaluation for automated categorization
- Example: `contains(description, "XXXX")` → set category

**Internationalization:**
- `@nuxtjs/i18n` module
- Locale files: `locales/*.json`
- Access: `i18n.t('key.path')` from `useNuxtApp().nuxt2Context`

**Authentication middleware:**
- [middleware/auth.js](middleware/auth.js) - Redirects unauthenticated users to `/login`
- Applied globally via `nuxt.config.js` router config

**Currency handling:**
- Multi-currency support with auto-conversion
- Base currency selection in settings
- Exchange rates from openexchangerates.org API

## Key Conventions

1. **TypeScript types** - Define in `types.ts` files per module
2. **ID generation** - Use `utils/generateId.ts`
3. **Date handling** - dayjs (configured in `plugins/dayjs.js`)
4. **Icons** - Material Design Icons via `@mdi/font` CDN
5. **Notifications** - `$notify` from `vue-notification` plugin
6. **Modal patterns** - Store state for modal visibility + active item ID

## Common Gotchas

- **Nuxt 2 Bridge** requires `@nuxt/bridge` config (not full Nuxt 3)
- **Vuex access** via `$store` from `useNuxtApp()`, not direct import
- **Pug syntax** in templates - indentation matters
- **Stylus imports** - Must explicitly import variables in scoped styles
- **Firebase config** - `config.js` is gitignored, use example as template
- **OpenSSL legacy** - Required for builds (set in deploy.bat)
