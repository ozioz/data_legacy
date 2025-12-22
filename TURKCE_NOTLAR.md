# Türkçe Notlar - Data Legacy 2.0

> **Geleceğin Veri Mühendisleri İçin Oyunlaştırılmış Öğrenme Platformu**

Bu doküman, Data Legacy 2.0 projesinin Türkçe teknik notlarını içerir.

---

## 📋 İçindekiler

1. [Tamamlanan Özellikler](#tamamlanan-özellikler)
2. [Admin-Only Modüller](#admin-only-modüller)
3. [Kurulum ve Kullanım](#kurulum-ve-kullanım)
4. [Netlify Deployment](#netlify-deployment)
5. [Sorun Giderme](#sorun-giderme)
6. [Teknik Detaylar](#teknik-detaylar)

---

## ✅ Tamamlanan Özellikler

### 🎮 Public Modüller (Tüm Kullanıcılar İçin)

#### 1. Career Mode (Kariyer Simülasyonu)
- ✅ **6 Arcade Oyunu**:
  - Pipeline Puzzle (ETL pipeline builder, throughput metrikleri)
  - Server Guardian (Tower Defense - klasik)
  - Server Guardian Roguelite (AI upgrade kartları ile)
  - Null Runner (Signal/Noise toplama)
  - Data Farm (Idle mekanikleri, offline üretim)
  - Query Master (SQL query builder)
- ✅ **Behavioral Scenarios**: AI destekli RPG senaryoları
- ✅ **Character Progression**: Engineer/Scientist/Analyst seçimi
- ✅ **Path System**: Technical vs Behavioral kariyer yolları
- ✅ **Level System**: Seviye bazlı ilerleme
- ✅ **XP & Leaderboard**: Gerçek zamanlı sıralama

#### 2. Prompt Lab (Hızlı Oyun Modu)
- ✅ **Visionary**: Görüntü prompt reverse engineering (Database validation ile)
- ✅ **Agent Handler**: AI tool chain builder (drag & drop)
- ✅ **The Algorithm**: Persona matching game
- ✅ **Coach GPT**: Sports strategy simulator
- ✅ **AI Scoring**: Semantic similarity ve AI değerlendirme

#### 3. AI Mock Interview
- ✅ **Multi-language Support**: Türkçe, İngilizce, İspanyolca, Fransızca, Almanca
- ✅ **Speech-to-Text**: Browser SpeechRecognition API
- ✅ **Text-to-Speech**: Browser SpeechSynthesis API
- ✅ **Video Call UI**: Kullanıcı kamerası + AI avatar
- ✅ **Auto-Complete**: 8 soru veya 20 dakika limiti
- ✅ **Realistic Scoring**: Gerçekçi puanlama sistemi (0-100)
- ✅ **Emotional Analysis**: Video frame analizi ile duygusal geri bildirim
- ✅ **SWOT Analysis**: Detaylı güçlü/zayıf yönler analizi
- ✅ **Transcript Saving**: Tüm konuşmalar Supabase'de saklanıyor

### 🔒 Admin-Only Modüller (Geliştirme Aşamasında)

⚠️ **Not**: Aşağıdaki modüller şu anda sadece admin kullanıcılar tarafından erişilebilir. Geliştirme tamamlandığında public yapılacak.

#### 1. The Core (Matematik & Algoritmalar)
- 🚧 **Matrix Architecture**: Neural network layer connection puzzle
- 🚧 **Gradient Descent**: Learning rate optimization simulator
- 🚧 **Educational Visualizations**: İnteraktif öğrenme deneyimi

#### 2. Guilds (Sosyal Sistem)
- 🚧 **Guild Creation**: Yeni guild oluşturma
- 🚧 **Guild List**: Tüm guild'leri görüntüleme
- 🚧 **Guild Detail**: Detaylı guild sayfası
- 🚧 **Guild Leaderboard**: Üyelerin XP toplamına göre sıralama
- 🚧 **Join/Leave**: Guild'e katılma/ayrılma

#### 3. Marketplace (Ekonomi Sistemi)
- 🚧 **Buy/Sell**: Data Farm kaynaklarını al/sat
- 🚧 **Live Prices**: Canlı fiyat takibi (simüle edilmiş)
- 🚧 **Inventory Management**: Kullanıcı envanter yönetimi
- 🚧 **Quant Tools**: İstatistik öğrenme mini-oyunları
  - Volatility Analysis (standart sapma hesaplama)
  - Probability Analysis (Bayes mantığı)
  - Fee Discount Rewards (doğru cevaplar için %0 işlem ücreti)
- 🚧 **Dynamic Market News**: AI tarafından üretilen haberler ve fiyat etkileri

#### 4. Profile & Resume Generator
- 🚧 **User Profile**: Kullanıcı profil sayfası
- 🚧 **Resume Generator**: Otomatik PDF CV oluşturma
  - Skills Analysis (oyun performansından)
  - Soft Skills Assessment
  - Achievement Tracking
  - Public Verification Link

#### 5. Public Verification
- 🚧 **Public Profile Page**: `/verify/[userId]` - Authentication gerektirmez
- 🚧 **Verified Badge**: "Verified Data Legacy Profile" rozeti
- 🚧 **Read-Only Stats**: Seviye, XP, Coding Hours, Skills

### 🛠️ Admin Sistemi

- ✅ **Admin Authentication**: `is_admin` kolonu ile kontrol
- ✅ **Admin Routes**: `/admin/*` rotaları korumalı
- ✅ **Admin Layout**: Server-side admin kontrolü
- ✅ **Visionary Admin Panel**: `/admin/visionary` - Level yönetimi
- ✅ **Auto-Generate Levels**: Visionary oyunu için otomatik level oluşturma

### 🎨 UI/UX Özellikleri

- ✅ **Responsive Design**: Mobile-first yaklaşım
- ✅ **Global Navigation**: Tüm sayfalardan erişilebilir navigasyon
- ✅ **React Portal Modals**: Z-index sorunları çözüldü
- ✅ **Asset Management**: Merkezi asset yönetimi (`lib/game/assets.ts`)
- ✅ **Cyberpunk Aesthetic**: Modern, karanlık tema
- ✅ **Smooth Animations**: Framer Motion ile animasyonlar
- ✅ **Loading States**: Tüm async işlemler için loading göstergeleri

### 🤖 AI Entegrasyonu

- ✅ **Hybrid Model Strategy**: Doğru model, doğru görev için
  - **SMART_MODEL** (Llama 3.3-70B): Karmaşık akıl yürütme, mülakatlar, kariyer koçluğu
  - **FAST_MODEL** (Llama 3.1-8B): Hız kritik görevler (<200ms)
  - **AUDIO_MODEL** (Whisper): Speech-to-text transcription
- ✅ **Career Coach**: Her oyun sonrası AI geri bildirimi
- ✅ **Dynamic Scenarios**: AI tarafından üretilen senaryolar
- ✅ **Upgrade Cards**: Roguelite modunda AI upgrade kartları
- ✅ **Market News**: AI tarafından üretilen piyasa haberleri
- ✅ **API Optimization**: Rate limiting, debouncing, caching

### 📊 Database & Backend

- ✅ **Supabase Integration**: PostgreSQL, Auth, Realtime
- ✅ **RLS Policies**: Tüm tablolarda Row Level Security aktif
- ✅ **Game Sessions**: Tüm oyun oturumları kaydediliyor
- ✅ **Behavioral Choices**: RPG senaryo kararları takip ediliyor
- ✅ **Leaderboards**: Gerçek zamanlı sıralama
- ✅ **Vector Extension**: Semantic similarity için hazır
- ✅ **RPC Functions**: Güvenli transaction'lar için

---

## 🚀 Kurulum ve Kullanım

### İlk Kurulum

1. **Dependencies yükleyin:**
   ```bash
   npm install
   ```

2. **Environment variables ayarlayın:**
   
   `.env.local` dosyası oluşturun:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GROQ_API_KEY=your_groq_api_key
   ```

3. **Supabase database kurulumu:**
   
   Supabase Dashboard → SQL Editor'da şu dosyaları **sırayla** çalıştırın:
   - `supabase/schema.sql`
   - `supabase/schema_arcade.sql`
   - `supabase/schema_social_economy.sql`
   - `supabase/migrations/2026_upgrade.sql`
   - `supabase/migrations/add_quant_tools.sql`
   - `supabase/migrations/add_admin_system.sql`
   - `supabase/migrations/add_visionary_levels.sql`
   - `supabase/rpc_execute_market_transaction.sql`
   - `supabase/rpc_apply_market_news.sql`

4. **Admin kullanıcı oluşturun:**
   
   İlk admin kullanıcıyı oluşturmak için:
   ```sql
   -- Email/password ile kayıt olun, sonra:
   UPDATE public.users 
   SET is_admin = true 
   WHERE email = 'your-email@example.com';
   ```

5. **Server'ı başlatın:**
   ```bash
   npm run dev
   ```

6. **Tarayıcıda açın:**
   ```
   http://localhost:3000
   ```

### Oyun Akışı

#### Career Mode
1. Ana sayfa → **Career Mode** seçin
2. Giriş yapın (Email/Password veya Anonymous)
3. **Hero seçin**: Engineer / Scientist / Analyst
4. **Path seçin**: Technical / Behavioral
5. **Career Map**'ten level seçin
6. Oyunu oynayın
7. **AI Career Coach** feedback alın
8. XP kazanın, seviye atlayın

#### Prompt Lab
1. Ana sayfa → **Prompt Lab** seçin
2. 4 oyundan birini seçin:
   - **Visionary**: Görüntü prompt reverse engineering
   - **Agent Handler**: AI tool chain builder
   - **The Algorithm**: Persona matching
   - **Coach GPT**: Sports strategy
3. Challenge'ı çözün
4. AI score alın
5. Leaderboard'da görünün

#### AI Mock Interview
1. Navigation → **AI Interview** seçin
2. Job role ve level seçin
3. Dil seçin (TR/EN/ES/FR/DE)
4. Mikrofon izni verin
5. Konuşarak cevap verin
6. AI geri bildirimi alın (SWOT analysis)

---

## 🌐 Netlify Deployment

### Başarılı Deployment İçin

1. **GitHub'a push edin:**
   ```bash
   git add .
   git commit -m "Your message"
   git push origin main
   ```

2. **Netlify'da site oluşturun:**
   - Netlify Dashboard → Add new site → Import from GitHub
   - Repository'yi seçin
   - Build settings otomatik algılanacak

3. **Environment variables ekleyin (ZORUNLU!):**
   - Netlify Dashboard → Site Settings → Environment Variables
   - 3 değişken ekleyin:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `GROQ_API_KEY`

4. **Netlify Next.js Plugin:**
   - `netlify.toml` dosyasında zaten tanımlı
   - Otomatik olarak algılanacak
   - Manuel eklemeye gerek yok

5. **Deploy:**
   - Otomatik deploy başlayacak
   - İlk deploy 5-10 dakika sürebilir

### Deployment Sonrası

1. **Database migration'ları çalıştırın** (production database'de)
2. **İlk admin kullanıcıyı oluşturun**
3. **Site'i test edin**: `https://your-site.netlify.app`

Detaylı rehber: `NETLIFY_DEPLOYMENT_GUIDE.md`

---

## 🐛 Sorun Giderme

### Sayfa Yüklenmiyor (404)
- **Çözüm**: Netlify Next.js plugin'in yüklendiğinden emin olun
- **Kontrol**: Build logs'u kontrol edin
- **Hard Refresh**: Ctrl+Shift+R

### Email Login Çalışmıyor
- **Çözüm**: Email/Password login kullanın (SMTP gerekmez)
- **Alternatif**: Anonymous login
- **Password Reset**: `/auth/reset-password` sayfasını kullanın

### Admin Paneline Erişemiyorum
- **Kontrol**: `public.users` tablosunda `is_admin = true` olduğundan emin olun
- **SQL**: `SELECT email, is_admin FROM public.users WHERE email = 'your-email@example.com';`
- **Çözüm**: Admin yapmak için SQL çalıştırın (yukarıdaki "Admin kullanıcı oluşturun" bölümüne bakın)

### Build Hatası
- **Çözüm**: `npm install` tekrar çalıştırın
- **TypeScript**: Tüm type'lar doğru
- **Netlify**: Build logs'u kontrol edin

### Environment Variables Çalışmıyor
- **Kontrol**: Netlify Dashboard'da değişkenlerin doğru yazıldığından emin olun
- **Çözüm**: Redeploy yapın (değişkenler değiştiğinde redeploy gerekir)

---

## 🔧 Teknik Detaylar

### Dosya Yapısı

```
data_legacy/
├── app/                    # Next.js 14 App Router
│   ├── actions/            # Server Actions (AI, Game, Guild, Market, Interview, Resume)
│   ├── admin/              # Admin panel (admin-only)
│   ├── arcade/             # Prompt Lab hub
│   ├── auth/               # Authentication
│   ├── core/               # The Core games (admin-only)
│   ├── guilds/             # Guild system (admin-only)
│   ├── interview/          # AI Mock Interview
│   ├── market/             # Marketplace (admin-only)
│   ├── profile/            # User profile (admin-only)
│   └── verify/             # Public verification (admin-only)
├── components/
│   ├── arcade/             # Prompt Lab games
│   ├── core/               # The Core games
│   ├── game/               # Career Mode games
│   ├── interview/          # Interview components
│   ├── market/             # Marketplace components
│   └── ui/                 # Reusable UI components
├── lib/
│   ├── admin/              # Admin authentication
│   ├── game/               # Game constants & assets
│   ├── groq/               # Groq AI client & models
│   ├── interview/          # Interview cache & emotion detection
│   ├── resume/             # PDF generator
│   ├── store/              # Zustand state management
│   └── supabase/           # Supabase clients
└── supabase/
    ├── migrations/         # Database migrations
    └── rpc_*.sql           # RPC functions
```

### Z-Index Hierarchy

1. **GameInstructions**: 99999 (React Portal)
2. **StoryModal**: 200
3. **CareerCoachModal**: 200
4. **Game modals**: 200
5. **Navigation**: 50
6. **Global HUD**: 50

### Asset Management

Tüm görseller `lib/game/assets.ts` dosyasında merkezi olarak yönetiliyor:
- Mascots & Heroes
- Backgrounds
- Arcade Game Covers
- UI Elements

### State Management

- **Zustand**: Client-side game state (persist devre dışı - CSP sorunu)
- **React Query**: Server state sync
- **LocalStorage**: Guest mode için

### Authentication Flow

1. **Email/Password**: Supabase Auth
2. **Anonymous**: Supabase Anonymous sign-in
3. **Guest Mode**: LocalStorage fallback (Career Mode için)

### Admin System

- **Database**: `public.users.is_admin` kolonu
- **Server Check**: `lib/admin/auth.ts` - `checkAdminStatus()`
- **Route Protection**: Layout dosyalarında (`app/*/layout.tsx`)
- **Navigation**: Client-side admin kontrolü

---

## 📝 Önemli Notlar

### CSP (Content Security Policy)
- Zustand persist geçici olarak devre dışı (CSP sorunu)
- `unsafe-eval` gerektiren kodlar kaldırıldı

### Guest Mode
- LocalStorage fallback çalışıyor
- Career Mode için otomatik guest mode aktif
- Prompt Lab guest mode gerektirmez

### Portal Modals
- Tüm modal'lar React Portal ile render ediliyor
- Z-index sorunları çözüldü
- `document.body`'ye direkt render

### TypeScript
- Full type coverage
- Strict mode aktif
- Supabase types otomatik generate ediliyor

### Build & Deployment
- ✅ Production build başarılı
- ✅ Netlify deployment hazır
- ✅ Environment variables yapılandırıldı
- ✅ Admin-only modüller korumalı

---

## 🔮 Gelecek Özellikler

### Yakında
1. **Admin Modüllerini Public Yapma**: Geliştirme tamamlandığında
2. **Game Balance Dashboard**: Win rate analytics
3. **Auto-Difficulty Adjustment**: Dinamik zorluk ayarlama

### Uzun Vadede
1. **Mobile App**: React Native
2. **Multiplayer Mode**: Gerçek zamanlı çok oyunculu
3. **Custom Scenarios**: Kullanıcı tarafından oluşturulan senaryolar
4. **AI-Generated Content**: Tamamen AI tarafından üretilen içerik

---

## 📞 Yardım

Sorun yaşarsanız:

1. **Browser Console**: F12 → Console sekmesi
2. **Terminal Logs**: Server çıktılarını kontrol edin
3. **Environment Variables**: `.env.local` dosyasını kontrol edin
4. **Supabase Dashboard**: Database ve Auth durumunu kontrol edin
5. **Netlify Build Logs**: Deployment hatalarını kontrol edin

---

## 🎯 Hızlı Referans

### Önemli Komutlar
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
```

### Önemli Dosyalar
- `netlify.toml` - Netlify yapılandırması
- `next.config.js` - Next.js yapılandırması
- `lib/game/assets.ts` - Asset yönetimi
- `lib/admin/auth.ts` - Admin authentication
- `supabase/migrations/` - Database migration'ları

### Önemli URL'ler
- Local: `http://localhost:3000`
- Production: `https://datalegacy.netlify.app`
- Admin Panel: `http://localhost:3000/admin` (admin-only)
- Visionary Admin: `http://localhost:3000/admin/visionary` (admin-only)

---

**Başarılar! 🎮✨**

*Data Legacy 2.0 - Version 2.0 - 2026*

*Son Güncelleme: Netlify deployment sonrası*
