# Netlify Quick Start - Data Legacy 2.0

## 🚀 Hızlı Deploy Adımları

### 1. GitHub'a Push
```bash
git add .
git commit -m "Ready for Netlify deployment"
git push origin main
```

### 2. Netlify'da Site Oluştur
1. [Netlify Dashboard](https://app.netlify.com) → **Add new site** → **Import an existing project**
2. GitHub'ı bağla ve repository'yi seç
3. Build settings otomatik algılanacak (değiştirme gerekmez)

### 3. Environment Variables Ekle (ZORUNLU!)
Netlify Dashboard → **Site Settings** → **Environment Variables** → **Add variable**

Şu 3 değişkeni ekle:
```
NEXT_PUBLIC_SUPABASE_URL = your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_anon_key
GROQ_API_KEY = your_groq_api_key
```

### 4. Deploy
**Deploy site** butonuna tıkla ve bekle (5-10 dakika)

### 5. Database Migration (ÖNEMLİ!)
Supabase Dashboard → SQL Editor → Şu dosyaları sırayla çalıştır:
- `supabase/schema.sql`
- `supabase/schema_arcade.sql`
- `supabase/schema_social_economy.sql`
- `supabase/migrations/2026_upgrade.sql`
- `supabase/migrations/add_quant_tools.sql`
- `supabase/migrations/add_admin_system.sql`
- `supabase/migrations/add_visionary_levels.sql`
- `supabase/rpc_execute_market_transaction.sql`
- `supabase/rpc_apply_market_news.sql`

### 6. Admin User Oluştur
Supabase SQL Editor:
```sql
UPDATE public.users 
SET is_admin = true 
WHERE email = 'your-email@example.com';
```

## ✅ Kontrol Listesi

- [ ] GitHub'a push edildi
- [ ] Netlify site oluşturuldu
- [ ] 3 environment variable eklendi
- [ ] İlk deploy başarılı
- [ ] Database migration'ları çalıştırıldı
- [ ] Admin user oluşturuldu
- [ ] Site test edildi

## ⚠️ Sorun mu Var?

**Build başarısız olursa:**
- Build logs'u kontrol et
- Environment variables'ın doğru olduğundan emin ol
- `NETLIFY_DEPLOYMENT_GUIDE.md` dosyasına bak

**Site çalışmıyorsa:**
- Environment variables'ı kontrol et
- Database migration'larını kontrol et
- Browser console'da hata var mı bak

---

**Hazır!** 🎉

