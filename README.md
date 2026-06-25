<div align="center">
  <img src="./public/images/logo-premium.png" alt="Curated Brazil" width="180" />

  # Curated Brazil

  ### Premium travel experiences across Brazil, presented through an immersive and conversion-focused landing page.

  [![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  [![Vercel](https://img.shields.io/badge/Vercel-Deployment-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

  [View live project](https://brazil-premium-travel.vercel.app/) · [Explore features](#key-features) · [Run locally](#running-locally)

  [Português](./README-PTBR.md)
</div>

<br />

![Curated Brazil preview](./public/images/rio_de_janeiro_carrossel.png)

## About the project

**Curated Brazil** is a digital platform designed to showcase an exclusive luxury journey through some of Brazil's most remarkable destinations.

The experience combines immersive visual storytelling, responsive navigation, and a complete conversion journey. Visitors can explore the itinerary, compare travel packages, submit a private application, and continue the conversation directly through WhatsApp.

The project was developed with a strong focus on:

- sophisticated visual design and premium brand positioning;
- lead generation, qualification, and storage;
- optimized image delivery and performance;
- accessibility across different devices;
- a scalable architecture prepared for continuous deployment.

## Key features

- **Immersive hero section:** automatic image carousel with prominent calls to action.
- **Interactive itinerary:** destination cards, dedicated pages, and image galleries.
- **Travel packages:** comparison between the Signature and All-Inclusive experiences.
- **Private application form:** collects traveler details, interests, budget, and preferences.
- **WhatsApp lead capture:** gathers essential information before starting a conversation.
- **Lead persistence:** Supabase integration for storing application and contact data.
- **Email notifications:** serverless function integrated with Resend.
- **Smooth animations:** transitions and interactions powered by Framer Motion.
- **Responsive design:** optimized experience across desktop, tablet, and mobile devices.
- **Production-ready SPA:** routing configured for reliable deployment on Vercel.

## Featured destinations

São Paulo · Amazon Rainforest · Pantanal · Bonito · Salvador · Minas Gerais · Rio de Janeiro · Ilha Grande · Iguazu Falls

## Technology stack

| Layer | Technologies |
| --- | --- |
| User interface | React 18, Tailwind CSS 4 |
| Build tool | Vite 7 |
| Routing | React Router DOM |
| Animations | Framer Motion |
| Icons | Lucide React, React Icons |
| Database | Supabase |
| Transactional email | Resend |
| Hosting and functions | Vercel |

## Application flow

```text
Visitor
   ├── explores destinations and travel experiences
   ├── submits a private application
   │      ├── data is stored in Supabase
   │      └── an email notification is sent
   └── requests a consultation
          ├── lead data is stored in Supabase
          └── a WhatsApp conversation is opened
```

## Running locally

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm
- a Supabase project
- a Resend account for email delivery

### Installation

Clone the repository and install its dependencies:

```bash
git clone https://github.com/renatovvjr/brazil-premium-travel.git
cd brazil-premium-travel
npm install
```

Create a `.env.local` file using the provided example:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Configure the environment variables:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
RESEND_API_KEY=YOUR_RESEND_API_KEY
RESEND_FROM_EMAIL="Curated Brazil <your-email@domain.com>"
```

Start the development server:

```bash
npm run dev
```

The application will be available at the address displayed by Vite, usually `http://localhost:5173`.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | starts the development server |
| `npm run build` | creates an optimized production build |
| `npm run preview` | previews the production build locally |

## Project structure

```text
.
├── api/                    # Serverless functions
├── public/images/          # Images and brand assets
├── src/
│   ├── lib/                # External service configuration
│   ├── App.jsx             # Main landing page
│   ├── DestinationPage.jsx # Destination pages
│   ├── Workspace.jsx       # Internal application workspace
│   ├── index.css           # Global styles
│   └── main.jsx            # Routes and application entry point
├── .env.example            # Environment variable template
├── vercel.json             # API and SPA rewrite rules
└── vite.config.js          # Vite configuration
```

## Deployment

The project is ready to be deployed on **Vercel**. Files inside `api/` are published as serverless endpoints, while `vercel.json` preserves client-side routing for the single-page application.

Before deploying, configure the same environment variables from `.env.local` in the Vercel project settings.

## Security

- Never commit `.env.local` or private credentials to the repository.
- Only use the public Supabase `anon` key in the frontend.
- Keep private credentials such as `RESEND_API_KEY` in server-side environment variables.
- Configure Row Level Security policies in Supabase before collecting production data.

## Author

Developed by **Renato Vieira**.

If you found this project interesting, consider leaving a star on the repository.

<div align="center">
  <sub>Curated Brazil — Luxury Travel Experiences</sub>
</div>
