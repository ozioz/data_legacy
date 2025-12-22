# 🎮 Data Legacy 2.0

> **Geleceğin Veri Mühendisleri İçin Oyunlaştırılmış Öğrenme Platformu**

Data Legacy 2.0, veri bilimi ve yapay zeka kariyerinizi oyunlaştırılmış bir deneyimle geliştirmenizi sağlayan, yenilikçi bir eğitim platformudur. Klasik eğitim yöntemlerini bir kenara bırakın - burada öğrenmek eğlenceli, rekabetçi ve gerçek dünya senaryolarına dayalı.

---

## 🌟 Neden Data Legacy 2.0?

### 🎯 Gerçek Dünya Senaryoları
Sadece teorik bilgi değil - gerçek iş hayatında karşılaşacağınız durumları simüle eden, AI destekli senaryolarla öğrenin. Her kararınız, kariyerinizi şekillendirir.

### 🚀 Hızlandırılmış Öğrenme
Groq AI (Llama 3) teknolojisiyle anlık geri bildirim alın. Hatalarınızdan anında öğrenin, doğru yolu keşfedin.

### 🏆 Rekabetçi Ortam
Global liderlik tablolarında yerinizi alın. Diğer veri profesyonelleriyle yarışın, seviyenizi yükseltin.

### 🎨 İki Farklı Deneyim
- **Career Mode**: Derinlemesine kariyer simülasyonu - 6 farklı oyun, karakter gelişimi, seviye sistemi
- **Prompt Lab**: Hızlı oyun modu - AI prompt mühendisliği becerilerinizi test edin

---

## 🎮 Ne Öğreneceksiniz?

### 📊 Teknik Beceriler
- **SQL Optimizasyonu**: Karmaşık sorguları optimize etme
- **ETL Pipeline Tasarımı**: Veri akışı mimarisi
- **Veri Analizi**: İstatistiksel analiz ve görselleştirme
- **Makine Öğrenmesi**: Algoritma anlayışı ve uygulaması
- **Sistem Mimarisi**: Ölçeklenebilir sistem tasarımı

### 🧠 Soft Skills
- **Kriz Yönetimi**: Zorlu durumlarda karar verme
- **Takım Çalışması**: İşbirliği ve liderlik
- **Problem Çözme**: Yaratıcı çözümler geliştirme
- **İletişim**: Teknik konuları açıklama

### 🤖 AI & Prompt Engineering
- **Prompt Tasarımı**: Etkili AI prompt'ları yazma
- **AI Agent Yönetimi**: Araç zincirleri oluşturma
- **Persona Analizi**: Kullanıcı davranışı tahmin etme
- **Stratejik Düşünme**: AI destekli karar verme

---

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js 18 veya üzeri
- npm veya yarn
- Supabase hesabı (ücretsiz)
- Groq API anahtarı (ücretsiz)

### Kurulum (5 Dakika)

1. **Projeyi klonlayın:**
   ```bash
   git clone https://github.com/yourusername/data-legacy-2.0.git
   cd data-legacy-2.0
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Environment variables'ı ayarlayın:**
   
   `.env.local` dosyası oluşturun:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GROQ_API_KEY=your_groq_api_key
   ```

4. **Supabase veritabanını kurun:**
   
   Supabase Dashboard → SQL Editor'da şu dosyaları sırayla çalıştırın:
   - `supabase/schema.sql`
   - `supabase/schema_arcade.sql`
   - `supabase/schema_social_economy.sql`
   - `supabase/migrations/2026_upgrade.sql`
   - `supabase/migrations/add_quant_tools.sql`
   - `supabase/migrations/add_admin_system.sql`
   - `supabase/migrations/add_visionary_levels.sql`
   - `supabase/rpc_execute_market_transaction.sql`
   - `supabase/rpc_apply_market_news.sql`

5. **Geliştirme sunucusunu başlatın:**
   ```bash
   npm run dev
   ```

6. **Tarayıcıda açın:**
   ```
   http://localhost:3000
   ```

---

## 🎯 İlk Adımlar

### 1. Hesap Oluşturun
- Email/password ile kayıt olun
- Veya "Skip for now" ile misafir olarak deneyin

### 2. Karakterinizi Seçin
- **Engineer**: Sistem mimarisi ve optimizasyon odaklı
- **Scientist**: Araştırma ve analiz odaklı
- **Analyst**: İş zekası ve raporlama odaklı

### 3. Yolunuzu Seçin
- **Technical Path**: Kodlama, algoritma, sistem tasarımı
- **Behavioral Path**: İş senaryoları, karar verme, liderlik

### 4. Oynamaya Başlayın!
- Seviye seviye ilerleyin
- XP kazanın, rozetler toplayın
- Liderlik tablosunda yerinizi alın

---

## 🎮 Oyun Modları

### 🎓 Career Mode (Kariyer Simülasyonu)

Derinlemesine öğrenme deneyimi. 6 farklı mini-oyun:

1. **Pipeline Puzzle** 🧩
   - ETL pipeline'ları tasarlayın
   - Veri akışını optimize edin
   - Throughput metriklerinizi geliştirin

2. **Server Guardian** 🛡️
   - Sistem güvenliğini koruyun
   - Saldırılara karşı savunun
   - Roguelite modunda upgrade kartları toplayın

3. **Null Runner** 🏃
   - Sinyal/gürültü ayrımı yapın
   - Veri kalitesini artırın
   - Hızlı kararlar verin

4. **Data Farm** 🌾
   - Kaynak üretimi yönetin
   - Idle mekanikleri kullanın
   - Ekonomi sistemini öğrenin

5. **Query Master** 📊
   - SQL sorguları optimize edin
   - Performans metriklerini iyileştirin
   - Karmaşık join'leri çözün

6. **Behavioral Scenarios** 🎭
   - AI destekli iş senaryoları
   - Gerçek dünya kararları
   - Kariyer koçundan geri bildirim

### ⚡ Prompt Lab (Hızlı Oyun)

AI prompt mühendisliği becerilerinizi test edin:

1. **Visionary** 🎨
   - Görüntü prompt'larını reverse engineer edin
   - **Zero-Latency**: Database validation (AI maliyeti yok!)
   - Prompt Builder UI (Subject, Style, Lighting seçimi)
   - Her doğru attribute = 33.33 puan
   - Zorluk seviyeleri: Easy, Medium, Hard

2. **Agent Handler** 🤖
   - AI agent araç zincirleri oluşturun
   - Doğru sıralamayı bulun
   - Karmaşık görevleri çözün

3. **The Algorithm** 🧮
   - Kullanıcı persona'larını tahmin edin
   - Öneri sistemlerini anlayın
   - AI değerlendirmesi alın

4. **Coach GPT** ⚽
   - Stratejik komutlar verin
   - Oyun simülasyonlarını yönetin
   - Kazanma/kaybetme senaryolarını test edin

### 🎤 AI Mock Interview

Gerçekçi iş görüşmeleri:

- **Multi-language Support**: Türkçe, İngilizce, İspanyolca, Fransızca, Almanca
- **Speech Recognition**: Konuşarak cevap verin
- **AI Feedback**: Detaylı SWOT analizi ve öneriler
- **Emotional Analysis**: Video analizi ile duygusal geri bildirim

---

## 🏆 İlerleme Sistemi

### Seviye Sistemi
- Her oyun size XP kazandırır
- Seviye atladıkça yeni içerikler açılır
- Toplam XP'niz liderlik tablosunda görünür

### Rozetler ve Başarılar
- "SQL Master" - 1000+ sorgu optimize ettiniz
- "Crisis Manager" - Zorlu senaryolarda başarılı oldunuz
- "Prompt Engineer" - Yüksek semantic similarity skorları
- Ve daha fazlası...

### Liderlik Tabloları
- Global sıralama
- Haftalık/yıllık istatistikler
- Guild bazlı rekabet (yakında)

---

## 🛠️ Teknoloji Stack

### Frontend
- **Next.js 14** - React framework (App Router)
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern UI styling
- **Framer Motion** - Smooth animations

### Backend
- **Supabase** - PostgreSQL database, Auth, Realtime
- **Groq AI** - Ultra-fast AI inference (Llama 3)
- **Server Actions** - Secure API endpoints

### AI & ML
- **Llama 3.3-70B** - Complex reasoning (interviews, coaching)
- **Llama 3.1-8B** - Fast responses (real-time games)
- **Whisper** - Speech-to-text transcription

---

## 📚 Öğrenme Kaynakları

### İçerik
- **6 Arcade Oyunu**: Pratik yaparak öğrenin
- **AI Senaryoları**: Gerçek dünya durumları
- **Interview Simülasyonu**: İş görüşmelerine hazırlanın
- **Resume Generator**: CV'nizi otomatik oluşturun

### Geri Bildirim
- **Career Coach**: Her oyun sonrası AI geri bildirimi
- **SWOT Analysis**: Güçlü/zayıf yönlerinizi keşfedin
- **Skill Tracking**: Hangi alanlarda iyi olduğunuzu görün

---

## 🌐 Deployment

### Netlify (Önerilen)
Detaylı deployment rehberi için: [`NETLIFY_DEPLOYMENT_GUIDE.md`](./NETLIFY_DEPLOYMENT_GUIDE.md)

**Hızlı Başlangıç:**
1. GitHub'a push edin
2. Netlify'da site oluşturun
3. Environment variables ekleyin
4. Deploy!

---

## 🤝 Katkıda Bulunun

Bu proje açık kaynaklıdır ve katkılarınızı bekliyoruz!

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

---

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

## 💬 İletişim

Sorularınız mı var? Önerileriniz mi var?

- GitHub Issues açın
- Pull Request gönderin
- Projeyi yıldızlayın ⭐

---

## 🎯 Roadmap

### ✅ Tamamlanan
- Career Mode (6 oyun)
- Prompt Lab (4 oyun)
- AI Mock Interview
- Resume Generator
- Admin System

### 🚧 Geliştirme Aşamasında
- Guild System (sosyal özellikler)
- Marketplace (ekonomi sistemi)
- The Core (matematik/algoritma oyunları)
- Public Profile Verification

### 🔮 Gelecek
- Mobile App
- Multiplayer Mode
- Custom Scenarios
- AI-Generated Content

---

## 🙏 Teşekkürler

Data Legacy 2.0'ı kullandığınız için teşekkürler! 

**Unutmayın:** Her uzman bir zamanlar acemiydi. Burada öğrenmek eğlenceli, hata yapmak güvenli, ve ilerlemek ödüllendirici.

**Başarılar! 🚀**

---

<div align="center">

**⭐ Projeyi beğendiyseniz yıldızlamayı unutmayın! ⭐**

Made with ❤️ for future data engineers

</div>
