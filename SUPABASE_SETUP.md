# Configurando o Supabase (banco de dados persistente)

## 1. Criar o projeto

1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita
2. Clique em **New project**
3. Defina nome, senha do banco e região (prefira `South America (São Paulo)`)
4. Aguarde o projeto inicializar (~1 min)

## 2. Criar as tabelas

1. No painel do projeto, vá em **SQL Editor**
2. Clique em **New query**
3. Cole o conteúdo de `supabase/schema.sql`
4. Clique em **Run** (▶)

## 3. Configurar autenticação

1. Vá em **Authentication → Settings**
2. Em **Email**, desative "Confirm email" (para testes sem e-mail de confirmação)
3. Para cada colaborador, vá em **Authentication → Users → Add user**:
   - Preencha e-mail e senha
   - Após criar, anote o `UUID` do usuário
4. Volte ao **SQL Editor** e insira o perfil na tabela `usuarios`:

```sql
insert into public.usuarios (auth_id, name, email, role, cargo, setor, avatar, ativo)
values
  ('UUID_DO_ADMIN',   'Admin Geral',  'admin@empresa.com',   'admin',       'Gestor',   'Gestão',    'AG', true),
  ('UUID_CARLOS',     'Carlos Silva', 'carlos@empresa.com',  'colaborador', 'Operador', 'Produção',  'CS', true),
  ('UUID_ANA',        'Ana Souza',    'ana@empresa.com',     'colaborador', 'Técnica',  'Qualidade', 'AS', true),
  ('UUID_ROBERTO',    'Roberto Lima', 'roberto@empresa.com', 'colaborador', 'Operador', 'Produção',  'RL', true);
```

## 4. Obter as chaves

1. Vá em **Settings → API**
2. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public key** → `VITE_SUPABASE_ANON_KEY`

## 5. Configurar o projeto local

```bash
cp .env.example .env
```

Edite `.env`:
```
VITE_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

## 6. Rodar

```bash
npm install
npm run dev
```

---

## Sem Supabase (modo local)

Se as variáveis não estiverem definidas, o app usa `localStorage` automaticamente.
Ideal para desenvolvimento sem internet, mas **os dados somem em guia anônima**.

## Storage de fotos (opcional)

1. Vá em **Storage → New bucket**
2. Nome: `evidencias`, marque como **Private**
3. Cole as políticas que estão comentadas no final do `schema.sql`

Na versão atual as fotos são salvas como base64 na própria linha do banco.
Para produção com muitas fotos, migre para o Supabase Storage e salve a URL.
