# Türkçe Notlar - Data Legacy 2.0

## ✅ Tamamlanan Özellikler

### 🎮 Ana Özellikler
1. ✅ **Mode Selection**: Career Mode ve Prompt Lab seçimi
2. ✅ **Prompt Lab (4 Oyun)**:
   - Visionary (Image prompt reverse engineering)
   - Agent Handler (AI tool chain builder)
   - The Algorithm (Persona matching)
   - Coach GPT (Sports strategy)
3. ✅ **Career Mode Optimizasyonları**:
   - Tower Defense Roguelite (AI upgrade cards)
   - Pipeline Puzzle (Throughput metric)
   - Data Farm (Idle mechanics)
4. ✅ **UI/UX İyileştirmeleri**:
   - Responsive tasarım
   - Modern gradient'ler
   - React Portal modals
   - Z-index optimizasyonları

### 🔐 Authentication
- ✅ Email/Magic Link login
- ✅ Anonymous login
- ✅ Guest mode (localStorage fallback)
- ✅ Auto-redirect sistemi

### 🤖 AI Entegrasyonu
- ✅ Groq AI ile tüm oyunlar
- ✅ Career Coach feedback
- ✅ Dynamic scenario generation
- ✅ Upgrade card generation

### 📊 Database
- ✅ Tüm tablolar oluşturuldu
- ✅ RLS policies aktif
- ✅ Real-time leaderboard
- ✅ Game session tracking

---

## 🚀 Kullanım

### İlk Kurulum

1. **Dependencies yükleyin:**
   ```bash
   npm install
   ```

2. **Environment variables ayarlayın:**
   `.env.local` dosyası oluşturun:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   GROQ_API_KEY=your_key
   ```

3. **Supabase database kurulumu:**
   - Supabase Dashboard → SQL Editor
   - `supabase/schema.sql` çalıştırın
   - `supabase/schema_arcade.sql` çalıştırın

4. **Server'ı başlatın:**
   ```bash
   npm run dev
   ```

### Oyun Akışı

#### Career Mode
1. Mode Selection → Career Mode seçin
2. Giriş yapın (Anonymous önerilir)
3. Hero seçin (Engineer/Scientist/Analyst)
4. Path seçin (Technical/Behavioral)
5. Career Map'ten level seçin
6. Oyunu oynayın
7. AI Career Coach feedback alın

#### Prompt Lab
1. Mode Selection → Prompt Lab seçin
2. Oyun seçin (4 seçenek)
3. Challenge'ı çözün
4. AI score alın
5. Leaderboard'da görünün

---

## 🐛 Sorun Giderme

### Sayfa Yüklenmiyor
- **Çözüm**: Browser console'u kontrol edin (F12)
- **CSP Hatası**: Zustand persist devre dışı (geçici)
- **Hard Refresh**: Ctrl+Shift+R

### Email Login Çalışmıyor
- **Çözüm**: Anonymous login kullanın
- **Alternatif**: Guest mode (localStorage)
- **SMTP Kurulumu**: `SUPABASE_EMAIL_SETUP.md` dosyasına bakın

### Modal Arkada Kalıyor
- **Durum**: ✅ Düzeltildi (React Portal)
- **Test**: Hard refresh yapın

### Build Hatası
- **Çözüm**: `npm install` tekrar çalıştırın
- **TypeScript**: Tüm type'lar doğru

---

## 📁 Dosya Yapısı

### Aktif Dosyalar ✅
- `app/` - Next.js 14 App Router
- `components/` - Tüm component'ler
- `lib/` - Utilities ve clients
- `supabase/` - Database schema'ları

### Silinen Dosyalar ❌
- `src/` - Eski Vite dosyaları (migrate edildi)
- `vite.config.js` - Artık kullanılmıyor
- `index.html` - Next.js app directory kullanıyor
- `tailwind.config.js` - `tailwind.config.ts` kullanılıyor

---

## 🎨 UI/UX Standartları

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Touch-friendly interactions

### Z-Index Hierarchy
1. GameInstructions: 99999 (Portal)
2. StoryModal: 200
3. CareerCoachModal: 200
4. Game modals: 200
5. Arcade back button: 100
6. Global HUD: 50

### Modal System
- React Portal kullanımı
- Backdrop blur
- Smooth animations
- Click-outside-to-close

---

## 🔮 Gelecek Özellikler

1. **Game Balance Dashboard**
   - Win rate analytics
   - Auto-difficulty adjustment

2. **Social Features**
   - Friend system
   - Challenges
   - Sharing

3. **Mobile App**
   - React Native
   - Push notifications

---

## 📞 Yardım

Sorun yaşarsanız:
1. Browser console'u kontrol edin (F12)
2. Terminal çıktılarını kontrol edin
3. Environment variables'ı kontrol edin
4. Supabase dashboard'u kontrol edin

---

## 📝 Notlar

- **Zustand Persist**: Geçici olarak devre dışı (CSP sorunu)
- **Guest Mode**: LocalStorage fallback çalışıyor
- **Portal Modals**: Tüm modal'lar en üstte görünüyor
- **TypeScript**: Full type coverage

---

**Başarılar! 🎮✨**

*Data Legacy 2.0 - Version 2.0 - 2026*
