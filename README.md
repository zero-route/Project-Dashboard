# Pantau — Monitoring Dashboard

## Struktur
```
app/
  dashboard/page.jsx        -> UI dashboard (client component)
  api/github/repos/         -> SUDAH aktif, ambil repo asli dari GitHub
  api/vercel/project/       -> stub, aktifkan isi VERCEL_TOKEN
  api/supabase/status/      -> stub, aktifkan isi SUPABASE_URL + SERVICE_ROLE_KEY
  api/cloudflare/metrics/   -> stub, aktifkan isi CLOUDFLARE_API_TOKEN
```

## Jalankan lokal
```bash
npm install
cp .env.local.example .env.local
# isi minimal GITHUB_USERNAME di .env.local
npm run dev
```
Buka http://localhost:3000/dashboard

## Deploy ke Vercel
1. Push folder ini ke repo GitHub baru.
2. Import repo tsb di https://vercel.com/new
3. Di Project Settings > Environment Variables, isi semua variabel dari
   `.env.local.example` (jangan pernah commit file `.env.local` sendiri).
4. Deploy.

## Kenapa arsitekturnya begini
Semua API key (Vercel/Supabase/Cloudflare) hanya dibaca di sisi server
(folder `app/api/.../route.js`), bukan di komponen client. Browser cuma
memanggil endpoint `/api/...` milik sendiri, sehingga key rahasia tidak
pernah terkirim ke publik.

## Langkah berikutnya yang disarankan
- Isi GITHUB_USERNAME lalu cek /dashboard — repo asli harus langsung muncul.
- Setelah Supabase token siap, ganti isi `api/supabase/status/route.js`
  dengan query nyata ke tabel `absen` (contoh query ada di komentar file itu).
- Tambahkan proteksi login sebelum dashboard ini online publik.
