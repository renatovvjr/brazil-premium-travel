BRAZIL PREMIUM LANDING - PASSO A PASSO RÁPIDO

1) Baixe e extraia este .zip em uma pasta do seu computador.

2) Abra o VS Code.
   - Clique em "Arquivo"
   - Clique em "Abrir Pasta..."
   - Selecione a pasta 'brazil-premium-landing-starter'

3) No terminal do VS Code:
   - Clique em "Terminal"
   - Clique em "Novo Terminal"

4) Rode:
   npm install

5) Crie um arquivo chamado .env.local na raiz do projeto
   e copie o conteúdo de .env.example, preenchendo com seus dados reais.

6) Para rodar localmente:
   npm run dev

7) Depois abra no navegador o endereço mostrado no terminal.
   Normalmente será algo como:
   http://localhost:5173

8) No Supabase, crie a tabela leads e a policy de insert.

SQL da tabela:
create table if not exists public.leads (
  id bigint generated always as identity primary key,
  first_name text,
  last_name text,
  email text not null,
  message text,
  created_at timestamptz default now()
);

alter table public.leads enable row level security;

create policy "Allow public insert on leads"
on public.leads
for insert
to anon
with check (true);

9) Quando tudo funcionar, publique na Vercel.
