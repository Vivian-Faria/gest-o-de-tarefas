# GestãoOp — Sistema de Gestão Operacional

MVP React + Vite com localStorage. Pronto para migrar para Supabase ou Firebase.

## Estrutura

```
src/
├── App.jsx                     # Root component + roteamento de páginas
├── main.jsx                    # Entry point React
├── components/
│   ├── GlobalStyles.jsx        # CSS global + animações + responsivo
│   ├── Icon.jsx                # Ícones SVG inline (Ic)
│   ├── Sidebar.jsx             # Navegação lateral
│   └── UI.jsx                  # Primitivos: Avatar, Chip, Modal, Field, Btn, Toast, etc.
├── hooks/
│   └── useToast.js             # Hook de notificações
├── pages/
│   ├── Login.jsx               # Tela de login
│   ├── AdminDashboard.jsx      # Dashboard gerencial
│   ├── AdminPages.jsx          # Colaboradores, Tarefas, Execuções, Relatórios, Config
│   └── ColaboradorPages.jsx    # Minhas Tarefas, Meu Desempenho
└── utils/
    ├── tokens.js               # Design tokens, seed data, cores por categoria
    └── helpers.js              # Store (localStorage), datas, cálculo de desempenho
```

## Instalação

```bash
npm install
npm run dev
```

## Contas demo

| Perfil       | E-mail                   | Senha     |
|--------------|--------------------------|-----------|
| Admin        | admin@empresa.com        | admin123  |
| Colaborador  | carlos@empresa.com       | 123456    |
| Colaborador  | ana@empresa.com          | 123456    |
| Colaborador  | roberto@empresa.com      | 123456    |

## Próximos passos

- [ ] Substituir `localStorage` por **Supabase** (PostgreSQL + Auth + Storage)
- [ ] Upload de fotos para **Supabase Storage** ou **Firebase Storage**
- [ ] Notificações push via **Service Worker** (PWA)
- [ ] `manifest.json` + ícones para instalação no celular
- [ ] Sistema de advertências
- [ ] Ranking entre unidades
- [ ] Avaliação comportamental
- [ ] Armazenamento de POPs/planos de ação por tarefa
