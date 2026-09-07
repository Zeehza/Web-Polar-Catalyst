# Tech Stack: Website Polar Catalyst

**Tanggal:** 3 September 2026
**Status:** Draft — menunggu konfirmasi

---

## Overview

| Layer           | Teknologi                   |
| --------------- | --------------------------- |
| Framework       | Next.js 15 (App Router)     |
| Language        | TypeScript                  |
| Styling         | Tailwind CSS v4             |
| UI Components   | Custom (build from scratch) |
| Database        | MySQL 8                     |
| ORM             | Prisma                      |
| Auth            | NextAuth.js (Auth.js v5)    |
| Form Validation | Zod + React Hook Form       |
| Email           | Resend                      |
| Deployment      | Coolify (self-hosted PaaS)  |

---

## 1. Frontend

### Next.js 15 (App Router)

- **Kenapa:** Framework React paling mature untuk production. Built-in SSR, ISR, dan API Routes — cocok untuk halaman publik yang butuh SEO (jadwal, hasil turnamen) sekaligus admin dashboard yang interaktif
- **Fitur yang dipakai:**
  - **Server Components** — halaman publik (About, Jadwal, Hasil) di-render di server → cepat & SEO-friendly
  - **Client Components** — admin dashboard, form interaktif, dark/light mode toggle
  - **API Routes (Route Handlers)** — backend logic: CRUD turnamen, kirim email, Discord webhook
  - **ISR (Incremental Static Regeneration)** — halaman publik di-cache & revalidate saat admin update data → performa optimal saat traffic spike event
  - **Image Optimization** — `next/image` untuk logo, banner, sponsor assets

### TypeScript

- **Kenapa:** Type safety mengurangi bug, terutama di data model turnamen/bracket yang cukup complex. Autocomplete juga bikin development lebih cepat

### Tailwind CSS v4

- **Kenapa:** Utility-first CSS, rapid development, config via CSS (v4 feature), dan theming untuk dark/light mode jadi simpel
- **Approach:** Build semua komponen dari scratch — full control atas design yang mengacu ke branding Polar Catalyst
- **Dark/Light Mode:** Pakai Tailwind `dark:` variant + `next-themes` untuk toggle persistence

---

## 2. Backend & Database

### MySQL 8

- **Kenapa:** Familiar, reliable, dan lebih dari cukup untuk skala website ini (puluhan concurrent users)
- **Data model utama:**
  - `Tournament` — info turnamen, jadwal, status
  - `Match` — hasil pertandingan per match
  - `Team/Participant` — peserta turnamen
  - `Bracket` — posisi di bracket (parent-child relationship)
  - `Sponsor` — data sponsor untuk showcase
  - `ContactSubmission` — form kontak sponsor (fallback storage kalau email gagal)
  - `Admin` — credential admin dashboard

### Prisma ORM

- **Kenapa:** Type-safe database client yang auto-generate dari schema. Perfect pairing dengan TypeScript — query database dapat autocomplete & type checking
- **Fitur yang dipakai:**
  - `prisma migrate` — database migration management
  - `prisma generate` — auto-generate TypeScript types dari schema
  - `prisma studio` — GUI untuk inspect/edit data langsung (berguna saat development)

### NextAuth.js (Auth.js v5)

- **Kenapa:** Simple credential-based login, cocok untuk single admin. Tidak perlu setup OAuth provider yang complex
- **Setup:**
  - Credentials provider (username + password)
  - Session strategy: JWT (stateless, tidak perlu session table)
  - Middleware protection untuk route `/admin/*`

---

## 3. Utilitas

### Zod + React Hook Form

- **Zod:** Schema validation yang bisa dipakai di client & server. Satu schema untuk validasi form input + API request
- **React Hook Form:** Performant form library, minimal re-render. Cocok untuk form admin dashboard yang banyak field

### Resend (Email Service)

- **Kenapa:** API-based email service, free tier 100 emails/bulan — lebih dari cukup untuk form kontak sponsor
- **Fallback:** Semua form submission disimpan di database dulu, baru kirim email. Kalau email gagal, data tetap aman
- **Alternatif:** Kalau mau zero-cost, bisa pakai Nodemailer + SMTP Gmail (tapi kurang reliable untuk production)

### Discord Webhook

- **Kenapa:** Requirement di PRD — form submission terkirim ke Discord channel
- **Implementasi:** Native `fetch()` ke Discord webhook URL dari API Route. Tidak perlu library tambahan

---

## 4. Deployment

### Coolify (Self-hosted PaaS)

- **Kenapa:** Familiar, self-hosted, gratis (hanya bayar VPS). Bisa deploy Next.js + MySQL dalam satu platform
- **Setup yang dibutuhkan:**
  - VPS minimal spec: **2 vCPU, 2GB RAM, 40GB SSD** (cukup untuk Coolify + Next.js + MySQL)
  - Coolify deploy Next.js via **Dockerfile** atau **Nixpacks** (auto-detect)
  - MySQL sebagai service terpisah di Coolify
  - Domain + SSL otomatis via Coolify (Let's Encrypt)

### Rekomendasi VPS Provider (untuk referensi nanti)

| Provider         | Spec            | Harga/bulan    | Catatan                           |
| ---------------- | --------------- | -------------- | --------------------------------- |
| **Hetzner**      | 2 vCPU, 4GB RAM | ~€4.5 (~Rp75k) | Best value, server di Eropa/US/SG |
| **DigitalOcean** | 1 vCPU, 2GB RAM | $12 (~Rp190k)  | Populer, banyak tutorial          |
| **Contabo**      | 4 vCPU, 8GB RAM | €6.5 (~Rp105k) | Murah tapi performa bervariasi    |
| **IDCloudHost**  | 2 vCPU, 2GB RAM | ~Rp80k         | Server Indonesia, latency rendah  |

> **💡 Tip:** Kalau target user mayoritas Indonesia, pilih VPS dengan server di Singapore atau Indonesia untuk latency rendah. Hetzner punya data center di Singapore.

---

## 5. Dev Tools & DX

| Tool             | Fungsi                                              |
| ---------------- | --------------------------------------------------- |
| **ESLint**       | Linting, code quality                               |
| **Prettier**     | Code formatting                                     |
| **Git + GitHub** | Version control                                     |
| **pnpm**         | Package manager (lebih cepat & hemat disk dari npm) |

---

## 6. Struktur Folder (Rencana)

` ` `

polar-catalyst/
├── prisma/
│ └── schema.prisma # Database schema
├── public/
│ └── images/ # Static assets (logo, sponsor, dll.)
├── src/
│ ├── app/
│ │ ├── (public)/ # Route group: halaman publik
│ │ │ ├── page.tsx # Landing/About
│ │ │ ├── jadwal/
│ │ │ ├── hasil/
│ │ │ ├── bracket/
│ │ │ ├── sponsor/
│ │ │ └── kontak/
│ │ ├── admin/ # Route group: admin dashboard
│ │ │ ├── dashboard/
│ │ │ ├── turnamen/
│ │ │ ├── sponsor/
│ │ │ └── login/
│ │ ├── api/ # API Routes
│ │ │ ├── auth/
│ │ │ ├── turnamen/
│ │ │ ├── match/
│ │ │ └── kontak/
│ │ ├── layout.tsx # Root layout (dark/light mode provider)
│ │ └── globals.css # Tailwind config + custom styles
│ ├── components/
│ │ ├── ui/ # Reusable UI (Button, Card, dll.)
│ │ ├── public/ # Components halaman publik
│ │ └── admin/ # Components admin dashboard
│ ├── lib/
│ │ ├── prisma.ts # Prisma client instance
│ │ ├── auth.ts # NextAuth config
│ │ ├── discord.ts # Discord webhook helper
│ │ └── email.ts # Resend/email helper
│ └── types/ # Shared TypeScript types
├── .env.local # Environment variables
├── next.config.ts
├── tsconfig.json
└── package.json

` ` `

---

## 7. Keputusan yang Perlu Dikonfirmasi

Beberapa hal yang perlu diputuskan sebelum mulai development:

| #   | Pertanyaan                                           | Status                 |
| --- | ---------------------------------------------------- | ---------------------- |
| 1   | Domain sudah punya atau belum?                       | ❓                     |
| 2   | VPS provider mana yang dipilih?                      | ❓ (tergantung client) |
| 3   | Email service: Resend (free tier) atau SMTP sendiri? | ❓                     |
| 4   | Asset visual (logo, warna branding) sudah final?     | ❓                     |
| 5   | Discord webhook URL untuk notifikasi form            | ❓                     |
