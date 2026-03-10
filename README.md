# CodeLeap Network

![Screenshot placeholder](https://via.placeholder.com/800x500/dddddd/777777?text=CodeLeap+Network+Screenshot)

Rede social de posts desenvolvida para o teste técnico da CodeLeap.

## Tecnologias

- **Vite** — Build tool e dev server
- **TypeScript** — Tipagem estática
- **React 19** — Interface
- **Tailwind CSS v4** — Design system e estilização
- **Redux Toolkit** — Estado global
- **Axios** — Cliente HTTP
- **Headless UI** — Componentes acessíveis
- **date-fns** — Formatação de datas
- **react-hot-toast** — Notificações
- **Vitest** — Testes unitários

## Instalação

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

## Diferenciais

- **Infinite Scroll** — Paginação automática ao chegar ao fim da lista
- **Arquitetura limpa** — Estrutura em features, componentes reutilizáveis e separação de responsabilidades
- **Design System** — Tokens via Tailwind v4 (@theme), paleta e tipografia do Figma
- **Optimistic Updates** — Remoção imediata no delete com rollback em caso de erro
- **Testes unitários** — Cobertura de componentes, slice e serviços
- **Acessibilidade** — ARIA, ícones com alt, modal Headless UI

## Estrutura

```
src/
├── components/     # UI e layout
├── features/       # auth, posts (slice, components, modals)
├── services/       # API e postService
├── store/          # Redux config
├── types/          # TypeScript
└── utils/          # Helpers
```
