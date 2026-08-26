# Pokok Sanad al-Quran

Aplikasi web untuk membina & memaparkan rangkaian sanad (periwayatan) al-Quran
dalam bentuk pokok keturunan (top-down), seperti *family tree builder* tetapi
untuk perawi dan riwayat qiraat.

Data disimpan pada `localStorage` — kekal di browser peranti yang sama
selagi tidak dipadam, tetapi **tidak dikongsi merentasi peranti/pengguna lain**.
Untuk storan berpusat (boleh dikongsi ramai), sambungkan ke Supabase — lihat
bahagian "Naik taraf ke Supabase" di bawah.

## Jalankan secara tempatan

```bash
npm install
npm run dev
```

Buka pautan `localhost` yang dipaparkan di terminal.

## Build untuk pengeluaran

```bash
npm run build
```

Fail statik akan terhasil dalam folder `dist/`.

## Deploy ke GitHub Pages (percuma)

Projek ini sudah lengkap dengan GitHub Actions workflow (`.github/workflows/deploy.yml`)
yang auto-build dan deploy setiap kali anda push ke cabang `main`.

**Langkah:**

1. **Semak `vite.config.js`** — pastikan baris `base: "/digitalsanad/"` sepadan
   dengan nama repo GitHub sebenar anda. Repo ini sudah ditetapkan untuk nama repo **digitalsanad**.
2. Push repo ini ke GitHub (`git init`, `git add .`, `git commit`,
   `git remote add origin ...`, `git push -u origin main`).
3. Di GitHub, pergi ke **Settings → Pages**.
4. Di bawah "Build and deployment" → "Source", pilih **GitHub Actions**
   (bukan "Deploy from a branch").
5. Push sekali lagi (atau pergi ke tab **Actions** dan jalankan workflow
   "Deploy ke GitHub Pages" secara manual). Tunggu ± 1-2 minit.
6. Laman akan tersedia di `https://<nama-akaun>.github.io/<nama-repo>/`
   (URL penuh juga dipaparkan dalam tab Actions selepas deploy berjaya).

Selepas persediaan pertama ini, setiap `git push` ke `main` akan auto-deploy
tanpa langkah manual lagi.

## Struktur data

- **Perawi** (nod): nama Arab, nama rumi, gelaran, tabaqat, tahun wafat, catatan
- **Sanad** (pautan guru→murid): riwayat/qiraat, catatan

Data contoh (`SEED_PERAWI` / `SEED_SANAD` dalam `src/App.jsx`) adalah untuk
demonstrasi antara muka sahaja — sila sahkan/gantikan dengan sumber sanad
yang muktabar sebelum digunakan secara rasmi.

## Naik taraf ke Supabase (storan berpusat)

Skema jadual asas:

```sql
create table perawi (
  id uuid primary key default gen_random_uuid(),
  nama_arab text,
  nama_rumi text not null,
  gelaran text,
  tabaqat text,
  tahun_wafat text,
  catatan text,
  sumber_rujukan text,
  created_by uuid references auth.users
);

create table sanad (
  id uuid primary key default gen_random_uuid(),
  guru_id uuid references perawi(id) on delete cascade,
  murid_id uuid references perawi(id) on delete cascade,
  riwayat text,
  catatan text,
  sumber_rujukan text
);
```

Gantikan panggilan `localStorage.getItem/setItem` dalam `src/App.jsx` dengan
`supabase.from('perawi').select()` / `.insert()` dsb., menggunakan
`@supabase/supabase-js`.
