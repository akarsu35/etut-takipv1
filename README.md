<div align="center">
  <img src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" alt="EtütTakip Pro Banner" width="100%" />
  
  # 📚 EtütTakip Pro
  
  ### Öğrenci Etüt Yönetim Sistemi
  
  [![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  
  *Öğretmenler için modern, kullanımı kolay etüt takip ve planlama uygulaması*
  
  [Demo](#demo) • [Özellikler](#-özellikler) • [Kurulum](#-kurulum) • [Kullanım](#-kullanım) • [Teknolojiler](#-teknolojiler)
</div>

---

## ✨ Özellikler

### 📅 Haftalık Program

- **Sürükle-bırak** ile kolay etüt ekleme
- Haftalık takvim görünümü
- Özelleştirilebilir ders saatleri
- Hafta bazlı arşivleme

### 👥 Öğrenci Yönetimi

- Öğrenci ekleme, düzenleme ve silme
- Her öğrenci için farklı renk kodları
- Sınıf bazlı gruplama
- Excel'den toplu öğrenci aktarımı

### ✅ Katılım Takibi

- Her etüt için **Katıldı / Gelmedi** durumu kaydetme
- Öğrenci bazlı katılım istatistikleri
- Görsel katılım göstergeleri (yeşil/kırmızı)
- Detaylı katılım geçmişi

### ⚠️ Geçen Haftadan Unutulanlar

- Geçen hafta etüdü olmayan öğrencileri görme
- **Sınıfa göre gruplanmış** liste
- Alfabetik sıralama
- Sürükle-bırak ile hızlı ekleme

### 📊 İstatistikler

- Haftalık özet raporları
- Öğrenci bazlı performans takibi
- Görsel grafikler ve analizler

### ⚙️ Ayarlar

- Özelleştirilebilir ders saatleri
- Tema ve görünüm ayarları
- Kullanıcı profil yönetimi

---

## 🚀 Kurulum

### Gereksinimler

- Node.js 18+
- npm veya yarn

### Adımlar

1. **Projeyi klonlayın:**

   ```bash
   git clone https://github.com/akarsu35/etut-takipv1.git
   cd etut-takipv1
   ```

2. **Bağımlılıkları yükleyin:**

   ```bash
   npm install
   ```

3. **Ortam değişkenlerini ayarlayın:**

   ```bash
   cp .env.example .env
   ```

   `.env` dosyasını düzenleyin ve gerekli değişkenleri ekleyin:

   ```env
   DATABASE_URL="your-database-url"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Veritabanını hazırlayın:**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Uygulamayı başlatın:**

   ```bash
   npm run dev
   ```

6. **Tarayıcıda açın:**
   ```
   http://localhost:3000
   ```

---

## 📖 Kullanım

### Öğrenci Ekleme

1. **Öğrenci Portföyü** sekmesine gidin
2. **+ Yeni Öğrenci** butonuna tıklayın
3. Öğrenci bilgilerini girin ve kaydedin

### Etüt Ekleme

1. **Haftalık Program** sekmesinde istediğiniz gün/saat hücresine tıklayın
2. Öğrenci seçin ve not ekleyin (opsiyonel)
3. Kaydet butonuna tıklayın

**veya**

- Sol taraftaki öğrenci listesinden bir öğrenciyi **sürükleyip** takvimde istediğiniz yere **bırakın**

### Katılım Kaydetme

- Etüt kartında **Katıldı** (yeşil) veya **Gelmedi** (kırmızı) butonuna tıklayın
- Durum anında kaydedilir ve senkronize olur

---

## 🛠 Teknolojiler

| Teknoloji        | Açıklama                           |
| ---------------- | ---------------------------------- |
| **Next.js 14**   | React tabanlı full-stack framework |
| **TypeScript**   | Tip güvenli JavaScript             |
| **Prisma**       | Modern veritabanı ORM              |
| **TailwindCSS**  | Utility-first CSS framework        |
| **NextAuth.js**  | Kimlik doğrulama                   |
| **React DnD**    | Sürükle-bırak işlevselliği         |
| **Sonner**       | Toast bildirimleri                 |
| **Lucide React** | Modern ikonlar                     |

---

## 📁 Proje Yapısı

```
etut-takipv1/
├── app/                    # Next.js app router
│   ├── page.tsx           # Ana sayfa (Haftalık Program)
│   ├── students/          # Öğrenci portföyü
│   ├── statistics/        # İstatistikler
│   └── settings/          # Ayarlar
├── components/            # Yeniden kullanılabilir bileşenler
├── context/               # React context (global state)
├── actions/               # Server actions
├── prisma/                # Veritabanı şeması
└── types.ts               # TypeScript tip tanımları
```

---

## 🤝 Katkıda Bulunma

1. Bu projeyi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'e push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

---

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

<div align="center">
  
  **EtütTakip Pro** ile öğrenci takibini kolaylaştırın! 🎓
  
  ⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
  
</div>
