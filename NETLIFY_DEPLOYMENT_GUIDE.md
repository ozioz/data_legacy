# Netlify Deployment Guide - Data Legacy 2.0

## ✅ Pre-Deployment Checklist

### 1. Environment Variables (CRITICAL)
Netlify Dashboard'da şu environment variable'ları eklemeniz **ZORUNLU**:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

**Nasıl Eklenir:**
1. Netlify Dashboard → Site Settings → Environment Variables
2. Her bir değişkeni tek tek ekleyin
3. **Deploy Settings** → **Build & Deploy** → **Environment Variables** bölümünden kontrol edin

### 2. Build Settings
Netlify otomatik olarak Next.js'i algılamalı, ama kontrol edin:

- **Build command**: `npm run build`
- **Publish directory**: `.next` (Next.js 14 için)
- **Node version**: `18.20.0` veya üzeri

### 3. Netlify Plugin (ÖNERİLİR)
Next.js 14 App Router için Netlify plugin'i kullanın:

**Netlify Dashboard → Plugins → Add Plugin → "@netlify/plugin-nextjs"**

Veya `netlify.toml` dosyası zaten hazır (projede mevcut).

### 4. Database Migrations
**ÖNEMLİ**: Supabase migration'larını production database'de çalıştırın:

1. Supabase Dashboard → SQL Editor
2. Şu sırayla çalıştırın:
   - `supabase/schema.sql`
   - `supabase/schema_arcade.sql`
   - `supabase/schema_social_economy.sql`
   - `supabase/migrations/2026_upgrade.sql`
   - `supabase/migrations/add_quant_tools.sql`
   - `supabase/migrations/add_admin_system.sql`
   - `supabase/migrations/add_visionary_levels.sql`
   - `supabase/rpc_execute_market_transaction.sql`
   - `supabase/rpc_apply_market_news.sql`

### 5. Admin User Creation
İlk admin kullanıcıyı oluşturun:

```sql
-- Supabase SQL Editor'da çalıştırın
UPDATE public.users 
SET is_admin = true 
WHERE email = 'your-admin-email@example.com';

-- Eğer user yoksa, önce sign up yapın, sonra bu SQL'i çalıştırın
```

## 🚀 Deployment Steps

### Step 1: GitHub Repository
1. GitHub'da yeni bir repository oluşturun
2. Projeyi push edin:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Data Legacy 2.0"
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```

### Step 2: Netlify Setup
1. Netlify Dashboard → **Add new site** → **Import an existing project**
2. GitHub'ı bağlayın ve repository'yi seçin
3. **Build settings** otomatik algılanmalı:
   - Build command: `npm run build`
   - Publish directory: `.next`

### Step 3: Environment Variables
1. **Site Settings** → **Environment Variables**
2. Şu değişkenleri ekleyin:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GROQ_API_KEY`

### Step 4: Deploy
1. **Deploy site** butonuna tıklayın
2. İlk deploy 5-10 dakika sürebilir
3. Deploy tamamlandıktan sonra site URL'ini kontrol edin

## ⚠️ Potential Issues & Solutions

### Issue 1: Build Fails - "Module not found"
**Solution**: 
- `package.json`'da tüm dependencies'in listelendiğinden emin olun
- Netlify'da `NPM_FLAGS = "--legacy-peer-deps"` ekleyin (netlify.toml'da mevcut)

### Issue 2: Environment Variables Not Working
**Solution**:
- Netlify Dashboard'da değişkenlerin doğru yazıldığından emin olun
- **Redeploy** yapın (değişkenler değiştiğinde redeploy gerekir)
- Build logs'da değişkenlerin yüklendiğini kontrol edin

### Issue 3: "Dynamic server usage" Errors
**Solution**:
- Bu normal! Next.js 14 App Router dynamic routes kullanıyor
- `netlify.toml` dosyası zaten hazır
- `@netlify/plugin-nextjs` plugin'ini kullanın

### Issue 4: API Routes Not Working
**Solution**:
- Next.js 14 Server Actions kullanıyor, API routes değil
- Netlify plugin otomatik handle eder
- Eğer sorun varsa, `netlify.toml`'daki redirects'i kontrol edin

### Issue 5: Database Connection Issues
**Solution**:
- Supabase URL ve Anon Key'in doğru olduğundan emin olun
- Supabase Dashboard → Settings → API → URL ve keys'i kontrol edin
- RLS policies'in aktif olduğundan emin olun

### Issue 6: Admin Routes Not Working
**Solution**:
- İlk admin kullanıcıyı oluşturun (yukarıdaki SQL)
- `is_admin = true` olduğundan emin olun
- Login yapıp `/admin` sayfasına erişmeyi deneyin

## 🔍 Post-Deployment Checks

### 1. Test Public Routes
- ✅ `/` - Career Mode
- ✅ `/arcade` - Prompt Lab
- ✅ `/interview` - AI Interview
- ✅ `/auth` - Authentication

### 2. Test Admin Routes (Admin Login Required)
- ✅ `/admin` - Admin Dashboard
- ✅ `/admin/visionary` - Visionary Game Admin
- ✅ `/guilds` - Guilds (admin-only)
- ✅ `/market` - Marketplace (admin-only)
- ✅ `/core` - The Core (admin-only)
- ✅ `/profile` - Profile (admin-only)

### 3. Test Authentication
- ✅ Email/Password signup
- ✅ Email/Password login
- ✅ Guest mode (Career Mode için)

### 4. Test Database
- ✅ User creation
- ✅ Game sessions saving
- ✅ Leaderboard updates

## 📝 Important Notes

1. **Environment Variables**: Netlify'da her değişiklikten sonra **redeploy** gerekir
2. **Database**: Production database'de migration'ları çalıştırmayı unutmayın
3. **Admin Access**: İlk admin kullanıcıyı manuel olarak oluşturmanız gerekir
4. **Build Time**: İlk deploy 5-10 dakika sürebilir, sonraki deploy'lar daha hızlı
5. **Custom Domain**: Netlify Dashboard → Domain Settings'den custom domain ekleyebilirsiniz

## 🎯 Quick Checklist

- [ ] GitHub repository oluşturuldu ve push edildi
- [ ] Netlify site oluşturuldu ve GitHub bağlandı
- [ ] Environment variables eklendi (3 adet)
- [ ] Netlify Next.js plugin eklendi (önerilir)
- [ ] Supabase migration'ları production'da çalıştırıldı
- [ ] İlk admin kullanıcı oluşturuldu
- [ ] İlk deploy başarılı
- [ ] Public routes test edildi
- [ ] Admin routes test edildi (login sonrası)
- [ ] Authentication test edildi

---

**Status**: ✅ **Netlify için hazır!**

Deploy sırasında sorun olursa, build logs'u kontrol edin ve yukarıdaki "Potential Issues" bölümüne bakın.

