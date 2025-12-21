# Netlify 404 Hatası Çözümü

## 🔴 Sorun
Netlify'da deploy başarılı ama site 404 hatası veriyor.

## ✅ Çözüm Adımları

### 1. Netlify Next.js Plugin Ekle (ZORUNLU!)

Next.js 14 App Router için `@netlify/plugin-nextjs` plugin'i **MUTLAKA** gerekli.

**Netlify Dashboard'da:**
1. Site Settings → **Plugins** → **Add plugin**
2. `@netlify/plugin-nextjs` ara ve ekle
3. **Redeploy** yap

**VEYA package.json'a ekle:**
```json
{
  "devDependencies": {
    "@netlify/plugin-nextjs": "^8.0.0"
  }
}
```

### 2. Build Settings Kontrolü

Netlify Dashboard → **Site Settings** → **Build & Deploy** → **Build settings**

**Doğru ayarlar:**
- **Build command**: `npm run build`
- **Publish directory**: `.next` (Next.js 14 için)
- **Node version**: `18.20.0` veya üzeri

### 3. next.config.js Güncellemesi

`next.config.js` dosyasına `output: 'standalone'` eklendi. Bu değişikliği commit edip push edin:

```bash
git add next.config.js
git commit -m "fix: Add standalone output for Netlify"
git push origin main
```

### 4. Netlify'da Redeploy

1. Netlify Dashboard → **Deploys**
2. **Trigger deploy** → **Clear cache and deploy site**

### 5. Alternatif: netlify.toml Güncellemesi

Eğer hala çalışmıyorsa, `netlify.toml` dosyasını güncelleyin (zaten güncellendi).

## 🔍 Debug Adımları

### Build Logs Kontrolü
1. Netlify Dashboard → **Deploys** → Son deploy'a tıkla
2. **Build logs** sekmesine bak
3. Hata var mı kontrol et

### Yaygın Hatalar

**Hata 1: "Module not found"**
- Çözüm: `NPM_FLAGS = "--legacy-peer-deps"` ekle (netlify.toml'da mevcut)

**Hata 2: "Cannot find module '@netlify/plugin-nextjs'"**
- Çözüm: Plugin'i Netlify Dashboard'dan ekle

**Hata 3: "404 on all routes"**
- Çözüm: Plugin ekle ve redeploy yap

## ✅ Doğru Yapılandırma

### netlify.toml
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18.20.0"
  NPM_FLAGS = "--legacy-peer-deps"
```

### next.config.js
```js
const nextConfig = {
  output: 'standalone', // Netlify için
  // ... diğer ayarlar
}
```

### package.json (opsiyonel)
```json
{
  "devDependencies": {
    "@netlify/plugin-nextjs": "^8.0.0"
  }
}
```

## 🚀 Hızlı Çözüm

1. **Netlify Dashboard** → Plugins → `@netlify/plugin-nextjs` ekle
2. **next.config.js** güncellemesini commit/push et
3. **Redeploy** yap (Clear cache ile)

---

**Not**: Next.js 14 App Router, Server Actions ve Server Components kullandığı için Netlify'da özel plugin gerektirir. Bu olmadan routing çalışmaz.

