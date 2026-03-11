# CodeLeap Network

<p align="center">
  <img src="./public/img.PNG" alt="CodeLeap Network Screenshot" width="800" />
</p>

## Checklist – Critérios & Bônus

### Critérios Obrigatórios

| # | Critério | Status |
|---|----------|--------|
| 1 | Autenticação (login com username ou Google) | ✅ |
| 2 | Criar post (título + conteúdo) | ✅ |
| 3 | Editar post (apenas dono) | ✅ |
| 4 | Excluir post (apenas dono) | ✅ |
| 5 | Listar posts | ✅ |
| 6 | Curtir post (likes) | ✅ |
| 7 | Comentários em posts | ✅ |
| 8 | Layout responsivo | ✅ |

### Bonus Points Implementados

| # | Bônus | Status |
|---|-------|--------|
| 1 | Firebase Authentication (Google Sign-in) | ✅ |
| 2 | Infinite Scroll (paginação com cursor) | ✅ |
| 3 | Framer Motion (animações) | ✅ |
| 4 | @mentions em posts e comentários | ✅ |
| 5 | Real-time CRUD (Firestore onSnapshot) | ✅ |
| 6 | Error Boundaries | ✅ |
| 7 | Suporte a imagem por URL | ✅ |
| 8 | Repository Pattern (REST + Firestore) | ✅ |
| 9 | Validação Zod | ✅ |

<p align="center">
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" /></a>
  <a href="https://firebase.google.com/"><img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://redux-toolkit.js.org/"><img src="https://img.shields.io/badge/Redux_Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white" alt="Redux Toolkit" /></a>
</p>

---

## Project Overview

**CodeLeap Network** is a production-ready social network for sharing posts, built for CodeLeap's technical assessment. It combines a clean, responsive UI with enterprise-grade architecture: dual data sources (REST API + Firestore), Firebase Authentication, real-time updates, and comprehensive security measures. The app delivers an exceptional user experience through smooth animations, optimistic UI, and resilient error handling.

---

## The "Overdelivery" Checklist

| Bonus Feature | Implementation |
|---------------|----------------|
| **Firebase Authentication** | Google Sign-in with `onAuthStateChanged`, fallback to username when not configured |
| **Infinite Scroll** | Intersection Observer + `startAfter` cursor-based pagination (Firestore) |
| **Framer Motion** | Staggered list animations, modal transitions, hover/tap micro-interactions |
| **@mentions** | `@username` detection with styled rendering in posts and comments |
| **Real-time CRUD** | Firestore `onSnapshot` for likes and comments when `VITE_DATA_SOURCE=firebase` |
| **Error Boundaries** | Global fallback UI with recovery option |
| **Image URLs** | `imageUrl` field supports external image URLs (no Firebase Storage dependency) |
| **Repository Pattern** | Swappable data sources via `VITE_DATA_SOURCE` |
| **Zod Validation** | Schema validation for API and Firestore responses |

---

## Technical Differentiators

| Category | Implementation |
|----------|----------------|
| **Dual Data Source** | Repository Pattern with `VITE_DATA_SOURCE` switching between REST API and Firestore—no refactoring when migrating backends |
| **Server Authority** | `serverTimestamp()` for all writes; Firestore rules validate schema, types, and immutability of `authorId` |
| **Auth Resilience** | Google Sign-in + Anonymous fallback when config fails; `onAuthStateChanged` keeps session in sync |
| **Performance** | Point-in-time `getDoc` after updates (no top-N query); skeleton loaders with PostItem proportions to avoid CLS |
| **Security Headers** | CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy via `vercel.json` |
| **Testability** | Repository mocks for unit tests; split hooks (`usePostLocal`, `usePostFirebase`) for isolated testing |
| **Type Safety** | Zod validation for API and Firestore payloads; `authorId`/`imageUrl` nullable to handle real-world data |
| **UX Polish** | Framer Motion, optimistic UI with rollback, loading/empty/error states in English, 4px/8px spacing grid |

---

## Architecture Decisions

### Repository Pattern

Posts are fetched through an abstract `IPostRepository` interface. The app injects either `RestPostRepository` (CodeLeap REST API) or `FirebasePostRepository` (Firestore) at runtime, driven by `VITE_DATA_SOURCE`. This keeps domain logic decoupled from infrastructure and allows switching backends without touching components or Redux.

### Redux Toolkit

Global state (auth, posts, pagination, sort order) is managed with Redux Toolkit. Async logic lives in `createAsyncThunk`, keeping reducers pure and side-effect free. Selectors use `createSelector` for memoization, avoiding unnecessary re-renders.

### Tailwind v4

Styling uses Tailwind v4 with design tokens in `@theme` (colors, typography, radii). Tokens align with the [CodeLeap Figma](https://www.figma.com/design/6AizP09Fh9oEAWTLKsr1vQ/) spec—primary `#7695ec`, 16px border radius, Roboto font weights. No arbitrary values in components.

### Revisão Visual (Figma)

| Elemento | Figma | Implementado |
|----------|-------|--------------|
| Cor primária | #7695ec | `--color-primary` ✅ |
| Border radius cards | 16px | `rounded-2xl` (1rem) ✅ |
| Fonte | Roboto | `--font-sans` ✅ |
| Background página | #dddddd | `--color-background` ✅ |
| Cards | #ffffff | `--color-background-card` ✅ |
| Espaçamentos | 4px/8px | Tailwind gap/padding ✅ |

---

## Security First

### Firebase Anonymous Auth (optional)

When Google Sign-in is not configured and `VITE_DATA_SOURCE=firebase`, the app offers a username fallback that uses Firebase Anonymous Authentication. Enable **Anonymous** in Firebase Console → Authentication → Sign-in method so users can create posts without Google.

### Firestore Security Rules

`firestore.rules` enforces:

- **Posts**: `create` only when `request.resource.data.authorId == request.auth.uid`; `update`/`delete` only when `resource.data.authorId == request.auth.uid`
- **Likes**: Create/delete only for the authenticated user's own like document
- **Comments**: Read allowed; create requires authentication

Deploy with:

```bash
firebase deploy --only firestore:rules
```

### XSS Protection

- **DOMPurify** sanitizes all API/Firestore content before render
- **Input sanitization** in the service layer before POST/PATCH
- No `dangerouslySetInnerHTML` without sanitization

### Author Consistency

`isOwner` is computed by comparing `post.authorId` with `request.auth.uid` (or `post.username` with `currentUser.displayName` for REST mode). Edit/delete controls render only for owners.

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
git clone https://github.com/your-username/codeleap-test.git
cd codeleap-test
npm install
```

### Environment Variables

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | CodeLeap REST API base URL | `https://dev.codeleap.co.uk/careers/` |
| `VITE_DATA_SOURCE` | `rest` or `firebase` | `rest` |
| `VITE_FIREBASE_API_KEY` | Firebase config (required when `firebase`) | — |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | — |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | — |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | — |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | — |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | — |
| `VITE_USE_FIREBASE_EMULATORS` | Use Firebase emulators in dev | `false` |

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Build & Preview

```bash
npm run build
npm run preview
```

### Tests

```bash
npm run test
```

Smoke tests (auth, CRUD, likes, comments, infinite scroll):

```bash
npx vitest run src/smoke
```

### Lint & Format

```bash
npm run lint
npm run format
```

---

## Project Structure

```
codeleap-test/
├── firebase.json           # Firebase config
├── firestore.rules        # Firestore security rules
├── firestore.indexes.json # Firestore indexes
├── public/
├── src/
│   ├── components/        # Shared UI (Header, Modal, Button, etc.)
│   ├── features/
│   │   ├── auth/          # Auth slice, LoginModal, AuthInitializer
│   │   └── posts/         # CreatePostCard, PostList, PostItem, usePost
│   ├── repositories/      # IPostRepository, RestPostRepository, FirebasePostRepository
│   ├── services/          # API, Firebase, firebasePostInteractions
│   ├── schemas/           # Zod schemas (postSchema, listResponseSchema)
│   ├── store/
│   ├── styles/            # globals.css, @theme tokens
│   ├── types/
│   └── utils/             # sanitize, validateImageUrl, errorHandler
├── .env.example
└── package.json
```

---

## License

Developed for CodeLeap technical assessment.
