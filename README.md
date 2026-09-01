# ATS_TimesheetsFE

Frontend repository for new ATS 2026 NUBELITY

## Stack

- [Next.js 16](https://nextjs.org) (App Router + Turbopack)
- React 19 + TypeScript
- Tailwind CSS v4
- ESLint (`eslint-config-next`)
- Deploy target: [Vercel](https://vercel.com)

## Requisitos

- Node.js >= 20 (probado con Node 26)
- npm
- HRIS_TimesheetsBE en ejecución

## Desarrollo local

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Scripts

| Script          | Descripcion                     |
| --------------- | ------------------------------- |
| `npm run dev`   | Servidor de desarrollo (`:3001`) |
| `npm run build` | Build de produccion              |
| `npm run start` | Sirve el build (`:3001`)         |
| `npm run lint`  | ESLint                           |