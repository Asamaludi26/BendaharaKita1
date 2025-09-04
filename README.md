<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1L2WA5PMFm9ox5wm5OxeKfvXZ40aK4uPS

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

<div align="center">
  <br />
  <!-- Ganti URL ini dengan URL logo aplikasi Anda -->
  <img src="https://i.imgur.com/your-logo-image-url.png" alt="Logo BendaharaKita" width="120">
  <h1 align="center">BendaharaKita</h1>
  <p align="center">
    <strong>Asisten Keuangan Personal Cerdas untuk Mengelola Finansial Anda.</strong>
  </p>
  <p align="center">
    Dibangun dengan React, TypeScript, dan ditenagai oleh Google Gemini API.
  </p>
  <p align="center">
    <a href="#fitur-utama">Fitur</a> •
    <a href="#teknologi-yang-digunakan">Teknologi</a> •
    <a href="#memulai">Memulai</a>
  </p>
</div>

---

### 💡 Tentang Aplikasi

**BendaharaKita** adalah aplikasi keuangan pribadi modern dan intuitif yang dirancang khusus untuk membantu pengguna di Indonesia mengelola finansial mereka dengan mudah dan cerdas. Dengan filosofi desain yang bersih, visualisasi data yang kaya, dan integrasi kecerdasan buatan (AI), aplikasi ini bukan sekadar pencatat transaksi, melainkan asisten keuangan personal yang memberdayakan pengguna untuk mengambil keputusan finansial yang lebih baik. Aplikasi ini sangat ideal untuk profesional muda, mahasiswa, pekerja lepas, dan siapa saja yang ingin memiliki kendali penuh atas keuangan mereka dan beralih dari pencatatan manual ke solusi digital yang lebih cerdas.

---

### ✨ Fitur Utama

| Fitur | Deskripsi |
| :--- | :--- |
| 📊 **Dashboard Interaktif** | Dapatkan gambaran 360° kesehatan finansial Anda dalam sekejap. Lihat ringkasan bulanan, analisis mendalam, perbandingan **Target vs. Aktual**, dan visualisasi data yang kaya melalui grafik arus kas dan komposisi pengeluaran. |
| 🤖 **Insight Finansial AI** | Ditenagai oleh **Google Gemini API**, fitur ini menganalisis data Anda dan memberikan 2-3 saran finansial yang personal, praktis, dan mudah dipahami dalam Bahasa Indonesia untuk membantu Anda membuat keputusan yang lebih cerdas. |
| 🎯 **Anggaran & Pelaporan** | Buat anggaran bulanan (**Target**) yang terstruktur dan catat realisasi pengeluaran dan pemasukan (**Aktual**) dengan mudah. Lacak setiap rupiah untuk memastikan Anda tetap pada jalur yang benar. |
| 🏆 **Manajemen Tujuan & Utang** | Fokus pada tujuan finansial Anda! Buat, lacak, dan kelola berbagai **Tujuan Tabungan** (Dana Darurat, Liburan) atau pantau progres pelunasan **Utang** (Produktif & Konsumtif) melalui visualisasi yang memotivasi. |
| 📜 **Riwayat Komprehensif** | Semua data finansial Anda tersimpan rapi. Tinjau kembali **Riwayat Transaksi**, arsip **Target Anggaran**, dan **Laporan Aktual** dari bulan-bulan sebelumnya untuk evaluasi dan perencanaan di masa depan. |
| 📱 **Desain Modern & Responsif** | Dibangun dengan Tailwind CSS, aplikasi ini memiliki antarmuka yang bersih, dukungan penuh untuk **Mode Gelap**, dan dioptimalkan untuk berbagai ukuran perangkat, dari ponsel hingga desktop. |

---

### 🚀 Teknologi yang Digunakan

*   **Frontend**: React, TypeScript
*   **Styling**: Tailwind CSS
*   **Charts**: Recharts
*   **AI Engine**: Google Gemini API (`gemini-2.5-flash`)
*   **Icons**: Font Awesome

---

### 🔧 Memulai (Getting Started)

Untuk menjalankan proyek ini di lingkungan lokal Anda, ikuti langkah-langkah berikut.

#### Prasyarat

*   Node.js (v18 atau lebih tinggi)
*   `npm` / `yarn` / `pnpm`

#### Instalasi

1.  **Clone repositori ini:**
    ```bash
    git clone https://github.com/your-username/bendaharakita.git
    cd bendaharakita
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables:**
    Buat file `.env` di *root* proyek dan tambahkan API Key Google Gemini Anda.
    ```env
    API_KEY="YOUR_GEMINI_API_KEY"
    ```
    > **Penting:** Pastikan untuk tidak membagikan API Key Anda secara publik. Tambahkan `.env` ke file `.gitignore` Anda.

4.  **Jalankan aplikasi:**
    ```bash
    npm run start
    ```
    Aplikasi akan berjalan dan dapat diakses di `http://localhost:3000`.

---

### 📄 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT - lihat file `LICENSE` untuk detailnya.

<div align="center">
Dibuat dengan ❤️ untuk manajemen keuangan yang lebih baik.
</div>
