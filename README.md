# CodeLeap Network

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=flat-square&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)

Rede social de posts desenvolvida para o teste técnico da CodeLeap. Projeto production-ready com foco em Product Experience (UX/UI), animações, responsividade e micro-interações.

![Screenshot placeholder](https://via.placeholder.com/800x500/dddddd/777777?text=CodeLeap+Network+Screenshot)

---

## 🛠 Tecnologias

| Tecnologia | Uso |
|------------|-----|
| **Vite** | Build tool e dev server |
| **TypeScript** | Tipagem estática |
| **React 19** | Interface e componentes |
| **Tailwind CSS v4** | Design system e estilização via `@theme` |
| **Redux Toolkit** | Estado global (auth, posts, paginação) |
| **Axios** | Cliente HTTP para a API |
| **Headless UI** | Modais acessíveis |
| **Framer Motion** | Animações e transições |
| **date-fns** | Formatação de datas (pt-BR) |
| **react-hot-toast** | Notificações estilizadas |
| **Vitest** | Testes unitários |

---

## 🚀 Instalação

```bash
npm install
```

## Execução

```bash
npm run dev
```

Acesse `http://localhost:5173`

## Build

```bash
npm run build
```

## Testes

```bash
npm run test
```

---

## ✨ Funcionalidades

### Core CRUD
- **Create** — Criação de posts (título + conteúdo)
- **Read** — Listagem com infinite scroll e paginação automática
- **Update** — Edição de posts via modal
- **Delete** — Remoção com confirmação e optimistic UI

### Ordenação & Busca
- **Sort** — Dropdown para alternar entre "Newest first" e "Oldest first"
- **Search** — Filtro local por título ou conteúdo

### Animações & Transições (Framer Motion)
- Stagger (fade-in + slide-up) na lista de posts
- Modal de delete com shake ao clicar fora sem confirmar
- Hover effects em botões e ícones (`scale`, `brightness`)
- Animações no like simulado (pop)

### UX & Micro-interações
- **Scroll to Top** — Botão flutuante após rolar 500px
- **Toasts** — Notificações customizadas (cor CodeLeap #7695ec) para todas as ações CRUD
- **Like simulado** — Botão de coração por post, contador local e animação de pop
- **Logout** — Popover de confirmação antes de sair

### Estados & Feedback
- **FeedbackState** — SVGs para "No posts found" e "Network Error"
- **Try Again** — Botão com loading state em caso de erro de rede
- **Optimistic Delete** — Remoção imediata com rollback em falha da API

### Responsividade
- Mobile-first
- Header sticky com `backdrop-blur`
- Modais adaptados (padding responsivo)
- Espaçamentos em grid de 8px (p-2, p-4, p-8)

---

## 📁 Estrutura do Projeto

```
src/
├── components/          # UI base e layout
│   ├── layout/          # Header
│   ├── ui/              # Button, Input, Modal, FeedbackState
│   └── ScrollToTop.tsx
├── features/
│   ├── auth/            # Login modal, authSlice
│   └── posts/
│       ├── components/  # CreatePostCard, PostList, PostItem, modals
│       ├── selectors/   # postSelectors (sort)
│       └── slice/       # postSlice (CRUD, pagination, sort)
├── services/            # postService (API)
├── store/               # Redux config
├── styles/              # globals.css, design tokens
├── types/               # TypeScript
└── utils/               # Helpers (errorHandler)
```

---

## 🎯 Diferenciais

- **Design System** — Tokens via Tailwind v4 (`@theme`), paleta e tipografia do [Figma CodeLeap](https://www.figma.com/design/6AizP09Fh9oEAWTLKsr1vQ/)
- **Arquitetura limpa** — Features isoladas, componentes reutilizáveis, separação de responsabilidades
- **Acessibilidade** — ARIA-labels em ícones, modais Headless UI
- **Código em inglês** — Convenções e nomes padronizados

---

## 📄 Licença

Projeto desenvolvido para fins de avaliação técnica.
