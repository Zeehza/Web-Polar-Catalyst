# PRD: Website Polar Catalyst

**Tanggal:** 1 September 2026
**Status:** Final Draft

## 1. Problem

- Operasional Polar Catalyst saat ini 100% di Discord → tidak ada presence resmi yang bisa diakses publik/luar komunitas
- Susah showcase Project secara profesional ke calon sponsor/partner
- Fandom peserta kesulitan akses info & jadwal turnamen secara terpusat

## 2. Goals

- Online presence resmi Polar Catalyst, bisa diakses tanpa perlu join Discord
- Mempermudah sponsor/partner menilai kredibilitas & value polar catalyst dengan cepat
- Jadi single source of truth untuk jadwal, hasil, dan status turnamen

## 3. Non-Goals

- Bukan pengganti Discord sebagai command center operasional komunitas

## 4. Success Metrics

> _(Draft — target angka spesifik belum ditentukan)_

- Website live & bisa diakses sebelum akhir November 2026
- Sponsor deck bisa reference website dengan motion marquee, bukan screenshot Discord
- Jadwal & hasil ter-update tanpa delay signifikan saat event berlangsung

## 5. Target Users

- **Fans/penonton vtuber** — mau tahu jadwal, hasil turnamen, Trunament yang akan datang
- **Fandom peserta** — mau lihat status/posisi tim mereka di bracket
- **Sponsor & partner** — menilai kredibilitas & reach sebelum kerja sama
- **Media & calon fandom baru** — melihat profil organisasi & cara menjalin kerjasama

## 6. Core Features

### Public-facing (MVP)

- Profil Polar Catalyst
- Jadwal turnamen
- Hasil turnamen
- Leaderboard/bracket (update manual oleh admin)
- Showcase sponsor
- Form kontak calon sponsor

### Internal (MVP)

- Admin dashboard — kelola jadwal, hasil, leaderboard/bracket

### Next phase (belum termasuk MVP)

- bot di discord untuk kirim ticket dengan role spesifik (contoh: admin, co-admin, partner, moderator fanbase, dll.)

## 7. User Stories

- Sebagai fans, saya ingin lihat jadwal turnamen supaya tahu kapan harus nonton
- Sebagai fans, saya ingin lihat hasil pertandingan supaya bisa update meski nggak sempat nonton live
- Sebagai fandom peserta, saya ingin lihat posisi tim saya di bracket supaya tahu progress turnamen
- Sebagai sponsor/partner, saya ingin lihat overview Polar Catalyst supaya bisa evaluasi kerja sama
- Sebagai calon sponsor, saya ingin isi form kontak di website supaya bisa menghubungi Polar Catalyst soal peluang kerja sama
- Sebagai admin, saya ingin input hasil match lewat dashboard supaya leaderboard/bracket di halaman publik ter-update tanpa edit kode manual

## 8. Requirements

### Functional

- Halaman About/Profil (Polar Catalyst)
- Halaman jadwal turnamen
- Halaman hasil turnamen
- Modul leaderboard/bracket — mekanisme **manual**: admin input hasil match via dashboard → halaman publik ter-update otomatis begitu disubmit (bukan real-time selama match berlangsung)
- Halaman showcase sponsor
- Form kontak calon sponsor → submission terkirim ke email Polar Catalyst dan discord webhook
- Admin dashboard: kelola jadwal, hasil, leaderboard/bracket
- Toggle dark/light mode
- Kontak/social links dasar

### Non-Functional

- Web tetap ringan/performan meski diakses puluhan user secara bersamaan, terutama saat live event
- Visual mengacu ke logo Polar Catalyst yang sudah ada, tanpa elemen maskot
- Responsive di mobile & desktop

## 9. Edge Cases

- Admin telat input hasil match → leaderboard/jadwal jadi stale, perlu timestamp "data terakhir diupdate kapan"
- Match ditunda/dibatalkan mendadak → status di jadwal harus jelas, bukan cuma hilang
- Fandom mengundurkan diri di tengah turnamen → status di leaderboard/bracket
- Traffic spike pas hari-H event → performa web harus tetap stabil untuk puluhan user bersamaan
- Form sponsor disubmit tapi email gagal terkirim → perlu fallback biar submission nggak hilang begitu saja
- Submission spam lewat form sponsor → perlu validasi dasar (captcha/honeypot)
- Admin lupa password/akses dashboard hilang → perlu mekanisme recovery

## 10. MVP Scope

### In scope

- Landing/about Polar Catalyst
- Jadwal turnamen yang memiliki link ke hasil tournament dan bracket
- Hasil turnamen/leaderboard
- bracket (manual update via dashboard)
- Showcase sponsor + form kontak sponsor
- Admin dashboard
- Dark/light mode
- Kontak/social links dasar

### Out of scope (next phase)

- Pendaftaran tim/fandom online berbasis ticket dengan role spesifik di discord

## 11. Timeline

- **Target launch:** akhir November 2026
- **Alasan:** Desember dipakai untuk kontak/outreach ke fandom yang mau ikut event Polar Catalyst berikutnya, yang mulai **Januari 2027** — web perlu live sebelum proses itu dimulai
- **Maintenance pasca-launch:** dihandle langsung oleh developer

## 12. Assumptions

> _(Belum dikonfirmasi eksplisit — sebaiknya divalidasi sebelum development)_

- Field form kontak sponsor: nama/nama perusahaan, email, pesan (bisa disesuaikan)
- Admin dashboard diasumsikan single-user (developer/admin), belum perlu role-based access multi-user
