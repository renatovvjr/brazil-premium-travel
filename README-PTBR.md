<div align="center">
  <img src="./public/images/logo-premium.png" alt="Curated Brazil" width="180" />

  # Curated Brazil

  ### Experiências de viagem premium pelo Brasil, apresentadas em uma landing page imersiva e orientada à conversão.

  [![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  [![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

  [Ver projeto online](https://brazil-premium-travel.vercel.app/) · [Conhecer funcionalidades](#principais-funcionalidades) · [Executar localmente](#executando-localmente)

  [English](./README.md)
</div>

<br />

![Prévia da Curated Brazil](./public/images/rio_de_janeiro_carrossel.png)

## Sobre o projeto

**Curated Brazil** é uma plataforma digital criada para apresentar uma jornada exclusiva de alto padrão por alguns dos destinos mais emblemáticos do Brasil.

A experiência combina narrativa visual, navegação responsiva e uma jornada de conversão completa: o visitante conhece o roteiro, compara modalidades, envia sua aplicação e pode continuar o atendimento diretamente pelo WhatsApp.

O projeto foi desenvolvido com foco em:

- experiência visual sofisticada e identidade premium;
- geração, qualificação e armazenamento de leads;
- carregamento otimizado de imagens;
- acessibilidade e adaptação para diferentes telas;
- arquitetura preparada para evolução e deploy contínuo.

## Principais funcionalidades

- **Hero imersivo:** carrossel automático com imagens em destaque e chamadas para ação.
- **Roteiro interativo:** apresentação dos destinos com páginas e galerias dedicadas.
- **Planos de viagem:** comparação entre as experiências Signature e All-Inclusive.
- **Formulário de aplicação:** coleta preferências, orçamento e perfil do viajante.
- **Captação via WhatsApp:** formulário intermediário antes do contato direto.
- **Persistência de leads:** integração com Supabase para armazenamento dos dados.
- **Notificação por e-mail:** função serverless integrada ao Resend.
- **Animações suaves:** transições e interações construídas com Framer Motion.
- **Design responsivo:** experiência otimizada para desktop, tablet e dispositivos móveis.
- **SPA em produção:** rotas configuradas para funcionamento correto na Vercel.

## Destinos apresentados

São Paulo · Amazônia · Pantanal · Bonito · Salvador · Minas Gerais · Rio de Janeiro · Ilha Grande · Cataratas do Iguaçu

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Interface | React 18, Tailwind CSS 4 |
| Build | Vite 7 |
| Navegação | React Router DOM |
| Animações | Framer Motion |
| Ícones | Lucide React, React Icons |
| Banco de dados | Supabase |
| E-mail transacional | Resend |
| Hospedagem e funções | Vercel |

## Fluxo da aplicação

```text
Visitante
   ├── explora destinos e experiências
   ├── envia uma aplicação privada
   │      ├── dados salvos no Supabase
   │      └── notificação enviada por e-mail
   └── solicita atendimento
          ├── lead salvo no Supabase
          └── conversa iniciada no WhatsApp
```

## Executando localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- npm
- um projeto no Supabase
- uma conta no Resend para o envio de e-mails

### Instalação

```bash
git clone https://github.com/renatovvjr/brazil-premium-travel.git
cd brazil-premium-travel
npm install
```

Crie o arquivo `.env.local` com base no exemplo disponível:

```bash
cp .env.example .env.local
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Preencha as variáveis:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON
RESEND_API_KEY=SUA_CHAVE_RESEND
RESEND_FROM_EMAIL="Curated Brazil <seu-email@dominio.com>"
```

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

A aplicação ficará disponível no endereço exibido pelo Vite, normalmente `http://localhost:5173`.

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | inicia o servidor de desenvolvimento |
| `npm run build` | gera a versão otimizada para produção |
| `npm run preview` | executa localmente a build de produção |

## Estrutura principal

```text
.
├── api/                    # Funções serverless
├── public/images/          # Imagens e identidade visual
├── src/
│   ├── lib/                # Configuração de serviços externos
│   ├── App.jsx             # Landing page principal
│   ├── DestinationPage.jsx # Páginas dos destinos
│   ├── Workspace.jsx       # Área interna da aplicação
│   ├── index.css           # Estilos globais
│   └── main.jsx            # Rotas e inicialização
├── .env.example            # Modelo de variáveis de ambiente
├── vercel.json             # Rewrites para API e SPA
└── vite.config.js          # Configuração do Vite
```

## Deploy

O projeto está preparado para deploy na **Vercel**. As funções presentes em `api/` são publicadas como endpoints serverless e o arquivo `vercel.json` preserva o funcionamento das rotas da SPA.

Antes do deploy, configure no painel da Vercel as mesmas variáveis presentes no arquivo `.env.local`.

## Segurança

- Nunca envie o arquivo `.env.local` para o repositório.
- Utilize apenas a chave pública `anon` do Supabase no frontend.
- Mantenha chaves privadas, como `RESEND_API_KEY`, somente nas variáveis de ambiente do servidor.
- Configure políticas de Row Level Security no Supabase antes de receber dados em produção.

## Autor

Desenvolvido por **Renato Vieira**.

Se este projeto chamou sua atenção, fique à vontade para deixar uma estrela no repositório.

<div align="center">
  <sub>Curated Brazil — Luxury Travel Experiences</sub>
</div>
