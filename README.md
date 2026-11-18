# 🌵 Neo Saloon Client

> ✨ A bold, modern web client foundation for the Neo Saloon experience.

Welcome to the **Neo Saloon** — a fresh digital space where great ideas, clean code, and smooth user experiences meet. 🚀

![Next.js](https://img.shields.io/badge/Next.js-16.3.1-111827?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.8-149eca?style=for-the-badge&logo=react&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7.9.1-2d3748?style=for-the-badge&logo=prisma&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)

Neo Saloon Client is a Next.js application built with the App Router, React, TypeScript, Tailwind CSS, and Prisma. It is currently the starting point for a polished client experience, with the data layer ready for user records and future product features. 🛠️

## 🎯 What is inside?

| 🧩 Area | 🌈 Details |
| --- | --- |
| 🖥️ Frontend | Next.js App Router with React 19 and TypeScript |
| 🎨 Styling | Tailwind CSS 4 and optimized Geist fonts |
| 🗄️ Data layer | Prisma 7 with a PostgreSQL datasource |
| 👤 User model | Unique email, first and last names, and optional phone |
| 🔌 Database client | Prisma Client configured with the PostgreSQL adapter |

## 🚀 Quick start

Get the saloon running locally in just a few steps. 🤠

### 1️⃣ Install dependencies

```bash
npm install
```

### 2️⃣ Configure the database

Create a `.env` file in the project root and set it to your PostgreSQL connection:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
```

Then generate Prisma Client and apply the schema to that database:

```bash
npx prisma generate
npx prisma db push
```

Set `JOSE_SECRET_KEY` to a long, random secret in the server environment. Client and admin sign-in uses a one-hour, HTTP-only JWT cookie. After applying the Prisma schema, start the app as usual.

### 3️⃣ Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser and step inside. 🌐

## 🧰 Available commands

| 💻 Command | 📌 Purpose |
| --- | --- |
| `npm run dev` | Start the development server ⚡ |
| `npm run build` | Create a production build 📦 |
| `npm run start` | Serve the production build 🚀 |
| `npx prisma generate` | Generate the Prisma Client 🔧 |
| `npx prisma db push` | Sync the Prisma schema to the database 🔄 |
| `npx prisma studio` | Browse and edit local database records 🔍 |

## 🔐 Client dashboard and welcome messages

- Clients sign in at `/` and are sent to `/dashboard`. Their dashboard reads only their own profile and welcome message.
- Admins sign in at `/` and are sent to `/admin`. The protected client-list and welcome-message APIs are also available for same-origin admin integrations and Postman.
- Only active customer accounts created within the previous seven days are eligible for a welcome message. A client can receive one welcome message only.
- Apply the new `WelcomeMessage` schema with `npx prisma db push` or deploy migrations with `npx prisma migrate deploy`.

### API routes

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth` | Public | Sign in; sets the HTTP-only JWT cookie |
| `POST` | `/api/auth/logout` | Public | Clears the login cookie |
| `GET` | `/api/dashboard` | Active customer | Gets the signed-in customer’s dashboard and own welcome message |
| `GET` | `/api/admin/clients?pageNumber=1&pageSize=25` | Admin or `users:read` | Lists customer accounts and welcome eligibility |
| `POST` | `/api/admin/messages` | Admin or `client-messages:send` | Sends one welcome message to an eligible client |

Send a welcome message with JSON:

```json
{
  "clientId": "customer-user-uuid",
  "content": "Welcome to Neo Saloon! Here’s a brief introduction..."
}
```

The Postman collection is in `postman/collections/neo-saloon-client.json`. Set its `baseUrl`, then sign in to establish the cookie before calling protected routes.

## 🗺️ Project structure

```text
app/                 Next.js routes, layout, and global styles
lib/prisma.ts        Shared Prisma Client setup
prisma/schema.prisma Database schema and models
public/              Static assets
postman/             API collections, environments, and specs
```

## 👥 Current data model

The `User` model includes:

- 📧 A unique email address
- 🪪 Required first and last names
- 📱 An optional phone number
- 🕒 Automatically managed `CreatedAt` and `UpdatedAt` timestamps

## 🛣️ Roadmap

- 🎨 Shape the Neo Saloon client interface
- 🔐 Add authentication and user flows
- 🔗 Connect user-facing screens to Prisma data
- 🌱 Expand the domain model as the product takes form

## 💛 Project status

🟡 **Early foundation** — the core stack and database layer are ready, and the product experience is taking shape one feature at a time.

## 📚 Learn more

- [Next.js documentation](https://nextjs.org/docs)
- [React documentation](https://react.dev/)
- [Prisma documentation](https://www.prisma.io/docs)
- [Tailwind CSS documentation](https://tailwindcss.com/docs)
