# Neo Saloon Client

> A modern web client foundation for the Neo Saloon experience.

![Next.js](https://img.shields.io/badge/Next.js-16.3.1-111827?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.8-149eca?style=for-the-badge&logo=react&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7.9.1-2d3748?style=for-the-badge&logo=prisma&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)

Neo Saloon Client is a Next.js application built with the App Router, React, TypeScript, Tailwind CSS, and Prisma. It is currently the starting point for a polished client experience, with the data layer ready for user records and future product features.

## What is inside?

| Area | Details |
| --- | --- |
| Frontend | Next.js App Router with React 19 and TypeScript |
| Styling | Tailwind CSS 4 and optimized Geist fonts |
| Data layer | Prisma 7 with a SQLite datasource |
| User model | Unique email, optional name, and automatic timestamps |
| Database client | Prisma Client with the PostgreSQL adapter package available for future migrations |

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the database

Create a `.env` file in the project root:

```env
DATABASE_URL="file:./dev.db"
```

Then generate Prisma Client and apply the local schema:

```bash
npx prisma generate
npx prisma db push
```

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npx prisma generate` | Generate the Prisma Client |
| `npx prisma db push` | Sync the Prisma schema to the database |
| `npx prisma studio` | Browse and edit local database records |

## Project structure

```text
app/                 Next.js routes, layout, and global styles
lib/prisma.ts        Shared Prisma Client setup
prisma/schema.prisma Database schema and models
public/              Static assets
postman/             API collections, environments, and specs
```

## Current data model

The initial `User` model includes:

- A unique email address
- An optional display name
- Automatically managed `createdAt` and `updatedAt` timestamps

## Roadmap

- Shape the Neo Saloon client interface
- Add authentication and user flows
- Connect user-facing screens to Prisma data
- Expand the domain model as the product takes form

## Learn more

- [Next.js documentation](https://nextjs.org/docs)
- [React documentation](https://react.dev/)
- [Prisma documentation](https://www.prisma.io/docs)
- [Tailwind CSS documentation](https://tailwindcss.com/docs)
