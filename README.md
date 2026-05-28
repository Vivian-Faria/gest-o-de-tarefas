# GestãoOp - Sistema de Gestão Operacional

Aplicação React + Vite para gestão de tarefas operacionais, colaboradores, execuções, relatórios e bonificações.

## Instalação

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Banco de dados

O app usa Supabase quando as variáveis de ambiente estão configuradas. Sem elas, continua funcionando com armazenamento local no navegador.

1. Crie um projeto no Supabase.
2. Execute o SQL de [supabase.schema.sql](./supabase.schema.sql) no SQL Editor do Supabase.
3. Copie [.env.example](./.env.example) para `.env`.
4. Preencha:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

5. Reinicie o servidor com `npm run dev`.

Observação: esta primeira integração sincroniza o estado do sistema em uma tabela `app_state`. Para produção com múltiplos perfis, o próximo passo recomendado é migrar para tabelas relacionais e autenticação real via Supabase Auth.

## Contas Demo

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Admin | admin@empresa.com | admin123 |
| Colaborador | carlos@empresa.com | 123456 |
| Colaborador | ana@empresa.com | 123456 |
| Colaborador | roberto@empresa.com | 123456 |

## Estrutura

Os arquivos principais ficam na raiz do projeto:

- `App.jsx`: componente raiz e navegação entre páginas
- `AdminDashboard.jsx`: painel gerencial
- `AdminPages.jsx`: colaboradores, tarefas, execuções, relatórios e configurações
- `ColaboradorPages.jsx`: tarefas e desempenho do colaborador
- `database.js`: conexão e sincronização com Supabase
- `helpers.js`: armazenamento local, datas e cálculos
- `GlobalStyles.jsx`: estilos globais e responsividade
- `UI.jsx`: componentes visuais reutilizáveis
